---
layout: post
title:  "微信小程序初探【类微信UI聊天简单实现】"
date:   2018-03-16
categories: 技术
excerpt: '微信小程序最近很火，火到什么程度，只要你一打开微信，就是它的身影，几乎你用的各个APP都可以在微信中找到它的复制版，另外官方自带的跳一跳更是将它推到了空前至高的位置。对比公众号，就我的感觉来说，有以下区别： 公众号略显繁琐：我首先要关注才能看到内容，而小程序不用(个人对微信公众号研究不深，不对'
tag: [微信,小程序]
---

微信小程序最近很火，火到什么程度，只要你一打开微信，就是它的身影，几乎你用的各个APP都可以在微信中找到它的复制版，另外官方自带的跳一跳更是将它推到了空前至高的位置。对比公众号，就我的感觉来说，有以下区别：

-   公众号略显繁琐：我首先要关注才能看到内容，而小程序不用(个人对微信公众号研究不深，不对之处还望见谅)
-   小程序性能要好一些：虽然我不是很清楚小程序用什么实现，就体验来说确实更接近原生一点；但是微信公众号是用网页的形式来展示内容的，其中的兼容性和性能问题不用我说，各位luer就已经清楚了吧
-   小程序更易开发：小程序发布了一套新的代码规则，也提供了一系列的组件，对比公众号百家争鸣的形式确实要统一得多

废话说了这么多，我也是最近才开始看小程序的实现方式，体验了一把，确实比较爽，以下就是个人开发总结：

## 简易的官网小程序

