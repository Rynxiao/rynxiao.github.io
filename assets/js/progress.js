;(function() {
	function getScrollHeight() {
		return Math.max(document.body.scrollHeight, document.documentElement.scrollHeighth);
	}

	function getScrollTop() {
		var scrollTop = 0;
		var documentElement = document.documentElement;
		var body = document.body;

		if (documentElement && documentElement.scrollTop) {
			scrollTop = documentElement.scrollTop;
		} else {
			scrollTop = body.scrollTop;
		}

		return scrollTop;
	}

	function getWindowHeight() {
		return window.innerHeight;
	}

	var ele = document.querySelector('#rynProgress');
	var windowHeight = getWindowHeight();
	var scrollHeight = getScrollHeight();
	var top = getScrollTop();

	if (scrollHeight <= clientHeight) {
		ele.style.display = 'none';
	} else {
		ele.setAttribute('max', height);

		// 添加事件
		document.addEventListener('scroll', function() {
			var top = getScrollTop();
			var currentHeight = top + windowHeight;
			var percent = Number(currentHeight / scrollHeight) + '%';
			ele.setAttribute('value', currentHeight);
			ele.setAttribute('alt', percent);
		});
	}
})();

