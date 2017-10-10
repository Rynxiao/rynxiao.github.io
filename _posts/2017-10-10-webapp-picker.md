---
layout: post
title:  "移动端效果之Picker"
date:   2017-10-10
categories: 技术
excerpt: '写在前面 接着前面的移动端效果的研究，这次来看看 选择器的实现原理 "移动端效果之Swiper" 代码看这里： "github" 1. 核心解析 1.1 基本HTML结构 1.2 初始化DOM 由于饿了么源码中的 是采用 指令生成的 ，因此我这里只是简单的用 来模拟一下 的生成。 javascrip'
tag: [webapp, picker]
---

## 写在前面

接着前面的移动端效果的研究，这次来看看`picker`选择器的实现原理

[移动端效果之Swiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/09/webapp-swiper.html)

代码看这里：[github](https://github.com/Rynxiao/mint-ui-learn)

![picker](http://img.blog.csdn.net/20171010180605685)

## 1. 核心解析

### 1.1 基本HTML结构

```html
<!-- 
    说明：
    1. 类 picker-3d 是为了提供3d视角，如果不需要可以去掉
    2. 类 picker-slot-absolute 在3d视角中需要加上，因为下面相对定位的 picker-items 是要相对父容器进行
    transform的，如果不加，就会造成位移不正确
    3. DOM中所有的style样式都是在初始化的时候加上的
-->
<div class="picker picker-3d">
    <div class="picker-items">
        <div class="picker-slot picker-slot-absolute" style="flex:1;">
            <div class="picker-slot-wrapper" id="wrapper" style="height: 108px;">
                <div class="picker-item picker-selected" style="height:36px;line-height: 36px">1981</div>
                <!-- ... -->
                <div class="picker-item" style="height:36px;line-height: 36px">1999</div>
            </div>
        </div>
    </div>
    <div class="picker-center-highlight" style="height:36px;margin-top:-18px;"></div>
</div>
```

### 1.2 初始化DOM

由于饿了么源码中的`picker`是采用`v-for`指令生成的`DOM`，因此我这里只是简单的用`javascript`来模拟一下`DOM`的生成。

```javascript
var el = document.querySelector('#wrapper');
var animationFrameId = null;
var currentValue;
var itemHeight = 36;
var visibleItemCount = 3;
var valueIndex = 0;
var rotateEffect = true;

var datas = ['1981', '1982', '1983', '...', '1999'];

// 如果支持3d视角，则给<div class="picker"></div>加上类"picker-3d"
// <div class="picker-slot" style="flex:1;">加上类"picker-slot-absolute"
if (rotateEffect) {
    var picker = document.querySelector('.picker');
    var pickerSlot = document.querySelector('.picker-slot');
    picker.classList.add('picker-3d');
    pickerSlot.classList.add('picker-slot-absolute');
}

// 限定容器高度
el.style.height = `${visibleItemCount * itemHeight}px`;

// 生成DOM
var html = '';
datas.forEach(function(data, index) {
    html += `<div class="picker-item" style="height:36px;line-height:36px;">${data}</div>`;
});
el.innerHTML = html;

// 激活当前item
var pickerItems = document.querySelectorAll('.picker-item');
pickerItems[valueIndex].classList.add('picker-selected');
```

### 1.3 初始化事件

总体上来说，`picker`的事件也包括滑动开始、滑动中、滑动结束。因为毕竟是移动端，滑动不可避免。这次，源码中的对滑动事件进行了封装，兼容了`PC`端以及排除了拖动和选择造成的影响，具体看一下分析。`

```javascript
/** 
 * draggable.js 
 * 只是起到一定的兼容性
 * 实质和直接调用 el.addEventListener('touchstart', startFn); 并没有多大差别
 */

// 滑动开始
// touchstart 和 mousedown 可见对PC端的兼容
// onselectstart/ondragstart 直接return 可见排除了拖动和选择
element.addEventListener(supportTouch ? 'touchstart' : 'mousedown', function(event) {
    if (isDragging) return;
    document.onselectstart = function() { return false; };
    document.ondragstart = function() { return false; };

    // ...
});

// 滑动结束
var endFn = function(event) {
    // 注销事件
    if (!supportTouch) {
        document.removeEventListener('mousemove', moveFn);
        document.removeEventListener('mouseup', endFn);
    }
    document.onselectstart = null;
    document.ondragstart = null;

    isDragging = false;

    if (options.end) {
        options.end(supportTouch ? event.changedTouches[0] || event.touches[0] : event);
    }
}
```

要是`DOM`跟随自己在手机屏幕上的滑动而滑动，方法大同小异，无非就是在开始滑动记录开始位置，滑动中实时计算位移，滑动结束之后将`DOM`滑动应该滑动的位置。这点可以参看前面一篇文章[移动端效果之Swiper](http://www.cnblogs.com/rynxiao/p/7640647.html)，这篇文章中有着相同的方法。这里重点讲一下其中的区别

```javascript
// 滑动开始的执行事件方法
start: function(event) {
    dragState = {
        range: getDragRange(),
        // ...
        startTranslateTop: translateUtil.getElementTranslate(el).top
    };
}
```

这其中有两个方法，第一个`getDragRange`和第二个`getElementTranslate(el)`.

-   第一个函数的作用是获取`picker`能够滑动的最小和最大的位移，这将会在滑动结束事件中用到。关于如何计算，这里简单提一下，向下滑动，最大不能超过最中间的`item`的最上方，这也就是为什么`itemHeight * Math.floor(visibleItemCount / 2)`，而向上滑动，最大不能超过中间`item`的最下方，`-itemHeight * (valuesLength - Math.ceil(visibleItemCount / 2))`，细细想一下就好了。
-   第二个函数的作用是获取当前`picker`的`transform`值，作为下一次滑动计算的依据。其实感觉这样挺费事，因为在`touchend`中最后肯定会计算`translate`值，我们只需要每次保存最后滑动的移动值就好了，而不要每次都要在`DOM`中取。

```javascript
/**
 * translateUtil
 * 对浏览器对前缀支持的一些判断
 * 检测浏览器对3d属性的支持情况
 * 获取当前的translate值/清空picker的translate值/移动picker
 * 对于浏览器的检测方面，这也算是一个比较好的工具类
 */
var docStyle = document.documentElement.style;
var engine;
var translate3d = false;

// 浏览器判断
if (window.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
    engine = 'presto';
} else if ('MozAppearance' in docStyle) {
    engine = 'gecko';
} else if ('WebkitAppearance' in docStyle) {
    engine = 'webkit';
} else if (typeof navigator.cpuClass === 'string') {
    engine = 'trident';
}

// css前缀
var cssPrefix = {
    trident: '-ms-',        // IE
    gecko: '-moz-',         // FireFox
    webkit: '-webkit-',     // Chrome/Safari/etc...
    presto: '-o-'           // Opera
}[engine];

// style前缀
var vendorPrefix = {
    trident: 'ms',
    gecko: 'Moz',
    webkit: 'Webkit',
    presto: 'O'
}[engine];

var helpElem = document.createElement('div');
var perspectiveProperty = vendorPrefix + 'Perspective';
var transformProperty = vendorPrefix + 'Transform';
var transformStyleName = cssPrefix + 'transform';
var transitionProperty = vendorPrefix + 'Transition';
var transitionStyleName = cssPrefix + 'transition';
var transitionEndProperty = vendorPrefix.toLowerCase() + 'TransitionEnd';

if (helpElem.style[perspectiveProperty] !== undefined) {
    translate3d = true;
}

// 讲一下这个正则
// \s*(-?\d+(\.\d+?)?)px 这是一个单元，匹配这样的 -23.15px, 剩下的应该就好理解了
var regexp = /translate\(\s*(-?\d+(\.\d+?)?)px,\s*(-?\d+(\.\d+?)?)px\)\s*translateZ\(0px\)/ig;
```

接下来看看滑动中

```javascript
drag: function(event) {
    // 加上 dragging 类是为了清除过渡效果，在swiper中也有同样的应用
    el.classList.add('dragging');

    dragState.left = event.pageX;
    dragState.top = event.pageY;

    var deltaY = dragState.top - dragState.startTop;
  
    // 计算当前的滑动位移
    var translate = dragState.startTranslateTop + deltaY;

    // 滑动元素
    translateUtil.translateElement(el, null, translate);
    velocityTranslate = translate - prevTranslate || translate;

    prevTranslate = translate;

    if (rotateEffect) {
        updateRotate(prevTranslate, pickerItems);
    }
}
```

看到以上的代码中有一个`velocityTranslate`，这个值有神马作用，最开始我也不清楚，后面发现在滑动结束之后用到了，才明白了它代表了一个速率的位移值。什么是速率？就好比你快速滑动的时候，总希望它能够惯性滑动一下，这个值乘以一个惯性值就可以得出一个惯性位移。看`end`中的代码。

```javascript
end: function() {
    // 添加过渡
    el.classList.remove('dragging');
    // 惯性值
    var momentumRatio = 7;
    var currentTranslate = translateUtil.getElementTranslate(el).top;
    var duration = new Date() - dragState.start;

    var momentumTranslate;
    if (duration < 300) {
        momentumTranslate = currentTranslate + velocityTranslate * momentumRatio;
    }

    // 加上惯性速率之后的位移值
    console.log('momentumTranslate', momentumTranslate);

    dragRange = dragState.range;

    setTimeout(function() {
        var translate;
        if (momentumTranslate) {
            translate = Math.round(momentumTranslate / itemHeight) * itemHeight;
        } else {
            translate = Math.round(currentTranslate / itemHeight) * itemHeight;
        }

        // 取得最终的位移值，
        // 必须为itemHeight的倍数
        // 在范围的最大值和最小值中取
        translate = Math.max(Math.min(translate, dragRange[1]), dragRange[0]);
        translateUtil.translateElement(el, null, translate);

        // 计算得出当前位移下应该对应的实际值
        currentValue = translate2Value(translate);

        // 3d效果
        if (rotateEffect) {
            planUpdateRotate();
        }
    }, 10);

    dragState = {};
}
```

这就是整个`picker`的实现流程，撇开`3d`效果就可以使用了。下面看一下如何实现的`3D`效果。在`doOnValuesChange`中有一个最开始的初始化。

```javascript
[].forEach.call(items, function(item, index) {
    translateUtil.translateElement(item, null, itemHeight * index);
});
```

给每一个`item`设置了根据索引来的位移值，此时的每一个`item`的定位都必须是`absolute`的，这样位移下来才是紧挨着的，不然可能中间都会有一个`itemHeight`的空格。

`3D`效果中最关键的一点就是如何进行翻转角度的计算。在源码中定义了一个常量对象：

```javascript
var VISIBEL_ITEMS_ANGLE_MAP = {
    3: -45,
    5: -20,
    7: -15
};
```

可以看到，当只有3个可见元素的时候，高亮部分相对于`X`轴平行，而上一个`item`就必须绕`X`轴顺时针旋转45度，反之下一个`item`绕`X`轴逆时针旋转45度。另外在其中有一段代码特别绕，根据我的理解是这样的：

```javascript
// 当前item相对于顶部原本应该有的位移值
var itemOffsetTop = index * itemHeight; 

// 滑动过程中，相对于最开始的位置滑动的位移值
var translateOffset = dragRange[1] - currentTranslate;

// 当应该有的位移值和滑动的位移值相等的时候，也就说明了当前的`item`被选中
// 也就是说此时当前的角度为0
var itemOffset = itemOffsetTop - translateOffset;
var percentage = itemOffset / itemHeight;

var angle = angleUnit * percentage;
if (angle > 180) angle = 180;
if (angle < -180) angle = -180;

rotateElement(item, angle);
```

如果觉得太绕，其实也没有必要按照他的这种做法来，我们只要想办法确定每一个`item`相对于当前选中的`item`是处于上一个还是下一个，就可以根据此来计算角度。

## 2. 总结

关于饿了么中的`picker`组件就看了这么多，整体来说跟`swiper`中的滑动十分相似，其中的关键点在于最后的计算位移值来根据位移值滑动到正确的位置，至于怎么计算值，其实每个人的实现方式可能都是大同小异的，也没要必要一定要按照源码来，可以适当加入自己的理解，这样或许写起代码来更加得心应手。这里只是个人的一点理解，希望能够给自己也给大家提供一点帮助。

