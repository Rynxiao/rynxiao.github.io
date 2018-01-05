---
layout: post
title:  "几个关于js数组方法reduce的经典片段"
date:   2018-01-04
categories: 技术
excerpt: '以下是个人在工作中收藏总结的一些关于javascript数组方法reduce的相关代码片段，后续遇到其他使用这个函数的场景，将会陆续添加，这里作为备忘。 javascript数组那么多方法，为什么我要单挑reduce方法，一个原因是我对这个方法掌握不够，不能够用到随心所欲。另一个方面，我也感觉到了这个方法的庞大魅力，在许多的场景中发挥着神奇的作用。 理解reduce函数 reduc'
tag: [javascript,Array,reduce]
---

以下是个人在工作中收藏总结的一些关于javascript数组方法`reduce`的相关代码片段，后续遇到其他使用这个函数的场景，将会陆续添加，这里作为备忘。

javascript数组那么多方法，为什么我要单挑`reduce`方法，一个原因是我对这个方法掌握不够，不能够用到随心所欲。另一个方面，我也感觉到了这个方法的庞大魅力，在许多的场景中发挥着神奇的作用。

### 理解`reduce`函数

>   reduce() 方法接收一个函数作为累加器（accumulator），数组中的每个值（从左到右）开始缩减，最终为一个值。

```
arr.reduce([callback, initialValue])
```

关于`reduce`的用法，这里不再做多述，可以去[这里](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce_clone)查看

看如下例子：

```javascript
let arr = [1, 2, 3, 4, 5];

// 10代表初始值，p代表每一次的累加值，在第一次为10
// 如果不存在初始值，那么p第一次值为1
// 此时累加的结果为15
let sum = arr.reduce((p, c) => p + c, 10);  // 25

// 转成es5的写法即为：
var sum = arr.reduce(function(p, c) {
    console.log(p);
    return p + c;
}, 10);
```

### 片段一：字母游戏

```javascript
const anagrams = str => {
    if (str.length <= 2) {
        return str.length === 2 ? [str, str[1] + str[0]] : str;
    }
    return str.split("").reduce((acc, letter, i) => {
        return acc.concat(anagrams(str.slice(0, i) + str.slice(i + 1)).map(val => letter + val));
    }, []);
}

anagrams("abc");    // 结果会是什么呢？
```

`reduce`负责筛选出每一次执行的首字母，递归负责对剩下字母的排列组合。

<p data-height="265" data-theme-id="0" data-slug-hash="mpMeRG" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce anagrams" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/mpMeRG/">reduce anagrams</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段二：累加器

```javascript
const sum = arr => arr.reduce((acc, val) => acc + val, 0);
sum([1, 2, 3]);
```

<p data-height="265" data-theme-id="0" data-slug-hash="OzjyOG" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce sum" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/OzjyOG/">reduce sum</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段三：计数器

```javascript
const countOccurrences = (arr, value) => arr.reduce((a, v) => v === value ? a + 1 : a + 0, 0);
countOccurrences([1, 2, 3, 2, 2, 5, 1], 1);
```

循环数组，每遇到一个值与给定值相等，即加1，同时将加上之后的结果作为下次的初始值。

<p data-height="265" data-theme-id="0" data-slug-hash="rpzOJy" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce count occurrences" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/rpzOJy/">reduce count occurrences</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段四：函数柯里化

