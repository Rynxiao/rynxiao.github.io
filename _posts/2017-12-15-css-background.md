---
layout: post
title:  "深入常用CSS声明(一) —— Background"
date:   2017-12-15
categories: 技术
cover: '/covers/20171215/b-attachment.png'
excerpt: '一直对一些自己常用的 声明掌握得不是很全，只知道常用的一些属性和值，但是对于其他的用法确实一知半解，这篇文章旨在扫盲，先不说有多深的理解，至少做到能够看到这些声明的属性和值的时候做到不陌生。 这里后续还会增加更多自己在工作和学习中的一些 声明，供自己查阅，也提供给大家看看。 "github" bac'
tag: [css, css声明, background]
---

一直对一些自己常用的`css`声明掌握得不是很全，只知道常用的一些属性和值，但是对于其他的用法确实一知半解，这篇文章旨在扫盲，先不说有多深的理解，至少做到能够看到这些声明的属性和值的时候做到不陌生。

这里后续还会增加更多自己在工作和学习中的一些`css`声明，供自己查阅，也提供给大家看看。

[github](https://github.com/Rynxiao/css-deep-study)

## background-image

用于指定一个容器的背景图片，主要的值有三个：

-   none 无背景图片(默认)
-   url(/* image path */) 指定的图片地址
-   inherit 继承自父容器

当背景图片默认不设置的时候，默认值为`none`，表示没有背景图片。如果设置了背景图而不可用时，同时又设置了背景色，那么背景色可以代替。

当背景图片通过`url`来指定值的时候，该容器的背景图就会被设置为指定的图片地址。背景图可以设置多张，用`background-image: url<path1>, url<path2>,…`的形式，同样还可以有多种形式：例如：Gradients（渐变）、SVG images(SVG图片)、element等等。背景图采用`z`轴层叠的方式，最先指定的图片会在之后指定的图片上被绘制。例如：

```html
<style>
  .container {
      background-image: url('../static/images/nobody.png'), url('../static/images/circus.png');
  }
</style>

<div class="container"></div>
```

你会发现第一张图片会在第二张图片之上。另外，如果指定了背景颜色，那么背景颜色会在`background-color`之下被绘制，看下面这张效果图：

![b-image-color](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214224803310-2061389222.png)

总的层叠关系如下简图所示：

![b-image-layout](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214224830654-1779253466.png)

当背景图片设置为`inherit`时，表示继承自父容器的背景图片。如果父容器没有设置背景图片，默认为`none`。例如下面的代码示例：

```html
<style>
    .container {
        /* ignore some code */
        background-image: url('../static/images/nobody.png'), url('../static/images/circus.png');
        background-repeat: no-repeat;
        background-position: center;
        background-color: red;
    }
    .c-right-bottom {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 100px;
        height: 70px;
        border: 2px solid green;
        background-image: inherit;
        background-repeat: no-repeat;
        background-position: center;
    }
    .un-image-wrapper {
        width: 100px;
        height: 70px;
    }
    .wrapper1 {
        background-color: #adad12;
        position: relative;
        border: 2px solid black;
    }
    .wrapper2 {
        position: absolute;
        width: 200px;
        height: 140px;
        /*background-color: inherit;*/
        border: 2px solid #305eb1;
        transform: translateY(210px);
    }
    .child-image {
        width: 100%;
        height: 100%;
        background-image: inherit;
        background-repeat: no-repeat;
        background-position: center;
    }
</style>

<div class="container">
    <div class="c-right-bottom"></div>
    <div class="un-image-wrapper wrapper1">
        wrapper1
        <div class="un-image-wrapper wrapper2">
            wrapper2
            <div class="child-image">child</div>
        </div>
    </div>
</div>
```

右下角绝对定位一个容器，背景图片继承自container，左上角默认定位若干个嵌套的容器，在最底层设置背景图片继承自父容器。效果图如下：

![b-image-inherit](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214224901404-334365563.png)

可以看到，右下角继承了父容器`container`的背景图片，而左上角什么也没有。因为最底层的容器背景图片设置为`inherit`，当时上层容器un-image-wrapper中并没有设置任何背景图片，因此继承属性默认为`none`。因此得出的结论是：背景图片继承只能是继承自和自己最近的父容器设置的背景图，这点和字体继承(可看我在wrapper1中设置的字体颜色分别应用到了下层的子元素中)略有差别。

如果我将wrapper2的`background-color: inherit;`声明代码注释打开的话，那么在wrapper2和child中都会应用到wrapper1中所设置的背景颜色，这点和`background-image`道理相同。

## background-origin

指定了背景图片原点相对于背景容器的位置，默认值为`padding-box`，表示和padding区域的原点对齐

-   border-box 背景图片会和容器的border原点对齐。 
-   padding-box 背景图片会和容器的padding区域的原点对齐
-   content-box 背景图片会和容器的内容区域原点对齐

在`background-attachment:fixed`下会没有作用，因为此时的图片容器是相对于当前窗口了，最好的办法就是实践一下，就可以知道差别了：

```html
<style>
  .container {
      margin-top: 10px;
      height: 500px;
      border: 10px dotted rgba(255, 0, 0, 0.3);
      padding: 20px;
      background: url('../images/ylj.jpeg') center left no-repeat;
  }
</style>
<div>
    <select name="attachment" id="attachment">
        <option value="scroll">scroll</option>
        <option value="fixed">fixed</option>
    </select>
    <select name="origin" id="origin">
        <option value="border-box">border-box</option>
        <option value="padding-box">padding-box</option>
        <option value="content-box">content-box</option>
    </select>
</div>
<div class="container" id="container"></div>
```

通过一个`select`来改变`origin`的值，通过一个展示区域显示图片

![b-origin](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214224934982-1785364315.png)

代码请戳这里: [https://codepen.io/rynxiao/pen/eymqpP](https://codepen.io/rynxiao/pen/eymqpP)

## background-attachment

决定背景是在视口中固定的还是随包含它的区块滚动

-   fixed 背景图片相对于当前视口
-   scroll 背景图片相对于图片容器滚动，不随内容滚动
-   local 如果容器内容有滚动情况，背景图片相对于内容滚动，而与包含它的容器无关

这其中要理解的可能就是`scroll`和`local`的区别。

简单来说就是包含它的容器有没有设置固定尺寸，如果没有固定尺寸，那么内容区域和容器区域其实是相同的，这样`scroll`和`local`的表现其实相同；如果容器设置了一定的高度，此时内容出现了滚动条，然后我们在底部设置了一张背景图，那么再通过设置`background-attachment`的为`scroll`和`local`的时候，差异就出来了：

```html
<style>
    html, body {
        width: 100%;
        height: 100%;
    }
    .container {
        background: url('../images/ylj.jpeg');
        background-repeat: no-repeat;
        background-attachment: scroll;
        background-position: center top;
        height: 100%;
        overflow: auto;
    }
</style>

<select name="attachment" id="attachment">
    <option value="scroll">scroll</option>
    <option value="fixed">fixed</option>
    <option value="local">local</option>
</select>
<div class="container" id="container">
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quam doloremque asperiores labore dicta, dolorum distinctio recusandae, cupiditate facere molestiae tenetur in sint veniam ullam ratione maiores quae eveniet ab. Perspiciatis!</p>
<br>
<!-- 下面省略若干<p>和<br>，作为撑开容器使用 -->     
```

同样通过设置一个`select`来改变`background-attachment`的值，可以观察到图片的表现状态：

![b-attachment](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214225003935-1116093775.png)

当设置为`scroll`的时候，图片会固定在容器的下方，而设置为`local`的时候，图片会固定在内容的下方，需要滑动一定的距离才能看得见图片。

代码请戳这里：[https://codepen.io/rynxiao/pen/baNXxM](https://codepen.io/rynxiao/pen/baNXxM)

## background-clip

[MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-clip)上说的是背景色是否能够延伸到边框下面，其实简单的理解就是：背景的裁剪区域。这点在MDN上面的一个例子已经很清楚地解释了这点。

-   border-box 背景色以边框为边界开始裁剪
-   padding-box 背景色以padding区域开始裁剪
-   content-box 背景色以内容区域开始裁剪(这点其实在我们工作中经常会被用到)

![b-clip](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214225028154-1050974513.png)

默认的属性的值为`border-box`。这里重点说一下`content-box`（至少我工作中用到了🤣）,比如你设置了一个容器的内边距值，但是你只希望内容区域有背景色的时候，就可以使用这个属性，而没有必要将padding改为margin。因为margin可能会引起`上边距折叠的问题`

代码请戳这里：[https://codepen.io/rynxiao/pen/KZpPgj](https://codepen.io/rynxiao/pen/KZpPgj)

## background-position

定义了背景图片相对于容器的位置，可取的值主要有以下几种：

-   一个固定的值(left, right, top, bottom)
-   两个固定的值(x: left, right, y: top, bottom)
-   两个值，一个固定，一个为数值(具体像素，或者百分比)
-   两个值，都为数值(具体像素，或者百分比)

如果只有一个值的情况下：如果设置了`left`或者`right`，表示背景图片距离容器水平的距离，竖直方向为容器的50%。与`background-position: 0/100% 50%;`同一效果。同理，如果只设置了`top`或者`bottom`，则与`background-position: 50% 0/100%;`同一效果。

如果设置为两个值的情况下， 第一个表示水平方向的定位，第二个表示竖直方向的定位：

+   两个都是固定值，这点按照字面意义理解就好
+   一个固定，一个为具体数值，数值如果为具体值：代表具体的定位，如果为百分比，则计算为(容器的高度/宽度 * xx%)得到的换算值。
+   两个都为数值，参看上一条

最好的理解方式是：把所有的值的种类的理解为具体的值的换算。

比如，容器的宽高为 `400 x 300`，图片尺寸为 `20 x 20`

```javacsript
background-position:

top          ->  0 (200 - 20)px
30% 50%      ->  (400 - 20) * 30%px (300 - 20) * 50%px
top 40%      ->  0 (300 - 20) * 40%px
30px bottom  ->  30px 0
center       ->  (400 - 20) * 50%px (300 - 20) * 50%px

// 而如果图片尺寸大于容器尺寸时，算术依然成立
// 例如尺寸为：700 x 400
center       ->  (400 - 700) * 50%px (300 - 400) * 50%px     ->   -150px -50px
```

![b-position](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214225100279-1726986268.png)

`position`最大的应用为早期制作精灵/雪碧图。例如CSDN中如此应用：

```css
.sprite-imgs .link_comments {
    background-image: url('../images/skin-type-icon-yellow.png');
    background-repeat: no-repeat;
    background-position: 0 -43px;
    padding-left: 17px;
}
```

顺便画了一个非常拙劣的图

![b-position-2](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214225123935-1528248010.png)

代码请戳这里：[https://codepen.io/rynxiao/pen/ZvGzyb](https://codepen.io/rynxiao/pen/ZvGzyb)

## background-repeat

定义了背景图片的平铺方式，默认x轴和y轴都平铺

-   repeat-x     x轴方向上平铺，图片可能显示不完全
-   repeat-y    y轴方向上平铺，图片可能显示不完全
-   repeat  x轴、y轴方向上平铺，图片可能显示不完全
-   space   图片x轴、y轴方向上平铺，但是保证图片会显示完全
-   round    图片x轴、y轴方向上平铺，若剩余的空间大于图片的一半尺寸，则加入一个新的图片，尺寸需另外计算
-   no-repeat   图片x轴、y轴方向上不平铺

以上几个属性都比较好理解，这里重点说一下`round`。图片以自身尺寸平铺的方式进行，如果平铺到最后发现剩余空间的尺寸已经不足容纳一个完整的图片，这里就需要计算：

```javascript
if (剩余空间 > 图片尺寸 / 2 ) {
    // 添加一个新的图片
    addANewImage()
}
// 重新计算图片尺寸，直到能容纳一个新的图片为止(会被压缩/拉伸)
reCaculateImageWidth()
```

一个简单的例子：如果我的容器尺寸为：224 x 224， 图片的尺寸为：28 x 28，那么在水平方向上刚好可以放下8个图片。而当我把容器尺寸改为：238 x 224时，会发现水平方向出现了9个星星， 图片被缩小；而改为237 x 224的时候，依然是8个星星，但是图片被放大。

![b-repeat](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214225151248-1778534432.png)

代码请戳这里：[https://codepen.io/rynxiao/pen/opXLaO](https://codepen.io/rynxiao/pen/opXLaO)

## background-size

指定了背景图片的尺寸，可取属性有如下几个：

-   一个固定的值：contain/cover/auto
-   一个固定值auto，一个具体数值
-   两个具体的数值

图片自身属性：

    位图：例如jpeg,一般具有自身尺寸和自身比例
    矢量图： 例如svg,一般不需要自身尺寸和自身比例。如果有，那么一定是既有自身尺寸，又有自身比例
    css渐变图：没有自身尺寸和比例
    element: 拥有element元素的尺寸和比例
针对以上图片属性，我们平时针对最多的就是位图，因此只需要记住位图对应的规则就可以了，剩余的忘记了可以回头来查。

一个固定值：

    contain: 最大限度填充背景区域，但是不能被裁剪，因此例子中的图片会适应高度放大
    cover: 填满背景容器区域，图片可以被裁剪，因此例子中的图片会适应宽度放大
    auto: 如果图片有自身尺寸，则按照自身尺寸展示，可以看到下面的例子中图片不会撑满容器
          如果图片没有自身尺寸并且没有自身比例，那么图片会填充整个背景容器，图片可能会被拉伸变形
          如果图片没有自身尺寸，但是有自身比例，那么按照'contain'来展示图片
          如果图片只有一个尺寸，并且有自身比例，那么另一个尺寸会通过比例计算出来
          如果图片只有一个尺寸，没有自身比例，那么另一个尺寸就是图片容器的尺寸
一个固定值auto，另一个具体数值：

-   根据自身比例来，如果存在自身比例，那么为auto的值会根据给定的值来计算，如果没有自身比例，那么另一个值为图片容器尺寸
-   若值为百分比，那么会根据图片容器尺寸先折算成具体尺寸，然后再根据比例计算另一边的尺寸
-   如果`backgound-attachment`为`fixed`时，图片容器尺寸为当前视图窗口

两个具体数值：

-   按照具体给定的尺寸显示，参看上面解释
-   图片可能会被拉伸

下面是一个实际的例子截图：

![b-size](http://images2017.cnblogs.com/blog/681618/201712/681618-20171214225212326-1416609798.png)

代码请戳这里：[https://codepen.io/rynxiao/pen/PEwLxN](https://codepen.io/rynxiao/pen/PEwLxN)

## 总结

查看API是一件非常无聊的事情，加上自己的一些想法和理解会使这件本来无趣的事情会变得有趣很多，查看的同时还需注意实践，万一有天不清楚了，能够看一下自己的demo，也能一下子就能明白过来，这里贴出来共勉。