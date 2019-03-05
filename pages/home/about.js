let app = getApp(),
    pageParams = {
        data: {
            version: 'v0.1.0',
            bg_display: false,
            i: 0
        }
    };

pageParams.onLoad = function() {
    this.setData({
        version: app.VERSION 
    });
};

pageParams.onPullDownRefresh = function() {
    let i = this.data.i;
    console.log(i)
    this.setData({
        i: ++i
    });
    if (i == 3) {
        this.setData({
            bg_display: true
        });
    }
    setTimeout(function() {
        wx.stopPullDownRefresh();
    }, 1000);
};

pageParams.onShareAppMessage = function (res) {
	if (res.from == 'button') {

	}
	return {
		title: '「青科课表」方便快捷查课表',
		path: 'pages/index/index',
	}
}

Page(pageParams);