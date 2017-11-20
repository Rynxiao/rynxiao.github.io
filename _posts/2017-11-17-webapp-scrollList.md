---
layout: post
title:  "移动端效果之ScrollList"
date:   2017-11-17
categories: 技术
excerpt: '写在前面 列表一直是展示数据的一个重要方式，在手机端的列表展示又和PC端展示不同，毕竟手机端主要靠滑。之前手机端之前一直使用的 ，但是 本身其实有很多兼容性 ，想改动一下需求也很不容易，可以看我之前写的这一文章 "IScroll那些事——内容不足时下拉刷新" （这里并不是说 不好，里面对手机、浏览器'
tag: [webapp, scrollList]
---

## 写在前面

列表一直是展示数据的一个重要方式，在手机端的列表展示又和PC端展示不同，毕竟手机端主要靠滑。之前手机端之前一直使用的`IScroll`，但是`IScroll`本身其实有很多兼容性`BUG`，想改动一下需求也很不容易，可以看我之前写的这一文章[IScroll那些事——内容不足时下拉刷新](http://www.cnblogs.com/rynxiao/p/7198312.html)（这里并不是说`IScroll`不好，里面对手机、浏览器兼容性都做了大量的处理，只是当遇到`bug`时或者想改一下需求时不时特别方便，毕竟是一个这么大的库）。因此也一直想了解一下这类列表的实现原理，万一真到时候可以自己写一个，这样自己维护自己的代码也可以更加得心应手。

下面主要是阅读了饿了么`UI`组件库`mint-ui`然后编写出来的效果图：

![LoadMore](http://oyo3prim6.bkt.clouddn.com/image/mint-ui/load-more.gif)

代码请看这里：[github](https://github.com/Rynxiao/mint-ui-learn)

[移动端效果之swiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/09/webapp-swiper.html)

[移动端效果之picker](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/10/webapp-picker.html)

[移动端效果之cellSwiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/13/webapp-cellSwiper.html)

[移动端效果之IndexList](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/20/webapp-indexList.html)

## 1 核心解析

### 1.1 整体思路图

![silu](http://oyo3prim6.bkt.clouddn.com/image/mint-ui/loadi-more-pic.png)

### 1.2 HTML结构

```html
<div class="page-loadmore-wrapper">
    <div id='loadMore' class="loadmore">
        <div id="loadMoreContent" class="loadmore-content">
            <!-- 这里是顶部状态生成的地方 -->
            <ul class="page-loadmore-list" id="loadMoreList"></ul>
            <!-- 这里是底部状态生成的地方 -->
        </div>
    </div>
</div>
```

这里有一点需要注意，滑动内容部分需要一个设置为`overflow:scroll`的容器，如果不设置，就会一直向上找，直到最后返回`window`，这点在下面的代码可以体现

```javascript
/**
 * 获取滚动容器
 * @param  DOM element 
 * @return 
 */
getScrollEventTarget: function(element) {
    var currentNode = element;
    while (currentNode && currentNode.tagName !== 'HTML' &&
         currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
        var overflowY = document.defaultView.getComputedStyle(currentNode).overflowY;
        if (overflowY === 'scroll' || overflowY === 'auto') {
            return currentNode;
        }
        currentNode = currentNode.parentNode;
    }
    return window;
}
```

### 1.3 滑动弹性与状态变化

这两点我们在`touchmove`事件中可以找到相应的代码：

```javascript
// 弹性滑动
// 这里用手指滑动的位移除以比例系数来得出内容应该滑动的位移
// 因此这里的内容滑动的位移一定是会小于手指滑动的位移的，除非你将系列设置为小于1，那我就没得话说了
// 于是就造成了一种滑动又滑不动的感觉
var distance = (_this.currentY - _this.startY) / _this.config.distanceIndex;

// 下移条件
// 1. 必须有刷新函数
// 2. 方向为向下
// 3. 初始的scrollTop为0
// 4. 状态不为加载中
if (typeof _this.config.topMethod === 'function' && _this.direction === 'down' &&
    _this.getScrollTop(_this.scrollEventTarget) === 0 && _this.topStatus !== 'loading') {
    event.preventDefault();
    event.stopPropagation();

    if (_this.config.maxDistance > 0) {
        _this.translate = distance <= _this.config.maxDistance ? distance - _this.startScrollTop : _this.translate;
    } else {
        _this.translate = distance - _this.startScrollTop;
    }

    if (_this.translate < 0) {
        _this.translate = 0;
    }

    // 这里是滑动中(touchmove)时应该判断的
    // 如果滑动的位移操作了我们设置的值就置为pull
    // 同时更新状态，改变内容的transform
    // 同理可以在向上拉动的时候找到相应的代码，这里不作累述
    _this.topStatus = _this.translate >= _this.config.topDistance ? 'drop' : 'pull';

    Event.trigger('topStatus', _this.topStatus);
    Event.trigger('translate', _this.translate);
}

// 在向上滑动的过程中，还需要时刻检测是否已经滑倒最下面了
// 如果没有滑倒最下面，则正常滑动，否则，加载新的数据
if (_this.direction === 'up') {
    _this.bottomReached = _this.bottomReached || _this.checkBottomReached();
}
```

#### 1.4 加载数据

当状态在`loading`的时候，就是加载数据的时候，而只有当滑动停止之后，状态才需要置为`loading`，因此加载数据的代码需要在`touchend`中执行，具体看下面代码注释：

```javascript
// 这里分析向下刷新数据时候的代码
// 向上部分的类似，可以自行去了解
if (_this.direction === 'down' && _this.getScrollTop(_this.scrollEventTarget) === 0 && _this.translate > 0) {
    // 这里触发topDropped为true是为了给内容部分加上动画
    Event.trigger('topDropped', true);

    // 判断当前是否已经拉倒了足够的位移，只有状态为drop的时候放手才会加载数据
    if (_this.topStatus === 'drop') {
        // 重置状态为loading，改变位移
        Event.trigger('topStatus', 'loading');
        // 向下移动50px像素是为了展示出loading的文字
        Event.trigger('translate', 50);

        // 加载数据
        _this.config.topMethod(function() {
            var args = [].slice.call(arguments);
            _this.onTopLoaded.apply(_this, args);
        });
    } else {
        // 如果向下拉动状态仍为pull，说明拉动的距离很小
        Event.trigger('translate', 0);
        Event.trigger('topStatus', 'pull');
    }
}
```

#### 1.5 上拉加载数据完成之后

这里与下拉刷新有一点小小的不同，这里贴一下代码：

```javascript
onBottomLoaded: function(list, isAllLoaded) {
    Event.trigger('bottomStatus', 'pull');
    Event.trigger('bottomDropped', false);
    Event.trigger('data', list);

    // 这里给scrollEventTarget设置了scrollTop为50是为了防止跳动
    if (this.scrollEventTarget === window) {
        document.body.scrollTop += 50;
    } else {
        this.scrollEventTarget.scrollTop += 50;
    }

    Event.trigger('translate', 0);
    this.bottomAllLoaded = isAllLoaded;
}
```

### 1.6 关于数据初始化填充

在数据内容不足一屏时，如果设置了`autoFill`字段为`true`的话，会自动调用一遍`bottomMethod`来填充数据

```javascript
fillContainer: function() {
    var _this = this;

    // 如果自动填充
    if (this.config.autoFill) {
        // 根据滚动容器来判断当前数据是否已经填充满容器
        if (this.scrollEventTarget === window) {
            this.containerFilled = this.$el.getBoundingClientRect().bottom >=
                document.documentElement.getBoundingClientRect().bottom;
        } else {
            this.containerFilled = this.$el.getBoundingClientRect().bottom >=
            this.scrollEventTarget.getBoundingClientRect().bottom;
        }

        // 如果数据没有填充满容器，则加载数据
        if (!this.containerFilled) {
            // 这里算是一点小遗憾，为了在自动加载loading的时候，显示出状态
            // 将内容部分位移了-50px，这就是为什么在自动加载的时候会出现一个跳动的过程
            Event.trigger('bottomStatus', 'loading');
            Event.trigger('translate', -50);
            var data = this.config.bottomMethod(function(list) {
                Event.trigger('data', list);
                Event.trigger('bottomStatus', 'pull');
                Event.trigger('translate', 0);
            });
        }
    }
},
```

## 2 总结

最开始会认为这样的效果实现起来会比较复杂（不过实际上确实也写了快500到600行代码了😀），但是真正分析起来，其实觉得代码还好，并没有想像得辣么困难。遇上自己想要实现的东西，就努力地去啃吧，就像遇到了你喜欢的女孩一样🤣