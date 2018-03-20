---
layout: post
title:  "几个会被面试问到的JS基础实现代码"
date:   2018-03-20
categories: 技术
excerpt: '记录工作和学习中的一些可能会被面试问到的JS内部实现基础，由于笔者水平有限，提供出的答案不一定准确，但是原理尽可能会讲清楚，以后会进行逐步添加。bind实现 bind实现其实是内部调用apply或者call来实现对象的this绑定'
tag: [面试,javascript]
---

记录工作和学习中的一些可能会被面试问到的JS内部实现基础，由于笔者水平有限，提供出的答案不一定准确，但是原理尽可能会讲清楚，以后会进行逐步添加。

## bind实现

`bind`实现其实是内部调用`apply`或者`call`来实现对象的`this`绑定，具体实现可以参考如下：

```javascript
var o = {
    a: 1,
    b: 2,
    print: function() {
        console.log(this.a);
        console.log(arguments);
    }
};

var other = {
    a: 4,
    b: 5
}

Function.prototype.bind = function(context) {
    var args = Array.prototype.slice.call(arguments, 1),
    self = this;
    return function() {
        var innerArgs = Array.prototype.slice.call(arguments);
        var finalArgs = args.concat(innerArgs);
        return self.apply(context,finalArgs);
    };
}

var afterBind = o.print.bind(other, 1, 2);
afterBind(3, 4);
```

## 函数防抖和函数节流

这里是参考的co神的[【前端性能】高性能滚动 scroll 及页面渲染优化](https://www.cnblogs.com/coco1s/p/5499469.html)一文中的防抖和节流。

### 函数防抖

函数防抖是指在一段时间内，只有当操作结束后才会在设置的超时时间内执行操作。可以想象一下，如果在窗口`resize`的时候，就是只有当`resize`结束完成之后，才会进行`resize`的`handler`操作，这样就保证了再`resize`的时候，页面内的元素是不会变动的，也就是“防抖”的真正含义

具体实现如下：

```javascript
// 防抖动函数
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
 
var myEfficientFn = debounce(function() {
    // 滚动中的真正的操作
    console.log('resize');
}, 1000);
 
// 绑定监听
window.addEventListener('resize', myEfficientFn);
```

### 函数节流

函数节流是在函数防抖的基础上增加了一个必须在多少时间间隔内运行一次的结果。就像co神举的例子，如果需要图片懒加载的时候，如果必须要等到滚动停止才加载图片，显示是不对的。

具体实现如下：

```javascript
// 简单的节流函数
function throttle(func, wait, mustRun) {
    var timeout,
        startTime = new Date();
 
    return function() {
        var context = this,
            args = arguments,
            curTime = new Date();
 
        clearTimeout(timeout);
        // 如果达到了规定的触发时间间隔，触发 handler
        if(curTime - startTime >= mustRun) {
            func.apply(context,args);
            startTime = curTime;
        // 没达到触发间隔，重新设定定时器
        } else {
            timeout = setTimeout(func, wait);
        }
    };
};
// 实际想绑定在 scroll 事件上的 handler
function realFunc() {
    console.log("Success");
}
// 采用了节流函数
window.addEventListener('resize',throttle(realFunc,500,1000));
```

## instanceof实现

`instanceof`的实现原理其实是：`instanceof` 左侧的对象沿着`__proto__`进行原型链的查找，右侧的对象沿着`prototype`进行原型链查找，如果存在着查找出的一个对象，使得左右两侧相等，那么`instanceof`就会返回`true`

强烈推荐看[王福朋的javascript原型链系列文章](https://www.cnblogs.com/wangfupeng1988/tag/%E5%8E%9F%E5%9E%8B%E9%93%BE/)，里面有详细的讲解。

具体实现如下：

```javascript
function A() {
    this.name = 'A';
}

function B() {
    this.name = 'B';
}

B.prototype = A.prototype;
B.prototype.constructor = B;

var b = new B();

function myInstanceOf(obj1, obj2) {
    var _p;
    var isInstanceOf = false;
    while(_p = obj1.__proto__) {
        if (_p === obj2.prototype) {
            isInstanceOf = true;
            break;
        }
        obj1 = _p;
    }
    return isInstanceOf;
}

console.log(myInstanceOf(b, B));    // true
console.log(myInstanceOf(B, Function));     // true
console.log(myInstanceOf(b, Function));     // false
console.log(myInstanceOf(b.constructor, Function));     // true
```