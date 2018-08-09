---
layout: post
title:  "教你使用谷歌云搭建一个免费的VPS服务(一年有效)"
date:   2018-08-08
categories: 技术
excerpt: '注册条件谷歌账号双币信用卡(Visa/MasterCard)注册谷歌云注册地址：[https://cloud.google.com/?hl=zh-cn](https://cloud.google.com/?hl=zh-cn)然后按照提示进行注册就好，在验证信用卡的时候，如果信用卡验证通过，会自动扣费 1美元，不过1美元等会又会返回到你信用卡。创建成功后，你后台默认就有 300 美元的可用金额。'
tag: [vps,google]
---

## 注册条件
- 谷歌账号
- 双币信用卡(Visa/MasterCard)

## 注册谷歌云
注册地址：[https://cloud.google.com/?hl=zh-cn](https://cloud.google.com/?hl=zh-cn)

然后按照提示进行注册就好，在验证信用卡的时候，如果信用卡验证通过，会自动扣费 1美元，不过1美元等会又会返回到你信用卡。创建成功后，你后台默认就有 300 美元的可用金额。

## 创建实例
点击【菜单导航】-> 【Compute Engine】-> 【VM实例】

### 区域选择

![create vm instance](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/D9A9F708A6F8497094315E3052B16485/9554)

进入页面之后，点击上图中【4】创建实例
![area](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/CC923F75DF2741E7BB35D970E7151041/9545)

选择你的服务器地区，有亚洲、欧洲、美洲等区域，根据自己的喜好进行选择，不过亚洲区域推荐台湾或者东京会好一点

### 机器类型选择

![type](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/C8DCD0AD234245CFAD44F7236C36ADC6/9547)

因为只是做一个VPS服务器，在机器类型中选择一个最微型的机器即可

### 系统选择

![system](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/259238D254F3473382A9DFDD811270D2/9558)

![system type](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/C7AAC1B4DDB543D3AA49F5A6403557ED/9556)

选择`centos 7`系统，不过默认的是`Debian GNU/Linux 9`感觉也没有什么问题

### 防火墙和免登陆SSH秘钥设置

![firewall](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/CA77DA91081A48C79426C8E911699CA1/9549)

ssh秘钥可以在自己用户根目录下查找

```cmd
> pwd
/Users/yhhu/.ssh
> ls -ll
total 24
-rw-------  1 yhhu  staff  3243 Jul  9 18:28 id_rsa
-rw-r--r--  1 yhhu  staff   747 Jul  9 18:28 id_rsa.pub
-rw-r--r--  1 yhhu  staff  2359 Aug  8 14:56 known_hosts
> cat id_rsa.pub
```

## 安装VPS服务

登陆VM，并查看是否有安装docker

```cmd
> ssh {your username}@{your vm ip}
> docker
```
![whether docker installed](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/E451E0E71DA1439FBCC4E7A79693F36E/9539)

安装ss服务

```cmd
> docker pull oddrationale/docker-shadowsocks
```
![docker-shadowsocks](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/86A50021183644BEB533BF188D2C535A/9541)

启动ss服务，配置密码和加密协议

```cmd
docker run -d -p 443:443 oddrationale/docker-shadowsocks -s 0.0.0.0 -p 443 -k {your password} -m aes-256-cfb
```

- -p：端口
- -k：密码
- -m：加密协议

![config](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/37B7E8B441C94FF0B5C4F62DA3183F05/9543)

## 安装代理软件

### PC

MAC上安装，具体的软件可以到这个仓库[shadowsocks/ShadowsocksX-NG](https://github.com/shadowsocks/ShadowsocksX-NG/releases/)去下载，windows上的代理软件自行搜索

# iPhone

推荐App Store搜索`SsrConnectPro`

### 配置

![open proxy](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/59B43765594547B0949B4D9F9DE84C73/9652)

![config](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/09E212431668481291705B54F3BCCE80/9654)

上图中打花括号`{}`的地方是需要你填写的，要严格对照你配置的命令哦

```cmd
docker run -d -p 443:443 oddrationale/docker-shadowsocks -s 0.0.0.0 -p 443 -k {your password} -m aes-256-cfb
```

配置好了之后，将代理`Turn Shadowsocks On`即可，好了，Google向你招手了

![google](https://note.youdao.com/yws/public/resource/4dd93227ee622d3432d184477358a2ba/xmlnote/224B8A5A39A44570817DC265F614C4D4/9667)





