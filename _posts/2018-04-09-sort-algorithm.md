---
layout: post
title:  "排序算法总结与实现"
date:   2018-04-09
categories: 技术
excerpt: '选择排序,选择排序每次比较的是数组中特定索引的值与全数组中每个值的大小比较，每次都选出一个最小(最大)值，如果当前索引的值大于之后索引的值，则两者进行交换,分类 -------------- 内部比较排 数据结构 ---------- 数组'
tag: [算法,排序,javascript]
---

## 选择排序

选择排序每次比较的是数组中特定索引的值与全数组中每个值的大小比较，每次都选出一个最小(最大)值，如果当前索引的值大于之后索引的值，则两者进行交换

```javascript
// 分类 -------------- 内部比较排序
// 数据结构 ---------- 数组
// 最差时间复杂度 ---- O(n^2)
// 最优时间复杂度 ---- O(n^2)
// 平均时间复杂度 ---- O(n^2)
// 所需辅助空间 ------ O(1)
// 稳定性 ------------ 不稳定

var arr = [1, 4, 5, 2, 3, 9, 0, 7, 6];
var temp;

for (var i = 0; i < arr.length; i++) {
	for (var j = i + 1; j < arr.length; j++) {
		if (arr[i] > arr[j]) {
			temp = arr[j];
			arr[j] = arr[i];
			arr[i] = temp;
		}
	}
}

console.log(arr);
```

过程大致如下：

```javascript
1 4 5 2 3 9 0 7 6
0 4 5 2 3 9 1 7 6
0 2 5 4 3 9 1 7 6
0 1 5 4 3 9 2 7 6
0 1 4 5 3 9 2 7 6
0 1 3 5 4 9 2 7 6
0 1 2 5 4 9 3 7 6
0 1 2 4 5 9 3 7 6
0 1 2 3 5 9 4 7 6
0 1 2 3 4 9 5 7 6
0 1 2 3 4 5 9 7 6
0 1 2 3 4 5 7 9 6
0 1 2 3 4 5 6 9 7
0 1 2 3 4 5 6 7 9
```

## 冒泡排序

冒泡排序每次从数组的最开始索引处与后一个值进行比较，如果当前值比较大，则交换位置。这样一次循环下来，最大的值就会排入到最后的位置。

```javascript
// 分类 -------------- 内部比较排序
// 数据结构 ---------- 数组
// 最差时间复杂度 ---- O(n^2)
// 最优时间复杂度 ---- 如果能在内部循环第一次运行时,使用一个旗标来表示有无需要交换的可能,可以把最优时间复杂度降低到O(n)
// 平均时间复杂度 ---- O(n^2)
// 所需辅助空间 ------ O(1)
// 稳定性 ------------ 稳定

var arr = [1, 4, 5, 2, 3, 9, 0, 7, 6];
var t;

for (var m = 0; m < arr.length; m++) {
	for (var n = 0; n < arr.length - m; n++) {
		if (arr[n] > arr[n + 1]) {
			t = arr[n + 1];
			arr[n + 1] = arr[n];
			arr[n] = t;
		}
	}
}

console.log(arr);
```

过程大致如下：

```javascript
1 4 5 2 3 9 0 7 6
1 4 2 5 3 9 0 7 6
1 4 2 3 5 9 0 7 6
1 4 2 3 5 0 9 7 6
1 4 2 3 5 0 7 9 6
1 4 2 3 5 0 7 6 9
1 2 4 3 5 0 7 6 9
1 2 3 4 5 0 7 6 9
1 2 3 4 0 5 7 6 9
1 2 3 4 0 5 6 7 9
1 2 3 0 4 5 6 7 9
1 2 0 3 4 5 6 7 9
1 0 2 3 4 5 6 7 9
0 1 2 3 4 5 6 7 9
```

## 插入排序

插入排序类似于扑克牌的插入方法，选取待排列数组中的任意一个数字作为已排序的基准，再依次从待排序数组中取出数字，根据依次比较，将这个数字插入到已排序的数组中