微信小程序官网中有个简单的小demo，地址在这里：[https://mp.weixin.qq.com/debug/wxadoc/dev/index.html](https://mp.weixin.qq.com/debug/wxadoc/dev/index.html)，按照它的步骤来，一定是可以运行一个和官方一样的例子出来的，这里就不贴过程了。主要说一下个人整体感受：

-   js还是原来的js，css还是原来的css，html方面来说，是改了一点东西，比如：div变成了view，文本变成了text，以及img变成了image，但是换汤不换药，该怎么用还是怎么用，而且语义也更加明确。
-   增加了配置文件`.json`，全局有一个`app.json`，是全局的配置，比如导航栏、TAB的配置，全局路由的配置等等，而在每个页面中，依然是可以进行全局覆盖的，比如`list.json`中单独规定了列表页面长啥样子。
-   每个页面都具有生命周期(包括启动页)，类似于`react/vue`的声明周期，更加明确在哪个阶段可以做哪些事情
-   代码组件化，很多封装的组件都可以简单引用，比如`map`，而在微信公众号上开发的时候，你可能还需要专门写一个地图插件
-   API更加好用，虽然我没多少开发过公众号，但是就之前配置的jssdk来说，就感觉比小程序复杂，小程序只需要一个appId就可以了，然后在代码中直接使用`wx`对象来调用各种API

## 开发一个类似微信UI的简单聊天程序

只是感兴趣稍微做了一下案例，其中功能可能根本就还只是九牛一毛，但是觉得有必要记录一下，说说自己遇到的问题以及解决办法，界面整体如下：

![all](//img-blog.csdn.net/20180315202221519)

首先，在`app.json`中编写页面路由，如下：

```json
{
  "pages":[        
    "pages/index/index",
    "pages/list/list",
    "pages/chat/chat"
  ],
  "window":{
    "backgroundTextStyle":"light",
    "navigationBarBackgroundColor": "#000",
    "navigationBarTitleText": "WeChat",
    "navigationBarTextStyle":"#fff"
  }
}
```

这里有3个页面，首页放一个按钮作为入口，列表页表示聊天记录，还有一个聊天页。

列表页没有什么可以讲的，设置列表页的标题可以在`list.json`中设置即可，如下：

```json
// list.json
{
  "navigationBarTitleText": "聊天列表"
}
```

列表页模拟了一些数据，然后再点击每一条的时候，进入单个聊天页面当中，其中需要将当前点击的一些信息传入下一个页面当中，这里仅仅只有名字。

```Javascript
//chat.js
//获取应用实例
const app = getApp()
const friends = require('./list-mock-data.js')

Page({
  data: {
    friends: friends.list
  },
  gotoChat(event) {
    const currentUser = event.currentTarget.dataset.user;
    wx.navigateTo({
      url: '../chat/chat?nickname=' + currentUser.nickname
    })
  }
})
```

然后进入聊天页面，首先进入聊天页面我想到的是，每一个气泡加上它的头像是否可以做成一个组件，因为只有左右的区分而已，另外如果再加上时间的话，再将时间传递过去就可以了。

因此`chat.wxml`最开始就是这样规划的：

```html
<block wx:for="{{ messages }}" wx:key="messages{{ index }}" >
  <template id="{{ item.id }}" is="bubble" data="{{ ...item }}" />
</block>
```

`template`中的代码就不展示了，最开始我写模板的时候，是开了一个`codePen`，然后模拟写出来之后，再往模板中套，保证基本的样子差不多，然后再在模板上进行细微的改动就可以了。

聊天页顶部的标题是通过列表页中传过来的，在页面加载完成的时候，设置就好了：

```javascript
// chat.js
// 设置昵称
setNickName(option) {
    const nickname = option.nickname || 'Marry';
    wx.setNavigationBarTitle({
      title: nickname
    });
  },
```

最开始的样子就是这样子的：

![first-chat](//img-blog.csdn.net/20180315202255505)

至此，基本的页面形态就已经完成了。

**遇到的一些问题：**

-   每次进入页面的时候，即使聊天内容已经超过了聊天区域，都会显示为最开始的地方
-   输入新的聊天记录的时候，如果聊天内容不是处于最底部，那么新加的内容会看不到

针对这两个问题，我按照自己最初的想法是：进入页面获取`scrollHieght`然后计算`scrollTop`值，将其滚动就好了，至于第二个问题按照类似的方法就可以解决了，但是我查看小程序的API之后，并没有发现如何计算`scrollHeight`的方法。只有类似的API，如：`boundingClientRect`和`scrollTop`

好在天无绝人之路，看到了`scroll-view`中的`scroll-into-view`属性，于是就想出了解决上面两个问题的方法：

-   进入页面，获取历史纪录，获取最后一条消息的`ID`值，记为`lastId`，在渲染的时候，消息列表中的每个ID值传入组件，作为每个消息记录的唯一标识，然后使用`scroll-in-view={{ id }}`就可以轻松地使最后一条消息进入视野当中
-   在聊天的时候，新加的记录会更新这个`lastId`值，这样就自动更新视图了

```javascript
// chat.wxml
<scroll-view 
    scroll-y 
    scroll-with-animation 
    class="chat-content"  
    scroll-top="{{ scrollTop }}"
    scroll-into-view="{{ lastId }}">
    <block wx:for="{{ messages }}" wx:key="messages{{ index }}" >
      <template id="msg{{ index }}" is="bubble" data="{{ ...item }}" />
    </block>
  </scroll-view>

// chat.js
Page({
  data: {
    messages: [],         // 聊天记录
    msg: '',              // 当前输入
    lastId: ''            // 最后一条消息的ID
    // ...
  },
  // ...
  send() {
    // ...
    const data = {
      id: `msg${++nums}`,
      message: msg,
      messageType: 0,
      url: '../../images/5.png'
    };
    this.setData({ msg: '', lastId: data.id });
  }
});
```

这样就可以大致实现类似于聊天的效果了，但是还有一个小问题，每次从列表中进入单个聊天页面的时候，会有一个斜向左上方滑动的过程，原因是：页面的转场动画是向左的，但是自动滚动到最后一条记录的动作是向上的，所以会有动作叠加，既然这样，我只需要让滚动的过程延迟一段时间就好

```Javascript
// 延迟页面向顶部滑动
  delayPageScroll() {
    const messages = this.data.messages;
    const length = messages.length;
    const lastId = messages[length - 1].id;
    setTimeout(() => {
      this.setData({ lastId });
    }, 300);
  },
```

至此问题就算是解决了，在真机模拟的时候，IOS还有一个问题，就是当点击输入框的时候，整体页面会向上顶起来，这个问题我在论坛中也有看到，但是没有找到解决办法，如果各位有遇到，还望不吝赐教。

## 扩展延伸

如果是一个真正的聊天程序应该怎么做呢？我的设想是这样的：

![first-chat-one](//img-blog.csdn.net/20180315202323546)

由于当时自己的机器由于莫名的原因不能够进行登录，后来采用了本地开了一个`websocket`的服务器来实现消息的发送。服务器代码相当简单，只是消息的转发而已

```javascript
// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 12112 });

wss.on('connection', ws => {
  console.log('connection established');
  ws.on('message', message => {
    console.log("on message coming");
    ws.send(message);
  });
});
```

在`chat.js`中需模拟历史消息的发送以及新加消息的发送，因此代码整体看起来是这样的：

```javascript
//chat.js
//获取应用实例
const app = getApp()
const msgs = require('./chat-mock-data.js');

Page({
  data: {
    messages: [],         // 聊天记录
    msg: '',              // 当前输入
    scrollTop: 0,         // 页面的滚动值
    socketOpen: false,    // websocket是否打开
    lastId: '',           // 最后一条消息的ID
    isFirstSend: true     // 是否第一次发送消息(区分历史和新加)
  },
  onLoad(option) {
    // 设置标题
    this.setNickName(option);
  },
  //事件处理函数
  onReady() {
    // 连接websocket服务器
    this.connect();
  },
  onUnload() {
    const socketOpen = this.data.socketOpen;
    if (socketOpen) {
      wx.closeSocket({});
      wx.onSocketClose(res => {
        console.log('WebSocket 已关闭！')
      });
    }
  },
  connect() {
    wx.connectSocket({
      url: 'ws://localhost:12112'
    });
    wx.onSocketOpen(res => {
      this.setData({ socketOpen: true });
      // 模拟历史消息的发送
      wx.sendSocketMessage({
        data: JSON.stringify(msgs),
      })
    });
    wx.onSocketMessage(res => {
      const isFirstSend = this.data.isFirstSend;
      const data = JSON.parse(res.data);
      let messages = this.data.messages;
      let lastId = '';
      
      // 第一次为接收历史消息，
      // 之后的为新加的消息
      if (isFirstSend) {
        messages = messages.concat(data);
        lastId = messages[0].id;
        this.setData({ messages, lastId, isFirstSend: false });
        // 延迟页面向顶部滑动
        this.delayPageScroll();
      } else {
        messages.push(data);
        const length = messages.length;
        lastId = messages[length - 1].id;
        this.setData({ messages, lastId });
      }
    });
    wx.onSocketError(res => {
      console.log(res);
      console.log('WebSocket连接打开失败，请检查！')
    })
  },
  // 设置昵称
  setNickName(option) {
    const nickname = option.nickname || 'Marry';
    wx.setNavigationBarTitle({
      title: nickname
    });
  },
  // 延迟页面向顶部滑动
  delayPageScroll() {
    const messages = this.data.messages;
    const length = messages.length;
    const lastId = messages[length - 1].id;
    setTimeout(() => {
      this.setData({ lastId });
    }, 300);
  },
  // 输入
  onInput(event) {
    const value = event.detail.value;
    this.setData({ msg: value });
  },
  // 聚焦
  onFocus() {
    this.setData({ scrollTop: 9999999 });
  },
  // 发送消息
  send() {
    const socketOpen = this.data.socketOpen;
    let messages = this.data.messages;
    let nums = messages.length;
    let msg = this.data.msg;

    if (msg === '') {
      return false;
    }

    const data = {
      id: `msg${++nums}`,
      message: msg,
      messageType: 0,
      url: '../../images/5.png'
    };
    this.setData({ msg: '' });
    
    if (socketOpen) {
      wx.sendSocketMessage({
        data: JSON.stringify(data)
      })
    }
  }
})

```

整体来说，自己的思路就像是上面的代码所描述的，这个只是初步的构想，还有很多东西需要完善：

-   头像
-   列表页和聊天页新消息的处理
-   数据库的历史消息存储
-   图片以及语音的发送

这些问题对于刚接触的我来说，还需要一点时间来消化，暂且就贴这么多吧。