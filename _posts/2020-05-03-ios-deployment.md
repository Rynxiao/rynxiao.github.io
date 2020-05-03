---
layout: post
title:  "IOS App打包发布完整流程"
date:   2020-05-03
categories: 技术
excerpt: '注册成为开发者，登录苹果开发者中心点击Accounts，在这里需要你填写你的Appple ID进行登录，如果没有，点击这里申请一个，填写信息就成，这里就不再赘述。申请完成之后，使用申请的AppID进行登录。进入主页之后，然后点击Join the Apple Developer Program进行开发者账号申请。点击Enroll'
tag: [app,ios,deployment,fastlane]
---

## 注册成为开发者

登录[苹果开发者中心](https://developer.apple.com/cn/)，点击[Accounts](https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1)，在这里需要你填写你的Appple ID进行登录，如果没有，点击[这里](https://appleid.apple.com/account?appId=632&returnUrl=https%3A%2F%2Fdeveloper.apple.com%2Faccount%2F#!&page=create)申请一个，填写信息就成，这里就不再赘述。申请完成之后，使用申请的AppID进行登录。

<img src="http://img.rynxiao.cn/ios-deployment/1.png" alt="login" style="zoom:50%;" />

进入主页之后，然后点击[Join the Apple Developer Program](https://developer.apple.com/programs/)进行开发者账号申请。点击[Enroll](https://developer.apple.com/programs/enroll/)

![enroll](http://img.rynxiao.cn/ios-deployment/2.png)

这里有几个点需要说明下：

- 苹果的开发者账号主要分为个人、组织(公司/企业)、教育机构

  | 类型                         | 费用 | 是否支持App Store上架 | 最大支持uuid数量 | 开发人数 | 备注                                          |
  | ---------------------------- | :--: | :-------------------: | :--------------: | :------: | --------------------------------------------- |
  | 个人(Individual)             | $99  |         支持          |       100        |    1     | 可以转为公司账号                              |
  | 组织(Organization)           | $99  |         支持          |       100        |   多人   | 申请时需要填写公司的邓白氏编码（DUNS Number） |
  | 企业程序(Enterprise Program) | $299 |        不支持         |       不限       |   多人   | 申请时需要填写公司的邓白氏编码（DUNS Number） |

点击[Start Your Enrollment](https://developer.apple.com/enroll/app)，目前申请开发者账号，需要在AppStore下载 Apple Developer然后进行申请。

<img src="http://img.rynxiao.cn/ios-deployment/3.png" style="zoom:40%;" />

点击`现在注册`，按照程序一步步填写信息，最后点击订阅即可。

<img src="http://img.rynxiao.cn/ios-deployment/4.png" style="zoom:40%;" />

一般情况下，订阅成功需要两天时间，请耐心等待。

## Certificates、p12以及provisioning Profiles

小白(在没有查阅资料之前我也是😺)最初看到这三个名词的第一反应可能是：证书我听过，但是其他两个是个什么东西，我倒不太清楚。

**这三个文件是做什么的，暂时可以不用了解，现在只需要记住的是：在ios打包的时候需要用到。**下面是一个比较完整的ios打包流程图，可以提前帮助理解。

<img src="http://img.rynxiao.cn/ios-deployment/10.png" style="zoom:50%;" />

注：以上图片来自于https://reactorapps.io/blog/ios-certificate-guide/

下面，我就用小白的视角来讲讲我是怎么认识这三个东西的。

### 证书(Certificates)

> **证书**是由公证处或认证机关开具的证明资格或权力的*证件*，它是表明（或帮助断定）事理的一个*凭证*。证件或凭证的尾部通常会烙印*公章*。
>
> A **certificate** is a document that Apple issues to you. This certificate states that you are a trusted developer and that you are in fact, who you claim to be, rather than someone else posing as you. 

证书的最主要功效就是证明你是谁以及你是否合法，就像一般开一家餐馆一样，你需要拿到一个营业执照，顾客也就认这个，这里申请的证书是苹果公司颁发的。

#### 那么怎么申请证书？

网上关于这方面的资料很多，这里不在赘述，可以查看[手把手教你搞定ios的证书申请](https://www.jianshu.com/p/ae11b893284b)

- 生成**Certificate Signing Request (CSR)**，填写相关的信息后，保存到本地，会生成一个以`.certSigningRequest`结尾的CSR文件

  > **A CSR or Certificate Signing request is a block of encoded text that is given to a Certificate Authority when applying for a certificate.**

<img src="http://img.rynxiao.cn/ios-deployment/5.png" style="zoom:50%;" />

- 在苹果开发者中心中创建一个`Certificate`
- 上传在本地生成的CSR文件，下载证书
- CSR文件中包含一个`public key`，这个key也会包含在生成的证书中，同时还会在`keychian`中生成一个`private key`

#### 非对称加密(Asymmetric cryptography)

> **Public-key cryptography**, or **asymmetric cryptography**, is a cryptographic system that uses pairs of [keys](https://en.wikipedia.org/wiki/Cryptographic_key): *public keys*, which may be disseminated widely, and *private keys*,which are known only to the owner. 

一个简单的例子，图片来自于https://en.wikipedia.org/wiki/Public-key_cryptography#Examples

![image-20200502171523337](http://img.rynxiao.cn/ios-deployment/11.png)

同样还是以开餐馆的例子来讲，当餐馆越做越大，需要采购一大批原材料的时候，这时候就需要请示老板了，老板拿了采购单审查了之后，觉得没啥问题，然后就会在采购单上签名。采购员拿着有老板签名的采购单，就去采购货物去了。这里面有几个关键点：

- 采购员只有在见到有老板签名的单子才认为是老板下达的命令
- 任何伪造的、模仿的或者不是老板签字的一律不具有效益
- 采购员在心中已经形成了一个老板签名的样板

其实这就是一个非对称加密的例子，老板的签名样板其实就是一个公钥(public key)，餐馆中的任何人都可以知道，而真实的老板签名字样即是私钥(private key)，这个签名手法是老板独有的。只有当经过签名之后的采购清单和签名样板进行匹配(这里的匹配其实就是使用公钥解密签名之后的内容)之后，才会认为这个采购单具有效益。

那么同理，怎么认为App是你独有的呢？就需要在发布的时候，对App进行私钥加密，即是**数字签名**

### P12

P12文件中包含了你的证书(包含了你的公钥)和你的私钥。

当你的App需要签名的时候，P12文件会一分为二。私钥用来做数字签名，公钥会打包进入你的app中，这样用户就可以根据app中的公钥来验证你的app的真实性。

#### 获取p12文件

我们可以从下载下来的证书中导出p12文件。

<img src="http://img.rynxiao.cn/ios-deployment/12.png" style="zoom:50%;" />

选择`Export`，其间会要求你输入密码。

###描述文件(provisioning Profiles)

简单来说，描述文件其实就是一份清单，包含了App中的一些必要信息，主要包括

- AppId，即为Bundle identifier，唯一，通常以`reverse domain name`的形式出现，例如`org.reactjs.native.example.TryWithReactNative`
- 证书(Development Certificates)，打包App时生成的证书
- Device UUid，设备的编号，规定了打出来的这个包只能由哪些设备使用(**Distrubtion Provisioning Profiles中不包含Device id**)

<img src="http://img.rynxiao.cn/ios-deployment/13.png" style="zoom:50%;" />

Provisioning Profiles分为两种，一种用于`Development`模式，可以供多人测试使用；一种用于`Distribution`模式，用于上传App Store。两种文件中的区别是，Distribution Provisioning Profiles中不包含device id。

![image-20200502175012371](http://img.rynxiao.cn/ios-deployment/14.png)

注：以上图片来自于https://medium.com/@jadhavrajashri49/provisioning-profile-67fad1907694

#### 怎么创建Provisioning Profiles？

关于怎么创建，以及创建不同模式下的Provisioning Profiles，可以参看[证书(Certificate)与描述文件(Provisioning Profiles)](https://www.cnblogs.com/rslai/p/9291159.html)，这里不再赘述。

> 证书创建完成后需要把描述文件手动下载到本机
>
> 找到你要使用的描述文件（开发者、发布）单击后显示如下内容，单击“Download”后保存到 “/Users/rongshenglai/Library/MobileDevice/Provisioning Profiles” 目录中注意每个人的个人目录不同根据情况修改。
>
> 下载的文件名类似“XXXX.mobileprovision” 前边的XXXX记录下来它就是描述文件名，使用时不要带.mobileprovision

## 如何使用Xcode + personal certificates真机调试

如果需要真机调试，但是又无法获取苹果开发者中心颁发的证书，那么可以使用xcode + 免费的开发者账号进行personal的证书申请。具体操作如下：

打开`xcode`，点击`Preferences`选择`Accounts`

<img src="http://img.rynxiao.cn/ios-deployment/15.png" style="zoom:50%;" />

点击左下角`+`号，使用`Apple Id`创建一个新的账户。

<img src="http://img.rynxiao.cn/ios-deployment/16.png" style="zoom:50%;" />

Apple ID中填写自己在苹果这开发中心申请的账号，完成后点击`Manage Certificates`

<img src="http://img.rynxiao.cn/ios-deployment/17.png" style="zoom:50%;" />

点击坐下角`+`号，创建一个证书即可，完成之后点击`Done`

<img src="http://img.rynxiao.cn/ios-deployment/19.png" style="zoom:50%;" />

回到`xcode`的工程目录下，在`Signing & Capabilities`面板的`Team`下，选择刚刚创建的Team

<img src="http://img.rynxiao.cn/ios-deployment/20.png" style="zoom:50%;" />

然后数据线连上真机，点击`Run`即可。

<img src="http://img.rynxiao.cn/ios-deployment/21.png" style="zoom:50%;" />

最后一步，则是在手机`设置 -> 通用 -> 设备管理`中，将未受信任的App置为信任即可。

## fastlane自动化打包上传

上面讲解了怎么生成certificates、p12以及provisioning profiles，有了这三个文件，现在就可以来打包发布了。这里采用的是fastlane。

网上关于[fastlane](https://docs.fastlane.tools/)上的教程很多，这里只是简单介绍。

fastlane是一个针对iOS和Android应用的Continuous Delivery工具集。能够自动化测试、截图以及管理你的provisioning profiles，为你打包上传应用节省了很多时间。

> *fastlane* is a tool for iOS and Android developers to automate tedious tasks like generating screenshots, dealing with provisioning profiles, and releasing your application.

<img src="http://img.rynxiao.cn/ios-deployment/22.png" style="zoom:50%;" />

注：图上的相关stage在最新的fastlane版本中可能有变化，以[官网](https://docs.fastlane.tools/)为准。

### [基本安装](https://docs.fastlane.tools/getting-started/ios/setup/)

安装最新的`xcode`命令行工具

```shell
xcode-select --install
```

安装fastlane

```shell
# Using RubyGems
sudo gem install fastlane -NV

# Alternatively using Homebrew
brew install fastlane
```

初始化项目

```shell
fastlane init
```

如果你选择了下载已经存在app的元数据，下面是生成的structure

<img src="http://img.rynxiao.cn/ios-deployment/23.png" style="zoom:50%;" />

### 工具集

到目前为止，Fastlane的工具集大约包含180多个小工具，基本上涵盖了打包、签名、测试、部署、发布、库管理等等移动开发中涉及到的内容。另外Fastlane本身强大的Action和Plugin机制，能够使你轻松地写出你自己想要的工具。

<img src="http://img.rynxiao.cn/ios-deployment/24.png" style="zoom:50%;" />

#### [代码签名(Codesigning)](https://docs.fastlane.tools/codesigning/getting-started/)

打包ios之前，最主要的就是要进行代码签名，这也是这篇文章上面讲解的内容。这里主要有几种方式：

- [cert](https://fastlane.tools/cert) & [sign](https://fastlane.tools/sigh)

  - [cert](https://fastlane.tools/cert)会保证你能创建一个合法的证书并且将private key存储在keychain中

  - [sign](https://fastlane.tools/sigh)会保证你能根据你的证书创建一个合法的provisioning profiles

  - [cert](https://fastlane.tools/cert)是`get_certificates ` action的别名，[sign](https://fastlane.tools/sigh)是`get_provisioning_profile` action的别名

  - ```ruby
    lane :beta do
      get_certificates           # invokes cert
      get_provisioning_profile   # invokes sigh
      build_app
    end
    ```

- [match](https://docs.fastlane.tools/codesigning/getting-started/#using-match)

  - > A new approach to iOS code signing: Share one code signing identity across your development team to simplify your codesigning setup and prevent code signing issues.
    >
    > *match* is the implementation of the [codesigning.guide concept](https://codesigning.guide/). *match* creates all required certificates & provisioning profiles and stores them in a separate git repository, Google Cloud, or Amazon S3. Every team member with access to the selected storage can use those credentials for code signing. *match* also automatically repairs broken and expired credentials. It's the easiest way to share signing credentials across teams

  - 官方推荐的形式

  - 使用git/cloud的形式管理证书

  - 能够自动修复和过期的证书

  - 方便在组内分享、管理

  - [match](https://docs.fastlane.tools/codesigning/getting-started/#using-match)是`sync_code_signing`actoin的别名

  - ```ruby
    lane :grant do |options|
      register_devices(devices_file: "./devices.txt")
      match(
        git_url: "git@xxx/certificates.git",
        type: "development",
        force_for_new_devices: true,
        app_identifier: ["org.reactjs.native.example.TryWithReactNative"]
      )
    end
    ```

####[开发打包(Beta Deployment)](https://docs.fastlane.tools/getting-started/ios/beta-deployment/)

如果证书已经搞定，下面就要使用`build_app(gym)`打开发包进行测试了

```ruby
lane :beta do
  sync_code_signing(type: "development")    # see code signing guide for more information
  build_app(scheme: "TryWithReactNative")
  upload_to_testflight
  slack(message: "Successfully distributed a new beta build")
end
```

打包完成之后，可以上传到预发布平台进行测试。这里有几个推荐：

- [testflight(upload_to_testflight)](https://docs.fastlane.tools/actions/testflight/#testflight)

- [appcenter](https://docs.fastlane.tools/plugins/available-plugins/#appcenter)，在[github](https://github.com/microsoft/fastlane-plugin-appcenter)中打开

  - fastlane插件

  - ```ruby
    # install
    fastlane add_plugin appcenter
    
    # basic usage
    appcenter_upload(
      api_token: "<appcenter token>",
      owner_name: "<appcenter account name of the owner of the app (username or organization URL name)>",
      owner_type: "user", # Default is user - set to organization for appcenter organizations
      app_name: "<appcenter app name (as seen in app URL)>",
      file: "<path to android build binary>",
      notify_testers: true # Set to false if you don't want to notify testers of your new release (default: `false`)
    )
    ```

- [payer 蒲公英](https://docs.fastlane.tools/plugins/available-plugins/#pgyer)，在[github](https://github.com/shishirui/fastlane-plugin-pgyer)中打开

  - fastlane插件

  - ```ruby
    # install 
    fastlane add_plugin pgyer
    
    # basic usage
    lane :beta do
      gym
      pgyer(
        api_key: "7f15xxxxxxxxxxxxxxxxxx141",
        user_key: "4a5bcxxxxxxxxxxxxxxx3a9e",
      )
    end
    ```

#### [生产打包(App Store Deployment)](https://docs.fastlane.tools/getting-started/ios/appstore-deployment/)

类似于开发打包过程，不过这里是要上传到苹果app store中，在此之前记得切换生产发布包的provisioning profiles

```ruby
lane :release do
  capture_screenshots                  # generate new screenshots for the App Store
  sync_code_signing(type: "appstore")  # see code signing guide for more information
  build_app(scheme: "TryWithReactNative")
  upload_to_app_store                  # upload your app to App Store Connect
  slack(message: "Successfully uploaded a new App Store build")
end
```

## 结束语

至此，整个App从注册、打包到发布就已经完全连成一条线了。对于新手小白来说却是不太容易，至于最后关于`fastlane`讲解的相关部分，因为自己并没有个人账号，采用的是公司生成的证书，所以也没办法亲自操作截图，如果有纰漏，敬请谅解。

## 参考资料

- [Understanding iOS Certificates](http://www.stencyl.com/help/view/ios-certificates-guide)
- [A Complete Guide to the Hellish World of iOS app Certificates and Profiles](https://reactorapps.io/blog/ios-certificate-guide/)
- [What is a provisioning profile & code signing in iOS?](https://medium.com/@abhimuralidharan/what-is-a-provisioning-profile-in-ios-77987a7c54c2)
- [how to use Apple Developer](https://developer.apple.com/cn/support/app-account/)
- [Provisioning profile](https://medium.com/@jadhavrajashri49/provisioning-profile-67fad1907694)
- [[学习笔记] 非对称加密和签名认证](https://zhuanlan.zhihu.com/p/34361296)
- [如何注册AppStore开发者账号?(2019最新版)](https://zhuanlan.zhihu.com/p/62735807)
- [iOS 开发者中的公司账号与个人账号之间有什么区别?](https://www.zhihu.com/question/20308474)
- [xcode7+iphone免费帐号打包详解](http://docs.wex5.com/xcode7-iphone-free-package/)
- [手把手教你搞定ios的证书申请](https://www.jianshu.com/p/ae11b893284b)
- [iOS开发证书相关知识](https://www.jianshu.com/p/f582683ef7a2)
- [证书(Certificate)与描述文件(Provisioning Profiles)](https://www.cnblogs.com/rslai/p/9291159.html)
- [Fastlane使用总结(一)](https://www.jianshu.com/p/04b83b335d53)

