$(function() {
	var rynCommentWords = [
		{ "Close": "关闭", "path": '#IDCommentPopupInner>.idc-close>span' },
		{ "Forgot password?": "忘记密码", "path": '#IDCommentPopupInner>h6'},
		{ "Please put in your email:": '请输入你的邮箱', "path": '#IDCommentPopupInner label' },
		{ "Send me my password!": '发送密码！', "path": '#IDCommentPopupInner .idc-btn_s>span' },
		{ "Close message": '关闭消息', "path": '#IDCommentPopupInner .idc-bottom>a' },
		{ "There are no comments posted yet.": '还没有评论哟.', "path": '#IDCommentsNoCommentsDiv', "type": 'inner' },
		{ "Be the first one!": '做第一个吧！', "path": '#IDCommentsNoCommentsDiv>a' },
		{ "Post a new comment": '发布一条新评论', "path": '#IDCommentsNewThreadCover>h3' },

		{ "Login": '登录', "path": '#IDCommentsHeadLogin>span' },
		{ "This blog post": '这篇文章评论', "path": '#IDShareMenuPost>a>span', "type": 'inner', "index": 0 },
		{ "All blog posts": '所有文章评论', "path": '#IDShareMenuBlog>a>span' },
		{ "Subscribe to this blog post's comments through...": '订阅这篇文章的评论，通过...', "path": '#divIdcSharePost>p', "type": 'inner', "index": 0 },
		{ "Subscribe via email": '通过邮箱订阅', "path": '#divIdcSharePost>.idc-subscribe-email strong' },
		{ "Subscribe": '订阅', "path": '#IDCSubscribeSubmit0 .idc-r' },
		{ "Subscribe to this blog post's comments through...": '订阅这篇文章的评论，通过...', "path": '#divIdcShareBlog>p', "type": 'inner', "index": 0 },
		{ "Subscribe via email": '通过邮箱订阅', "path": '#divIdcShareBlog>.idc-subscribe-email' },
		{ "Subscribe": '订阅', "path": '#IDCSubscribeSubmit1 .idc-r' },
		{ "Follow the discussion": '关注议题', "path": '#IDCommentsHead .idc-head_tools-share' },
		{ "Comments": '评论', "path": '#idc-commentcount_label' },
		{ "Logging you in...": '正在登录...', "path": '#IDCommentsHead .idc-loggingin>span', "type": 'inner' },
		{ "Close": '关闭', "path": '#IDfrmHeaderLogin>.idc-close>span' },
		{ "Login to IntenseDebate": '登录到 IntenseDebate', "path": '#IDfrmHeaderLogin>p', "type": 'inner', "index": 0 },
		{ "Or": '或者', "path": '#IDfrmHeaderLogin>p', "type": 'inner', "index": 1 },
		{ "create an account": '创建一个新账户', "path": '#IDfrmHeaderLogin>p', "type": 'inner', "index": 1 },
		{ "Username or Email:": '用户名或者邮箱', "path": '#IDfrmHeaderLogin>.idc-columns label', "type": 'inner', "index": 0 },
		{ "Password:": '密码', "path": '#IDfrmHeaderLogin>.idc-columns label', "type": 'inner', "index": 1 },
		{ "Forgot login?": '忘记密码?', "path": '#IDfrmHeaderLogin .idc-fade>a' },
		{ "Cancel": '取消', "path": '#IDfrmHeaderLogin .idc-btn_l-secondary .idc-r' },
		{ "Login": '登录', "path": '#IDfrmHeaderLogin .idc-btn_l .idc-r' },
		{ "Close": '关闭', "path": '#IDfrmHeaderWPLogin>.idc-close>span' },
		{ "Username or Email:": '用户名或者邮箱', "path": '#IDfrmHeaderWPLogin>.idc-columns label', "type": 'inner', "index": 0 },
		{ "Password:": '密码', "path": '#IDfrmHeaderWPLogin>.idc-columns label', "type": 'inner', "index": 1 },
		{ "Lost your password?": '忘记密码?', "path": '#IDfrmHeaderWPLogin .idc-fade>a' },
		{ "Cancel": '取消', "path": '#IDfrmHeaderWPLogin .idc-btn_l-secondary .idc-r' },
		{ "Login": '登录', "path": '#IDfrmHeaderWPLogin .idc-btn_l .idc-r' },
		{ "Dashboard": '工作台', "path": '#IDCommentsHead>.idc-user>.idc-right>.snap_noshots', "type": 'inner', "index": 0 },
		{ "Edit profile": '编辑档案', "path": '#IDCommentsHead>.idc-user>.idc-right>.snap_noshots', "type": 'inner', "index": 1 },
		{ "Logout": '登出', "path": '#idc-logout-link' },
		{ "Logged in as": '登录由', "path": '#IDCommentsHead>.idc-user>.idc-user_i', "type": 'inner' },
		{ "Admin Options": '管理员操作', "path": '#IDAdminOptsLink' },
		{ "Disable comments for this page": '当前页禁止评论', "path": '#showHideAdminOpts label', "type": 'inner' },
		{ "Save Settings": '保存设置', "path": '#IDCSavedSettings' },

		{ "Comment as a Guest, or login:": '以游客身份评论，或登录:', "path": '#IDCNavGuest2>span' },
		{ "Login to IntenseDebate": '登录到 IntenseDebate', "path": '#IDCNavList .idc-loginbtn_intensedebate' },
		{ "Login to WordPress.com": '登录到 WordPress', "path": '#IDCNavList .idc-loginbtn_wordpress' },
		{ "Login to Twitter": '登录到 Twitter', "path": '#IDCNavList .idc-loginbtn_twitter' },
		{ "Go back": '返回', "path": '#IDCNavGuest' },
		{ "Tweet this comment": '评论', "path": '#IDCommentsNewThread .idc-userbar .idc-right label', "type": 'inner' },
		{ "Connected as": '连接', "path": '#IDCommentsNewThread .idc-userbar-i', "type": 'inner' },
		{ "Logout": '登出', "path": '#IDCommentsNewThread .idc-userbar-i .snap_noshots' },
		{ "Email (optional)": '邮箱 (可选)', "path": '#IDCommentsNewThread .idc-column-wide>label' },
		{ "Not displayed publicly.": '转为私有显示.', "path": '#IDCommentsNewThread .idc-column-wide>.idc-form-info' },
		{ "Name": '姓名', "path": '#IDCColumnNameLabel>label' },
		{ "Email": '邮箱', "path": '#IDCColumnEmailLabel>label' },
		{ "Website (optional)": '网站 (可选)', "path": '#IDCColumnURLLabel>label' },
		{ "Displayed next to your comments.": '评论展示的昵称.', "path": '#IDCColumnName>.idc-form-info' },
		{ "Not displayed publicly.": '转为私有显示.', "path": '#IDCColumnEmailReply>.idc-form-info' },
		{ "If you have a website, link to it here.": '链接到您的网站.', "path": '#IDCColumnURL>.idc-form-info' },
		{ "Posting anonymously.": '匿名评论.', "path": '#IDCommentsNewThreadListItem1' },
		{ "Tweet this comment": '评论到Twitter', "path": '#IDNewThreadTweetThisWrapper label', "type": 'inner' },
		{ "Submit Comment": '发布评论', "path": '#IDNewThreadSubmitLI .idc-r>strong' },
		{ "Subscribe to": '订阅到', "path": '#IDSubscribeToThisWrapper .idc-nofloat', "type": 'inner' },
		{ "All new comments": '所有新的评论', "path": '#IDSubscribeToThis', "type": 'inner' },
		{ "Comments by": '评论通过', "path": '#idc-container>.idc-foot>.idc-id>span' },

		{ "Reply as a Guest, or login:": '以游客身份评论，或登录:', "path": '#IDCNavGuestReply2>span' },
		{ "Login to IntenseDebate": '登录到 IntenseDebate', "path": '#IDCNavListReply .idc-loginbtn_intensedebate' },
		{ "Login to WordPress.com": '登录到 WordPress', "path": '#IDCNavListReply .idc-loginbtn_wordpress' },
		{ "Login to Twitter": '登录到 Twitter', "path": '#IDCNavListReply .idc-loginbtn_twitter' },
		{ "Go back": '返回', "path": '#IDCNavGuestReply' },
		{ "Tweet this comment": '评论', "path": '#IDCommentReplyDiv .idc-userbar .idc-right label', "type": 'inner' },
		{ "Connected as": '连接', "path": '#IDCommentReplyDiv .idc-userbar-i', "type": 'inner' },
		{ "Logout": '登出', "path": '#IDCommentReplyDiv .idc-userbar-i .snap_noshots' },
		{ "Email (optional)": '邮箱 (可选)', "path": '#IDCommentReplyDiv .idc-column-wide>label' },
		{ "Not displayed publicly.": '转为私有显示.', "path": '#IDCommentReplyDiv .idc-column-wide>.idc-form-info' },
		{ "Name": '姓名', "path": '#IDCColumnNameReplyLabel>label' },
		{ "Email": '邮箱', "path": '#IDCColumnEmailReplyLabel>label' },
		{ "Website (optional)": '网站 (可选)', "path": '#IDCColumnURLReplyLabel>label' },
		{ "Displayed next to your comments.": '评论展示的昵称.', "path": '#IDCColumnNameReply>.idc-form-info' },
		{ "Not displayed publicly.": '转为私有显示.', "path": '#IDCColumnEmailReply>.idc-form-info' },
		{ "If you have a website, link to it here.": '链接到您的网站.', "path": '#IDCColumnURLReply>.idc-form-info' },
		{ "Posting anonymously.": '匿名评论.', "path": '#IDCommentReplyListItem1' },
		{ "Tweet this comment": '评论到Twitter', "path": '#IDReplyTweetThisWrapper label', "type": 'inner' },
		{ "Cancel": '取消', "path": '#IDReplyDivSubmitLI>.idc-btn_l-secondary>.idc-r' },
		{ "Submit Comment": '发布评论', "path": '#IDReplyDivSubmitLI>.idc-btn_l>.idc-r>strong' },
		{ "Subscribe to": '订阅到', "path": '#IDSubscribeToThisWrapperReply .idc-nofloat', "type": 'inner' },
		{ "All new comments": '所有新的评论', "path": '#IDSubscribeToThisReply', "type": 'inner' }
	];

	rynCommentWords.forEach(function(word) {
		if (word.type === 'inner') {
			if (typeof word.index === 'number') {
				var index = word.index;
				var $element = $(word.path).eq(index);
				var text = $.trim($element.text());
				var wText = word[text];
				if (text) {
					$element.text(wText);
				}
			} else {
				var $element = $(word.path);
				var html = $element.html();
				var text = $.trim($element.text());
				var wText = word[text];
				var regExp = new RegExp(text, 'g');
				if (html) {
					$element.html(html.replace(regExp, wText));
				}
			}
		} else {
			var $element = $(word.path);
			var text = $.trim($element.text());
			console.log(text);
			var wText = word[text];
			if (text) {
				$element.text(wText);
			}
		}
	});
});

