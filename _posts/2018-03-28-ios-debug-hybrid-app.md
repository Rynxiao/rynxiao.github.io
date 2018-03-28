---
layout: post
title:  "如何在IOS上调试Hybrid应用"
date:   2018-03-28
categories: 技术
excerpt: '最近在找关于在 上调试Hybrid应用的方法，比如我想进行断点调试、日志打印、屏幕适配等等，刻意去搜了下方法，虽然之前已经大致知道了，这里系统归纳一下，原文在 https://developers.redhat.com/blog/2017/07/12/how to debug your mobil'
tag: [ios,hybrid,调试]
---

最近在找关于在`xcode`上调试Hybrid应用的方法，比如我想进行断点调试、日志打印已经屏幕适配等等，刻意去搜了下方法，虽然之前已经大致知道了，这里系统归纳一下，原文在[https://developers.redhat.com/blog/2017/07/12/how-to-debug-your-mobile-hybrid-app-on-ios/](https://developers.redhat.com/blog/2017/07/12/how-to-debug-your-mobile-hybrid-app-on-ios/)，配图还是用的文中的配图，这里只是翻译一下。

正如你所知，有时候在一个手机设备上调试程序是一件非常困难的事。对于`Android`和网页应用来说，我们有`Chrome Developer tools`，这也是我们通用的方式，那么对于`IOS`来说，我们也有相似的方式，那就是`Safari Web insepctor`。

随着IOS 6和 Safari 6的发行，苹果也发布了网页检查器来调试和创建网页，这就意味着我们可以在我们的电脑上看到我们手机中运行的程序到底是在怎么进行的，并且对其进行调试，下面就让我来详细地解析一下整个环境的搭建。

**提示：**你得先有一台Mac电脑。

## 系统要求

- MacOSX Lion version 10.7.4 or greater
- Certified USB Cable
- Safari 6
- Device / Emulator
- XCode 4.5 or later with iOS 6 SDK or later

## 开启开发者选项

### 电脑上的Safari配置

#### 1. 打开Safari(图中第一步)然后点击左上角工具栏中的Safari(图中第二步)

![mac-safari](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/mac-safari.png)

#### 2. 点击偏好设置(Preferences)

![preferences](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/mac-preferences.png)

#### 3. 点击高级【Advanced】(图中第1步)，然后开启勾选在菜单栏中开启"开发"选项【Show Develop menu in menu bar】(图中第2步)

![open-options](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/mac-open-options.png)

#### 4. 关闭窗口，你就可以在safari的工具条上看到“开发”【Develop】这个选项了

![safari-develop](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/mac-safari-develop.png)

### 设备上的Safari配置

要想你的手机被调试，你还需要在手机上进行如下几步设置。

#### 1. 点击设置，找到Safari

![phone-safari](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/phone-safari.jpg)

#### 2. 点击进入，向下滑动直到找到高级选项【Advanced】

![phone-advanced](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/phone-advanced.jpg)

#### 3. 开启检查器开关【Web Inspector】

![phone-inspector](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/phone-inspector.jpg)

## 在设备上运行项目

当我们配置好了以上的设置，然后就需要把APP的源码down下来，我们就可以在我们的设备上运行项目了。

### 1. 使用USB连接电脑，打开xcode，运行项目

![xcode-run-project](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/xcode-run-project.png)

### 2. 如果程序在你的手机上正常打开了，就可以打开电脑上的safari，然后点击“开发”【Developer】选项

![debug-safari](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-safari.png)

### 3. 这就会在开发工具上新开一个窗口

![debug-inspector](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-inspector.png)

## 开发工具解析

### 网络(Network)

![debug-network](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-network.png)

### 资源(Resources)

这个部分会列举所有在App上的资源，你可以浏览它们

![debug-resources](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-resources.png)

### 时间轴(Timelines)

你可以查看你的App加载、网络请求、布局渲染以及javascript事件执行总共花了多少时间。这在你对App有较高性能要求的时候会显得很有用处。

![debug-timeline](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-timeline.png)

### 调试器(Debugger)

类似于Chrome的调试工具，在这里你也可以进行单步、断点调试。这里不在赘述，想了解更多可以自行Google

![debug-debugger](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-debugger.png)

### 本地存储(Storage) 

![debug-storage](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-storages.png)

### 控制台(Console)

在这里，你可以进行信息的打印以及命令的执行等等。

![debug-console](http://oyo3prim6.bkt.clouddn.com/debug-hybrid-app/debug-console.png)

