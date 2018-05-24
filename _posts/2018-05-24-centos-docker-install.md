---
layout: post
title:  "centos中docker的安装"
date:   2018-05-24
categories: 技术
excerpt: '之前学习docker的时候，是在windows上直接使用可执行文件安装的，最近需要在自己的服务器上安装docker，特此了解了一下如何安装，这里补一下。 "小白学Docker之基础篇" "小白学Docker之Compose" "小白学Docker之Swarm" centos安装docker 安装方式'
tag: [docker,linux,centos]
---

之前学习docker的时候，是在windows上直接使用可执行文件安装的，最近需要在自己的服务器上安装docker，特此了解了一下如何安装，这里补一下。

- [小白学Docker之基础篇](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/07/docker-intro.html)
- [小白学Docker之Compose](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/09/docker-compose.html)
- [小白学Docker之Swarm](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/02/10/docker-swarm.html)

## centos安装docker

安装方式可以分为一下三种，官方推荐的是第一种，但是基于国情，还是下载下来手动安装得好。

- 仓库安装
- 手动安装
- 脚本安装

### 仓库安装

#### 1. 设置仓库

1.1 安装依赖

```cmd
$ sudo yum install -y yum-utils \
  device-mapper-persistent-data \
  lvm2
```

1.2 获取仓库

```cmd
$ sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
```

1.3 (可选择)开启`edge`和`test`仓库。这两个仓库默认包含在上面已经安装的`docker-ce.repo`中，不过默认是关闭的，打开它们可以使用下面命令。

```cmd
$ sudo yum-config-manager --enable docker-ce-edge
$ sudo yum-config-manager --enable docker-ce-test
```

同样，禁用它们只需要使用`--disable`就可以了

```cmd
$ sudo yum-config-manager --disable docker-ce-edge
```

#### 2. 安装Docker CE

2.1 安装最新版本的Docker CE

```cmd
$ sudo yum install docker-ce
```

2.2 如果你想安装特定版本的，可以按照以下的步骤

```cmd
# 列出所有
$ yum list docker-ce --showduplicates | sort -r
docker-ce.x86_64            18.03.0.ce-1.el7.centos             docker-ce-stable

# 选择一个版本安装
$ sudo yum install docker-ce-<VERSION STRING>
```

2.3 启动docker

```cmd
$ sudo systemctl start docker
```

2.4 验证docker是否运行

```cmd
$ sudo docker run hello-world
```
#### 3. 更新Docker CE

安装以上的安装流程即可，使用`list`列出所有可以更新的包，选择一个你想安装的。

### 手动安装

1. 下载安装包

 在[https://download.docker.com/linux/centos/7/x86_64/stable/Packages/ ]( https://download.docker.com/linux/centos/7/x86_64/stable/Packages/ )上去下载`rpm`包
 
 **tips:** 如果要安装`edge`版本，可以将上面的`stable`改成`edge`就可以了，关于`edge`和`stable`的区别，可以移步这里[Learn about stable and edge channels](https://docs.docker.com/install/)

2. 安装Docker CE

```cmd
$ sudo yum install /home/packages/docker-ce-18.03.1.ce-1.el7.centos.x86_64.rpm
```

3. 启动Docker服务

```cmd
$ sudo systemctl start docker
```

4. 验证docker是否运行

```cmd
$ sudo docker run hello-world
```

5. 如何手动更新

```cmd
# 下载最新的rpm包
# 重复之前的安装步骤
# 使用yum -y upgrade 替代 yum -y install 命令
```

### 脚本安装

可以从[get.docker.com](https://get.docker.com/)来下载对应的脚本来直接安装。关于脚本安装的风险性，麻烦参照官网。

```cmd
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh

<output truncated>

If you would like to use Docker as a non-root user, you should now consider
adding your user to the "docker" group with something like:

  sudo usermod -aG docker your-user

Remember to log out and back in for this to take effect!

WARNING: Adding a user to the "docker" group grants the ability to run
         containers which can be used to obtain root privileges on the
         docker host.
         Refer to https://docs.docker.com/engine/security/security/#docker-daemon-attack-surface
         for more information.
```
## docker-compose安装

### curl方式安装

下载`docker-compose`在`github`仓库的二进制源码，然后按照以下步骤进行：

1. 下载Docker Compose

```cmd
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
```

2. 给二进制执行文件赋予权限

```cmd
sudo chmod +x /usr/local/bin/docker-compose
```

3. 测试安装是否成功

```cmd
$ docker-compose --version
docker-compose version 1.21.2, build 1719ceb
```

#### 升级

`version <= 1.2`: 升级之前删除或者合并容器
`version >= 1.3`: 可以直接使用`labels`合并

```cmd
docker-compose migrate-to-labels
```

如果你不想保留之前的容器，只需要删除即可：

```cmd
docker container rm -f -v myapp_web_1 myapp_db_1 ...
```

#### 删除

```cmd
sudo rm /usr/local/bin/docker-compose
```

### pip方式安装

#### 安装pip

```cmd
curl "https://bootstrap.pypa.io/get-pip.py" -o "get-pip.py"
python get-pip.py

pip --help
pip -V
```

#### 安装Docker Compose

```cmd
sudo pip install -U docker-compose
```

#### 卸载Docker Compose

```cmd
sudo pip uninstall docker-compose
```

## 参考地址

[https://docs.docker.com/install/linux/docker-ce/centos/#install-using-the-convenience-script](https://docs.docker.com/install/linux/docker-ce/centos/#install-using-the-convenience-script)

