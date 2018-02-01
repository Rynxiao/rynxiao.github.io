---
layout: post
title:  "那些年下过的大雨"
date:   2018-02-01
categories: 技术
excerpt: '想了解一下用纯CSS和JS怎么实现一段下雨的动画，于是去CodePen上面搜了一下，发现了很多很有意思的东西。有空可以常去上面逛逛，在对技术产生敬畏的同时也能学到好多好多东西。以下是自己理解的几个代码实现过程，所有源码均出自于CodePen。 代码：github 效果：http://rynxia'
tag: [rain,javascript,css,canvas]
---

想了解一下用纯CSS和JS怎么实现一段下雨的动画，于是去[CodePen](https://codepen.io/)上面搜了一下，发现了很多很有意思的东西。有空可以常去上面逛逛，在对技术产生敬畏的同时也能学到好多好多东西。以下是自己理解的几个代码实现过程，所有源码均出自于[CodePen](https://codepen.io/)。

代码：[github](https://github.com/Rynxiao/The-heavy-rain-in-those-years)

效果：[http://rynxiao.com/The-heavy-rain-in-those-years/](http://rynxiao.com/The-heavy-rain-in-those-years/)

**PS**: 所有效果均在代码中以注释形式给出，不再额外进行补充，如果想了解更多细节，麻烦参考源码

## 淅沥淅沥

像一阵细雨打湿你心田，那感觉如此甜蜜。

![gif1](http://rynxiao.com/The-heavy-rain-in-those-years/images/small/1.gif)

```Css
/**
 * 雨滴容器
 * 宽度为15px，高度为120px
 * 0.5秒内从屏幕上方移动到屏幕90%的高度
 * 模仿雨滴的下降过程
 */
.drop {
    position: absolute;
    bottom: 100%;
    width: 15px;
    height: 120px;
    pointer-events: none;
    animation: drop 0.5s linear infinite;
}
@keyframes drop {
    0% {
        transform: translateY(0vh);
    }
    75% {
        transform: translateY(90vh);
    }
    100% {
        transform: translateY(90vh);
    }
}
```

雨滴容器模仿的是下降的过程，在下降过程的同时，改变真正雨滴的透明度，模仿出雨滴划过的轨迹

```css
/**
 * 雨滴
 * 宽度为1px，高度为120 * 0.6 = 72px
 * 设置从上到下的渐变色，模仿雨滴划过的轨迹
 * 0.5s内由不透明变为透明，模仿雨滴下落碰撞到物体之后消失的情景
 */
.stem {
    width: 1px;
    height: 60%;
    margin-left: 7px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), 
        rgba(255, 255, 255, 0.25));
    animation: stem 0.5s linear infinite;
}
@keyframes stem {
    0% {
        opacity: 1;
    }
    65% {
        opacity: 1;
    }
    75% {
        opacity: 0;
    }
    100% {
        opacity: 0;
    }
}
/**
 * 水花
 * 雨滴碰撞到地面会溅起水花
 * 宽度为15px，高度为10px
 * 设置上边框为点状，加上设置圆角，模拟水花溅起时的弧形
 * 设置动画，当雨滴下降到地面时，透明度设置为1，同时通过设置缩放
 * 模拟水花放大的过程
 */
.splat {
    width: 15px;
    height: 10px;
    border-top: 2px dotted rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    opacity: 1;
    transform: scale(0);
    animation: splat 0.5s linear infinite;
    /*display: none;*/
}
@keyframes splat {
    0% {
        opacity: 1;
        transform: scale(0);
    }
    80% {
        opacity: 1;
        transform: scale(0);
    }
    90% {
        opacity: 0.5;
        transform: scale(1);
    }
    100% {
        opacity: 0;
        transform: scale(1.5);
    }
}
```

源码：[https://codepen.io/arickle/pen/XKjMZY](https://codepen.io/arickle/pen/XKjMZY)

## 是离愁

犹记当时杏花雨，晓幕晨钟去孤舟。说好不回头，止不住，是离愁。

![rain2](http://rynxiao.com/The-heavy-rain-in-those-years/images/small/2-example.gif)

```css
/**
 * 雨滴
 * 下落过程透明度由0变为1
 * 高度由40px变为5px
 */
.drop {
    position: absolute;
    background: #fff;
    width: 2px;
    height: 40px;
    opacity: 0;
    left: 150px;
    animation: fall 0.2s ease-in forwards;
}
@keyframes fall {
    0% {
        top: -100px;
        opacity: 0;
        height: 100px;
    }
    99% {
        opacity: 1;
    }
    100% {
        top: 150px;
        opacity: 0;
        height: 5px;
    }
}
```

雨滴的下降过程中，高度逐渐变小，因此造成了一种下落的堕落感，这点和第一个动画略有不同。

```Css
/**
 * 波纹
 * 沿X轴旋转75度，造成椭圆效果
 * 动画效果：
 * 中心定格，设置波纹延迟，波纹逐渐变大造成扩散效果
 * 先上在下再上，造成波纹的跌宕效果
 */
#ripples {
    position: absolute;
    width: 300px;
    height: 300px;
    transform: rotateX(75deg);
}
.ripple {
    position: absolute;
    /* ... */
    border: 6px solid rgba(255, 255, 255, 0.2);
    animation: grow ease-in-out forwards 1;
}
.ripple:nth-child(1) {
  animation-delay: 0s;
  animation-duration: 2s;
}
/* ... */
@keyframes grow {
    0% {
        width: 1px;
        height: 1px;
        opacity: 0;
        transform: translateY(20px);
    }
    25% {
        opacity: 0.5;
        transform: translateY(-10px);   
    }
    50% {
        transform: translateY(10px);
    }
    100% {
        width: 250px;
        height: 250px;
        opacity: 0;
        transform: translateY(0);
    }
}
```

所有过程都是中心对齐，然后像周围扩散，例如下面的水珠，模拟的其实就是从中心点的原点上跳过程。

```css
/**
* 水珠
* 中心定位
* 通过控制水花垂直方向位移，造成溅起效果
* 通过控制水平方向便宜，造成运动效果
*/
@keyframes bounce1 {
    /* 中心点 */
    0% {
        left: 150px;
        top: 150px;
        opacity: 0;
    }
    /* 透明度 */
    5% {
        opacity: 0.5;
    }
    /* 上升 */
    50% {
        top: 104px;
    }
    /* 下降，同时左偏 */
    100% {
        left: 125px;
        top: 150px;
        opacity: 0;
    }
}
```

源码：[https://codepen.io/Yakudoo/pen/doObLw](https://codepen.io/Yakudoo/pen/doObLw)

## 错过

青春灿烂，炫如夏花。你说看过彩色的瀑布，我摸着你的头，笑得像个傻瓜。

![gif1](http://rynxiao.com/The-heavy-rain-in-those-years/images/small/3.gif)

```javascript
// 整个动画的关键点
// 整个动画其实是由一条条细线组成，根据下落的时差，造成瀑布的效果
// 根据计算出的屏幕宽度，每条细线1px，然后在屏幕上均匀分布360色
function anim() {
    window.requestAnimationFrame(anim);
    
    // 通过每次在绘制的细线上在绘制透明黑色，因此最先绘制的就会变暗，造成了尾巴的效果
    ctx.fillStyle = repaintColor;
    ctx.fillRect(0, 0, w, h);

    for(var i = 0; i < total; ++i){
        var currentY = dots[i] - 1;
        // 不断增加每次线段的长度，绘制每次最亮的那一部分
        dots[i] += dotsVel[i] += accelleration;

        // 颜色其实在最开始就已经被分配出来了，根据点在的位置而定
        ctx.fillStyle = 'hsl('+ colors[i] + ', 80%, 50%)';
        ctx.fillRect(occupation * i, currentY, size, dotsVel[i] + 1);

        // 从上面出现的条件，也是造成时差的条件
        if(dots[i] > h && Math.random() < .01){
            dots[i] = dotsVel[i] = 0;
        }
    }
}
anim();
```

源码：[https://codepen.io/towc/pen/VYbYvQ](https://codepen.io/towc/pen/VYbYvQ)

## 路过

一个人的记忆就是座城市，时间腐蚀着一切建筑，把高楼和道路全部沙化。如果你不往前走，就会被沙子掩埋。所以我们泪流满面，步步回头，可是只能往前走。

![gif1](http://rynxiao.com/The-heavy-rain-in-those-years/images/4.gif)

```javascript
var RAIN_DROP = function(width, height, toInit, renderer){
    this.width = width;
    this.height = height;
    this.toInit = toInit;
    this.renderer = renderer;

    this.init();
};
RAIN_DROP.prototype = {
    SCALE_RANGE : {min : 0.2, max : 1},         // 缩放比例
    VELOCITY_RANGE : {min : -1.5, max : -1},    // 水平速度范围
    VELOCITY_RATE : 3,                          // 垂直速度基值
    LENGTH_RATE : 20,                           // 雨滴长度
    ACCELARATION_RATE : 0.01,                   // 加速度比例
    VERTICAL_OFFSET_RATE : 0.04,                // 垂直偏移量
    FRONT_THRESHOLD : 0.8,                      // 前景临界值（前面的雨滴不至于过小，后面的雨滴不至于过大）
    REFLECTION_RADIUS_RATE : 0.02,              // 雨滴水花半径基值
    COLOR : 'rgba(255, 255, 255, 0.5)',         // 雨滴颜色
    RADIUS_RATE : 0.2,                          // 用于设置全局透明度
    THRESHOLD_RATE : 0.6,                        

    init: function(){
        // 获取随机缩放比例
        this.scale = this.renderer.getRandomValue(this.SCALE_RANGE);
        // 雨滴长度
        this.length = this.LENGTH_RATE * this.scale;
        // 雨滴水平方向速度
        this.vx = this.renderer.getRandomValue(this.VELOCITY_RANGE) * this.scale;
        // 雨滴垂直方向速度
        this.vy = this.VELOCITY_RATE * this.scale;
        // 雨滴垂直方向加速度
        this.ay = this.ACCELARATION_RATE * this.scale;
        // 角度
        this.theta = Math.atan2(this.vy, this.vx);
        // 用于计算垂直方向是否出边界的偏移量
        this.offset = this.height * this.VERTICAL_OFFSET_RATE;
        // 雨滴水平坐标值
        this.x = this.renderer.getRandomValue({min : 0, max : this.width - this.height * Math.cos(this.theta)});
        // 雨滴垂直坐标值
        this.y = (this.toInit ? this.renderer.getRandomValue({min : 0, max : this.height}) : 0) - this.offset;
        // 水花半径
        this.radius = this.length * this.REFLECTION_RADIUS_RATE;
    },
    render: function(context, toFront){
        // 如果雨滴在前面，但是缩放比例小于规定临界值，则去掉雨滴
        // 如果雨滴在后面，但是缩放比例大于规定临界值，则去掉雨滴
        // 保证了在背景前面的雨滴不至于太小，在背景靠后的雨滴不至于太大
        if (toFront && this.scale < this.FRONT_THRESHOLD || !toFront && this.scale >= this.FRONT_THRESHOLD) {
            return true;
        }
        context.save();
        context.strokeStyle = this.COLOR;

        // 如果雨滴的垂直方向坐标大于了临界值，则以水花的形式展示
        // 否则以雨滴下落的方式展示
        if (this.y >= this.height * (1 - (1 - this.scale) * this.THRESHOLD_RATE) - this.offset) {
            context.lineWidth = 3;
            context.globalAlpha = (1 - this.radius / this.length / this.RADIUS_RATE) * 0.5;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, Math.PI, Math.PI * 2, false);
            context.stroke();
            context.restore();

            this.radius *= 1.05;

            if (this.radius > this.length * this.RADIUS_RATE){
               return false;
            }
        } else {
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.length * Math.cos(this.theta), this.y + this.length * Math.sin(this.theta));
            context.stroke();
            context.restore();

            // 通过水平速度改变水平位移
            this.x += this.vx;
            // 通过垂直速度改变垂直位移
            this.y += this.vy;
            // 通过加速度，增加垂直方向的速度
            // 因此雨滴并不是沿着直线运动，而是有一定的弧度
            this.vy += this.ay;
        }
        return true;
    }
};
```

源码：[https://codepen.io/K-T/pen/YVYvdW](https://codepen.io/K-T/pen/YVYvdW)

## 都是你

曾经想征服全世界，到最后回首才发现，这世界滴滴点点全部都是你。

![gif1](http://rynxiao.com/The-heavy-rain-in-those-years/images/5.gif)

```Javascript
// 关键点
function loop() {
    requestAnimationFrame(loop);
    // 不断绘制半透明画布，用来造成尾巴效果
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    var particle;
    var i, j, ilen, jlen;
    cursor.position.x += (mouseX - cursor.position.x)*0.1;
    cursor.position.y += (mouseY - cursor.position.y)*0.1;
    for (i = 0, ilen = particles.length; i < ilen; i++) {
        particle = particles[i];
        // 通过速度控制角度大小，用来控制流星划过时的速度
        particle.angle += particle.speed;

        // 以相同转动的速度向鼠标中心点不停的移动
        particle.shift.x += (cursor.position.x - particle.shift.x) * particle.speed;
        particle.shift.y += (cursor.position.y - particle.shift.y) * particle.speed;

        // sin/cos 用来控制画圆
        // orbit 半径轨道不断增加， force用来控制轨道系数，最低为0
        // Math.sinx * (particle.orbit*particle.force) 表示以particle.orbit*particle.force为半径画圆
        // 加上中心点坐标，造成不断围绕中心点旋转的效果
        particle.position.x = particle.shift.x + Math.sin(i + particle.angle) * (particle.orbit*particle.force);
        particle.position.y = particle.shift.y + Math.cos(i + particle.angle) * (particle.orbit*particle.force);

        // 不断增加点的半径，最高为100
        particle.orbit += (cursor.orbit - particle.orbit) * 0.01;

        context.beginPath();
        // 根据点所在的位置，随机颜色
        context.fillStyle = "hsl("+((particle.position.x/canvas.width + particle.position.y/canvas.height) * 180) + ", 100%, 70%)";  
        context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
        context.fill();
    }
} 
```

源码：[https://codepen.io/vennsoh/pen/DuLbo](https://codepen.io/vennsoh/pen/DuLbo)