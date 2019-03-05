let app = getApp(),
	pageParams = {
		data: {
			weekTitle: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
			courseTop: ['', 210, 425, 635, 850, 1060],
			palette: ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#e74c3c', '#d35400', '#f39c12', '#2c3e50', '#8e44ad'],
			weeks: "无",
			courses: {},
		}
	};
/**
	 * 生命周期函数--监听页面显示
	 */
pageParams.onShow = function () {
	//每次显示这个页面,判断有没有登录
	if (!wx.getStorageSync("stuNum")) {
		wx.showModal({
			title: '提示',
			content: '请先绑定教务账号',
			showCancel: false,
			confirmText: '确定',
			success: function (res) {
				wx.switchTab({
					url: '/pages/me/me'
				});
			}
		});
	} else if (Object.keys(this.data.courses).length === 0) {
		//判断是否有课程信息，如果没有则加载缓存
		if (app.cache.courses) { //如果有课程的缓存
			wx.showLoading({
				title: '正在加载课表',
			});
			this.renderCourses();
		} else { //如果登录了&没有课程缓存
			//获取课表
			app.getCourses(wx.getStorageSync("stuNum"), wx.getStorageSync("password"));
		}
	}
}

pageParams.onLoad = function () {
	// 绑定事件
	app.event.on('getCoursesSuccess', this.renderCourses, this);
	app.event.on('logout', this.recover, this);
	
	
	
};

pageParams.onUnload = function () {
	app.event.remove('getCoursesSuccess', this);
	app.event.remove('logout', this);
};


// 监听错误
pageParams.onError = function (err) {
	console.log("监听错误：" + err)
	// 上报错误
	
};
// 触发错误
pageParams.onLaunch= function () {
	throw new Error('my error msg')
};

pageParams.renderCourses = function () {
	this.recover();
	let weeks = app.cache.week,
		resCourses = app.cache.courses,
		resWeekTitle = [],
		index = 0,
		colorIndex = Math.floor(Math.random() * (this.data.palette.length)),
		courseBg = {};

	for (let key in resCourses) {
		resWeekTitle.push(this.data.weekTitle[key]);
		index += 1;
		for (let subKey in resCourses[key]) {
			for (let subSubKey in resCourses[key][subKey]) {
				let course = resCourses[key][subKey][subSubKey];
				course['shortName'] = course['name'];
				if (course['name'].length > 9) {
					course['shortName'] = course['name'].slice(0, 9) + '...';
				}
				let bgKey = course['name'];
				if (!courseBg[bgKey]) {
					courseBg[bgKey] = this.data.palette[colorIndex++ % (this.data.palette.length)];
				}
				course['bg'] = courseBg[bgKey];
			}
		}
	}
	wx.hideLoading();
	if (index == 0) {
		wx.showModal({
			title: '哎哟～',
			content: '本周无课哟～ 关掉手机浪去吧~',
			confirmText: 'Get',
			showCancel: false
		});
	}
	// 保存渲染后的课程信息
	this.setData({
		weekTitle: resWeekTitle,
		weeks: weeks,
		courses: resCourses
	})
};

pageParams.recover = function () {
	this.setData({
		weekTitle: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
		weeks: wx.getStorageSync("week"),
		courses: {}
	})
};

pageParams.showDetail = function (e) {
	let dataSet = e.currentTarget.dataset,
		course = this.data.courses[dataSet.day][dataSet.lesson][dataSet.id];

	wx.showModal({
		title: '详情',
		content: course['name'] + ' / ' + course['room'] + ' / ' + course['classWeek'] + ' / ' + course['teacher'],
		confirmText: '知道了',
		showCancel: false
	});
};


Page(pageParams);