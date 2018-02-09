---
layout: post
title:  "小白学Docker之Swarm"
date:   2018-02-10
categories: 技术
excerpt: '概念 Docker Swarm 和 Docker Compose 一样，都是 Docker 官方容器编排项目，但不同的是，Docker Compose 是一个在单个服务器或主机上创建多个容器的工具，而 Docker Swarm 则可以在多个服务器或主机上创建容器集群服务，对于微服务的部署，显然 Docker Swarm 会更加适合。 创建一个集群 Mac,Linux,Wind'
tag: [docker,swarm,运维]
---

承接上篇文章：[小白学Docker之基础篇](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/07/docker-compose.html)，自学网站来源于[https://docs.docker.com/get-started](https://docs.docker.com/get-started)

系列文章：

- [小白学Docker之基础篇](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/07/docker-intro.html)
- [小白学Docker之Compose](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/09/docker-compose.html)
- [小白学Docker之Swarm](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/10/docker-swarm.html)

## 概念

> Docker Swarm 和 Docker Compose 一样，都是 Docker 官方容器编排项目，但不同的是，Docker Compose 是一个在单个服务器或主机上创建多个容器的工具，而 Docker Swarm 则可以在多个服务器或主机上创建容器集群服务，对于微服务的部署，显然 Docker Swarm 会更加适合。

## 创建一个集群

### Mac,Linux,Window7和8虚拟主机安装

Mac,Linux,Window7和8需要在本地安装虚拟机来创建虚拟主机，如果你已经配置了[Docker Toolbox](https://docs.docker.com/toolbox/overview/)，那么就已经安装了Virtual Box，因此不需要重新安装

创建完之后运行下面的命令就可以在本地创建虚拟主机了：

```shell
docker-machine create --driver virtualbox myvm1
docker-machine create --driver virtualbox myvm2
```

### Windows 10虚拟主机安装

创建共享虚拟交换机，以便各个虚拟主机能够相互之间进行连接。

> Virtual Switch(vSwitch)相当于一个虚拟的二层交换机，该交换机连接虚拟网卡和物理网卡，将虚拟机上的数据报文从物理网口转发出去。与物理交换机一样，vSwitch的作用就是用来转发数据。

1. 启动Hyper-V管理器

![docker-Hyper-V](http://oyo3prim6.bkt.clouddn.com/docker/docker-hyper-v.png)

2. 进入管理页面之后，找到右手边的虚拟交换机管理器

![switch-manager](http://oyo3prim6.bkt.clouddn.com/docker/docker-v-switch-manager.png)

3. 打开管理器，创建虚拟交换机

![v-switch](http://oyo3prim6.bkt.clouddn.com/docker/docker-create-v-switch.png)

4. 进行虚拟交换机配置

![v-switch-config](http://oyo3prim6.bkt.clouddn.com/docker/docker-v-switch-config.png)

之后执行下面的命令就可以创建虚拟主机了：

```shell
docker-machine create -d hyperv --hyperv-virtual-switch "myswitch" myvm1
docker-machine create -d hyperv --hyperv-virtual-switch "myswitch" myvm2 
```

![docker-machine-create](http://oyo3prim6.bkt.clouddn.com/docker/docker-machine-create.png)

### 虚拟主机列表以及IP

```shell
docker-machine ls
```

![docker-machine-ls](http://oyo3prim6.bkt.clouddn.com/docker/docker-machine-ls.png)

### 初始化集群并且添加节点

将myvm1这台主机作为集群管理机，将myvm2作为工作节点加入到集群中，使用`docker-machine ssh`连接到虚拟机，使用`docker swarm init`来初始化节点。

```shell
docker-machine ssh myvm1 "docker swarm init --advertise-addr 10.5.21.30"
```

![docker-swarm-int](http://oyo3prim6.bkt.clouddn.com/docker-swarm-init.png)

将myvm2加入到swarm节点

```shell
docker-machine ssh myvm2 "docker swarm join --token SWMTKN-1-3k3mev52t5hegvsgoagqhmw05eknp3gbnbe
3qnbk78lenyxmy0-21x31f58ehp323w92tqjqazv6 10.5.21.30:2377"
```
![docker-swarm-node-add](http://oyo3prim6.bkt.clouddn.com/docker/docker-swarm-node-add.png)

运行`docker node ls`查看集群中的节点：

```shell
docker-machine ssh myvm1 "docker node ls"
```

![docker-swarm-nodels](http://oyo3prim6.bkt.clouddn.com/docker/docker-swarm-nodels.png)

### 让你的shell直接和集群主机对话

进行这个配置之后，就可以直接连接到集群主机了，以前你必须通过`ssh`先连接到主机执行命令，进行环境配置之后，你就可以直接使用类似`docker-machine ls`的命令了

#### Mac,Linux配置

```shell
# 1. 运行 docker-machine env myvm1
$ docker-machine env myvm1
export DOCKER_TLS_VERIFY="1"
export DOCKER_HOST="tcp://192.168.99.100:2376"
export DOCKER_CERT_PATH="/Users/sam/.docker/machine/machines/myvm1"
export DOCKER_MACHINE_NAME="myvm1"
# Run this command to configure your shell:
# eval $(docker-machine env myvm1)

# 2. 运行上一个命令结果的最后一句
eval $(docker-machine env myvm1)

# 3. 使用docker-machine查看结果
$ docker-machine ls
NAME    ACTIVE   DRIVER       STATE     URL                         SWARM   DOCKER        ERRORS
myvm1   *        virtualbox   Running   tcp://192.168.99.100:2376           v17.06.2-ce   
myvm2   -        virtualbox   Running   tcp://192.168.99.101:2376           v17.06.2-ce  
```

#### Windows 10配置

```shell
> docker-machine env myvm1
docker: 'env' is not a docker command.
See 'docker --help'
PS C:\WINDOWS\system32> docker-machine env myvm1
$Env:DOCKER_TLS_VERIFY = "1"
$Env:DOCKER_HOST = "tcp://10.5.21.30:2376"
$Env:DOCKER_CERT_PATH = "C:\Users\huyh\.docker\machine\machines\myvm1"
$Env:DOCKER_MACHINE_NAME = "myvm1"
$Env:COMPOSE_CONVERT_WINDOWS_PATHS = "true"
# Run this command to configure your shell:
# & "C:\Program Files\Docker\Docker\Resources\bin\docker-machine.exe" env myvm1 | Invoke-Expression

> & "C:\Program Files\Docker\Docker\Resources\bin\docker-machine.exe" env myvm1 | Invoke-Expression

> docker-machine ls
NAME    ACTIVE   DRIVER   STATE     URL                     SWARM   DOCKER        ERRORS
myvm1   *        hyperv   Running   tcp://10.5.21.30:2376           v18.02.0-ce
myvm2   -        hyperv   Running   tcp://10.5.21.31:2376           v18.02.0-ce
```

![docker-machine-env](http://oyo3prim6.bkt.clouddn.com/docker/docker-machine-env.png)

### 在集群主机上部署应用程序

同[Docker Compose](http://www.cnblogs.com/rynxiao/p/8434275.html)里面讲到的一样，现在你可以使用下面的命令在集群上部署你的应用了

```shell
docker stack deploy -c docker-compose.yml getstartedlab
```

查看集群中应用的运行情况

```shell
docker stack ps getstartedlab
```

![docker-swarm-deploy](http://oyo3prim6.bkt.clouddn.com/docker/docker-swarm-deploy.png)

在浏览器中运行`http://10.5.21.30`来查看集群的负载情况

![docker-swarm-hostname](http://oyo3prim6.bkt.clouddn.com/docker/docker-swarm-hostname.png)

如果你想增加实例数，只需要在`docker-compose.yml`中修改`replicas`的数量，然后直接运行`docker stack deploy -c docker-compose.yml getstartedlab`即可，不需要摧毁stack和容器。

### 关闭应用和swarm

```shell
# Take the app down with docker stack rm:
docker stack rm getstartedlab

# Take down the swarm.
docker-machine ssh myvm2 "docker swarm leave"
docker-machine ssh myvm1 "docker swarm leave --force"
```

### 离开集群主机shell

```shell
eval $(docker-machine env -u)
```

### 重启Docker Machine

```shell
> $ docker-machine ls
NAME    ACTIVE   DRIVER       STATE     URL   SWARM   DOCKER    ERRORS
myvm1   -        virtualbox   Stopped                 Unknown
myvm2   -        virtualbox   Stopped                 Unknown

> $ docker-machine start myvm1
Starting "myvm1"...
(myvm1) Check network to re-create if needed...
(myvm1) Waiting for an IP...
Machine "myvm1" was started.
Waiting for SSH to be available...
Detecting the provisioner...
Started machines may have new IP addresses. You may need to re-run the `docker-machine env` command.

> $ docker-machine start myvm2
Starting "myvm2"...
(myvm2) Check network to re-create if needed...
(myvm2) Waiting for an IP...
Machine "myvm2" was started.
Waiting for SSH to be available...
Detecting the provisioner...
Started machines may have new IP addresses. You may need to re-run the `docker-machine env` command.
```

## GUI图形界面管理

使用`visualizer`或者`portainer`镜像来启动GUI图形界面服务，这里使用`portainer`

1. 更改docker-compose.yml文件

```yml
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
  portainer:
    image: portainer/portainer
    ports:
      - "9000:9000"
    volumes: 
      - "//var/run/docker.sock:/var/run/docker.sock" 
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]
networks:
  webnet:
```

2. 重启服务：

```shell
docker stack deploy -c docker-compose.yml getstartedlab
```

3. 在浏览器中输入`http://10.5.21.30:9000`

![docker-gui-portainer](http://oyo3prim6.bkt.clouddn.com/docker/docker-gui-portainer.png)

## 参考链接

- [https://docs.docker.com/get-started/part4/#restarting-docker-machines](https://docs.docker.com/get-started/part4/#restarting-docker-machines)
- [http://www.cnblogs.com/xishuai/p/docker-swarm.html](http://www.cnblogs.com/xishuai/p/docker-swarm.html)