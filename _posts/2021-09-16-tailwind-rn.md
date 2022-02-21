---
layout: post
title:  "React Native踩坑日记 —— tailwind-rn"
date:   2021-09-16
categories: 技术
excerpt: '项目背景 在项目的初始阶段，我们需要建立自己的design system，我们spike了一些方案，[tailwind-rn](https://github.com/vadimdemedes/tailwind-rn)就是其中一种，如果有用到或者即将用到tailwind-rn的，可以进来看一看，避免踩坑。后来觉得项目比较简单，tailwind对新上项目小伙伴确实不太友好，所以我们最终没有采用。'
tag: [RN, React Native, Tailwind]
---

## 项目背景

在项目的初始阶段，我们需要建立自己的design system，我们spike了一些方案，[tailwind-rn](https://github.com/vadimdemedes/tailwind-rn)就是其中一种，如果有用到或者即将用到tailwind-rn的，可以进来看一看，避免踩坑。

后来觉得项目比较简单，tailwind对新上项目小伙伴确实不太友好，所以我们最终没有采用。

## 简介

[GitHub - vadimdemedes/tailwind-rn: 🦎 Use Tailwind CSS in React Native projects](https://github.com/vadimdemedes/tailwind-rn)

[Tailwind](https://tailwindcss.com/) 提倡了原子型的CSS类，旨在灵活、复用，减少CSS重复，同时对于强迫症患者也有一定的治疗效果（毕竟有时候想类名是一件头疼的事）。当然，对于初学者有一定的熟悉成本，你需要要知道它的一些规则，熟悉它的命名系统等等。不太了解的可以自行google一下，这里不再赘述tailwind的使用。

[tailwind-rn](https://github.com/vadimdemedes/tailwind-rn) 就是基于tailwind的实现，使用tailwind生成的css类，然后再进行一些处理(CSS声明的转换、去除一些在RN上不适用的CSS声明等等)，最终转化成适用于RN的Styles格式。

> All styles are generated from Tailwind CSS source and not hard-coded, which makes it easy to keep this module up-to-date with latest changes in Tailwind CSS itself.

## 使用

我们大致来看看，tailwind-rn应该怎么在RN中使用。

```js
import React from 'react';
import {SafeAreaView, View, Text} from 'react-native';
import tailwind from 'tailwind-rn';

const App = () => (
	<SafeAreaView style={tailwind('h-full')}>
		<View style={tailwind('pt-12 items-center')}>
			<View style={tailwind('bg-blue-200 px-3 py-1 rounded-full')}>
				<Text style={tailwind('text-blue-800 font-semibold')}>
					Hello Tailwind
				</Text>
			</View>
		</View>
	</SafeAreaView>
);

export default App;
```

`tailwind`这个方法是从`tailwind.ts`中重新暴露出来的，伴随暴露的还有一个`getColor`方法。

```js
import { create } from 'tailwind-rn';
import styles from './styles.json';

const { tailwind, getColor } = create(styles);

tailwind('text-blue-500 text-opacity-50');
//=> {color: 'rgba(66, 153, 225, 0.5)'}
```

`styles.json`是通过cli创建出来的，这个文件就是tailwind CSS类 → RN Styles 的映射。所以如果开启了purge功能，同时又添加了一些自定义的Style，需要每次都手动执行cli的命令行重新生成新的styles.json。

简便的方法是，可以监听`tailwind.config.js`是否更改，然后自动生成styles.json，因为一般自定义的Style都会更改这个文件。

## 一些优点

### purge功能

打开purge配置，能让你尽可能地生成最小化的原子型RN styles，最大化的减少体积。建议在开发的时候不要开启，在打包的时候执行一次就好了。

```js
// Default tailwind config
// Refer to https://unpkg.com/browse/tailwindcss@2.2.9/stubs/defaultConfig.stub.js

module.exports = {
    purge: {
        enabled: true,
        content: ['../../src/**/*.ts', '../../src/**/*.tsx']
    },
    variants: {
        extend: {}
    },
    plugins: []
};
```

### 自定义theme

借助于tailwind的design system，tailwind-rn也同样地能够适用，你可以什么都不需要配置，直接使用它内置的设计系统，也可以新增、覆盖一些数值，来定义符合自己的设计系统。

```js
theme: {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
  },
  extend: {
		// 自定义的extend，会在生成tailwind默认的同时，额外生成自定义的类
    colors: {
      brand: {
        primary: {
          100: '#2c28f7'
        },
        secondary: {
          100: '#146d23'
        },
      }
    },
    padding: {
      7.5: 30
    },
    width: {
      12.5: 50,
      '3/7': '42.857143%',
      '4/7': '57.142857%'
    },
    borderWidth: {
      1.5: 6
    }
  }
}
```

## 一些坑

### 不支持各个边框（上、下、左、右）颜色属性

tailwind只提供整个边框颜色的支持，但是对于上、下、左、右四个边的边框是不支持的。

```css
border-black {
	--tw-border-opacity: 1;
	border-color: rgba(0, 0, 0, var(--tw-border-opacity));
}
```

> Tailwind ships with 73 colors out of the box and 5 breakpoints, which means there are already 365 border color utilities. If we added per-side border colors, that would jump to 1825 classes.

简单搜索一下，官方也有人提了这个issue，官方给出的答案是因为如果添加了四个边框的颜色支持，tailwind可能需要额外增加1825个css声明，所以暂时没有在考虑的范围之内。【[issue链接](https://github.com/tailwindlabs/discuss/issues/46#issuecomment-343185807)】

给出的解决方案是使用`@apply`创建一个新的component class

```css
.code-block {
    @apply .border .border-grey-light;
    border-left-width: config('borderWidths.4');
    border-left-color: config('borderColors.grey-dark');
}
```

tailwind-rn本身没有`@apply` 的方式去重新定义一个自定义的类，官方给出的解释是使用`@apply`的本身其实就是使用`tailwind('xx')`【尽管我觉得有点扯，我其实是希望tailwind-rn能直接帮我把自定义的类打进styles.json，而不是我自己再手动定义一个tailwind('xx')，然后再手动引入】

> I think `tailwind()` function itself is an equivalent of `@apply` already. `@apply py-2 px-2 bg-blue-500` is the same as `tailwind('py-2 px-2 bg-blue-500')`. [Support @apply](https://github.com/vadimdemedes/tailwind-rn/issues/32)

所以在RN上面的实现也是类似的

```js
arrow: {
  ...tailwind(['w-0', 'h-0', 'border-solid', 'border-1.5']),
  borderTopColor: getColor('bg-black-medium'),
  borderLeftColor: getColor('bg-white-dark'),
  borderBottomColor: getColor('bg-black-medium'),
  borderRightColor: getColor('bg-black-medium')
}
```

### 不支持StyleSheet.hairLineWidth

React Native定义的逻辑像素单位是**没有单位**，为什么**？**

> 因为RN是个跨平台的框架，在IOS上通常以逻辑像素单位pt描述尺寸，在Android上通常以逻辑像素单位dp描述尺寸，RN选哪个都不好，既然大家意思相同，干脆不带单位，在哪个平台渲染就默认用哪个单位。
> **RN提供给开发者的就是已经通过DPR（设备像素比）转换过的逻辑像素尺寸，开发者无需再关心因为设备DPR不同引起的尺寸数值计算问题**

通过上面的解释，所以width为1的，在ios上代表的是1pt，在android上代表的是1dp，表现为的设备像素在二倍屏上是即是2物理像素，三倍屏则是3物理像素，而一像素边框其实是代表的物理像素，所以ios在三倍屏上要想显示一像素的边框，对应的应该是0.33333pt.

由于我们需要使用RN的`hairLineWidth`来帮我们自动根据设备来计算，所以就不能使用配置文件来处理，所以解决的方案也比较硬核，就是直接往`styles.json`中塞值。

自定义一个`custom.style.ts`，专门用来处理一些tailwind-rn理不了的类声明。

```js
// custom.styles.ts

import { StyleSheet } from 'react-native';

export const customStyles = {
  'border-hair': {
	    borderWidth: StyleSheet.hairlineWidth
  },
  'border-t-hair': {
	    borderTopWidth: StyleSheet.hairlineWidth
  },
  'border-b-hair': {
      borderBottomWidth: StyleSheet.hairlineWidth
  },
  'border-l-hair': {
      borderLeftWidth: StyleSheet.hairlineWidth
  },
  'border-r-hair': {
      borderRightWidth: StyleSheet.hairlineWidth
  },
  'width-hair': {
      width: StyleSheet.hairlineWidth
  }
};

export type CustomStylesKey = keyof typeof customStyles;
```

然后在`tailwind.ts`中merge一下

```js
// tailwind.ts
import { create } from 'tailwind-rn';
import { assign } from 'lodash';

const { tailwind } = create(assign(styles, customStyles));
```

### 不支持智能提示

在现在主流的IDE上，都存在tailwind的智能提示插件，但是对于tailwind-rn的提示却不友好，要解决也挺简单

- 自己实现一个插件，兼容各个IDE
- 重新定义下类型，一个讨巧的做法，这里讲一下这种方法

编辑器不支持智能提示，我们可以利用Typescript的类型系统来稍微改造一下，让其能够自己推断

```javascript
// tailwind.ts

import { create } from 'tailwind-rn';
import styles from 'src/styles/styles.json';
import { assign } from 'lodash';
import { customStyles, CustomStylesKey } from 'src/styles/custom.style';

const { tailwind } = create(assign(styles, customStyles));

export type TailwindKey = keyof typeof styles | CustomStylesKey;

export default (keys: TailwindKey[]) => tailwind(keys.join(' '));
```

这里强行将之前的`string`变成了一个数组，目的就是为了让IDE去识别自己定义的tailwind key类型

```js
// 推荐使用
tailwind('h-11 bg-red-100')

// 改造之后
tailwind(['h-11', 'bg-red-100'])
```

### getColor与purge冲突

当使用tailwind-rn提供的`getColor`方法，并开启了`purge`配置时

```js
// tailwind.config.js
module.exports = {
    purge: {
        enabled: true,
        content: ['../../src/**/*.ts', '../../src/**/*.tsx']
    },
    // ...
}
```

由于tailwind默认不支持边框颜色，所以我不得不使用RN提供的方法。但是这样使用，我就需要使用`getColor`方法。

```js
// PageA.styles.ts
const styles = StyleSheet.create({
    container: {
        ...tailwind('w-11 h-11 bg-black text-white'),
        borderTopColor: getColor("blue-500")
    }
})
```

但是在我使用`purge`之后，tailwind扫描了默认已经在使用的CSS类，所以`blue-500`没有被识别，也没有被打包到`styles.json`中。

这就是问题所在。解决的方法也比较简单，就是使用tailwind提供的css类

```js
// PageA.styles.ts
const styles = StyleSheet.create({
    container: {
        ...tailwind('w-11 h-11 bg-black text-white'),
        borderTopColor: getColor("bg-blue-500 bg-opacity-50")
    }
})
```

源代码中的getColor是会默认扫描background，所以默认拼接了`bg-`，那么干掉就成了

```js
// Pass the name of a color (e.g. "bg-blue-500") and receive a color value (e.g. "#4399e1"),
// or a color and opacity (e.g. "bg-black bg-opacity-50") and get a color with opacity (e.g. "rgba(0,0,0,0.5)")
const getColor = name => {
		// const style = tailwind(name.split(' ').map(className => `bg-${className}`).join(' '));
    const style = tailwind(name);
    return style.backgroundColor;
};
```

针对这个问题，我给官方提了个PR，但是不知道何时才能merge了。

[Purge function will conflict with getColor by Rynxiao · Pull Request #96 · vadimdemedes/tailwind-rn](https://github.com/vadimdemedes/tailwind-rn/pull/96)

显然修改源代码是不可靠的，一下次的更新可能就会干掉你原先apply的代码，所以我们自己实现一遍就好。

```js
// tailwind.ts

export const getColor = (keys: TailwindKey[]) => {
    const style = tailwind(key.join(' '));
    return style.backgroundColor;
};
```

**注：近期关注问题会在下个release中修复 [https://github.com/vadimdemedes/tailwind-rn/pull/96#issuecomment-1006122279](https://github.com/vadimdemedes/tailwind-rn/pull/96#issuecomment-1006122279)**

## 总结

- 使用初期确实挺烦的，一个类一个类去找，但是熟悉了它的命名规范之后，其实写起来还挺顺畅的。
- 有一些坑，但都不是不能解决的问题，大不了使用原生的RN Style撸一撸。

## 参考链接

- [https://github.com/vadimdemedes/tailwind-rn](https://github.com/vadimdemedes/tailwind-rn)
- [聊聊React Native屏幕适配那些事儿](https://segmentfault.com/a/1190000039805723)