函数柯里化的目的就是为了储存数据，然后在最后一步执行。深入了解，请参看小火柴的这篇文章[http://www.cnblogs.com/xiaohuochai/p/8026074.html](http://www.cnblogs.com/xiaohuochai/p/8026074.html)

```javascript
const curry = (fn, arity = fn.length, ...args) => 
  arity <= args.length ? fn(...args) : curry.bind(null, fn, arity, ...args);

curry(Math.pow)(2)(10);
curry(Math.min, 3)(10)(50)(2);
```

通过判断函数的参数取得当前函数的`length`(当然也可以自己指定)，如果所传的参数比当前参数少，则继续递归下面，同时储存上一次传递的参数。

<p data-height="265" data-theme-id="0" data-slug-hash="PEKPRg" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce curry" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/PEKPRg/">reduce curry</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段五：数组扁平化

```javascript
const deepFlatten = arr => 
  arr.reduce((a, v) => a.concat(Array.isArray(v) ? deepFlatten(v) : v), []);
deepFlatten([1, [2, [3, 4, [5, 6]]]]);
```

<p data-height="265" data-theme-id="0" data-slug-hash="RxZWev" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce deep flatten array" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/RxZWev/">reduce deep flatten array</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段六：生成菲波列契数组

```javascript
const fibonacci = n => Array(n).fill(0).reduce((acc, val, i) => acc.concat(i > 1 ? acc[i - 1] + acc[i - 2] : i), []);
fibonacci(5);
```

<p data-height="265" data-theme-id="0" data-slug-hash="NXvGoG" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce fibonacci" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/NXvGoG/">reduce fibonacci</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段七：管道加工器

```javascript
const pipe = (...funcs) => arg => funcs.reduce((acc, func) => func(acc), arg);
pipe(btoa, x => x.toUpperCase())("Test");
```

通过对传递的参数进行函数加工，之后将加工之后的数据作为下一个函数的参数，这样层层传递下去。

<p data-height="265" data-theme-id="0" data-slug-hash="MrvaRp" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce pipe" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/MrvaRp/">reduce pipe</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段八：中间件

```Javascript
const dispatch = action => {
    console.log('action', action);
    return action;
}

const middleware1 = dispatch => {
    return action => {
        console.log("middleware1");
        const result = dispatch(action);
        console.log("after middleware1");
        return result;
    }
}

const middleware2 = dispatch => {
    return action => {
        console.log("middleware2");
        const result = dispatch(action);
        console.log("after middleware2");
        return result;
    }
}

const middleware3 = dispatch => {
    return action => {
        console.log("middleware3");
        const result = dispatch(action);
        console.log("after middleware3");
        return result;
    }
}

const compose = middlewares => middlewares.reduce((a, b) => args => a(b(args)))

const middlewares = [middleware1, middleware2, middleware3];
const afterDispatch = compose(middlewares)(dispatch);

const testAction = arg => {
    return { type: "TEST_ACTION", params: arg };
};
afterDispatch(testAction("1111"));
```

`redux`中经典的`compose`函数中运用了这种方式，通过对中间件的重重层叠，在真正发起action的时候触发函数执行。

<p data-height="265" data-theme-id="0" data-slug-hash="XVaXoo" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce middlewares" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/XVaXoo/">reduce middlewares</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段九：redux-actions对state的加工片段

```javascript
// redux-actions/src/handleAction.js
const handleAction = (type, reducer, defaultState) => {
    const types = type.toString();
    const [nextReducer, throwReducer] = [reducer, reducer];
    return (state = defaultState, action) => {
        const { type: actionType } = action;
        if (!actionType || types.indexOf(actionType.toString()) === -1) {
            return state;
        }
      
        return (action.error === true ? throwReducer : nextReducer)(state, action);
    }
}

// reduce-reducers/src/index.js
const reduceReducer = (...reducers) => {
    return (previous, current) => {
        reducers.reduce((p, r) => r(p, current), previous);
    }
}

// redux-actions/src/handleActions.js
const handleActions = (handlers, defaultState, { namespace } = {}) => {
    // reducers的扁平化
    const flattenedReducerMap = flattenReducerMap(handles, namespace);
    // 每一种ACTION下对应的reducer处理方式
    const reducers = Reflect.ownkeys(flattenedReducerMap).map(type => handleAction(
        type,
        flattenedReducerMap[type],
        defaultState
    ));
    // 状态的加工器，用于对reducer的执行
    const reducer = reduceReducers(...reducers);
    // reducer触发
    return (state = defaultState, action) => reducer(state, action);
}
```

<p data-height="265" data-theme-id="0" data-slug-hash="barpBv" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce handleActions" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/barpBv/">reduce handleActions</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段十：数据加工器

```javascript
const reducers = {
    totalInEuros: (state, item) => {
        return state.euros += item.price * 0.897424392;
    },
    totalInYen: (state, item) => {
        return state.yens += item.price * 113.852;
    }
};

const manageReducers = reducers => {
    return (state, item) => {
        return Object.keys(reducers).reduce((nextState, key) => {
            reducers[key](state, item);
            return state;
        }, {})
    }
}

const bigTotalPriceReducer = manageReducers(reducers);
const initialState = { euros: 0, yens: 0 };
const items = [{ price: 10 }, { price: 120 }, { price: 1000 }];
const totals = items.reduce(bigTotalPriceReducer, initialState);
```

<p data-height="265" data-theme-id="0" data-slug-hash="qpXJaB" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce handleActions" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/qpXJaB/">reduce handleActions</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 片段十一：对象空值判断

```Javascript
let school = {
    name: 'Hope middle school',
    created: '2001',
    classes: [
        {
            name: '三年二班',
            teachers: [
                { name: '张二蛋', age: 26, sex: '男', actor: '班主任' },
                { name: '王小妞', age: 23, sex: '女', actor: '英语老师' }
            ]
        },
        {
            name: '明星班',
            teachers: [
                { name: '欧阳娜娜', age: 29, sex: '女', actor: '班主任' },
                { name: '李易峰', age: 28, sex: '男', actor: '体育老师' },
                { name: '杨幂', age: 111, sex: '女', actor: '艺术老师' }
            ]
        }
    ]
};

// 常规做法
school.classes &&
school.classes[0] &&
school.classes[0].teachers &&
school.classes[0].teachers[0] &&
school.classes[0].teachers[0].name

// reduce方法
const get = (p, o) => p.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), o);
get(['classes', 0, 'teachers', 0, 'name'], school);   // 张二蛋
```

<p data-height="265" data-theme-id="0" data-slug-hash="operQq" data-default-tab="js" data-user="rynxiao" data-embed-version="2" data-pen-title="reduce handleActions" class="codepen">See the Pen <a href="https://codepen.io/rynxiao/pen/operQq/">reduce handleActions</a> by 糊一笑 (<a href="https://codepen.io/rynxiao">@rynxiao</a>) on <a href="https://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

### 参考地址

https://zhuanlan.zhihu.com/p/27748589

http://www.jb51.net/article/121572.html

Https://github.com/Chalarangelo/30-seconds-of-code#anagrams-of-string-with-duplicates