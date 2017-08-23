---
layout: post
title: '使用github+jekyll搭建个人博客'
subtitle: '给自己一个小空间'
date: 2017-02-21
categories: 技术
cover: 'http://on2171g4d.bkt.clouddn.com/jekyll-theme-h2o-postcover.jpg'
tags: jekyll github blog
---

## 聊聊起初

每次看到大牛们的博客，都会激起一颗一定要搭建自己博客的心，毕竟有着一颗向大牛们看齐的心。但是一直不知道如何下手，从最初的csdn写写博客到在github上建立仓库写代码分享，虽然也能够记录一些事情，但是总感觉缺少点什么——对，就是像是这东西并不是自己的。后来偶然机会知道了github的gh-pages功能可以搭建个人博客，然后兴致冲冲地去折腾了一番，但是了解到并不能搭建后台，突然间又像浇了一盘冷水一样，知道现在都还存留着这个博客的残骸，看这里[http://rynxiao.github.io/blog/#/](http://rynxiao.github.io/blog/#/)。

之前是想着用react搭建前台页面，后台用bmob，但是放置久了，心也就冷了，索然不做了。最近才发现原来github的gh-pages也可以使用jekyll来搭建，好吧，怪自己孤陋寡闻。然后就试着了解了一下jekyll，也就是这博客的由来。

## 经历过程

闲话说了，聊聊经历过程吧，顺便记录自己踩下的坑。本人是在`windows`上进行操作，至于其他平台上的操作，请小伙伴们自行搜索。

搭建博客有两种安装过程：**1.使用jekyll搭建；2.从jekyll模板中找到一个自己喜欢的，fork进自己的博客，然后修改_config.yml文件**，下面分别来讲讲两种方式的搭建。 

### 一、使用jekyll服务搭建

#### 1.1 安装ruby以及ruby相关工具(DevKit)

由于jekyll是基于ruby语言开发的，因此我们需要安装ruby以及ruby相关的工具(DevKit)。具体的ruby可以到[官网](http://www.ruby-lang.org/en/downloads/)上去下载，不过毕竟是国外网站，如果没有好的翻墙工具还是比较慢的。这里我已经准备好了，点[ruby](http://pan.baidu.com/s/1eSNz3iE)和[DevKit](http://pan.baidu.com/s/1csz3uY)下载。点击exe文件进行自定义目录安装。安装完成之后，确保ruby的环境已经配置到了系统的变量中。比如我的DevKit安装目录是：D:\develop\DevKit。进入DevKit目录，输入如下命令：

```
 ```cmd
C:\Users> cd D:\develop\DevKit
C:\Users> D:
D:\develop\DevKit> ruby dk.rb init
D:\develop\DevKit> ruby dk.rb install
 ```
```

可以使用`gem -v` 和 `ruby -v`来确认是否已经安装成功

![Markdown](http://p1.bpimg.com/572179/509e513d9975bf36.png)

#### 1.2 更改gem sources

使用`gem sources`发现是`https://rubygems.org/`，国外网站的通病就是下载很慢，因此我们需要替换一个国内的源。

```
 ```cmd
gem sources -add https://gems.ruby-china.org/ --remove https://rubygems.org/ 替换源
gem sources -u 更新缓存
gem sources 查看替换后的源
 ```
```

![Markdown](http://p1.bpimg.com/572179/d6344eefc5dd1f10.png)

看到更新之后的源被替换成了`http://gems.ruby-china.org/`，没错，就是`http`，我试了用`https`一直是不成功的。

#### 1.3 安装jekyll

经过上面两步之后，我们就可以安装jekyll了。调用命令：

```
 ```cmd
gem install jekyll
 ```
```

之后使用`jekyll -v`来查看jekyll版本，可以看到我的版本是3.4.0。记录一下，本人并没有安装3.0.0以前的版本，这是在网上看到的:

> 这里稍微强调一下，这个版本和之前的2.x. x版本有些许不一样，可能在后面_config.yml的写法上可能有差异，不过没关系，这并不影响我继续前进

![Markdown](http://p1.bqimg.com/572179/fdf98aa24a27850f.png)

#### 1.4 创建博客

至此我们就可以用jekyll来创建博客了，具体命令如下：

```
 ```cmd
jekyll new myblog
cd myblog
jekyll server
 ```
```

然后在`http://127.0.0.1:4000`端口来查看你创建的博客。

#### 1.5 可能会遇到的坑

* 端口占用

![Markdown](http://p1.bqimg.com/572179/7216ad804c56adb7.png)

看到jekyll启动服务的4000端口已经被占用，我们需要找到占用的程序，然后干掉它。

```
 ```cmd
// 1.查看所有的端口使用情况，显示PID
netstat -ano 
// 2.找到端口被占用的PID，比如PID为14325
tasklist /svc /FI "PID eq 14325"
// 3.打开任务管理器，找到相应的程序，杀掉就好
// FoxitProtect.exe 默认会绑定4000端口，因此杀掉这个进程就行
 ```
```

如下图，正常启动如下：

![Markdown](http://p1.bpimg.com/572179/f2d176e04576a60b.png)

在浏览器中输入`127.0.0.1:4000`就可以看到我们的博客模样：

![Markdown](http://p1.bpimg.com/572179/6f8cece1235e03ea.png)

#### 1.6 后话

这只是jekyll提供的最基本的博客原型，当然你可以更改其中的样式、结构来变成自己喜欢的模样，同时还可以安装高亮插件、数学公式插件等等，这里就不再赘述，请小伙伴们自行搜索安装。

jekyll的目录结构，最重要的就是`_includes`,`_layouts`,`_posts`

> `_config.yml` : 配置文件，用来定义你想要的效果，设置之后就不用关心了。

> `_includes` : 可以用来存放一些小的可复用的模块，方便通过{ % include file.ext %}（去掉前两个{中或者{与%中的空格，下同）灵活的调用。这条命令会调用_includes/file.ext文件。

> `_layouts` : 这是模板文件存放的位置。模板需要通过YAML front matter来定义，后面会讲到，{ { content }}标记用来将数据插入到这些模板中来。

> `_posts` : 你的动态内容，一般来说就是你的博客正文存放的文件夹。他的命名有严格的规定，必须是2012-02-22-artical-title.md这样的形式，MARKUP是你所使用标记语言的文件后缀名，根据_config.yml中设定的链接规则，可以根据你的文件名灵活调整，文章的日期和标记语言后缀与文章的标题的独立的。

> `_site` : 这个是Jekyll生成的最终的文档，不用去关心。最好把他放在你的.gitignore文件中忽略它。

#### 2.在github中展示你刚才搭建的博客

##### 2.1 注册一个github账号

比如我的github账号名称就是rynxiao，注册请点击这里[https://github.com/](https://github.com/)

##### 2.2 配置ssh

* 安装git客户端

安装地址 [https://git-scm.com/download/win](https://git-scm.com/download/win)，快一点可以直接在百度上搜索下载。

* 检查是否生成了ssh key

如果生成了ssh key，那么会在windows的C盘用户目录下生成一个`.ssh`的文件夹(比如我的地址就是C:\Users\huyh\.ssh)，如果没有，则进行下一步。

* 在本地创建ssh key

```
 ```cmd
ssh-keygen -t rsa -C "yuzhongzi91@sina.com" //这里以我的邮箱为例子，自行替换
 ```
```

* 将公钥中的内容复值到github中的ssh keys中

连续三次回车之后会在`.ssh`文件夹中生成id_rsa(私钥)和id_rsa.pub(公钥)，使用编辑工具打开id_rsa.pub，复制内容。

进入自己的github主页，点击`settings` -> `SSH and GPG keys` -> `New SSH key` -> `填写title以及复制刚才公钥中的内容`

* 验证

在cmd中输入命令，显示出自己的用户名，则说明已经成功连上github。

```
 ```cmd
ssh -T git@github.com 
 ```
```

![Markdown](http://p1.bqimg.com/572179/6866998d55e2d130.png)

* 设置git的username和email

```
 ```cmd
git config --global user.name "rynxiao"
git config --global user.email "yuzhongzi91@sina.com"
 ```
```

##### 2.3 上传自己的代码到github仓库

进入自己的github主页，然后新建一个仓库，名称叫做`你的用户名.github.io`，例如我的就叫做`Rynxiao.github.io`。

然后进入你本地的博客目录，例如是`myblog`，输入如下命令，下面以我的用户名为例：

```
 ```cmd
git init                                                                // 初始化git仓库
git add .                                                               // 添加文件夹中的所有内容到本地仓库
git commit -m "first commit"                                            // 添加评论
git remote add origin https://github.com/Rynxiao/Rynxiao.github.io.git  // 添加远程github仓库地址
git push -u origin master                                               // 提交本地仓库代码到远程仓库
 ```
```

连上仓库之后会让你输入用户名和密码，然后就可以提交代码了。然后在浏览器中输入Rynxiao.github.io，就可以看到我们在本地中搭建的博客样子了

### 二、复制别人现有的博客模板

- 进入[http://jekyllthemes.org/](http://jekyllthemes.org/)，挑选一个自己喜欢的模板
- 进入主页，然后fork至自己的仓库下
- 进入自己github主页，找到刚才的那个仓库，然后点击`settings`，更改名称，格式为`你的账户名.github.io`，例如我的就叫`Rynxiao.github.io`
- 更改仓库中的`config.yml`文件，换成自己的信息。详细的更改配置可以在模板的主页中读取，一般都会有介绍
- 在浏览器中输入`你的账户名.github.io`，就可以看到你喜欢的博客模样了

## 参考链接

[https://bigballon.github.io/posts/jekyll-github.html](https://bigballon.github.io/posts/jekyll-github.html)

[http://blog.csdn.net/u014015972/article/details/50497254](http://blog.csdn.net/u014015972/article/details/50497254)
