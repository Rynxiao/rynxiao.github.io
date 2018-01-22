---
layout: post
title:  "移动端APP列表点透事件处理方法"
date:   2018-01-22
categories: 技术
excerpt: '关于点透事件这里不再赘述，如果不清楚的可以上网搜一搜，或者看小火柴的这篇文章。 这里是自己在做移动端时，在列表滑动的时候，遇到的点透问题。出现这个问题的来由是因为在转场的时候，各个手机的转场效果不一'
tag: [javascript,react,点透]
---


关于点透事件这里不再赘述，如果不清楚的可以上网搜一搜，或者看小火柴的[这篇文章](http://www.cnblogs.com/xiaohuochai/p/8293225.html)。

这里是自己在做移动端时，在列表滑动的时候，遇到的点透问题。出现这个问题的来由是因为在转场的时候，各个手机的转场效果不一样，有的比较好，但是在有些低端机上，转场显得有点卡，于是就把过渡效果去掉了，因此就是直接的路由切换。**【具体事件具体分析，可能我遇到的问题并不适合你，这里只是贴出来共享】**

先看下面两张图片：

![page1](http://img.blog.csdn.net/20180122102648803)
![page2](http://img.blog.csdn.net/20180122102703959)

点击列表页的按钮会切换到下一个页面，但是在下一个页面上的每一个条目都是可以点击的，这时就会触发了下一个页面的弹窗，事实上我们并不想直接显示这个弹窗，而是要等待用户点击。

你可能在项目中的列表页写了如下的一段代码：

```javascript
render() {
    return (
        <ul className="list">
            { 
                list.map((l, index) => {
                    return (
                        <li key={ `list${index}` } onClick={ () => doSomething() }>
                            { `item${index}` }
                        </li>
                    )
                })  
            }
        </ul>
    );
}
```

在一个列表中的每个项目上绑定了点击事件，但是当点击之后切换到下一页。当时移动端的点击事件都会有300ms的延迟，因此在切换了页面之后，浏览器会再次判断点击的行为，此时如果下一个页面都有可以触发点击的元素，这时候就触发了下一个页面的点击行为。

于是，你可能会这么做，将`onClick`事件换成`onTouchEnd`事件

```javascript
<li 
    key={ `list${index}` } 
    onTouchStart= { event => event.preventDefault() }
    onTouchEnd={ () => doSomething() }>
    { `item${index}` }
</li>
```

但是，每次滑动的时候，其实你也触发了`onTouchEnd`事件，于是每次滑动你都会点击进入到下一页。于是你又想，加上一个`onTouchStart`事件，然后阻止掉默认事件，尼玛发现滑都滑不动了。

因此针对常用的几种解决点透事件的方法，我想了几种解决方案：

## 方案一：自己模拟Tap事件

大致的代码如下：

```javascript
var list = document.querySelector('#list');
var dragState = {};

list.addEventListener('touchstart', function(event) {
    var touch = event.touches[0];
    dragState.startTime = new Date();
    dragState.startLeft = touch.pageX;
    dragState.startTop = touch.pageY;
    dragState.startTopAbsolute = touch.clientY;
});

list.addEventListener('touchmove', function(event) {
    var touch = event.touches[0];
    dragState.currentLeft = touch.pageX;
    dragState.currentTop = touch.pageY;
    dragState.currentTopAbsolute = touch.clientY;
});

list.addEventListener('touchend', function() {
    var dragDuration = new Date() - dragState.startTime;
    var offsetLeft = dragState.currentLeft - dragState.startLeft;
    var offsetTop = dragState.currentTop - dragState.startTop;

    if (dragDuration < 300) {
        var fireTap = Math.abs(offsetLeft) < 10 && Math.abs(offsetTop < 10);
        if (isNaN(offsetLeft) || isNaN(offsetTop)) {
            fireTap = true;
        }
        if (fireTap) {
            alert('tap');
        }
    }
    dragState = {};
});
```

判断水平位移差和垂直位移差都小于10像素，并且`touchstart`和`touchend`的时间差小于300ms时，即认为触发了`Tap`事件。

## 方案二：加入转场动画

既然是因为转场动画在某些机型上比较卡的原因造成的，那么如果不是太考虑性能的话，可以加上转场动画，关于`react`中的转场动画，时间大概在300ms就好，可以看我之前对于转场代码的研究：[react-css3-transition-group](https://github.com/Rynxiao/react-css3-transition-group)

## 方案三：在目标页面加入遮罩层

在目标页面加上一层透明的弹层，使上一个页面的点击在此弹层上失效，具体做法为使用一个高阶组件，在高阶组件中添加一个定时器，在每个页面加载的时候生成一个弹层，400ms之后消失弹层即可。

```javascript
import React from 'react';

const styles = {
    modal: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: 'transparent'
    }
};

const ComponentWrapper = MyComponent => {

    const ComponentTemplate = React.createClass({
        getInitialState() {
            return {
                modal: true
            };
        },

        componentDidMount() {
            this.modalInter = setTimeout(() => {
                this.setState({ modal: false });
            }, 400);
        },

        componentWillUnmount() {
            this.hideTips();
            this.modalInter && clearTimeout(this.modalInter);
        },

        render() {
            return (
                <Page style={ this.props.style }>
                    <MyComponent { ...this.props } container={ this } />
                    { this.state.modal && <div style={ styles.modal }></div> }
                </Page>
            )
        }
    });

    return ComponentTemplate;
};

export default ComponentWrapper;
```

另外在`0.13.3`版本的`react`还支持`mixins`的时候，可以添加如下代码：

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

const styles = {
    modal: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        backgroundColor: 'transparent'
    }
};

const clickThroughMixin = {
    getInitialState() {
        return {
            clickThroughModal: true
        }
    },

    componentDidMount() {
        this._renderModal();
        this.modalInter = setTimeout(() => {
            this._modalTarget && ReactDOM.unmountComponentAtNode(this._modalTarget);
            this._modalTarget.remove();
        }, 400);
    },

    componentWillUnmount() {
        this.modalInter && clearTimeout(this.modalInter);
    },

    _renderModal() {
        if (!this._modalTarget) {
            this._modalTarget = document.createElement('div');
            this._container = this._getContainerDOMNode().appendChild(this._modalTarget);
            ReactDOM.unstable_renderSubtreeIntoContainer(
                this, (<div style={ styles.modal }></div>), this._modalTarget
            );
        }
    },

    _getContainerDOMNode() {
        const node = ReactDOM.findDOMNode(this), body = document.body;
        return node ? node.parentNode || body : body;
    }
};

export default clickThroughMixin;
```