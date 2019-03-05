let appParams = {
	SERVER_URL: 'https://www.ayidiedu.com/jiaowu',
	VERSION: 'v0.1.0',
	event: require('./utils/event'),
	cache: {},
	week: 0,
	semester: '2018-2019-1',
	updateTime: '未更新',
	auth: 0,
};
wx.showShareMenu({
	withShareTicket: true
})
appParams.onLaunch = function () {
	try {
		let data = wx.getStorageInfoSync();
		if (data.keys.length) {
			data.keys.forEach((key) => {
				try {
					this.cache[key] = wx.getStorageSync(key);
				} catch (e) {
					console.error('getStorage 失败。详细信息：' + e.message);
				}
			});
		}
	} catch (e) {
		console.error('getStorageInfo 失败。详细信息：' + e.message);
	}
};

appParams.saveData = function (obj) {
	for (let key in obj) {
		this.cache[key] = obj[key];
		wx.setStorage({
			key: key,
			data: obj[key],
		})
	}
}

/*
 * 获取时间
 */
appParams.getTime = function () {
	wx.request({
		url: this.SERVER_URL + '/time.php',
		method: 'get',
		success: (res) => {
			console.log("获取时间:" + res.data.updateTime);
			if (res.statusCode != 200) {
				wx.showModal({
					title: '啊喔',
					content: res.data.errmsg,
					showCancel: false
				});
			} else { //正确获取数据
				let data = res.data;
				this.saveData({
					'semester': data.semester,
					'week': data.week,
				});
				wx.setStorageSync('updateTime', data.updateTime);
				wx.setStorageSync('week', data.week);
			}
		},
		fail: () => {
			wx.showModal({
				title: '啊喔',
				content: '要么是你网络问题, 要么是服务器挂了~',
				showCancel: false
			});
		}
	});
}

/*
 * 获取课表
 * id  : 教务账号
 * pwd : 教务密码
 */
appParams.getCourses = function (id, pwd) {
	//显示加载，获取成功后关闭加载
	wx.showLoading({
		title: '正在获取课表',
	});
	console.log("获取课表");
	this.getTime();
	wx.request({
		url: this.SERVER_URL + '/timetable.php',
		data: {
			stuid: id,
			stupwd: pwd,
			semester: this.cache.semester,
			week: this.cache.week,
		},
		method: 'get',
		success: (res) => {
			wx.switchTab({
				url: '/pages/index/index'
			});
			wx.showToast({
				title: '获取课表成功',
				icon: 'success',
				duration: 2000
			});
			let data = res.data;
			this.saveData({
				'courses': data,
				'stuInfo': [id, pwd],
				//'updateTime': (new Date()).getTime()
			});
			this.event.emit('getCoursesSuccess');
		},
		fail: () => {
			wx.hideLoading();
			wx.showModal({
				title: '连接教务系统超时',
				content: '可能是教务系统不稳定所至，请稍后重试',
				showCancel: false,
				confirmText: "确定",
			});
		},
		complete: () => {
			this.event.emit('getCoursesComplete');
		}
	});
}

/*
 * 绑定教务账号
 * id  : 教务账号
 * pwd : 教务密码
 */
appParams.bindingAccount = function (id, pwd) {
	wx.showLoading({
		title: '正在验证账号',
	});
	console.log("绑定教务账号");
	wx.request({
		url: this.SERVER_URL + '/wxBinding.php',
		data: {
			openid:wx.getStorageSync("openid"),
			stuid: id,
			stupwd: pwd
		},
		method: 'get',
		success: (res) => {
			wx.hideLoading();//隐藏loading
			console.log(res);
			if (res.data.state != 1) {
				wx.showModal({
					title: '提示',
					content: res.data.info,
					showCancel: false
				});
			} else { //正确获取数据
				wx.navigateBack({
					delta: 1
				});
				wx.showToast({
					title: '绑定成功',
					icon: 'success',
					duration: 2000,
				});
				//let data = res.data;
				wx.setStorageSync('stuNum', id);
				wx.setStorageSync('password', pwd);
				this.saveData({
					//'courses': data,
					'stuInfo': [id, pwd],
					'updateTime': (new Date()).getTime()
				});

				//this.event.emit('getCoursesSuccess');
			}
		},
		fail: () => {
			wx.hideLoading();
			wx.showModal({
				title: '连接教务系统超时',
				content: '可能是教务系统不稳定所至，请稍后重试',
				showCancel: false,
				confirmText: "确定",
			});
		},
		complete: () => {
			this.event.emit('getCoursesComplete');
		}
	});
}

App(appParams);