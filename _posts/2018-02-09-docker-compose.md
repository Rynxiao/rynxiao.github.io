---
layout: post
title:  "小白学Docker之Compose"
date:   2018-02-09
categories: 技术
excerpt: '承接上篇文章：小白学Docker之基础篇，自学网站来源于https://docs.docker.com/get-started 概念 Compose是一个编排和运行多容器Docker应用的工具，主要是通过一个YAML文件进行服务配置。 使用Compose主要有三步： 在每个应用环境中配置一个Dockerfile，定义单个应用的镜像 使用docker-compose.yml来组装各个应用'
tag: [docker,compose,运维]
---

承接上篇文章：[小白学Docker之基础篇](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/07/docker-intro.html)，自学网站来源于[https://docs.docker.com/get-started](https://docs.docker.com/get-started)

系列文章：

- [小白学Docker之基础篇](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/07/docker-intro.html)
- [小白学Docker之Compose](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/09/docker-compose.html)
- [小白学Docker之Swarm](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/10/docker-swarm.html)

## 概念

Compose是一个编排和运行多容器Docker应用的工具，主要是通过一个YAML文件进行服务配置。

使用Compose主要有三步：

- 在每个应用环境中配置一个Dockerfile，定义单个应用的镜像
- 使用`docker-compose.yml`来组装各个应用
- 运行`docker-compose up`命令来运行整个应用

一个基本的`docker-compose.yml`可能长这个样子：

```shell
version: '3'
services:
  web:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - .:/code
      - logvolume01:/var/log
    links:
      - redis
  redis:
    image: redis
volumes:
  logvolume01: {}
```

## 基本案例

### 1. 编写web服务器脚本以及依赖

- 创建示例文件夹

```shell
> mkdir composetest
> cd composetest
```
![docker-compose-mkdir](http://oyo3prim6.bkt.clouddn.com/docker/docker-compose-mkdir.png)

- 编写服务器脚本

```shell
> vim app.py
```

app.py的内容为：

```python
import time

import redis
from flask import Flask


app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)


def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)


@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
```

- 创建依赖文件requirements.txt

```shell
> vim requirements.txt
```

内容为：

```txt
flask
redis
```

### 2. 创建一个Dockerfile，使用python来运行这个脚本

```shell
> vim Dockerfile
```

Dockerfile的内容为：

```shell
# 拉取python镜像
FROM python:3.4-alpine

# 拷贝当前目录到/code
ADD . /code

# 设置工作目录
WORKDIR /code

# 使用pip安装依赖
RUN pip install -r requirements.txt

# 启动脚本
CMD ["python", "app.py"]
```

### 3. 编写docker-compose.yml来编排应用

```shell
> vim docker-compose.yml
```

内容为：

```shell
version: '3'
services:
  web:
    build: .
    ports:
     - "5000:5000"
  redis:
    image: "redis:alpine"
```

web服务采用本地的`Dockerfile`进行构建，使用ports进行端口映射；redis服务直接默认从Docker Hub拉取镜像

### 4. 运行

运行命令`docker-compose up`来启动整个应用

![docker-compose-up](http://oyo3prim6.bkt.clouddn.com/docker/docker-compose-up.png)

之后在浏览器中输入`http://localhost:5000`就可以看到下面这句话：

```
Hello World! I have been seen 1 times.
```

如果看不到，可以尝试使用`http://0.0.0.0:5000`

另外如果你使用了Docker Machine开启了一台本地的主机， 你可以是使用`docker-machine ip MACHINE_VM`来查看你开启的主机的IP，然后使用`http://MACHINE_VM_IP:5000`在浏览器中打开

另开一个终端，输入如下命令

```shell
docker image ls
```

可以看到整个应用运行的容器

![docker-image-ls](http://oyo3prim6.bkt.clouddn.com/docker/docker-image-ls.png)

### 停止

```shell
CTRL + C

// or

docker-compose down
```

### 其他命令

```shell
# 后台运行
docker-compose up -d

# 查看当前运行的服务
docker-compose ps

# 单独运行一个服务，例如查看web服务的环境
docker-compose run web env

# 停止服务，如果你是使用的docker-compose up -d开启的服务
docker-compose stop

# 关闭服务并且移除容器，加上--volumes可以同时移除挂载在Redis容器上的目录
docker-compose down --volumes
```

![docker-run-web](http://oyo3prim6.bkt.clouddn.com/docker/docker-run-web.png)

## 结合Swarms构建负载均衡应用(单台主机)

`Docker Swarm`、`Docker Machine`与`Docker Compose`号称Docker三剑客，`Swarm`和`Machine`将在之后的章节讲到，这里先做示例

### 制作一个python镜像并发布

这里的镜像在`app.py`上面略微改动了一下，具体如下：

```python
from flask import Flask
from redis import Redis, RedisError
import os
import socket

# Connect to Redis
redis = Redis(host="redis", db=0, socket_connect_timeout=2, socket_timeout=2)

app = Flask(__name__)

@app.route("/")
def hello():
    try:
        visits = redis.incr("counter")
    except RedisError:
        visits = "<i>cannot connect to Redis, counter disabled</i>"

    html = "<h3>Hello {name}!</h3>" \
           "<b>Hostname:</b> {hostname}<br/>" \
           "<b>Visits:</b> {visits}"
           
    # 这里获取hostname，为了区分我们到底请求的是那台机器       
    return html.format(name=os.getenv("NAME", "world"), hostname=socket.gethostname(), visits=visits)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
```

Dockerfile如下：

```shell
FROM python:2.7-slim
WORKDIR /app
ADD . /app
RUN pip install --trusted-host pypi.python.org -r requirements.txt
EXPOSE 80
ENV NAME World
CMD ["python", "app.py"]
```

制作镜像

```shell
docker build -t friendlyhello .
```
![docker-build-friend](http://oyo3prim6.bkt.clouddn.com/docker/docker-build-friend.png)

给镜像打TAG

```shell
docker tag friendlyhello rynxiao/get-started:service
```

发布镜像

```shell
> docker login
> docker push rynxiao/get-started:service
```

发布镜像之前需要在[Docker Hub](https://hub.docker.com/)上注册一个账号，打TAG的时候一定要用自己的用户名，否则将会报下面的错误：

```
PS F:\docker\service> docker push ryn/get-started:service
The push refers to repository [docker.io/ryn/get-started]
7fd8355bf728: Preparing
fc6ecbc8862a: Preparing
88afc3a14faa: Preparing
94b0b6f67798: Preparing
e0c374004259: Preparing
56ee7573ea0f: Waiting
cfce7a8ae632: Waiting
denied: requested access to the resource is denied
```

push成功之后就可以看到自己上传的镜像了

![docker-push](http://oyo3prim6.bkt.clouddn.com/docker/docker-push.png)

PS: 如果运行不成功，可以暂时用我的镜像

### 编写docker-compose.yml文件

```
version: "3"
services:
  web:
    image: rynxiao/get-started:service
    deploy:
      replicas: 5
      resources:
        limits:
          cpus: "0.1"
          memory: 50M
      restart_policy:
        condition: on-failure
    ports:
      - "80:80"
    networks:
      - webnet
networks:
  webnet:
```

docker-compose.yml主要做了以下几件事:

- 拉取自己制作的镜像

- 运行5个web服务的实例，限制每个服务运行10%CPU以及50M内存

- 失败后自动重启

- 端口映射

- 规定web容器以一个叫做webnet的负载均衡网络来共享80端口(好吧，我这里有点晕)

## 运行APP

```shell
docker swarm init
```

关于swarm，将在后面会讲到，楼主在这里也只是有一个概念。anyway, just follow at first. 总之如果这里不运行这句命令，将会报一个`this node is not a swarm manager`的错误

运行`docker stack deploy`来部署服务，首先给应用命名：

```shell
docker stack deploy -c docker-compose.yml getstartedlab
```

这样就在一台主机上运行了一个名叫getstartedlab_web的服务，这个服务包括5个web容器实例(Task)，每个实例共享80端口。我们可以查看这个服务：

```shell
// service
docker service ls

// tasks
docker service ps getstartedlab_web
```

![docker-stack](http://oyo3prim6.bkt.clouddn.com/docker/docker-stack.png)

之后，我们在浏览器中打开`http://localhost`，多刷新几次，会看到每次的hostname都有变化，和`container id`对应

![docker-compose-browser](http://oyo3prim6.bkt.clouddn.com/docker/docker-compose-browser.png)

如果你想增加实例数，只需要在`docker-compose.yml`中修改`replicas`的数量，然后直接运行`docker stack deploy -c docker-compose.yml getstartedlab`即可，不需要摧毁stack和容器。

### 关闭应用和swarm

```shell
# Take the app down with docker stack rm:
docker stack rm getstartedlab

# Take down the swarm.
docker swarm leave --force
```
![docker-stack-rm](http://oyo3prim6.bkt.clouddn.com/docker/docker-stack-rm.png)

## 参考链接

- [https://docs.docker.com/compose/gettingstarted/](https://docs.docker.com/compose/gettingstarted/)
- [http://www.cnblogs.com/xishuai/p/docker-compose.html](http://www.cnblogs.com/xishuai/p/docker-compose.html)