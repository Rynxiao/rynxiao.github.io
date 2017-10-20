---
layout: post
title:  "移动端效果之IndexList"
date:   2017-10-20
categories: 技术
excerpt: '写在前面接着前面的移动端效果讲，这次讲解的的是IndexList的实现原理。效果如下：代码请看这里：github移动端效果之swiper移动端效果之picker移动端效果之cellSwiper1. 核心解析总体来说的原理就是当点击或者滑动右边的索引条时，通过获取点击的索引值来使左边的内容滑动到相应的位置。其中怎样滑动到具体的位置，看下面分解：1.1 基本html代码div class="index'
tag: [webapp, IndexList]
---

## 写在前面

接着前面的移动端效果讲，这次讲解的的是`IndexList`的实现原理。效果如下：

![IndexList](http://img.blog.csdn.net/20171020093538678)

代码请看这里：[github](https://github.com/Rynxiao/mint-ui-learn)

[移动端效果之swiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/09/webapp-swiper.html)

[移动端效果之picker](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/10/webapp-picker.html)

[移动端效果之cellSwiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/13/webapp-cellSwiper.html)

## 1. 核心解析

总体来说的原理就是当点击或者滑动右边的索引条时，通过获取点击的索引值来使左边的内容滑动到相应的位置。其中怎样滑动到具体的位置，看下面分解：

### 1.1 基本html代码

```javascript
<div class="indexlist">
    <ul class="indexlist-content" id="content">
        <!-- 需要生成的内容 -->
    </ul>
  <div class="indexlist-nav" id="nav">
      <ul class="indexlist-navlist" id="navList">
            <-- 需要生成的索引条 -->
      </ul>
  </div>
  <div class="indexlist-indicator" style="display: none;" id="indicator"></div>
</div>
```

### 1.2 DOM初始化

由于饿了么组件库中的`indexList`是采用`vue`组件生成`DOM`，我这里大致使用`javascript`来模拟生成`DOM`。

```javascript
// 内容填充
function initialDOM() {
    // D.data 获取内容数据
    var data = D.data;
    var contentHtml = '';
    var navHtml = '';
    // 初始化内容和NAV
    data.forEach(function(d) {
        var index = d.index;
        var items = d.items;
        navHtml += '<li class="indexlist-navitem">'+ index +'</li>';
        contentHtml += '<li class="indexsection" data-index="'+ index +'"><p class="indexsection-index">'+ index +'</p><ul>';
        items.forEach(function(item) {
            contentHtml += '<a class="cell"><div class="cell-wrapper"><div class="cell-title"><span class="cell-text">'+ item +'</span></div></div></a>';
        });
        contentHtml += '</ul></li>';
    });

    content.innerHTML = contentHtml;
    navList.innerHTML = navHtml;
}

// 样式初始化
if (!currentHeight) {
    currentHeight = document.documentElement.clientHeight -content.getBoundingClientRect().top;
}
// 右边索引栏的宽度
navWidth = nav.clientWidth;
// 左边内容的初始化高度和右边距
// 高度为当前页面的高度与内容top的差值
content.style.marginRight = navWidth + 'px';
content.style.height = currentHeight + 'px';
```

### 1.3 绑定滑动事件

在右边的索引栏上加上滑动事件，当点击或者滑动的时候触发。在源代码中在`touchstart`事件的结尾处，在`window`上绑定了`touchmove`与`touchend`事件，是为了使得滑动得区域更大，只有在开始的时候在索引栏上触发了`touchstart`事件时，之后再`window`上触发滑动和结束事件，这就意味着我们在滑动的过程中可以在左侧的内容区域滑动，同时也能达到`index`的效果。

```javascript
function handleTouchstart(e) {
    // 如果不是从索引栏开始滑动，则直接return
    // 保证了左侧内容区域能够正常滑动
    if (e.target.tagName !== 'LI') {
        return;
    }
  
    // 记录开始的clientX值，这个clientX值将在之后的滑动中持续用到，用于定位
    navOffsetX = e.changedTouches[0].clientX;
  
    // 内容滑动到指定区域
    scrollList(e.changedTouches[0].clientY);
    if (indicatorTime) {
        clearTimeout(indicatorTime);
    }
    moving = true;
    
    // 在window区域注册滑动和结束事件
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
}
```

这里面用到了`e.changedTouches`，这个`API`可以去`MDN`查一下。

如果不是用到多点触控，`changedTouches`和`touches`的区别并不是特别大，`changedTouches`在同一点点击两次，第二次将不会有`touch`值。具体可以看[这篇文章](http://www.feelcss.com/touchevent.html)

下面看一下如何滑动：

```javascript
function scrollList(y) {
    // 通过当前的y值以及之前记录的clientX值来获得索引栏中的对应item
    var currentItem = document.elementFromPoint(navOffsetX, y);
    if (!currentItem || !currentItem.classList.contains('indexlist-navitem')) {
        return;
    }
  
    // 显示指示器
    currentIndicator = currentItem.innerText;
    indicator.innerText = currentIndicator;
    indicator.style.display = '';

    // 找到左侧内容的对应section
    var targets = [].slice.call(sections).filter(function(section) { 
        var index = section.getAttribute('data-index');
        return index === currentItem.innerText;
    });
    var targetDOM;
    if (targets.length > 0) {
        targetDOM = targets[0];
        // 通过对比要滑动到的区域的top值与最开始的一个区域的top值
        // 两者的差值即为要滚动的距离
        content.scrollTop = targetDOM.getBoundingClientRect().top - firstSection.getBoundingClientRect().top;
      
        // 或者使用scrollIntoView来达到相同的目的
        // 不过存在兼容性的问题
        // targetDOM.scrollIntoView();
    }
}
```

关于`elementFromPoint`的`API`可以看[这里](https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint)

[caniuse.com](caniuse.com)上关于`getBoundingClientRect`和`scrollIntoView`的兼容性

- getBoundingClientRect

![getBoundingClientRect](http://img.blog.csdn.net/20171020093630313)

- scrollIntoView

![scrollIntoView](http://img.blog.csdn.net/20171020093714032)

最后需要注销`window`上的滑动事件

```javascript
window.removeEventListener('touchmove', handleTouchMove);
window.removeEventListener('touchend', handleTouchEnd);
```

## 2. 总结

分析就这么多，多看源码能够学到优秀的设计理念。比如如果最开始让我来做的话，我可以就只会在右侧的索引栏上绑定事件，而不会关联左侧的内容，这样滑动的区域将会大大减小。

同时看源码可以学到一些比较偏僻的知识，促使自己去学习。比如文中的`changedTouches`以及`elementFromPoint`等`API`的学习。



