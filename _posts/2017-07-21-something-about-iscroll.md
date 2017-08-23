---
layout: post
title:  "IScroll的那些事——内容不足时下拉刷新"
date:   2017-07-21
categories: 技术
tag: [iscroll, javascript]
---

之前项目中的列表是采用的`IScroll`，但是在使用`IScroll`有一个问题就是：当内容不足全屏的时候，是木有办法往下拉的，这样就达不到刷新的目的了。【**这是本人工作中遇到的，具体例子具体分析，这里只作一个参考**】

大致的例子是这样的：

{% highlight html %}
<style>
    * {
        margin: 0;
        padding: 0;
    }
    html,body,.container {
        width: 100%;
        height: 100%;
    }
    .container>ul>li {
        padding: 15px 20px;
        text-align: center;
        border-bottom: 1px solid #ccc;
    }
</style>

<div id="container" class="container">
    <ul class="scroller">
        <li>item1</li>
        <li>item2</li>
        <li>item3</li>
        <li>item4</li>
        <li>item5</li>
    </ul>
</div>

<script src="https://cdn.bootcss.com/iScroll/5.2.0/iscroll.min.js"></script>
<script>
    var myScroll = null;
    function onLoad() {
        myScroll = new IScroll('container');
    }
    window.addEventListener('DOMContentLoaded', onLoad, false);
</script>
{% endhighlight %}



那么，既然超过一屏是可以刷新的，那我们就来逛逛代码吧。在github上搜索iscroll，打开第一个，找到`src`下面的`core.js`。

### 1. 思路

首先既然要下拉，肯定会触发`touchstart`、`touchmove`以及`touchend`事件。搜索`touchmove`，很好，在`_initEvents`中的注册了这个事件。

{% highlight javascript %}
_initEvents: function (remove) {
        // ...
        // 这里省略若干代码

        if ( utils.hasTouch && !this.options.disableTouch ) {
            eventType(this.wrapper, 'touchstart', this);
            eventType(target, 'touchmove', this);
            eventType(target, 'touchcancel', this);
            eventType(target, 'touchend', this);
        }

        // ...
},
{% endhighlight %}

好吧，看到这里的时候，我表示懵了一下逼，这不就是个绑定事件么？`this`又是一个什么鬼，然后我去查了一下文档，发现了这么一个东西。[文档地址](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)

{% highlight javascript %}
target.addEventListener(type, listener[, options]);
target.addEventListener(type, listener[, useCapture]);
target.addEventListener(type, listener[, useCapture, wantsUntrusted  ]); 
//  
// Gecko/Mozilla only

listener
    当所监听的事件类型触发时，会接收到一个事件通知（实现了 Event 接口的对象）对象。listener 必须是一个实现了 EventListener 接口的对象，或者是一个函数
{% endhighlight %}

木有看错，`listener`是一个对象或者是一个函数。前提是这个对象实现了`EventListener`接口。我们接着往下看，发现了这么一个例子。

{% highlight javascript %}
var Something = function(element) {
    // |this| is a newly created object
    this.name = 'Something Good';
    this.handleEvent = function(event) {
        console.log(this.name); 
        // 'Something Good', as this is bound to newly created object
        switch(event.type) {
            case 'click':
                // some code here...
                break;
            case 'dblclick':
                // some code here...
                break;
        }
    };

    // Note that the listeners in this case are |this|, not this.handleEvent
    element.addEventListener('click', this, false);
    element.addEventListener('dblclick', this, false);

    // You can properly remove the listeners
    element.removeEventListener('click', this, false);
    element.removeEventListener('dblclick', this, false);
}
var s = new Something(document.body);
{% endhighlight %}

然后在去`IScroll`的源码去找，发现了同样的实现方式。在`default`文件夹中有一个`handleEvent.js`。

好了，这个梗先告一段落。还是继续看源码。在`handleEvent.js`中，有这么一段东西。

{% highlight javascript %}
handleEvent: function (e) {
        switch ( e.type ) {
            case 'touchstart':
            case 'pointerdown':
            case 'MSPointerDown':
            case 'mousedown':
                this._start(e);
                break;
            case 'touchmove':
            case 'pointermove':
            case 'MSPointerMove':
            case 'mousemove':
                this._move(e);
                break;
            case 'touchend':
            case 'pointerup':
            case 'MSPointerUp':
            case 'mouseup':
            case 'touchcancel':
            case 'pointercancel':
            case 'MSPointerCancel':
            case 'mousecancel':
                this._end(e);
                break;
            // ...
        }
    }
};
{% endhighlight %}

发现在`start/move/end`分别调用了内部方法`_start/_move/_end`方法。去看看这三个方法，看其中可能会引起不会滑动的点。

在`_start`方法中，看到这样的几行代码，会不会是直接返回了呢？分析分析：

{% highlight javascript %}
if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) {
    return;
}

// ...

var point = e.touches ? e.touches[0] : e,
    pos;

this.initiated  = utils.eventType[e.type];
this.moved      = false;
{% endhighlight %}

