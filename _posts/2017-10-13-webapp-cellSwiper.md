---
layout: post
title:  "移动端效果之CellSwiper"
date:   2017-10-13
categories: 技术
excerpt: '写在前面 接着之前的移动端效果讲解，刚好项目中需要使用到这一效果，去饿了么的组件库看了一下效果，发现效果和微信端的 还是有点差别的，由于项目中又是使用的 ，之前使用的 所有组件都是自己一个字母一个字母码起来的（想来也是辛酸），所以结合之前的 ，道理类似，实现了类似微信端的抽拉效果。 代码看这里： '
tag: [webapp, cellSwiper]
---

## 写在前面

接着之前的移动端效果讲解，刚好项目中需要使用到这一效果，去饿了么的组件库看了一下效果，发现效果和微信端的`cellSwiper`还是有点差别的，由于项目中又是使用的`React`，之前使用的`React`所有组件都是自己一个字母一个字母码起来的（想来也是辛酸），所以结合之前的`swiper`，道理类似，实现了类似微信端的抽拉效果。

![cellSwiper](http://img.blog.csdn.net/20171013125056228)

代码看这里：[github](https://github.com/Rynxiao/mint-ui-learn)

[移动端效果之Swiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/09/webapp-swiper.html)

[移动端效果之Picker](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/10/webapp-picker.html)

[移动端效果之IndexList](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/20/webapp-indexList.html)

[移动端效果之scrollList](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/11/17/webapp-scrollList.html)

## 1. 核心解析

### 1.1 HTML结构

```html
<div class="c-cell-swiper" id="wrapper">
    <div class="cell-content" id="content">
        <div class="your-code">
            <img class="icon" src="./images/t.jpg"></img>
            <div class="left">
                <span>萌萌的卡洛奇</span>
                <p class="sub">我这个月要来看你啦</p>
            </div>
            <div class="right">now</div>
      </div>
    </div>
    <div class="cell-btn-group" id="btnGroup">
        <div class="cell-btn">标为未读</div>
        <div class="cell-btn">删除</div>
    </div>
</div>
```

代码中类名为`your-code`的地方是你自己要加的代码。

做一个效果之前，我们先需要分析一下我们应该怎么做，这样才能有的放矢。比如这个效果，由于采用的是覆盖式抽拉，因此，需要两个层，上面一个层负责滑动，下面一个层固定，当上面的层滑动完成之后，下面的自然就显示出来了。

因此有两个点：

-   上层和下层的层都要绝对定位，这样才好区别层级（最开始我试的是上面的层不需要决定定位，发现移到项目中的时候，下面的层显示不出来，因为最开始设置了`z-index:-1`。但一般的页面来说，`body`其实是有一个层级的，因此就会覆盖下面的层，导致显示不出来）
-   既然都采用绝对定位，那么上面的层级的高度就需要计算

### 1.2 代码分析

定位好层级之后，下面的按钮层就可以基本不用管了，主要的操作还是滑动。滑动可以借鉴之前的`swiper`代码，这里不作赘述。

#### 1.2.1 计算高度和按钮组的宽度

```javascript
var el = document.querySelector('#content');
var btn = document.querySelector('#btnGroup');
var wrapper = document.querySelector('#wrapper');

function getBtnGroupWidth() {
    // 按钮组的宽度，滑动的最大距离
    btnGroupWidth = btn.getBoundingClientRect().width;
    wrapperHeight = el.getBoundingClientRect().height;
    // 设置最上层容器的高度
    wrapper.style.height = wrapperHeight + 'px';
    // 设置子容器高度
    el.children[0].style.height = wrapperHeight + 'px';
    // 设置按钮组的line-height,保证按钮组文字居中
    btn.style.lineHeight = wrapperHeight + 'px';
}
```

#### 1.2.2 滑动

```javascript
// 滑动中 ontouchmove

// ...
// 这里计算的是上层滑动的距离范围
// 滑动最远不能超过按钮组宽度
// 滑动最小距离就是不滑动，也就是0
offsetLeft = Math.min(Math.max(-btnGroupWidth, offsetLeft), 0);
translate(el, offsetLeft);
// ...

// 滑动结束 ontouchend

// ...
// 如果是tap, 直接关闭
if (dragDuration < 300) {
    var fireTap = Math.abs(offsetLeft) < 5 && Math.abs(offsetTop < 5);
    if (isNaN(offsetLeft) || isNaN(offsetTop)) {
        fireTap = true;
    }
    if (fireTap) {
        translate(el, 0, 150);
        opened = false;
        swiping = false;
        return;
    }
}

var distanceX = Math.abs(offsetLeft);

// 如果向左滑动超过了按钮组的40%，辣么在松手的一刻自动滑开
// 反之如果向右滑动超过了按钮组的40%就关闭
if (distanceX > btnGroupWidth * 0.4 && offsetLeft < 0) {
    translate(el, -btnGroupWidth, 150);
    opened = true;
} else {
    translate(el, 0, 150);
    opened = false;
}
// ...
```

## 2. 总结

整个流程来说相当于`swiper`还是相当简单的，可以说其实就是一个`swiper`的简化版本。

重点在于拿到一个效果之后如何分析，只有有清晰的分析思路才能针对这个分析来给出合理的解决方案。这里仅仅记录自己做这个效果的历程，拿出来共享，希望对大家有所帮助。