---
layout: post
title:  "模拟制作网易云音乐(AudioContext)"
date:   2017-11-07
categories: 技术
excerpt: '记得好早前在慕课网上看到一款 "可视化音乐播放器" ，当前是觉得很是神奇，还能这么玩。由于当时刚刚转行不久，好多东西看得稀里糊涂不明白，于是趁着现在有时间又重新梳理了一遍，然后参照官网的API模拟做了一款网易播放器。没有什么创新的点，只是想到了就想做一下而已。 效果可以看这里： "http://mu'
tag: [AudioContext, 音乐播放器]
---

记得好早前在慕课网上看到一款[可视化音乐播放器](http://www.imooc.com/learn/299)，当前是觉得很是神奇，还能这么玩。由于当时刚刚转行不久，好多东西看得稀里糊涂不明白，于是趁着现在有时间又重新梳理了一遍，然后参照官网的API模拟做了一款网易播放器。没有什么创新的点，只是想到了就想做一下而已。

效果可以看这里：[http://music.poemghost.com/](http://music.poemghost.com/)，如果看不了，说明博主的服务器已经不在工作啦。**（建议使用电脑浏览器打开，同时切换到手机模式来打开，因为在手机上测试时有问题，而且有很大性能损耗，经常会导致浏览器奔溃）**

代码在这里：[github](https://github.com/Rynxiao/wangyi_music)

效果图一览：

![xiaoguo](http://oyo3prim6.bkt.clouddn.com/image/wangyi_music111.gif)

看着自己洋洋洒洒写了快1000多行的`js`，我现在心里也是一万屁草泥马飘过。当然其中还有很多代码没有经过提炼，很多变量可以公用，用对象化的方式来说写这个会更有条理，这个博主以后有时间再梳理一遍。下面来讲讲主要的实现过程。

## 一、整体思路

`API`可以到[https://webaudio.github.io/web-audio-api/#dom-audiobuffersourcenode](https://webaudio.github.io/web-audio-api/#dom-audiobuffersourcenode)上面去看，只是一个草案，并没有纳入标准，所以有些地方还是有问题，在下面我会说到我遇到了什么问题。但是这个草案上的东西其实可以做出很多其他的效果。比如多音频源来达到混音效果、音频振荡器效果等等...

整体的思路图如下：

![AudioContext](http://img.blog.csdn.net/20171107124101868)

大致上来说就是通过`window`上的`AudioContext`方法来创建一个音频对象，然后连接上数据，分析器和音量控制。最后通过`BufferSourceNode`的`start`方法来启动音频。

## 二、具体分析

### 2.1 路由

`routes/index.js`

```javascript
router.get('/', function(req, res, next) {
    fs.readdir(media, function(err, names) {
        var first = names[0];

        // 如果第一个文件不是mp3文件，说明是MAC系统
        if (first.indexOf('mp3') === -1) {
            first = names[1];
            names = names.slice(1);
        }

        var song = first.split(' - ')[1].replace('.mp3', '');
        var singer = first.split(' - ')[0];

        if (err) {
            console.log(err);
        } else {
            res.render('index', { 
                title: '网易云音乐', 
                music: names, 
                posts: listPosts,
                song: song,
                singer: singer,
                post: listPosts[0] 
            });
        }
    });
});
```

这里`mac`平台和`windows`不同，`mac`文件夹会有一个`.DS_Store`文件，因此作了一点小处理。

另外由于用的海外服务器，所以请求`mp3`资源的时候会有很长时间，因此我把音频资源放在了七牛云，而不是从本地获取，但是数据还是在本地拿，因为并没有用到数据库。

### 2.2 主页面

页面运用了手淘的`flexible`，因此在最开始切换到手机模式的时候，可能需要刷新一下浏览器才能显示正常。样式采用的是预处理`sass`，感兴趣的可以去看一下[代码](https://github.com/Rynxiao/wangyi_music)

### 2.3 创建音频

```javascript
/**
 * 创建音频
 * @param  AudioBuffer buffer AudioBuffer对象
 * @return void
 */
function createAudio(buffer) {
    // 如果音频是关闭状态，则重新新建一个全局音频上下文
    if (ac.state === 'closed') {
        ac = new (window.AudioContext || window.webkitAudioContext)();
    }
    audioBuffer = buffer;
    ac.onstatechange = onStateChange;

    // 创建BufferSrouceNode
    bufferSource = ac.createBufferSource();
    bufferSource.buffer = buffer;

    // 创建音量节点
    gainNode = ac.createGain();
    gainNode.gain.value = gainValue;

    // 创建分析节点
    analyser = ac.createAnalyser();
    analyser.fftSize = fftSize;

    bufferSource.onended = onPlayEnded;
    
    // 嵌套连接
    bufferSource.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(ac.destination);
}
```

结合上面的图，这里创建音频的代码就比较好理解了。

### 2.4 播放

播放其实是一个非常简单的`API`，直接调用`BufferSourceNode`的`start`方法即可，`start`方法有两个我们会用到的参数，第一个是开始时间，第二个是时间位移，决定了我们从什么时候开始，这将在跳播的时候会用到。

另外有一个注意的点是，不能再同一个`BufferSourceNode`上调用两次`start`方法，否则会报错。

```javascript
bufferSource && bufferSource.start(0);
```

### 2.5 获取频谱图数据

```javascript
/**
 * 获取音频解析数据
 * @return void
 */
function getByteFrequencyData() {
    var arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    renderCanvas(arr);

    renderInter = window.requestAnimationFrame(getByteFrequencyData);
}
```

通过不断触发这个函数，将最新的数据填充到一个8位的无符号数组中，进而开始渲染数据。此时的音频范围默认设置为256。

### 2.6 音量调节

音量调节也有现成的`API`，这点也没什么可讲的。

```javascript
// gain 的值默认为1
// 因此这里如果想做继续音量放大的可以大于1
// 但是太大可能会出现破音效果，大家感兴趣可以试试
gainNode.gain.value = [0 ~ 1];
```

### 2.7 暂停与恢复播放

我在`AudioBufferSourceNode`上找了好久，本来以为有`start/stop`方法，那么就会有类似于`puase`方法之类的，但是遗憾的是，确实没有。最开始我也不知道怎么做播放和暂停，但是好在天无绝人之路，意外发现在全局的`AudioContext`上有两个方法`resume/suspend`，这也是实现播放和暂停的两个方法。

```javascript
/**
 * 恢复播放
 * @return null
 */
function resumeAudio() {
    playState = PLAY_STATE.RUNNING;

    // 放下磁头
    downPin();

    // 在当前AudioContext被挂起的状态下，才能使用resume进行重新激活
    ac.resume();

    // 重新恢复可视化
    resumeRenderCanvas();

    // 重启定时器
    startInter && clearInterval(startInter);
    startInter = setInterval(function() {
        renderTime(start, executeTime(startSecond));
        updateProgress(startSecond, totalTime);
        startSecond++;
    }, 1000);
}

/**
 * 暂停播放
 * @return null
 */
function suspendAudio() {
    playState = PLAY_STATE.SUSPENDED;

    // 停止可视化
    stopRenderCanvas();

    // 收起磁头
    upPin();

    startInter && clearInterval(startInter);

    // 挂起当前播放
    ac.suspend();
}
```

### 2.8 跳动播放

跳动播放需要用到开始时间，这里我默认设置为0，接下来就是时间位移了。通过跳动播放进度条的游标，我们不难计算出我们应该播放的时间。

这里有一个问题，我之前也说到过，就是在同一个`AudioBufferSourceNode`上不能同时`start`两次，那么也就是说，我如果这里再直接调用`start(0, offsetTime)`将会报错，是的，这里我也卡了好久，最后再一个论坛(是哪个我倒是忘记了)上给了一个建议，不能同时在一个`AudioBufferSourceNode`上`start`两次，那就在不同的`AudioBufferSourceNode`上`start`，也就意味着我可以新建一个节点，然后依然用之前`ajax`请求到的数据来创建一个新的音频数据。实验是可以行的。

```javascript
/**
 * 跳动播放
 * @param  number time 跳跃时间秒数
 * @return void
 */
function skipAudio(time) {
    // 先释放之前的AudioBufferSourceNode对象
    // 然后再重新连接
    // 因为不允许在一个Node上start两次
    analyser && analyser.disconnect(gainNode);
    gainNode && gainNode.disconnect(ac.destination);
    bufferSource = ac.createBufferSource();
    bufferSource.buffer = audioBuffer;

    // 创建音频节点
    gainNode = ac.createGain();
    gainNode.gain.value = gainValue;

    // 创建分析节点
    analyser = ac.createAnalyser();
    analyser.fftSize = fftSize;

    bufferSource.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(ac.destination);

    bufferSource.onended = onPlayEnded;
    bufferSource.start(0, time);

    playState = PLAY_STATE.RUNNING;
    changeSuspendBtn();

    // 开始分析
    getByteFrequencyData();

    // 填充当前播放的时间
    renderTime(start, executeTime(time));
    startSecond = time;

    // 放下磁头
    downPin();

    // 重新开始计时
    startInter && clearInterval(startInter);
    startSecond++;
    startInter = setInterval(function() {
        renderTime(start, executeTime(startSecond));
        updateProgress(startSecond, totalTime);
        startSecond++;
    }, 1000);
}
```

### 2.9 列表循环

列表循环用到了`bufferSource`上的一个回调方法`onended`，在播放完成之后就自动执行下一曲。

```javascript
/**
 * 播放完成后的回调
 * @return null
 */
function onPlayEnded() {
    var acState = ac.state;

    // 在进行上一曲和下一曲或者跳跃播放的时候
    // 如果调用stop方法，会进入当前回调，因此要作区分
    // 上一曲和下一曲的时候，由于是新的资源，因此采用关闭当前的AduioContext, load的时候重新生成
    // 这样acState的状态就是suspended，这样就不会出现播放错位
    // 而在跳跃播放的时候，由于是同一个资源，因此加上skip标志就可以判断出来
    // 发现如果是循环播放，onPlayEnded方法不会被执行，因此采用加载相同索引的方式

    if (acState === 'running' && !skip) {
        var index = getNextPlayIndex();
        loadMusic(playItems[index], index);
    }
}
```

这里有一个坑就是当我点击了上一曲和下一曲的时候，发现也会执行这个回调，因此点击下一曲的时候，实际上播放的是下两曲的歌曲。因此这里做了区分，当点击上一曲和下一曲的时候，会给`skip`设置为`true`，这样就不会执行这个方法中默认的行为。

## 三、手机端会有的问题

之前说过，建议不要在手机端运行，因为会有一些问题，主要表现在：

-   `AudioContext`需要兼容，我在`Chrome`和`Safari`测试的时候一直得不到音频数据，之后才发现需要兼容写法，不然页面播放不了。兼容写法为：`webkitAudioContext`。
-   最开始加载音频的时候，`AudioContext`默认的状态是`suspended`，这也是我最开始最纳闷的事，当我点击播放按钮的时候没有声音，而点击跳播的时候会播放声音，后来调试发现走到了`resumeAudio`中。
-   性能还是有一定的问题，在手机上播放的时候，经常会出现卡死的现象。渲染柱状条的时候感到有明显的卡顿。、
-   由于手机浏览器上页面高度还包括地址栏、导航条高度，因此，唱片可能会超出范围

## 四、总结

我就是发现了一个好玩的东西，然后发了兴致好好玩了一下，之前照着别人的代码敲了一遍代码，后来发现什么都忘了，不如自己动手来得牢靠。有些东西一时看不懂，不要死磕，那是因为水平不够，不过记住就好，慢慢学习，然后再来攻克它，以此共勉。