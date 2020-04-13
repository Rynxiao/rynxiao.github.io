---
layout: post
title:  "做一个单纯的react-image显示组件"
date:   2020-04-13
categories: 技术
excerpt: '最近项目上有一个需求，在显示图片的时候，需要传递自定义的头部就行认证。google了一番之后，发现没有现成的组件库可以使用【也可能是我没找到】，所以请求图片只能采用xhr方式来异步加载。下面就是在做这个组件库时的一些笔记，主要关注以下两个点：图片的等比例缩放处理'
tag: [react,image]
---

最近项目上有一个需求，在显示图片的时候，需要传递自定义的头部就行认证。google了一番之后，发现没有现成的组件库可以使用【也可能是我没找到】，所以请求图片只能采用xhr方式来异步加载。下面就是在做这个组件库时的一些笔记，主要关注以下两个点：

- 图片的等比例缩放处理
- 在请求图片的过程中，由于是异步加载，如果后加载的一个图片太小，而前一个图片过大，就会有图片显示不正确的问题

## 图片的缩放处理

最开始想到的是使用CSS 属性`background`来显示图片，后来发现使用CSS的`background-size`实现按照比例缩放图片好像有点困难，具体如下：

- 如果图片原始的尺寸小于外层容器的尺寸，我希望它居中显示
- 如果图片原始尺寸大于外层尺寸
  - 如果ratio > 1 (imageWidth / imageHeight)，图片应该按照宽度来进行缩放
  - 如果ratio = 1, 图片等比例缩放
  - 如果ratio < 1, 图片按照高度来缩放

因为要取到图片的原始尺寸，使用`img`标签显示也会有点问题。所以最终采用的是[new Image()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image)这个Web Api来创建的图片。具体代码如下：

```javascript
export const getImage = (src: string) => (
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(NETWORK_ERROR));
    image.src = src;
    image.crossOrigin = '';
    return image;
  })
);
```

同时，图片缩放的部分代码如下：

```javascript
if (ratio > 1) {
    if (imageWidth > wrapperWidth) {
      displayWidth = wrapperWidth;
      displayHeight = parseInt(`${(1 / ratio) * wrapperWidth}`, 10);
    }
  } else if (ratio === 1) {
    if (imageWidth > wrapperWidth) {
      displayWidth = wrapperWidth;
      displayHeight = wrapperWidth;
    } else {
      displayWidth = wrapperHeight;
      displayHeight = wrapperHeight;
    }
  } else if (imageHeight > wrapperHeight) {
    displayWidth = parseInt(`${ratio * wrapperHeight}`, 10);
    displayHeight = wrapperHeight;
  }
```

## 图片的覆盖问题

因为需要进行头部的认证，所以请求图片的方式统一使用了`XHR`的方式来进行请求，然后就会造成图片覆盖的问题。造成这个原因是，当出现了图片地址替换的时候，比如类似下面的代码：

```jsx
const [src, setSrc] = useState(src1);
useEffect(() => { setTimeout(() => setSrc(src2)); }, [src]);

return (
  <div className="App">
    <Image width={50} height={100} src={src} errorMessage="something bad happen" />
  </div>
);
```

上述代码中的src2会后被加载，如果src1的加载速度比src2的加载速度快倒没有什么问题，但是反之，就会出现后加载的图片反而被先加载的图片进行覆盖。那么，怎么解决这个问题：

想到的办法是，当开始加载后一个图片时，首先进行判断是否存在上一个加载图片的请求，如果存在，则直接`abort`，类似于`debounce`的做法。具体的做法如下：

- 声明一个图片请求的类，专门用来作图片请求

  ```javascript
  export default class ImageRequest {
    xmlHttpRequest: XMLHttpRequest;
    url: string;
    headers: XMLHttpRequestHeaders;
  
    setHeaders() {
      if (this.headers) {
        const keys = Object.keys(this.headers);
        keys.forEach((key: string) => {
          this.xmlHttpRequest.setRequestHeader(key, this.headers[key]);
        });
      }
    }
  
    request(url: string, headers: XMLHttpRequestHeaders) {
      this.url = url;
      this.headers = headers;
  
      if (this.xmlHttpRequest) {
        this.xmlHttpRequest.abort();
      }
  
      this.xmlHttpRequest = new XMLHttpRequest();
      this.xmlHttpRequest.open('GET', this.url);
      this.xmlHttpRequest.responseType = 'blob';
      this.setHeaders();
      this.xmlHttpRequest.send();
  
      return new Promise((resolve, reject) => {
        this.xmlHttpRequest.onload = () => {
          this.xmlHttpRequest = null;
          if (this.xmlHttpRequest.status === 200) {
            resolve(this.xmlHttpRequest.response);
          } else {
            reject(new Error(`${IMAGE_LOAD_ERROR}${this.xmlHttpRequest.statusText}`));
          }
        };
  
        this.xmlHttpRequest.onerror = () => {
          reject(new Error(NETWORK_ERROR));
        };
      });
    }
  }
  ```

  在每个实例中维持一个`XMLHttpRequest`的引用，每当进行请求的时候，首先判断当前引用是否存在，如果存在，则直接abort，否则，则进行图片的请求。

- 在组件中，创建一个request实例，同时将其维护在state中

  ```jsx
  // 记住，不能在组件外部声明实例，需要保存在每一个组件中，确保每一个组件都有一个新的请求实例
  // const imageRequest: ImageRequest = new ImageRequest();
  
  const Image: React.FC<Props> = (props) => {
    const [request] = useState<ImageRequest>(new ImageRequest());
  
    useEffect(() => {
      if (src) {
        setState(LOADING_STATE.LOADING);
        loadImage(request, src, headers).then((img: HTMLImageElement) => {
          const { displayWidth, displayHeight } = getDisplayImageSize(img, width, height);
          const displayImage = img;
          displayImage.width = displayWidth;
          displayImage.height = displayHeight;
          setState({ ...LOADING_STATE.SUCCESS, image: displayImage });
        }).catch(() => setState(LOADING_STATE.FAIL));
      }
    }, [loadImage, src]);
    
    // ...
  };
  ```

  注意，这里的`ImageRequest`实例只能保存在组件的state中，因为如果在组件开始使用const引入，如果一个页面中存在多个相同组件时，就会导致多个组件共享一个request实例中的`xmlHttpRequest`引用，就会出现前面的图片全部都会被abort掉的情况。

## 总结

看是简单的问题，做起来也会比较复杂，口说的没用，做起来才行。

最后，项目地址：[https://github.com/Rynxiao/react-image](https://github.com/Rynxiao/react-image)，npm包地址：[https://www.npmjs.com/package/rt-image](https://www.npmjs.com/package/rt-image)，欢迎留言和star