`initiated`属性在最开始肯定是没有的，而`enabled`默认是`true`，所以在最开始执行这个方法的时候是不会返回的，而是会给`initiated`这个属性设置当前的`eventType`值，这个值会在`_move`方法中用到。重点来看看`_move`方法。

{% highlight javascript %}
if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
    return;
}
{% endhighlight %}

首先来进行类型判断，因为在`_start`方法中已经定义了这个值，所以这里也不会返回。接着往下看：

{% highlight javascript %}
if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
    return;
}
{% endhighlight %}

【**实际上是两次click事件的模拟**】如果两次滑动的时间大于了300ms，并且只要一个方向上的位移少于10像素，那么也是会返回的。那么会不会呢，打个断点测试一下就知道了。这里就不贴图了，实际中的测试结果是，每一次移动肯定是在300ms以内的，这里之所以判断300ms,主要是`click`事件执行会有一个300ms的延迟。而每一次移动，由于手指的触点比较大，还是会大于10像素的，即使两次不大于10像素，也是不影响的。所以这点不会返回。那么继续接着看：

{% highlight javascript %}
// If you are scrolling in one direction lock the other
if ( !this.directionLocked && !this.options.freeScroll ) {
    if ( absDistX > absDistY + this.options.directionLockThreshold ) {
        this.directionLocked = 'h';     // lock horizontally
    } else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
        this.directionLocked = 'v';     // lock vertically
    } else {
        this.directionLocked = 'n';     // no lock
    }
}

if ( this.directionLocked == 'h' ) {
    if ( this.options.eventPassthrough == 'vertical' ) {
        e.preventDefault();
    } else if ( this.options.eventPassthrough == 'horizontal' ) {
        this.initiated = false;
        return;
    }

    deltaY = 0;
} else if ( this.directionLocked == 'v' ) {
    if ( this.options.eventPassthrough == 'horizontal' ) {
        e.preventDefault();
    } else if ( this.options.eventPassthrough == 'vertical' ) {
        this.initiated = false;
        return;
    }

    deltaX = 0;
}
{% endhighlight %}

第一个条件判断只要是定义了这次滑动的方向是什么。`h`表示水平方向，`v`表示竖直方向。我们是要向下滑动，所以我们关注的是竖直方向。看第二个条件判断，如果是竖直方向，那么将水平方向的`deltaX`值变为0。这样做的目的是保持绝对的竖直方向。因为移动实际还是根据元素的位移值来的。当`probe`的版本为2以下的时候，是根据css3的`transform`属性来移动位移的，为3版本的时候是根据决定对位来移动的。所以这里只要不把我们的`deltaY`置为0就说明木有什么问题。继续往下看代码：

{% highlight javascript %}
deltaX = this.hasHorizontalScroll ? deltaX : 0;
deltaY = this.hasVerticalScroll ? deltaY : 0;

newX = this.x + deltaX;
newY = this.y + deltaY;
// ...

// 这里是移动
this._translate(newX, newY);
{% endhighlight %}

测试中发现，这个`hasVerticalScroll`一直是`false`，那么`deltaY`一直就是0，也就是移动了也白移动。找到问题原因。那么，这个`hasVerticalScroll`是从哪里来的？全局找呀找，在`refresh`中找到这样几行代码：

{% highlight javascript %}
this.wrapperWidth   = this.wrapper.clientWidth;
this.wrapperHeight  = this.wrapper.clientHeight;

var rect = utils.getRect(this.scroller);
/* REPLACE START: refresh */

this.scrollerWidth  = rect.width;
this.scrollerHeight = rect.height;

this.maxScrollX     = this.wrapperWidth - this.scrollerWidth;
this.maxScrollY     = this.wrapperHeight - this.scrollerHeight;

/* REPLACE END: refresh */

this.hasHorizontalScroll    = this.options.scrollX && this.maxScrollX < 0;
this.hasVerticalScroll      = this.options.scrollY && this.maxScrollY < 0;
{% endhighlight %}

`refresh`方法会在`IScroll`实例化的时候调用一次。粗略一看，`scrollY`内置为`true`，所以只有`maxScrollY`会大于0。往上看。`this.wrapperHeight - this.scrollerHeight`肯定是大于0的呀，这就是问题所在。

那么看看我们最开始代码，这里的`wrapperHeight`为文档高度，`scrollerHeight`为内容高度，所以`wrapperHeight`高度始终大于`scrollHeight`。但是，手机端页面夹杂的列表，一般都有头部、底部，而中间部分一般都会采用`padding`的形式来使得列表在全局滚动，这样就不需要每次都要特定地计算列表的高度。

### 2. 解决方案

针对以上问题，只要我们能够使内部的滚动部分高度大于容器高度，那么就能触发滚动。

#### 2.1 粗略做法

可以设置一个`min-height`属性为`900px`(900只是一个示例，只要够大就可以)，这样就可以保证可以滑动。

#### 2.2 精准做法

计算当前的容器高度，然后比容器高度多一个像素即可。

