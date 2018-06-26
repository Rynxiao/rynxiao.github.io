---
layout: post
title:  "Mac上node安装"
date:   2018-06-17
categories: 技术
excerpt: 'brew方式安装 安装homebrew，/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"可能会遇到没有文件写入权限的问题，加上权限就好，类似于这样的：sudo chmod -R g+w /usr/local/Homebrew sudo chmod -R g+w /usr/local/Homebrew'
tag: [mac,node,install]
---

## brew方式安装

### 安装homebrew

```shell
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
可能会遇到没有文件写入权限的问题，加上权限就好，类似于这样的：

```shell
sudo chmod -R g+w /usr/local/Homebrew
```

### 安装node

```shell
brew install node
```

等待安装完成即可

## nvm安装方式

### 安装nvm

```shell
# script
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
# wget
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
```

### 写入环境变量

```shell
vim ~/.bash_profile
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
```

### 安装node版本

```shell
nvm 8.11.3
```
