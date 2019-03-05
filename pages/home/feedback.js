let app = getApp(),
	pageParams = {
		data: {
			btn_disabled: true,
			btn_loading: false
		}
	};

pageParams.onShow = function (e) {
	if (!wx.getStorageSync("stuNum")){
		wx.showModal({
			title: '提示',
			content: '请先登录并绑定教务账号！',
			showCancel: false,
			confirmText: '确定',
			success: function(res) {
				wx.navigateBack();
			}
		})
	}
};

pageParams.inputInput = function (e) {
	let btn = true;
	if (e.detail.value != '') {
		btn = false;
	}
	this.setData({
		btn_disabled: btn
	});
};



pageParams.formSubmit = function (e) {
	this.setData({
		btn_loading: true
	});
	wx.request({
		url: app.SERVER_URL + '/feedback.php',
		data: {
			openid: wx.getStorageSync('openid'),
			stuid: wx.getStorageSync('stuNum'),
			stupwd: wx.getStorageSync('stupwd'),
			content: e.detail.value.content,
			userwx: e.detail.value.userwx
		},
		method: 'GET',
		success: (res) => {
			if (res.data.state == 1) {
				console.log(res);
				wx.showModal({
					title: '提示',
					content: '提交成功，谢谢你的建议！',
					showCancel: false,
					success: function (res) {
						wx.navigateBack();
					}
				});
			} else {
				wx.showModal({
					title: '提示',
					content: res.data.info,
					showCancel: false
				});
			}
		},
		fail: () => {
			wx.showModal({
				title: '啊喔',
				content: '要么是你网络问题, 要么是服务器挂了~',
				showCancel: false
			});
		},
		complete: () => {
			this.setData({
				btn_loading: false
			});
		}
	});
};

Page(pageParams);