---
layout: post
title:  "关于React组件之间如何优雅地传值的探讨"
date:   2017-12-25
categories: 技术
excerpt: '闲话不多说，开篇撸代码，你可以会看到类似如下的结构： 代码看这里： "https://codepen.io/rynxiao/pen/vpyaLO" 当一个组件嵌套了若干层子组件时，而想要在特定的组件中取得父组件的属性，就不得不将 一层一层地往下传，我这里只是简单的列举了3个子组件，而当子组件嵌套过深'
tag: [react]
---

闲话不多说，开篇撸代码，你可以会看到类似如下的结构：

```javascript
import React, { Component } from 'react';

// 父组件
class Parent extends Component {
    constructor() {
        super();
        this.state = { color: 'red' };
    }
  
    render() {
        return <Child1 { ...this.props } />
    }
}

// 子组件1
const Child1 = props => {
    return <Child2 { ...props } />
}

// 子组件2
const Child2 = props => {
    return <Child3 { ...props } />
}

// 子组件3
const Child3 = props => {
    return <div style={{ color: props.color }}>Red</div>
}
```

代码看这里：[https://codepen.io/rynxiao/pen/vpyaLO](https://codepen.io/rynxiao/pen/vpyaLO)

当一个组件嵌套了若干层子组件时，而想要在特定的组件中取得父组件的属性，就不得不将`props`一层一层地往下传，我这里只是简单的列举了3个子组件，而当子组件嵌套过深的时候，`props`的维护将成噩梦级增长。因为在每一个子组件上你可能还会对传过来的`props`进行加工，以至于你最后都不确信你最初的`props`中将会有什么东西。

那么`React`中是否还有其他的方式来传递属性，从而改善这种层层传递式的属性传递。答案肯定是有的，主要还有以下两种形式：

## Redux等系列数据仓库

使用`Redux`相当于在全局维护了整个应用数据的仓库，当数据改变的时候，我们只需要去改变这个全局的数据仓库就可以了。类似这样的：

```javascript
var state = {
    a: 1
};

// index1.js
state.a = 2;

// index2.js
console.log(state.a);   // 2
```

当然这只是一种非常简单的形式解析，`Reudx`中的实现逻辑远比这个要复杂得多，有兴趣可以去深入了解，或者看我之前的文章：[用react+redux编写一个页面小demo](http://blog.csdn.net/yuzhongzi81/article/details/51880577)以及[react脚手架改造](http://www.cnblogs.com/rynxiao/p/7933113.html)，下面大致列举下代码：

```javascript
// actions.js
function getA() {
  return {
        type: GET_DATA_A
  };
}

// reducer.js
const state = {
    a: 1
};

function reducer(state, action) {
    case GET_DATA_A: 
        state.a = 2;
        return state;
    default:
        return state;
}

module.exports = reducer;

// Test.js
class Test extends React.Component {
    constructor() {
        super();
    }
  
    componentDidMount() {
        this.props.getA();
    }
}

export default connect(state => {
    return { a: state.reducer.a }
}, dispatch => {
    return { getA: dispatch => dispatch(getA()) }
})(Test);
```

这样当在`Test`中的`componentDidMount`中调用了`getA()`之后，就会发送一个`action`去改变`store`中的状态，此时的a已经由原先的1变成了2。

这只是一个任一组件的大致演示，这就意味着你可以在任何组件中来改变`store`中的状态。关于什么时候引入`redux`我觉得也要根据项目来，如果一个项目中大多数时候只是需要跟组件内部打交道，那么引入`redux`反而造成了一种资源浪费，更多地引来的是学习成本和维护成本，因此并不是说所有的项目我都一定要引入`redux`。

## context

关于`context`的讲解，`React`文档中将它放在了进阶指引里面。具体地址在这里：[https://reactjs.org/docs/context.html](https://reactjs.org/docs/context.html)。主要的作用就是为了解决在本文开头列举出来的例子，为了不让`props`在每层的组件中都需要往下传递，而可以在任何一个子组件中拿到父组件中的属性。

但是，好用的东西往往也有副作用，官方也给出了几点不要使用`context`的建议，如下：

-   如果你想你的应用处于稳定状态，不要用`context`
-   如果你不太熟悉`Redux`或者`MobX`等状态管理库，不要用`context`
-   如果你不是一个资深的`React`开发者，不要用`context`

鉴于以上三种情况，官方更好的建议是老老实实使用`props`和`state`。

下面主要大致讲一下`context`怎么用，其实在官网中的例子已经十分清晰了，我们可以将最开始的例子改一下，使用`context`之后是这样的：

```javascript
class Parent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { color: 'red' };
    }
  
    getChildContext() {
        return { color: this.state.color }
    }
  
    render() {
            return <Child1 />
    }
}

const Child1 = () => {
    return <Child2 />
}

const Child2 = () => {
    return <Child3 />
}

const Child3 = ({ children }, context) => {
    console.log('context', context);
    return <div style={{ color: context.color }}>Red</div>
}

Parent.childContextTypes = {
    color: PropTypes.string
};

Child3.contextTypes = {
    color: PropTypes.string
};  

ReactDOM.render(<Parent />, document.getElementById('container'));
```

可以看到，在子组件中，所有的`{ ...props }`都不需要再写，只需要在`Parent`中定义`childContextTypes`的属性类型，以及定义`getChildContext`钩子函数，然后再特定的子组件中使用`contextTypes`接收即可。

代码请看这里：[https://codepen.io/rynxiao/pen/vpyzBm](https://codepen.io/rynxiao/pen/vpyzBm)

这样做貌似十分简单，但是你可能会遇到这样的问题：当改变了`context`中的属性，但是由于并没有影响父组件中上一层的中间组件的变化，那么上一层的中间组件并不会渲染，这样即使改变了`context`中的数据，你期望改变的子组件中并不一定能够发生变化，例如我们在上面的例子中再来改变一下：

```javascript
// Parent
render() {
    return (
        <div className="test">
        <button onClick={ () => this.setState({ color: 'green' }) }>change color to green</button>  
        <Child1 />
      </div>
    )
}
```

增加一个按钮来改变`state`中的颜色

```javascript
// Child2
class Child2 extends React.Component {
    
      shouldComponentUpdate() {
          return true;
      }

      render() {
          return <Child3 />
      }
}
```

增加`shouldComponentUpdate`来决定这个组件是否渲染。当我在`shouldComponentUpdate`中返回`true`的时候，一切都是那么地正常，但是当我返回`false`的时候，颜色将不再发生变化。

在这里看效果：[https://codepen.io/rynxiao/pen/eyBLgY](https://codepen.io/rynxiao/pen/eyBLgY)

既然发生了这样的情况，那是否意味着我们不能再用`context`，没有绝对的事情，在这篇文章[How to safely use React context](https://medium.com/@mweststrate/how-to-safely-use-react-context-b7e343eff076)中给出了一个解决方案，我们再将上面的例子改造一下：

```javascript
// 重新定义一个发布对象，每当颜色变化的时候就会发布新的颜色信息
// 这样在订阅了颜色改变的子组件中就可以收到相关的颜色变化讯息了
class Theme {
    constructor(color) {
        this.color = color;
        this.subscriptions = [];
    }
  
    setColor(color) {
        this.color = color;
        this.subscriptions.forEach(f => f());
    }
  
    subscribe(f) {
      this.subscriptions.push(f)
    }
}

class Parent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { theme: new Theme('red') };
        this.changeColor = this.changeColor.bind(this)
    }
  
    getChildContext() {
        return { theme: this.state.theme }
    }
  
    changeColor() {
        this.state.theme.setColor('green');
    }
  
    render() {
            return (
            <div className="test">
              <button onClick={ this.changeColor }>change color to green</button>  
              <Child1 />
            </div>
        )
    }
}

const Child1 = () => {
    return <Child2 />
}

class Child2 extends React.Component {
    
    shouldComponentUpdate() {
        return false;
    }
  
    render() {
        return <Child3 />
    }
}

// 子组件中订阅颜色改变的信息
// 调用forceUpdate强制自己重新渲染
class Child3 extends React.Component {
    
    componentDidMount() {
        this.context.theme.subscribe(() => this.forceUpdate());
    }
  
    render() {
        return <div style={{ color: this.context.theme.color }}>Red</div>
    }
}

Parent.childContextTypes = {
    theme: PropTypes.object
};

Child3.contextTypes = {
    theme: PropTypes.object
};  

ReactDOM.render(<Parent />, document.getElementById('container'));
```

看上面的例子，其实就是一个订阅发布者模式，一旦父组件颜色发生了改变，我就给子组件发送消息，强制调用子组件中的`forceUpdate`进行渲染。

代码在这里：[https://codepen.io/rynxiao/pen/QaGVgo](https://codepen.io/rynxiao/pen/QaGVgo)

但在开发中，一般是不会推荐使用`forceUpdate`这个方法的，因为你改变的有时候并不是仅仅一个状态，但状态改变的数量只有一个，但是又会引起其他属性的渲染，这样会变得得不偿失。

另外基于此原理实现的有一个库： [MobX](http://mobxjs.github.io/mobx)，有兴趣的可以自己去了解。

**总体建议是：能别用`context`就别用，一切需要在自己的掌控中才可以使用。**

## 总结

这是自己在使用`React`时的一些总结，本意是朝着偷懒的方向上去了解`context`的，但是在使用的基础上，必须知道它使用的场景，这样才能够防范于未然。





