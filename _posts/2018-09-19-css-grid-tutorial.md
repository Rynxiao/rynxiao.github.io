---
layout: post
title:  "CSS Grid 新手入门"
date:   2018-09-19
categories: 技术
excerpt: '基本概念 "MDN" 上的解释是这样的 CSS Grid Layout excels at dividing a page into major regions or defining the relationship in terms of size, position, and layer, b'
tag: [css,css grid]
---

## 基本概念

[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)上的解释是这样的
> CSS Grid Layout excels at dividing a page into major regions or defining the relationship in terms of size, position, and layer, between parts of a control built from HTML primitives. 

另外，下面一段话摘自[A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)，对于CSS Grid会有更加清楚地释义

> CSS Grid Layout (aka "Grid"), is a two-dimensional grid-based layout system that aims to do nothing less than completely change the way we design grid-based user interfaces.

总结来说：

- CSS Grid 是一个二维的布局系统
- CSS Grid 相比传统布局在页面整体划分布局上更加出色
- CSS Grid 并不是只能单独使用，依然可以搭配`Flexbox`以及传统定位布局一起使用

## 兼容性

摘自[Can I Use](https://caniuse.com/#feat=css-grid)中对`CSS Grid`的兼容性分析。

![compatibility](http://oyo3prim6.bkt.clouddn.com/cssgrid/compatibility.png)

从图中可以看出浏览器的兼容率整体达到84.16%，并且都是无需带前缀的。

## 基本概念

网格是一组相交的水平线和垂直线，它定义了网格的列和行。我们可以将网格元素放置在与这些行和列相关的位置上。

### Grid Container (网格容器)

在一个元素上应用了`display: grid;`或者`display: inline-grid;`那么就创建了一个网格容器，它下面的直接子元素都会成为网格元素，例如：

```html
<style>
.wrapper {
  display: grid;
}
</style>

<div class="wrapper">
  <div class="custom">One</div>
  <div class="custom">Two
    <p>I have some more content in.</p>
    <p>This makes me taller than 100 pixels.</p>    
  </div>
  <div class="custom">Three</div>
  <div class="custom">Four</div>
  <div class="custom">Five</div>
</div>
```
![normal-grid](http://oyo3prim6.bkt.clouddn.com/cssgrid/normal-grid.png)

从网页的基本表现看，和平常的布局没有什么差别，Mac OSX 【alt + command + I】，Windows 【F11】打开网页检查器即可看出网格布局。

![inspector-grid](http://oyo3prim6.bkt.clouddn.com/cssgrid/inspector-grid.png)

### Grid Tracks (网格轨迹)

从字面上的意译来看还是比较绕口，但是我换一种说法你可能就会明白了。可以把`tracks`看做是table中的行和列就好了。

![grid-track](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-track.png)

定义一个网格中的行和列的数量分别使用`grid-template-rows`和`grid-template-columns`来确定这个表格会有多少行以及多少列。例如：

```css
.container {
  display: grid;
  grid-template-rows: 100px 50px 100px;
  grid-template-columns: 100px 100px 100px;
}
```
上面的代码写出了一个`3 x 3`的网格

![sure-grid](http://oyo3prim6.bkt.clouddn.com/cssgrid/sure-grid.png)

在图中可以看出网格的数量，其中的子元素会根据这些网格的数量自动填充。如果事先不知道要划分多少行，可以使用只使用`grid-template-columns`来确定多少列，行数会根据有多少子item来自动计算，例如下面的：

```css
.container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
}
```
![single-col](http://oyo3prim6.bkt.clouddn.com/cssgrid/single-col.png)

5个元素如果是划分3列，那么就应该会有两行。

#### fr

如果想要均分容器的宽度，那么可以使用新引入的单位`fr`，新的`fr单位`代表网格容器中可用空间的一等份。例如：

```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
```

#### repeat()

可以使用`repeat()`函数来标记轨道重复使用的部分，例如上面的样式就可以写成：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

#### 每行高度

如果想确定使用每行高度，可以使用`grid-auto-rows: 100px;`来确定每行只有100px

#### minmax()

如果想让每行的高度随着内容自动填充，那么可以使用`minmax()`来确定最小值与最大值，例如：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
}
```

上面的样式规定了一个3列布局，每行的高度最少为100px的网格。

![auto-rows](http://oyo3prim6.bkt.clouddn.com/cssgrid/auto-rows.png)

### Grid Line (网格线)

网格线用来构建整个网格，包括水平的和竖直的

![grid-line](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-line.png)

当一个网格被构建出来，网格线就会被默认地有一个标识，看下图：

![grid-numbers](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-numbers.png)

标识的线可以是正向也可以是逆向的，例如第一行的线的标识就是[1|-4]，那么线标识有什么用？线标识主要用来确定一个子元素要占有的面积，也成为`Grid Area`，例如下面的代码：

```css
.one {
  grid-column-start: 1;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 3;
}
```
![line](http://oyo3prim6.bkt.clouddn.com/cssgrid/line.png)

#### 给线命名

默认的线的标识都是用数字来表示的，当然也可以给线来命名，具体如下：

```css
.container {
  grid-template-columns: [first] 40px [line2] 50px [line3] auto [col4-start] 50px [five] 40px [end];
  grid-template-rows: [row1-start] 25% [row1-end] 100px [third-line] auto [last-line];
}
```
![grid-names](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-names.png)

从图中可以看出，第一列的第一根线被命名成了`first`，那么我们就可以将之前的写法稍微改一下了：

```css
.one {
  grid-column-start: first;
  grid-column-end: col4-start;
  grid-row-start: 1;
  grid-row-end: 3;
}
```

关于更多的线的命名使用方法，可以参看[Naming lines when defining a grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Layout_using_Named_Grid_Lines)，这里只是简单的介绍

### Grid Cell (网格单元)

可以简单理解为一个`table`中的一个单元格

![grid-cell](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-cell.png)

### Grid Area (网格面积)

可以通过规定一个`item`的起始行和起始列来规定一个area，注意：area必须为一个 规则的举行，而不能为一个类似于`L`形状的图形

![grid-area](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-area.png)

通过行和列标识来确定一个面积，例如：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
}
.one {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 3;
}
```
上面的代码就划定了一个两行两列的区域，上面的写法可以简写为：

```css
.one {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  
  /* 这种写法对应： */
  grid-column: [grid-column-start] / [grid-column-end];
  grid-row: [grid-row-start] / [grid-row-end];
}
```

或者使用`grid-area`，

```css
.one { 
  grid-area: 1 / 1 / 3 / 3;
  
  /* 这种写法分别对应： */
  grid-area: [grid-row-start] / [grid-column-start] / [grid-row-end] / [grid-column-end];
}
```

还可以配合`grid-template-areas`来提前划分区域，例如：

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
  grid-template-areas: 
   "header header header"
   "siderbar main main"
   "footer footer footer"
}
```

上面的样式中，规定了一个`3 x 3`的网格，并且划分了区域，第一行为`header`，第二行为左侧为`siderbar`，右侧为`main`，第三行为`footer`，那么剩余的工作就是制定子元素对应的区域即可，例如：

```css
.header {
  grid-area: header;
}
.siderbar {
  grid-area: siderbar;    
}
.main {
  grid-area: main;    
}
.footer {
  grid-area: footer;
}
```

对应的网页文件为：

```html
<div class="container">
  <div class="custom header">header</div>
  <div class="custom siderbar">siderbar</div>
  <div class="custom main">main</div>
  <div class="custom footer">footer</div>
</div>
```

最终的效果为：

![template-areas](http://oyo3prim6.bkt.clouddn.com/cssgrid/template-areas.png)

### Grid Gutters (网格间距)

分为行间距和列间距，类似于`table`中的`colspan`和`rowspan`，具体例子如下：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
  grid-gap: 10px;
  
  /* 这里的grid-gap相当于： */
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}
```

从上一个例子中，我也设置了`10px`的间距，可以从图中看出来。

### Grid z-index

类似于`position: absolute;`绝对定位之后的层级，后面渲染的item会覆盖前面的，因此下例中的item为`Two`的会覆盖在`One`上

```css
.z-index-1 {
  grid-column: 1 / 3;
  grid-row: 1;
  background-color: aliceblue;
}
.z-index-2 {
  grid-column: 2 / 4;
  grid-row: 1 / 3;
  background-color: antiquewhite;
}
```
![z-index-1](http://oyo3prim6.bkt.clouddn.com/cssgrid/z-index-1.png)

调整item1的index之后`z-index: 2;`，会看到item1会覆盖在item2上面

```html
<div class="custom z-index-1" style="z-index: 2;">One</div>
<div class="custom z-index-2" style="z-index: 1;">Two</div>
```

![z-index-2](http://oyo3prim6.bkt.clouddn.com/cssgrid/z-index-2.png)

## 网格布局中的对齐

如果熟悉`flex`，那么一定会知道flex中的布局，相同的，在`grid`布局中也有相应的布局

### 网格布局的两条轴线

> When working with grid layout you have two axes available to align things against – `the block axis` and `the inline axis`. The block axis is the axis upon which blocks are laid out in block layout. If you have two paragraphs on your page they display one below the other, so it is this direction we describe as the block axis. 

- 块方向的列轴

![block-axis](http://oyo3prim6.bkt.clouddn.com/cssgrid/block_axis.png)

- 文字方向的行轴

![inline-axis](http://oyo3prim6.bkt.clouddn.com/cssgrid/Inline_axis.png)

以上的文字以及图片均摘自[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Box_Alignment_in_CSS_Grid_Layout)

### 对齐列项目

对齐列项目主要的CSS声明有两个：`align-items`以及`align-self`，`align-items`用于所有item的设置，`align-self`可以单独进行自定义。这两个声明可取的属性值有以下几种：

- auto
- normal
- start
- end
- center
- stretch
- baseline
- first baseline
- last baseline

下面我们用一个栗子分别说明如下(栗子摘自MDN)：

```html
<style>
.wrapper {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 10px;
  grid-auto-rows: 100px;
  grid-template-areas: 
    "a a a a b b b b"
    "a a a a b b b b"
    "c c c c d d d d"
    "c c c c d d d d";
}
.item1 {
  grid-area: a;
  background-color: aqua;
}
.item2 {
  grid-area: b;
  background-color: aqua;
}
.item3 {
  grid-area: c;
  background-color: aqua;
}
.item4 {
  grid-area: d;
  background-color: aqua;
}
</style>

<div class="wrapper">
  <div class="custom item1">Item 1</div>
  <div class="custom item2">Item 2</div>
  <div class="custom item3">Item 3</div>
  <div class="custom item4">Item 4</div>
</div>
```

定义了一个`8 x 4`列的网格，其中划分为均匀的四个区域，分别用`item[1,2,3,4]`来进行填充，默认的对齐方式为`stretch`

![box-alignment-2](http://oyo3prim6.bkt.clouddn.com/cssgrid/box-alignment-2.png)

可以通过几个`select`来控制对齐方式，分别通过控制整体和单个item的对齐

![box-alignment](http://oyo3prim6.bkt.clouddn.com/cssgrid/box-alignment.png)

### 相对于容器的列对齐

使用`align-content`这个属性声明来决定整个网格在容器中的列方向的布局，可选的值如下：

- normal
- start
- end
- center
- stretch
- space-around
- space-between
- space-evenly
- baseline
- first baseline
- last baseline

![align-content](http://oyo3prim6.bkt.clouddn.com/cssgrid/align-content.png)

可以看到图中，当选择了`align-content: end`的时候，整个网格就会在容器的下方对齐。

更多内容请参看[MDN CSS_Grid_Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Box_Alignment_in_CSS_Grid_Layout)

## Grid 布局和其他布局的关系

### Grid 和 Flex

> The basic difference between CSS Grid Layout and CSS Flexbox Layout is that flexbox was designed for layout in one dimension - either a row or a column. Grid was designed for two-dimensional layout - rows, and columns at the same time. 

Grid布局和Flex布局最大的不同点就是：Grid布局是二维布局，针对行和列的布局，而Flex布局为一维布局，只针对行和列的当行布局。

**Tips**: 这两种布局并不冲突，可以搭配使用。可以在整体布局上采用`grid`布局，而细节处理可以使用`flex`

下面看一个栗子，来看看这两种布局之间有什么不同（栗子来源MDN）:

### 编写一个自动换行适应的布局

- Flex方式

```html
<style>
  .flex-wrapper {
    display: flex;
    flex-wrap: wrap;
  }
  .flex-wrapper > div {
    flex: 1 1 200px;
  }
</style>

<div class="flex-wrapper">
  <div>One</div> 
  <div>Two</div>
  <div>Three</div>
  <div>Four</div>
  <div>Five</div>
</div>
```

- Grid 方式

```html
<style>
  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
</style>
```

使用`flex-wrap: wrap;`来限定如果一行不足就自动换行。使用`auto-fill`来根据容器宽度决定会有多少列，并且使用`minmax()`函数来确定最小为200px，最大为容器宽度来自适应。

如果屏幕上有很多剩余的空间，`flex`布局会均分成5列，而`grid`布局则会始终为3列，并且余下的两个item也长度也 相同，而如果屏幕宽度调整为小于200时，`flex`布局会弹性地变为1列，但是`grid`布局如果没有使用`auto-fill`时，会始终为设置的列数。

另外，`grid`布局和`flex`布局还有一点不同的是，在最开始的分配的时候`grid`布局会优先划分布局，即会优先规定出屏幕中可以最大容忍出 多少个符合条件（这里是最小为200px， 最大为1fr）的item数量，然后依次填充。

![flex-grid](http://oyo3prim6.bkt.clouddn.com/cssgrid/flex_grid.png)

### Grid 和 绝对定位

```css
.positioned {
  grid-template-columns: repeat(4,1fr);
  grid-auto-rows: 200px;
  grid-gap: 20px;
  position: relative;
}
.box3 {
  grid-column-start: 2;
  grid-column-end: 4;
  grid-row-start: 1;
  grid-row-end: 3;
  position: absolute;
  top: 40px;
  left: 40px;
}
```
![grid-position](http://oyo3prim6.bkt.clouddn.com/cssgrid/grid-position.png)

如果父容器有定位标识`relative` Or `absolute`等，那么下面的子item会根据原始它们应该布局的位置定位，反之如果父容器没有 定位标识，那么应用了`position: absolute;`会脱离`gird`布局，并且按照CSS传统的方式布局。

备注：

- 文中部分图片以及案例均来自于[A Complete Guide to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)和[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- 本文代码仓库：[https://github.com/Rynxiao/css-grid-tutorial/](https://github.com/Rynxiao/css-grid-tutorial/)
- 本文部分实例：[http://rynxiao.com/css-grid-tutorial/](http://rynxiao.com/css-grid-tutorial/)

## 参考连接

- [MDN Css Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [A Complete Guid to Grid](https://css-tricks.com/snippets/css/complete-guide-grid/)








