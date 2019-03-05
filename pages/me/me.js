// pages/fortest/fortest.js
let app = getApp(),
	pageParams = {
		data: {
			stuid: '',
			stupwd: '',
			stuid_focus: false,
			stupwd_focus: false,
			btn_disabled: true,
			btn_loading: false,
			updateTime: "未更新"
		}
	};
pageParams.bindStuNum = function (options) {
	//如果没有登录，先登录
	if (wx.getStorageSync("nick") == "") {
		wx.showLoading({
			title: '正在登录',
		});
		this.wxLogin();
	} else {
		wx.navigateTo({
			url: '/pages/login/login'
		});
	}
};
pageParams.wxLogin = function (e) {
	wx.showLoading({
		title: '正在登录',
	})
	var that = this;
	wx.login({
		success: function (res) {
			var code = res.code; //发送给服务器的code 
			wx.getUserInfo({
				success: function (res) {
					var userNick = res.userInfo.nickName; //用户昵称 
					var avataUrl = res.userInfo.avatarUrl; //用户头像地址 
					var gender = res.userInfo.gender; //用户性别
					that.setData({
						nick: userNick,
						avataUrl: avataUrl
					})
					if (code) {
						wx.request({
							url: app.SERVER_URL + '/wxLogin.php',
							//url: 'http://127.0.0.1/jiaowu3/wxLogin.php',
							//服务器的地址，现在微信小程序只支持https请求，所以调试的时候请勾选不校监安全域名
							data: {
								code: code,
								nick: userNick,
								avaurl: avataUrl,
								sex: gender,
							},
							header: {
								'content-type': 'application/json'
							},
							success: function (res) {
								console.log(res.data);
								wx.setStorageSync('nick', res.data.nick); //将获取信息写入本地缓存 
								wx.setStorageSync('openid', res.data.openid);
								wx.setStorageSync('imgUrl', res.data.imgUrl);
								wx.setStorageSync('sex', res.data.sex);
								if (res.data.account != null) {
									wx.setStorageSync('stuNum', res.data.account);
									wx.setStorageSync('password', res.data.password);
									that.setData({
										stuNum: res.data.account,
										password: res.data.password
									});
									app.getCourses(res.data.account, res.data.password);
								} else {
									wx.setStorageSync('stuNum', null);
									wx.setStorageSync('password', null);
									wx.showModal({
										title: '提示',
										content: '还未绑定教务账号，立即绑定？',
										cancelText: "稍后",//默认是“取消” 
										confirmText:"去绑定",//默认是“确定” 
										success: function (res) {
											if (res.cancel) {
												wx.showModal({
													content: '可在“我”界面“教务账号”菜单中进行绑定',
													showCancel: false
												})
											} else {
												wx.navigateTo({
													url: '/pages/login/login'
												});
											}
										}
									})
									wx.hideLoading();
								}
							},
							fail : function (res) {
								wx.hideLoading();
								wx.showModal({
									title: '连接教务系统超时',
									content: '可能是教务系统不稳定所至，请稍后重试',
									showCancel: false
								})
							}							
						})
					} else {
						console.log("获取用户登录态失败！");
					}
				},
				fail: function (e) {
					console.log("获取用户信息失败+" + JSON.stringify(e));
					wx.redirectTo({
						url: '../auth/auth',
					})
				},
				complete: function (res) {

				},
			})
		},
		fail: function (error) {
			console.log('login failed ' + error);
		}
	})
};
/**
 * 生命周期函数--监听页面加载
 */
pageParams.onLoad = function (options) {
	this.setData({	//加载页面时显示昵称和头像
		nick: wx.getStorageSync('nick'),
		avataUrl: wx.getStorageSync('imgUrl'),
		stuNum: wx.getStorageSync('stuNum'),
	})
	
};
/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
pageParams.onReady = function () {
	//如果没有时间信息，获取时间信息
	//app.getTime();
};

/**
	 * 生命周期函数--监听页面显示
	 */
pageParams.onShow = function () {
	this.setData({
		stuNum: wx.getStorageSync('stuNum'),
		updateTime: wx.getStorageSync("updateTime"),
	})
};

/**
 * 生命周期函数--监听页面隐藏
 */
pageParams.onHide = function () {

},

/**
 * 生命周期函数--监听页面卸载
 */
pageParams.onUnload = function () {

};

/**
 * 页面相关事件处理函数--监听用户下拉动作
 */
pageParams.onPullDownRefresh = function () {

};

/**
 * 页面上拉触底事件的处理函数
 */
pageParams.onReachBottom = function () {

};

/**
 * 用户点击右上角分享
 */
pageParams.onShareAppMessage = function () {

}

Page(pageParams);