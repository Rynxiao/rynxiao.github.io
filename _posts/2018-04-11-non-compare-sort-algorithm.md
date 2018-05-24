---
layout: post
title:  "非比较排序算法总结与实现"
date:   2018-04-11
categories: 技术
excerpt: '之前一篇文章介绍了几种常用的比较排序算法，下面介绍的是几种非比较排序算法。非比较排序算法内部引用的都是计数排序，当然你也可以将计数排序换为其他的比较排序算法。计数排序 计数排序的步骤为：1. 遍历数组(A)，借助一个辅助数组(B)，将每一个数字放在辅助数组(B)对应索引的位置并计数加1'
tag: [算法,排序,javascript]
---

[之前一篇文章](http://rynxiao.com/%E6%8A%80%E6%9C%AF/2018/04/09/sort-algorithm.html)介绍了几种常用的比较排序算法，下面介绍的是几种非比较排序算法。

非比较排序算法内部引用的都是**计数排序**，当然你也可以将计数排序换为其他的比较排序算法。

## 计数排序

计数排序的步骤为：

1. 遍历数组(A)，借助一个辅助数组(B)，将每一个数字放在辅助数组(B)对应索引的位置并计数加1
2. 遍历辅助数组(B)，将每项的值变为与前一项相加的和
3. 遍历原始数组(A)，取出辅助数组中对应的索引值，将值填入对应的一个新的数组(C)中

计数排序的原理用一个通俗的栗子来讲就是这样的：

```javascript
// 有一个这样的数组
var arr = [1, 5, 3, 8, 2];

// 8排在哪个位置？ 4 ，如何得来？

1 < 8 // 计数加1
5 < 8 // 计数加1
3 < 8 // 计数加1
2 < 8 // 计数加1

那最后自然是 4

// 算法上是这样实现：
B: [, 1, 1, 1, , 1, , , 1]
B: [0, 1, 1, 1, 0, 1, 0, 0, 1]  // 空余部分用0填充
B: [0, 1, 2, 3, 3, 4, 4, 4, 5]  // 计数

// 遍历原始数组
arr[0]: 1
// 取B中对应的索引值
B[1]: 1
// 放入C
C: [, 1]

// 中间省略N步

// N+1步
arr[4]: 2
B[2]: 2
C: [, 1, 2, 3, 5, 8]
C: [1, 2, 3, 5, 8]  // 去除空余
```

实现：

```javascript
// 分类 ------------ 内部非比较排序
// 数据结构 --------- 数组
// 最差时间复杂度 ---- O(n + k)
// 最优时间复杂度 ---- O(n + k)
// 平均时间复杂度 ---- O(n + k)
// 所需辅助空间 ------ O(n + k)
// 稳定性 ----------- 稳定

var arr = [1, 4, 5, 2, 3, 9, 0, 7, 6];
var b = [];
var c = [];

// 初始计数
for (var i = 0; i < arr.length; i++) {
	var ai = arr[i];
	var count = b[ai];
	count ? b[ai] = ++count : b[ai] = 1;
}

// 计数
for (var i = 1; i < b.length; i++) {
	var p = b[i - 1];
	var n = b[i];

	if (!p) {
		p = 0;
	}

	if (!n) {
		n = 0;
	}

	b[i] = p + n;
}

// 重新分配
for (var i = arr.length - 1; i >= 0 ; i--) {
	var index = b[arr[i]];
	while (index >= 0) {
		if (typeof c[index] === 'number') {
			index--;
		} else {
			c[index] = arr[i];
			break;
		}
	}
}

// 去除空格
for (var i = 0; i < c.length; i++) {
	if (!c[i]) {
		c.splice(i, 1);
	}
}

console.log(c);
```

## 基数排序

基数排序的基本原理是：

1. 将所有待比较的数字均看成位数相同的，不同的用0填充，比如`12`和`112`这两个数字，则看成`012`和`112`
2. 从最后位置依次向前比较，每次比较会得到一个排序(这里的比较会运用到计数排序)，这样就会得到最终的排序规则

还是用一个栗子来说明一下，这样更加清楚

```javascript
// 有这样一个数组

var arr = [12, 112, 34, 26, 290, 1, 45];

// 1. 补齐
var arr = [012, 112, 034, 026, 290, 001, 045]

// 2. 比较最后一位
012         290         
112         001
034         012
026   ->    112
290         034
001         045
045         026

// 3. 比较第二位
290         001         
001         012
012         112
112   ->    026
034         034
045         045
026         290

// 4. 比较百位
001         001         1   
012         012         12
112         026         26
026   ->    034    ->   34
034         045         45
045         112         112
290         290         290
```

实现：

```javascript
// 分类 ------------- 内部非比较排序
// 数据结构 ---------- 数组
// 最差时间复杂度 ---- O(n * max)
// 最优时间复杂度 ---- O(n * max)
// 平均时间复杂度 ---- O(n * max)
// 所需辅助空间 ------ O(n * max)
// 稳定性 ----------- 稳定

var arr = [12, 112, 34, 26, 290, 1, 45];
var max = 1;

// 获取每次的余数
function getRemainder(n, d) {
	var base = Math.pow(10, d);
	return Math.floor(n / base) % 10;
}

function countingSort(arr, d) {
	var b = [];
	var c = [];

	for (var j = 0; j < arr.length; j++) {
		var l = getRemainder(arr[j], d);
		var count = b[l];
		count ? b[l] = ++count : b[l] = 1;
	}

	// 计数
	for (var i = 1; i < b.length; i++) {
		var p = b[i - 1];
		var n = b[i];

		if (!p) {
			p = 0;
		}

		if (!n) {
			n = 0;
		}

		b[i] = p + n;
	}

	// 重新分配
	for (var i = arr.length - 1; i >= 0 ; i--) {
		var index = b[getRemainder(arr[i], d)];
		while (index >= 0) {
			if (typeof c[index] === 'number') {
				index--;
			} else {
				c[index] = arr[i];
				break;
			}
		}
	}

	// 去除空格
	for (var i = 0; i < c.length; i++) {
		if (!c[i]) {
			c.splice(i, 1);
		}
	}

	for (var i = 0; i < c.length; i++) {
		arr[i] = c[i];
	}
}

// 计算最大位数
for (var i = 0; i < arr.length; i++) {
	var t = '' + arr[i];
	if (t.length > max) {
		max = t.length;
	}
}

for (var i = 0; i < max; i++) {
	countingSort(arr, i);
}

console.log(arr);
```

大致运行过程如下：

```javascript
12 112 34 26 290 1 45
290 1 12 112 34 45 26
1 12 112 26 34 45 290
1 12 26 34 45 112 290
```

## 桶排序

桶排序是原理是，将一个数组分成若干个桶(桶的数量根据数据量来确定，比如根据最大值、值的区间范围等等，但**尽量保证每个桶内的数据均匀**即可)，通过一定的规则来确定这个数字在哪个桶当中，比如下面的我就取的每个桶的范围为10，那么除以这个范围即可以得出这个数字属于哪个桶中。然后再采用非比较排序或者计数排序对桶内数据进行排序，这样在遍历所有桶中的数据时，就保证了数据已经排列好了。

下面还是以一个数组为例说明：

```javascript
var arr = [12, 112, 34, 32, 29, 26, 290, 114, 1, 45, 292];

12 / 10  -> 1
112 / 10 -> 11
34 / 10  -> 3
32 / 10  -> 3
29 / 10  -> 2
26 / 10  -> 2
290 / 10 -> 29
114 / 10 -> 11
1 / 10   -> 0
45 /10   -> 4

0号桶内数据：1
1号桶内数据：12
2号桶内数据：29, 26
3号桶内数据: 34, 32
4号桶内数据：45
11号桶内数据：112, 114
29号桶内数据：290, 292
```
得出了每个桶内的数据之后，然后在按照基本的排序把桶内数据排序好即可，可见桶的复杂度取决于**取桶的数量以及桶内的排序算法**。

```javascript
// 分类 ------------- 内部非比较排序
// 数据结构 --------- 数组
// 最差时间复杂度 ---- O(nlogn)或O(n^2)，只有一个桶，取决于桶内排序方式
// 最优时间复杂度 ---- O(n)，每个元素占一个桶
// 平均时间复杂度 ---- O(n)，保证各个桶内元素个数均匀即可
// 所需辅助空间 ------ O(n + bn)，bn为桶的个数
// 稳定性 ----------- 稳定

var arr = [12, 112, 34, 32, 29, 26, 290, 114, 1, 45, 292];

function countingSort(arr) {
	var b = [];
	var c = [];

	for (var i = 0; i < arr.length; i++) {
		var ai = arr[i];
		var count = b[ai];
		count ? b[ai] = ++count : b[ai] = 1;
	}

	// 计数
	for (var i = 1; i < b.length; i++) {
		var p = b[i - 1];
		var n = b[i];

		if (!p) {
			p = 0;
		}

		if (!n) {
			n = 0;
		}

		b[i] = p + n;
	}

	// 重新分配
	for (var i = arr.length - 1; i >= 0 ; i--) {
		var index = b[arr[i]];
		c[index] ? c[index - 1] = arr[i] : c[index] = arr[i];
	}

	// 去除空格
	for (var i = 0; i < c.length; i++) {
		if (!c[i]) {
			c.splice(i, 1);
		}
	}

	for (var i = 0; i < c.length; i++) {
		arr[i] = c[i];
	}
}

function bucketSort(arr) {
	var bucketList = [];
	var resultList = [];
	var base = 10;

	// 分桶
	for (var i = 0; i < arr.length; i++) {
		var bucketNum = Math.floor(arr[i] / 10);
		if (bucketList[bucketNum]) {
			bucketList[bucketNum].push(arr[i]);
		} else {
			bucketList[bucketNum] = [arr[i]];
		}
	}

	// 桶内使用计数排序
	for (var i = 0; i < bucketList.length; i++) {
		bucketList[i] && countingSort(bucketList[i]);
	}

	// 输出
	for (var i = 0; i < bucketList.length; i++) {
		if (bucketList[i]) {
			resultList = resultList.concat(bucketList[i]);
		}
	}

	return resultList;
}

console.log(bucketSort(arr));
```

过程大致如下：

```javascript
0号桶内数据: 1
1号桶内数据: 12
2号桶内数据: 29 26
3号桶内数据: 34 32
4号桶内数据: 45
11号桶内数据: 112 114
29号桶内数据: 290 292
```

## 参考

- [常用排序算法总结(二)](https://www.cnblogs.com/eniac12/p/5332117.html)
- [三大线性排序之桶排序](https://www.cnblogs.com/hxsyl/p/3214379.html)

我的博客即将搬运同步至腾讯云+社区，邀请大家一同入驻：https://cloud.tencent.com/developer/support-plan?invite_code=2mn876wro42s8
