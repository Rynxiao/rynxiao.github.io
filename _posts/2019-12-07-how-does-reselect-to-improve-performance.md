---
layout: post
title:  "reselect是怎样提高组件渲染性能的?"
date:   2019-12-07
categories: 技术
excerpt: 'reselect是什么？reselect是配合redux使用的一款轻量型的状态选择库，目的在于当store中的state重新改变之后使得局部未改变的状态不会因为整体的state变化而全部重新渲染，功能有点类似于组件中的生命周期函数shouldComponentDidUpdate，但是它们并不是一个东西'
tag: [react,redux,reselect]
---

## reselect是什么？

[reselect](https://github.com/reduxjs/reselect)是配合`redux`使用的一款轻量型的状态选择库，目的在于当store中的state重新改变之后，使得局部未改变的状态不会因为整体的state变化而全部重新渲染，功能有点类似于组件中的生命周期函数`shouldComponentDidUpdate`，但是它们并不是一个东西。下面是官方的一些简介：

> - Selectors can compute derived data, allowing Redux to store the minimal possible state.
> - Selectors are efficient. A selector is not recomputed unless one of its arguments changes.
> - Selectors are composable. They can be used as input to other selectors.

**[注]**：并不是reselect非要和redux绑定使用不可，可以说reselect只是一个enhancement，并不代表强耦合。

## 什么时候用reselect?

- `store`状态树庞大且层次较深
- 组件中的state需要经过复杂的计算才能呈现在界面上

个人认为符合这两点就可以使用reselect，为什么？简单的state或许根本完全没有必要引入redux，状态管理组件内部就可以消化，再者reselect只是在参数级别的缓存，如果组件状态逻辑并不是特别复杂，只是简单的getter，那也可不必引入reselect。

**[建议]**：建议引入了redux就可以引入reselect，去看官方的源码，总共加起来才短短的108行代码，对测试并没有什么成本，同时加入也不会对打包体积造成什么影响，但是有些时候对组件渲染的性能却有很大的改善。

## 基本用法

这里是直接copy的官方仓库中的代码

[![Edit reselect](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/empty-fog-xhjtn?expanddevtools=1&fontsize=14&hidenavigation=1)

```javascript
import { createSelector } from 'reselect'

const shopItemsSelector = state => state.shop.items
const taxPercentSelector = state => state.shop.taxPercent

const subtotalSelector = createSelector(
  shopItemsSelector,
  items => items.reduce((acc, item) => acc + item.value, 0)
)

const taxSelector = createSelector(
  subtotalSelector,
  taxPercentSelector,
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
)

export const totalSelector = createSelector(
  subtotalSelector,
  taxSelector,
  (subtotal, tax) => ({ total: subtotal + tax })
)

let exampleState = {
  shop: {
    taxPercent: 8,
    items: [
      { name: 'apple', value: 1.20 },
      { name: 'orange', value: 0.95 },
    ]
  }
}

console.log(subtotalSelector(exampleState)) // 2.15
console.log(taxSelector(exampleState))      // 0.172
console.log(totalSelector(exampleState))    // { total: 2.322 }
```

## reselect是怎么优化代码性能的？

- [整体store层级state的缓存](https://github.com/reduxjs/reselect/blob/ac77610bbb0a3cab9b280ea5ea379c2387017446/src/index.js#L68)
- 组件级别state的缓存

```javascript
const selector = memoize(function () {
  const params = []
  const length = dependencies.length

  for (let i = 0; i < length; i++) {
    // apply arguments instead of spreading and mutate a local list of params for performance.
    params.push(dependencies[i].apply(null, arguments))
  }

  // apply arguments instead of spreading for performance.
  return memoizedResultFunc.apply(null, params)
})

selector.resultFunc = resultFunc
selector.dependencies = dependencies
selector.recomputations = () => recomputations
selector.resetRecomputations = () => recomputations = 0
return selector
```

函数整体返回的就是这个`selector`，因为我们调用`createSelector`，其实返回的是一个函数，所以`memoize`返回的其实也是一个函数，那么`selector`中做了什么？

```javascript
export function defaultMemoize(func, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null
  let lastResult = null
  // we reference arguments instead of spreading them for performance reasons
  // 这里作为返回的函数，传入的参数即为state
  return function () {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments)
    }

    lastArgs = arguments
    return lastResult
  }
}
```

`memoize`是reselect中提供的默认缓存函数，可以的得知执行这个函数的时候，返回的函数即为上面代码中的`selector`，那么`arguments`即为传入的state，通过`areArgumentsShallowlyEqual`比较两次传入的参数是否相等，注意，这里是浅比较，即第一层引用的比较

```javascript
function defaultEqualityCheck(a, b) {
  return a === b
}
```

当两次传入的值存在变化的时候，那么就会执行

```javascript
func.apply(null, arguments)
```

这里会计算得到所有的依赖，然后得到下一轮缓存函数的`params`。

就redux的reducer来讲，这层缓存并没有什么作用，看看reducer代码：

```javascript
function reducer(state, action) {
  switch (action.type): 
    case REQUEST_TODO_PENDING:
    	return { ...state, loading: true };
  	case REQUEST_TODO_LIST_SUCCESS:
  		return { ...state, list: ['todo'], loading: false };
  	// ...
  	// default
}
```

redux社区推崇所有的state都是不可变的，所以只要dispatch了一个action，每次返回的state必然会是一个新的对象，对于浅比较每次返回的结果必然是`true`;

所以，缓存的关键还在第二层`momoize`，因为这里的state并不是每一次都必须变化：

```javascript
const resultFunc = funcs.pop()
const dependencies = getDependencies(funcs)

const memoizedResultFunc = memoize(
  function () {
    recomputations++
    // apply arguments instead of spreading for performance.
    return resultFunc.apply(null, arguments)
  },
  ...memoizeOptions
)
```

真正代码的执行在`resultFunc.apply(null, arguments)`，这里缓存的逻辑跟上面没什么区别，这里就不在讲解了。`resultFunc`是`createSelector`中的最后一个参数

```javascript
const shopItemsSelector = state => state.shop.items
const taxPercentSelector = state => state.shop.taxPercent

const subtotalSelector = createSelector(
  shopItemsSelector,
  items => items.reduce((acc, item) => acc + item.value, 0)
)
```

大家可以自行对照一下上面的这个例子，那么`arguments`就是第二个函数的参数，也就是第一步缓存函数中的`params`。

## 总结

好了，就啰嗦这么多了，最后，多读书，多看报，少吃零食，多睡觉😪😪💤






