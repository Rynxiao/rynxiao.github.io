---
layout: post
title:  "移动端效果之Swiper"
date:   2017-10-09
categories: 技术
excerpt: '写在前面在做移动端方面运用到了饿了么的vue前端组件库，不满足于只用在表面，故想深入了解一下实现原理。1. 说明父容器overflow:hidden;，子页面transform:translateX(-100%);width:100%;2. 核心解析2.1 页面初始化由于所有页面都在手机屏幕左侧一个屏幕宽度的位置，因此最开始的情况是页面中看不到任何一个子页面，所以第一步应该设置应该显示的子页面，默认'
tag: [webapp, swiper]
---

## 写在前面

最近在做移动端方面运用到了饿了么的`vue`前端组件库，因为不想单纯用组件而使用它，故想深入了解一下实现原理。后续将会继续研究一下其他的组件实现原理，有兴趣的可以关注下。

![swiper](http://img.blog.csdn.net/20171009125115356)

[移动端效果之Picker](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/10/webapp-picker.html)

[移动端效果之CellSwiper](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2017/10/13/webapp-cellSwiper.html)

代码在这里：[戳我](https://jsbin.com/koriguy/2/edit?js) or [github](https://github.com/Rynxiao/mint-ui-learn)

## 1. 说明

父容器`overflow:hidden;`，子页面`transform:translateX(-100%);width:100%;`

## 2. 核心解析

### 2.1 页面初始化

由于所有页面都在手机屏幕左侧一个屏幕宽度的位置，因此最开始的情况是页面中看不到任何一个子页面，所以第一步应该设置应该显示的子页面，默认情况下`defaultIndex:0`

```javascript
function reInitPages() {
    // 得出页面是否能够被滑动
    // 1. 子页面只有一个
    // 2. 用户手动设置不能滑动 noDragWhenSingle = true
    noDrag = children.length === 1 && noDragWhenSingle;

    var aPages = [];
    var intDefaultIndex = Math.floor(defaultIndex);
    var defaultIndex = (intDefaultIndex >= 0 && intDefaultIndex < children.length) 
        ? intDefaultIndex : 0;
    
    // 得到当前被激活的子页面索引
    index = defaultIndex;

    children.forEach(function(child, index) {
        aPages.push(child);
        // 所有页面移除激活class
        child.classList.remove('is-active');

        if (index === defaultIndex) {
            // 给激活的子页面加上激活class
            child.classList.add('is-active');
        }
    });

    pages = aPages;
}
```

### 2.2 容器滑动开始(onTouchStart)

在低版本的`android`手机上，设置`event.preventDefault()`会起到一定的性能提升作用，使得滑动起来不是那么卡。

**前置工作：**

-   如果用户设置了 `prevent:true`， 滑动时阻止默认行为
-   如果用户设置了`stopPropagation:true`， 滑动时阻止事件向上传播
-   如果动画尚未结束，阻止滑动
-   设置`dragging:true`，滑动开始
-   设置用户滚动为`false`

**滑动开始：**

使用一个全局对象记录信息，这些信息包括：

```javascript
dragState = {
    startTime           // 开始时间
    startLeft           // 开始的X坐标
    startTop            // 开始的Y坐标(相对于整个页面viewport pageY)
    startTopAbsolute    // 绝对Y坐标(相对于文档顶部 clientY)
    pageWidth           // 一个页面宽度
    pageHeight          // 一个页面的高度
    prevPage            // 上一个页面
    dragPage            // 当前页面
    nextPage            // 下一个页面
};
```

### 2.3 容器滑动(onTouchMove)

套用全局`dragState`，记录新的信息

```javascript
dragState = {
    currentLeft         // 开始的X坐标
    currentTop          // 开始的Y坐标(相对于整个页面viewport pageY)
    currentTopAbsolute  // 绝对Y坐标(相对于文档顶部 clientY)
};
```

那么我们就可以通过开始和滑动中的信息来计算出一些东西：

-   滑动的水平位移（`offsetLeft = currentLeft - startLeft`）

-   滑动的垂直位移（`offsetTop = currentTopAbsolute - startTopAbsolute`）

-   是否是用户的自然滚动，这里的自然滚动说的是用户并不是想滑动`swiper`，而是想滑动页面

    ```javascript
    // 条件
    // distanceX = Math.abs(offsetLeft);
    // distanceY = Math.abs(offsetTop);
    distanceX < 5 || ( distanceY >= 5 && distanceY >= 1.73 * distanceX )
    ```

-   判断是左移还是右移（`offsetLeft < 0` 左移，反之，右移）

-   重置位移

    ```javascript
    // 如果存在上一个页面并且是左移
    if (dragState.prevPage && towards === 'prev') {
        // 重置上一个页面的水平位移为 offsetLeft - dragState.pageWidth
        // 由于 offsetLeft 一直在变化，并且 >0
        // 那么也就是说 offsetLeft - dragState.pageWidth 的值一直在变大，但是仍未负数
        // 这就是为什么当连续属性存在的时候左滑会看到上一个页面会跟着滑动的原因
        // 这里的 translate 方法其实很简单，在滑动的时候去除了动画效果`transition`，单纯改变位移
        // 而在滑动结束的时候，加上`transition`，使得滑动到最后释放的过渡更加自然
        translate(dragState.prevPage, offsetLeft - dragState.pageWidth);
    } 

    // 当前页面跟着滑动
    translate(dragState.dragPage, offsetLeft);

    // 后一个页面同理
    if (dragState.nextPage && towards === 'next') {
        translate(dragState.nextPage, offsetLeft + dragState.pageWidth);
    }
    ```

### 2.4 滑动结束(onTouchEnd)

**前置工作：**

在滑动中，我们是可以实时地来判断到底是不是用户的自然滚动`userScrolling`，如果是用户自然滚动，那么`swiper`的滑动信息就不算数，因此要做一些清除操作：

```javascript
dragging = false;
dragState = {};
```

当然如果`userScrolling:false`，那么就是滑动子页面，执行`doOnTouchEnd`方法

-   判断是否是`tap`事件

    ```javascript
    // 时间小于300ms,click事件延迟300ms触发
    // 水平位移和垂直位移栋小于5像素
    if (dragDuration < 300) {
        var fireTap = Math.abs(offsetLeft) < 5 && Math.abs(offsetTop < 5);
        if (isNaN(offsetLeft) || isNaN(offsetTop)) {
            fireTap = true;
        }
        if (fireTap) {
            console.log('tap');
        }
    }
    ```

-   判断方向

    ```javascript
    // 如果事件间隔小于300ms但是滑出屏幕，直接返回
    if (dragDuration < 300 && dragState.currentLeft === undefined) return;

    // 如果事件间隔小于300ms 或者 滑动位移超过屏幕宽度 1/2， 根据位移判断方向
    if (dragDuration < 300 || Math.abs(offsetLeft) > pageWidth / 2) {
        towards = offsetLeft < 0 ? 'next' : 'prev';
    }

    // 如果非连续，当处于第一页，不会出现上一页，当处于最后一页，不会出现下一页
    if (!continuous) {
        if ((index === 0 && towards === 'prev') 
            || (index === pageCount - 1 && towards === 'next')) {
            towards = null;
        }
    }

    // 子页面数量小于2时，不执行滑动动画
    if (children.length < 2) {
        towards = null;
    }
    ```

-   执行动画

    ```javascript
    // 当没有options的时候，为自然滑动，也就是定时器滑动
    function doAnimate(towards, options) {
        if (children.length === 0) return;
        if (!options && children.length < 2) return;

        var prevPage, nextPage, currentPage, pageWidth, offsetLeft;
        var pageCount = pages.length;

        // 定时器滑动
        if (!options) {
            pageWidth = element.clientWidth;
            currentPage = pages[index];
            prevPage = pages[index - 1];
            nextPage = pages[index + 1];
            if (continuous && pages.length > 1) {
                if (!prevPage) {
                    prevPage = pages[pages.length - 1];
                }

                if (!nextPage) {
                    nextPage = pages[0];
                }
            }

            // 计算上一页与下一页之后
            // 重置位移
            // 参看doOnTouchMove
            // 其实这里的options 传与不传也就是获取上一页信息与下一页信息
            if (prevPage) {
                prevPage.style.display = 'block';
                translate(prevPage, -pageWidth);
            }

            if (nextPage) {
                nextPage.style.display = 'block';
                translate(nextPage, pageWidth);
            }
        } else {
            prevPage = options.prevPage;
            currentPage = options.currentPage;
            nextPage = options.nextPage;
            pageWidth = options.pageWidth;
            offsetLeft = options.offsetLeft;
        }

        var newIndex;
        var oldPage = children[index];

        // 得到滑动之后的新的索引
        if (towards === 'prev') {
            if (index > 0) {
                newIndex = index - 1;
            }
            if (continuous && index === 0) {
                newIndex = pageCount - 1;
            }
        } else if (towards === 'next') {
            if (index < pageCount - 1) {
                newIndex = index + 1;
            }
            if (continuous && index === pageCount - 1) {
                newIndex = 0;
            }
        }

        // 动画完成之后的回调
        var callback = function() {
            // 得到滑动之后的激活页面，添加激活class
            // 重新赋值索引
            if (newIndex !== undefined) {
                var newPage = children[newIndex];
                oldPage.classList.remove('is-active');
                newPage.classList.add('is-active');
                index = newIndex
            }

            if (isDone) {
                end();
            }
          
            if (prevPage) {
                prevPage.style.display = '';
            }

            if (nextPage) {
                nextPage.style.display = '';
            }
        }

        setTimeout(function() {
            // 向后滑动
            if (towards === 'next') {
                isDone = true;
                before(currentPage);
                // 当前页执行动画，完成后执行callback
                translate(currentPage, -pageWidth, speed, callback);
                if (nextPage) {
                    // 下一面移动视野中
                    translate(nextPage, 0, speed)
                }
            } else if (towards === 'prev') {
                isDone = true;
                before(currentPage);
                translate(currentPage, pageWidth, speed, callback);
                if (prevPage) {
                    translate(prevPage, 0, speed);
                }
            } else {
              // 如果既不是左滑也不是右滑
              isDone = true;
              // 当前页面依旧处于视野中
              // 上一页和下一页滑出
              translate(currentPage, 0, speed, callback);
              if (typeof offsetLeft !== 'undefined') {
                  if (prevPage && offsetLeft > 0) {
                        translate(prevPage, pageWidth * -1, speed);
                  }
                  if (nextPage && offsetLeft < 0) {
                        translate(nextPage, pageWidth, speed);
                  }
              } else {
                if (prevPage) {
                  translate(prevPage, pageWidth * -1, speed);
                }

                if (nextPage) {
                  translate(nextPage, pageWidth, speed);
                }
              }
           }
        }, 10);
    }
    ```

    ​

**后置工作:**

清除一次滑动周期中保存的状态信息

```javascript
dragging = false;
dragState = {};
```

## 总结

整体来说实现原理还是比较简单的，滑动开始记录初始位置，计算上一页与下一页的应该展示的页面；滑动中计算位移，计算上一页下一页的位移；滑动结束根据位移结果执行相应的动画。

有一个细节就是，在滑动中`transition`的效果置为空，是为了防止在滑动中上一页与下一页因为过渡存在而位移得不自然，在滑动结束后再给他们加上动画效果。