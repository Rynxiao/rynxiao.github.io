---
layout: post
title:  "小白学Docker之基础篇"
date:   2018-02-07
categories: 技术
excerpt: 'PS： 以下是个人作为新手小白学习docker的笔记总结 1. docker是什么 百科上的解释是这样的： Docker 是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。容器是完全使用沙箱机制，相互之间不会有任何接口。 知乎上的很多理解是将其理解成集装箱，彼此之间互相不影响，各自运行'
tag: [docker,运维]
---

PS： 以下是个人作为新手小白学习docker的笔记总结

## 1. docker是什么

百科上的解释是这样的：

> Docker 是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何流行的 Linux 机器上，也可以实现虚拟化。容器是完全使用沙箱机制，相互之间不会有任何接口。

知乎上的很多理解是将其理解成集装箱，彼此之间互相不影响，各自运行在各自的环境中。可以看这里的解释：[https://www.zhihu.com/question/28300645](https://www.zhihu.com/question/28300645)

### docker安装

win10 环境（其他环境自行搜索安装）:

#### 首先 启动 Microsoft Hyper-V

在电脑上打开“控制面板”->“程序”-> “启动或关闭Windows功能”， 勾选Hyper-V选项：

![hyper](http://oyo3prim6.bkt.clouddn.com/docker/hyper-enable.png)

然后重启电脑

#### 去[官网](https://docs.docker.com/docker-for-windows/install/#download-docker-for-windows) (https://docs.docker.com/docker-for-windows/install/#download-docker-for-windows)下载   [Docker for Windows Installer](https://download.docker.com/win/stable/Docker%20for%20Windows%20Installer.exe)

我们下载稳定版，安装文件保存位置可以根据自己喜好选择

![docker-download](http://oyo3prim6.bkt.clouddn.com/docker/docker-download.png)

下载完成后的安装文件：

![docker](http://oyo3prim6.bkt.clouddn.com/docker/docker.png)

#### 安装

双击安装文件安装，弹出：

![docker-install1](http://oyo3prim6.bkt.clouddn.com/docker/docker-install1.png)

勾选接受协议点击 install ,接下来会自动进行安装，安装完成后：

![docker-installed](http://oyo3prim6.bkt.clouddn.com/docker/docker-installed.png)

完成后桌面会出现 Docker 图标 ，并且 Docker 会自动启动

![docker-icon](http://oyo3prim6.bkt.clouddn.com/docker/docker-icon.png)

现在 Docker 就已经安装好了。

#### 电脑 cpu 开启虚拟化

参考电脑型号搜索 cpu 开启虚拟化，下面是常见开启方法，仅供参考：

https://jingyan.baidu.com/article/91f5db1b3002831c7f05e3b0.html

https://jingyan.baidu.com/article/335530daa55d7e19cb41c3c2.html

### 运行 Hello world

使用`docker run`在容器内运行 Hello world

![hello-world](http://oyo3prim6.bkt.clouddn.com/docker/hello-world.png)

在最开始时，由于本地不存在`ubuntu:15.10`的镜像，Docker就会从镜像仓库 Docker Hub 下载这个镜像，这里暂时不需要管，下载完成后，就会自动执行这个echo命令。

- ubuntu:15.10：指定要运行的镜像

- /bin/echo "Hello world"：在启动的容器里执行的命令

PS: 在windows上的git Bash中，会出现如下错误：

```shell
$ docker run ubuntu:15.10 /bin/echo "Hello world"
C:\Program Files\Docker\Docker\Resources\bin\docker.exe: Error response from daemon: OCI runtime create failed: container_linux.go:296: starting container process caused "exec: \"D:/develop/Git/usr/bin/echo\": stat D:/develop/Git/usr/bin/echo: no such file or directory": unknown.

// 自己意会
`git Bash`并不是一个终端设备，只是一个解释Shell命令的软件
换成windows自带的CMD，或者PowerShell运行命令即可
参看：https://www.zhihu.com/question/21711307
```

### 与容器对话

通过以下命令在容器内打开一个伪终端，然后运行命令

```shell
docker run -i -t ubuntu:15.10 /bin/bash
```
![container-chat](http://oyo3prim6.bkt.clouddn.com/docker/container-chat.png)

- -t:在新容器内指定一个伪终端或终端。

- -i:允许你对容器内的标准输入 (STDIN) 进行交互。

使用`exit`或者`ctrl + d`来退出容器

### 后台运行容器

使用`docker run -d`的方式来在后台运行容器

```shell
docker run -d ubuntu:15.10 /bin/sh -c "while true; do echo hello world; sleep 1; done"
339394e15bd25bcd3791ba1ae6d3f107fa49584acc55081a45e70d9719448c8e
```
![run-back](http://oyo3prim6.bkt.clouddn.com/docker/run-back.png)

339394e15bd25bcd3791ba1ae6d3f107fa49584acc55081a45e70d9719448c8e

这个长字符串叫做容器ID，对每个容器来说都是唯一的，我们可以通过容器ID来查看对应的容器发生了什么。

首先，我们需要确认容器有在运行，可以通过 docker ps 来查看

```shell
docker ps
```
![docker-ps](http://oyo3prim6.bkt.clouddn.com/docker/docker-ps.png)

使用`docker logs <container id>`来查看容器内的日志

```shell
docker logs 339394e15bd2

// or

docker logs amazing_cori
```

![docker-logs](http://oyo3prim6.bkt.clouddn.com/docker/docker-logs.png)

### 停止容器

使用`docker stop <container id>`来查看容器内的日志

```shell
docker stop 339394e15bd2

// or

docker stop amazing_cori
```

![docker-stop](http://oyo3prim6.bkt.clouddn.com/docker/docker-stop.png)

## 2. docker镜像

### 镜像列表

![images](http://oyo3prim6.bkt.clouddn.com/docker/images.png)

- REPOSITORY:   镜像的仓库源
- TAG:          镜像的标签
- IMAGE ID:     镜像ID
- CREATED:      镜像创建的时间
- SIZE:         镜像大小

### 获取一个新的镜像

当本地机器上使用一个不存在的镜像时，Docker就会下载这个镜像，例如：

![download](http://oyo3prim6.bkt.clouddn.com/docker/download.png)

我们也可以使用`docker pull`命令下载

```shell
docker pull ubuntu:15.10
```

### 查找镜像

使用`docker search xxx`从`Docker Hub`中发布的镜像，地址是:[Docker Hub](https://hub.docker.com/)，例如我们搜索`ubuntu`的镜像为：

![search](http://oyo3prim6.bkt.clouddn.com/docker/search.png)

其中`OFFICIAL`代表的是否是官方发布

### 创建镜像

当我们从`docker`中下载的镜像不能满足我们的要求的时候，我们可以对这个镜像进行更改或者创建一个新的镜像。

#### 更改镜像

![update-image](http://oyo3prim6.bkt.clouddn.com/docker/update-image.png)

拉取`learn/tutorial`镜像，在此镜像上安装`ping`命令，之后使用`commit`进行提交

```shell
docker commit <image id> <new image name>
```

使用`docker images`查看更改之后的镜像

![after-images](http://oyo3prim6.bkt.clouddn.com/docker/after-images.png)

### 删除镜像

1.停止所有的container，这样才能够删除其中的images：


```
docker stop $(docker ps -a -q)
```


如果想要删除所有container的话再加一个指令：


```
docker rm $(docker ps -a -q)
```


2.查看当前有些什么images


```
docker images
```


3.删除images，通过image的id来指定删除谁


```
docker rmi <image id>
```


想要删除untagged images，也就是那些id为<None>的image的话可以用


```
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
```


要删除全部image的话


```
docker rmi $(docker images -q)
```

## 3. 使用Dockerfile创建一个镜像

### 创建一个Dockerfile

```shell
> cd docker
> touch Dockerfile
> vim Dockerfile
```

![docker-file](http://oyo3prim6.bkt.clouddn.com/docker/dockerfile.png)

关于`Dockerfile`里面的各个指令，解释如下：

```shell
在Dockerfile中用到的命令有
FROM
    FROM指定一个基础镜像， 一般情况下一个可用的 Dockerfile一定是 FROM 为第一个指令。至于image则可以是任何合理存在的image镜像。
    FROM 一定是首个非注释指令 Dockerfile.
    FROM 可以在一个 Dockerfile 中出现多次，以便于创建混合的images。
    如果没有指定 tag ，latest 将会被指定为要使用的基础镜像版本。
MAINTAINER
    这里是用于指定镜像制作者的信息
RUN
    RUN命令将在当前image中执行任意合法命令并提交执行结果。命令执行提交后，就会自动执行Dockerfile中的下一个指令。
    层级 RUN 指令和生成提交是符合Docker核心理念的做法。它允许像版本控制那样，在任意一个点，对image 镜像进行定制化构建。
    RUN 指令缓存不会在下个命令执行时自动失效。比如 RUN apt-get dist-upgrade -y 的缓存就可能被用于下一个指令. --no-cache 标志可以被用于强制取消缓存使用。
ENV
    ENV指令可以用于为docker容器设置环境变量
    ENV设置的环境变量，可以使用 docker inspect命令来查看。同时还可以使用docker run --env <key>=<value>来修改环境变量。
USER
    USER 用来切换运行属主身份的。Docker 默认是使用 root，但若不需要，建议切换使用者身分，毕竟 root 权限太大了，使用上有安全的风险。
WORKDIR
    WORKDIR 用来切换工作目录的。Docker 默认的工作目录是/，只有 RUN 能执行 cd 命令切换目录，而且还只作用在当下下的 RUN，也就是说每一个 RUN 都是独立进行的。如果想让其他指令在指定的目录下执行，就得靠 WORKDIR。WORKDIR 动作的目录改变是持久的，不用每个指令前都使用一次 WORKDIR。
COPY
    COPY 将文件从路径 <src> 复制添加到容器内部路径 <dest>。
    <src> 必须是想对于源文件夹的一个文件或目录，也可以是一个远程的url，<dest> 是目标容器中的绝对路径。
    所有的新文件和文件夹都会创建UID 和 GID 。事实上如果 <src> 是一个远程文件URL，那么目标文件的权限将会是600。
ADD
    ADD 将文件从路径 <src> 复制添加到容器内部路径 <dest>。
    <src> 必须是想对于源文件夹的一个文件或目录，也可以是一个远程的url。<dest> 是目标容器中的绝对路径。
    所有的新文件和文件夹都会创建UID 和 GID。事实上如果 <src> 是一个远程文件URL，那么目标文件的权限将会是600。
VOLUME
    创建一个可以从本地主机或其他容器挂载的挂载点，一般用来存放数据库和需要保持的数据等。
EXPOSE
    EXPOSE 指令指定在docker允许时指定的端口进行转发。

CMD
    Dockerfile.中只能有一个CMD指令。 如果你指定了多个，那么最后个CMD指令是生效的。
    CMD指令的主要作用是提供默认的执行容器。这些默认值可以包括可执行文件，也可以省略可执行文件。
    当你使用shell或exec格式时，  CMD 会自动执行这个命令。
ONBUILD
    ONBUILD 的作用就是让指令延迟執行，延迟到下一个使用 FROM 的 Dockerfile 在建立 image 时执行，只限延迟一次。
    ONBUILD 的使用情景是在建立镜像时取得最新的源码 (搭配 RUN) 与限定系统框架。
ARG
    ARG是Docker1.9 版本才新加入的指令。
    ARG 定义的变量只在建立 image 时有效，建立完成后变量就失效消失
LABEL
    定义一个 image 标签 Owner，并赋值，其值为变量 Name 的值。(LABEL Owner=$Name )

ENTRYPOINT
    是指定 Docker image 运行成 instance (也就是 Docker container) 时，要执行的命令或者文件。
```

更加详细的解释请参看这里：[http://www.docker.org.cn/dockerppt/114.html](http://www.docker.org.cn/dockerppt/114.html)

Dockerfile里面的内容：

```shell
FROM docker.io/centos
MAINTAINER The CentOS Test Images - test
RUN mkdir -p /usr/app
RUN ls
RUN pwd
ENV JAVA_HOME /usr/app/jdk
ENV PATH $JAVA_HOME/bin:$PATH
```

在这里只是拉取了一个`centos`镜像，然后添加了JAVA的环境变量，这里仅仅作为测试

### 创建镜像

使用`docker build`来生成镜像，关于这个命令的详细用法，可以使用`docker build --help`

```shell
> cd docker
> docker build -t centos:test -f ./Dockerfile .
```
- -t 表示给镜像打TAG
- -f 表示Dockerfile的地址
- .  表示包含Dockerfile存放的目录

过程如下：

![docker-build](http://oyo3prim6.bkt.clouddn.com/docker/docker-build.png)

创建之后的镜像：

![build-images](http://oyo3prim6.bkt.clouddn.com/docker/build-images.png)

查看Path：

![path](http://oyo3prim6.bkt.clouddn.com/docker/path.png)

## 参考文章

- [http://www.runoob.com/docker/docker-hello-world.html](http://www.runoob.com/docker/docker-hello-world.html)
- [http://blog.csdn.net/rznice/article/details/52211620](http://blog.csdn.net/rznice/article/details/52211620)
- [https://stackoverflow.com/questions/41286028/docker-build-error-checking-context-cant-stat-c-users-username-appdata](https://stackoverflow.com/questions/41286028/docker-build-error-checking-context-cant-stat-c-users-username-appdata)