```javascript
// 分类 ------------- 内部比较排序
// 数据结构 ---------- 数组
// 最差时间复杂度 ---- 最坏情况为输入序列是降序排列的,此时时间复杂度O(n^2)
// 最优时间复杂度 ---- 最好情况为输入序列是升序排列的,此时时间复杂度O(n)
// 平均时间复杂度 ---- O(n^2)
// 所需辅助空间 ------ O(1)
// 稳定性 ------------ 稳定

var arr = [1, 4, 5, 2, 3, 9, 0, 7, 6];

/**
 * 直接使用同一个数组方式
 */
for (var i = 1; i < arr.length; i++) {
	var get = arr[i];
	var j = i - 1;
	// 倒叙比较已经排序的值和取到的值进行比较
	// 如果取到的值在已经排序中的值中存在合适的索引插入，则需要将这个索引之后的值进行后移
	while (j >= 0 && arr[j] > get) {
		arr[j + 1] = arr[j];
		j--;
	}
	arr[j + 1] = get;
}
console.log(arr);

/**
 * 引入一个新的数组方式
 * 引入一个数组后会更好理解
 */
var sortList = [arr[0]];

for (var i = 1; i < arr.length; i++) {
	var sLen = sortList.length;

    // 如果取出的数字比已经排序的第一个值都小，则插入到最开始
	if (arr[i] < sortList[0]) {
		sortList.unshift(arr[i])
		continue;
	}

    // 如果取出的数字比已经排序的最后一个值都大，则插入到最末尾
	if (arr[i] > sortList[sLen - 1]) {
		sortList[sLen] = arr[i];
		continue;
	}

	for (var j = 0; j < sLen - 1; j++) {
		if (arr[i] >= sortList[j] && arr[i] <= sortList[j + 1]) {
			sortList.splice(j + 1, 0, arr[i]);
			break;
		}		
	}
}

console.log(sortList);
```

过程大致如下：

```javascript
1
1 4
1 4 5
1 2 4 5
1 2 3 4 5
1 2 3 4 5 9
0 1 2 3 4 5 9
0 1 2 3 4 5 7 9
0 1 2 3 4 5 6 7 9
```

## 二分插入排序

二分插入排序是直接插入排序的一个变种，利用二分查找法找出下一个插入数字对应的索引，然后进行插入。

当n较大时，二分插入排序的比较次数比直接插入排序的最差情况好得多，但比直接插入排序的最好情况要差，所当以元素初始序列已经接近升序时，直接插入排序比二分插入排序比较次数少。二分插入排序元素移动次数与直接插入排序相同，依赖于元素初始序列。

```javascript
// 分类 -------------- 内部比较排序
// 数据结构 ---------- 数组
// 最差时间复杂度 ---- O(n^2)
// 最优时间复杂度 ---- O(nlogn)
// 平均时间复杂度 ---- O(n^2)
// 所需辅助空间 ------ O(1)
// 稳定性 ------------ 稳定

var arr = [1, 4, 5, 2, 3, 9, 0, 7, 6];

/**
 * 直接使用同一个数组方式
 */
for (var i = 1; i < arr.length; i++) {
	var get = arr[i];
	var left = 0;
	var right = i - 1;

    // 每次找出中间位置然后进行比较，最终确定索引位置
	while (left <= right) {
		var mid = parseInt((left + right) / 2);
		if (arr[mid] > get) {
			right = mid - 1;
		} else {
			left = mid + 1;
		}
	}
    
    for (var k = i - 1; k >= left; k--) {
        arr[k + 1] = arr[k];
    }
    arr[left] = get;
	
}

/**
 * 引入一个新的数组方式
 * 引入一个数组后会更好理解变化的方式
 */
var sortList = [arr[0]];

for (var i = 1; i < arr.length; i++) {
	var sLen = sortList.length;
	var get = arr[i];
	var left = 0;
	var right = sLen - 1;

    // 每次找出中间位置然后进行比较，最终确定索引位置
	while (left <= right) {
		var mid = parseInt((left + right) / 2);
		if (sortList[mid] > get) {
			right = mid - 1;
		} else {
			left = mid + 1;
		}
	}

    // splice是数组插入值的一个快捷方式，将值移位的方式如下
    // sortList.splice(left, 0, get);
    
    for (var k = sLen - 1; k >= left; k--) {
        sortList[k + 1] = sortList[k];
    }
    sortList[left] = get;
	
}

console.log(sortList);
```

过程大致如下：

```javascript
1
1 4
1 4 5
1 2 4 5
1 2 3 4 5
1 2 3 4 5 9
0 1 2 3 4 5 9
0 1 2 3 4 5 7 9
0 1 2 3 4 5 6 7 9
```
## 希尔排序

## 参考

- [常用排序算法总结(一)](https://www.cnblogs.com/eniac12/p/5329396.html)
- [图解排序算法(二)之希尔排序](https://www.cnblogs.com/chengxiao/p/6104371.html)
- [白话经典算法系列之三希尔排序的实现](https://www.cnblogs.com/skywang12345/p/3597597.html)
