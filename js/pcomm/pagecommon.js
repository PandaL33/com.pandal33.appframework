/****************************************************************
 * 系统常量
 ****************************************************************/
function YTHConstValue() {};
YTHConstValue.APPDeviceId = "123456";
YTHConstValue.SystemIsDebug = 0;
YTHConstValue.DefaultSerUrlHost = ["192.168.51.43", "8735"];
/****************************************************************
 * JS原型新增功能函数
 ****************************************************************/
//去除字符串左右两端的空格，使用方式：string.TrimSpace();
String.prototype.TrimSpace = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};
//去除字符串左边的空格，使用方式：string.TrimLSpace();
String.prototype.TrimLSpace = function() {
	return this.replace(/(^\s*)/g, "");
};
//去除字符串右边的空格，使用方式：string.TrimRSpace();
String.prototype.TrimRSpace = function() {
	return this.replace(/(\s*$)/g, "");
};

/****************************************************************
 * 运行时信息
 ****************************************************************/
function YTHRuntimeFun() {};
//设备信息
YTHRuntimeFun.prototype.GetDeviceInfo = function() {
	var networkId = plus.networkinfo.getCurrentType();
	var networkDesc = (networkId == plus.networkinfo.CONNECTION_UNKNOW) ? "网络连接状态未知" 
						: (networkId == plus.networkinfo.CONNECTION_NONE) ? "未连接网络" 
						: (networkId == plus.networkinfo.CONNECTION_ETHERNET) ? "有线网络" 
						: (networkId == plus.networkinfo.CONNECTION_WIFI) ? "无线WIFI网络" 
						: (networkId == plus.networkinfo.CONNECTION_CELL2G) ? "蜂窝移动2G网络" 
						: (networkId == plus.networkinfo.CONNECTION_CELL3G) ? "蜂窝移动3G网络" 
						: (networkId == plus.networkinfo.CONNECTION_CELL4G) ? "蜂窝移动4G网络" 
						: "未识别的 " + networkId;
	var deviceInfo = {
		"DeviceVendor": plus.device.vendor,
		"DeviceModel": plus.device.model,
		"DeviceIMEI": plus.device.imei,
		"DeviceIMSI": plus.device.imsi,
		"DeviceUUID": plus.device.uuid,
		"OSName": plus.os.name,
		"OSVersion": plus.os.version,
		"OSVendor": plus.os.vendor,
		"OSLanguage": plus.os.language,
		"NetworkId": networkId,
		"NetworkDesc": networkDesc
	};
	return deviceInfo;
};
//plus.push客户端标识信息
YTHRuntimeFun.prototype.PushClientInfo = function() {
	var ppgci = plus.push.getClientInfo();
	var clientInfo = {
		"Token": ppgci.token,
		"Clientid": ppgci.clientid,
		"Appid": ppgci.appid,
		"Appkey": ppgci.appkey
	};
	return clientInfo;
};
//APP退出
YTHRuntimeFun.prototype.AppQuit = function() {
	plus.runtime.quit();
};
//APP重启
YTHRuntimeFun.prototype.AppRestart = function() {
	plus.runtime.restart();
};
//APP注销（清除 UserContext ，重启程序）
YTHRuntimeFun.prototype.AppLogout = function() {
	var waiting = plus.nativeUI.showWaiting("处理中...");
	(new YTHUserContext()).ClearUserContext();
	setTimeout(function(){
		waiting.close();
		plus.runtime.restart();
	}, 500);
};
//APP恢复出厂设置（清除 storage ，重启程序）
YTHRuntimeFun.prototype.AppFactoryReset = function() {
	var waiting = plus.nativeUI.showWaiting("处理中...");
	plus.storage.clear();
	setTimeout(function(){
		waiting.close();
		plus.runtime.restart();
	}, 500);
};

/****************************************************************
 * 新开页面
 * 1.7.0+版本，mui.openWindow判断是否已存在指定ID的窗体，如果存在直接show。
 * 基于母版页新开页面主要为两种方式：
 *   1.基于未预载的母版的页打开，打开时创建子页面WebView对象。
 *   2.基于已预载（index预载）的母版页打开，重新指定预载页内容页的url，不创建子页WebView对象。
 ****************************************************************/
function YTHOpenWindow(url, id, animation) {
	this.WUrl = url;
	this.WId = id;
	this.WAni = Boolean(animation) ? animation : "slide-in-right";
};
//打开新页面，创建WebView对象
YTHOpenWindow.prototype.Open = function() {
	mui.openWindow({
		url: this.WUrl,
		id: this.WId,
		styles: {
			scrollIndicator: "none"
		},
		show: {
			autoShow: true,
			aniShow: this.WAni,
			duration: 100
		},
		waiting: {
			autoShow: true,
			title: '正在加载...'
		}
	});
};
//基于未预载的母版的页打开，无参数（主子页面ID拼接，避免模板页面的ID重复创建）
YTHOpenWindow.prototype.OpenInSubMasDef = function(subUrl, subId, subTitle) {
	mui.openWindow({
		url: this.WUrl,
		id: this.WId + "header-" + subId,
		styles: {
			scrollIndicator: "none"
		},
		extras: {
			subTitle: subTitle,
			subUrl: subUrl,
			subId: this.WId + "content-" + subId
		},
		show: {
			autoShow: true,
			aniShow: this.WAni,
			duration: 100
		},
		waiting: {
			autoShow: true,
			title: '正在加载...'
		}
	});
};
//基于未预载的母版的页打开，带参数（json对象）（主子页面ID拼接，避免模板页面的ID重复创建）
YTHOpenWindow.prototype.OpenInSubMasDefExtra = function(subUrl, subId, subTitle, subExtra) {
	mui.openWindow({
		url: this.WUrl,
		id: this.WId + "header-" + subId,
		styles: {
			scrollIndicator: "none"
		},
		extras: {
			subTitle: subTitle,
			subUrl: subUrl,
			subId: this.WId + "content-" + subId,
			subExtra: subExtra
		},
		show: {
			autoShow: true,
			aniShow: this.WAni,
			duration: 100
		},
		waiting: {
			autoShow: true,
			title: '正在加载...'
		}
	});
};
//预加载默认母版页（在 plusReady 中调用，并指定预载页面级别）
YTHOpenWindow.prototype.PreloadSubMasDef = function(level) {
	if (!plus.webview.getWebviewById("pmain-submasterdefpre-lv" + level)) {
		var wvHeader = mui.preload({
			url: this.WUrl,
			id: "pmain-submasterdefpre-lv" + level,
			styles: {
				scrollIndicator: "none"
			}
		});
		var wvContent = mui.preload({
			url: "",
			id: "pmain-submasterdefpre-lv" + level + "content",
			styles: {
				top: "45px",
				bottom: "0",
				scrollIndicator: "none"
			}
		});
		wvContent.hide("none");
		wvHeader.append(wvContent);
		wvContent.onloaded = function(e) {
			setTimeout(function() {
				wvContent.show("none");
			}, 50);
		};
	}
};
//基于已预载的母版页打开，无参数（直接通过预载ID获取WebView对象）
YTHOpenWindow.prototype.OpenInSubMasDefPre = function(subLevel, subTitle, showMenu) {
	var wvHeader = plus.webview.getWebviewById("pmain-submasterdefpre-lv" + subLevel);
	mui.fire(wvHeader, 'smdUpdateHeader', {
		title: subTitle,
		showmenu: showMenu
	});
	wvHeader.show(this.WAni, 100);
	var wvContent = wvHeader.children()[0];
	wvContent.loadURL(this.WUrl);
};
//基于已预载的母版页打开，带参数（直接通过预载ID获取WebView对象）
YTHOpenWindow.prototype.OpenInSubMasDefPreExtra = function(subLevel, subTitle, showMenu, subExtra) {
	var wvHeader = plus.webview.getWebviewById("pmain-submasterdefpre-lv" + subLevel);
	mui.fire(wvHeader, 'smdUpdateHeader', {
		title: subTitle,
		showmenu: showMenu
	});
	wvHeader.show(this.WAni, 100);
	var wvContent = wvHeader.children()[0];
	wvContent.loadURL(this.WUrl);
	wvContent.onloaded = function(e) {
		mui.fire(wvContent, 'smdTransferData', {
			SubConExtra: subExtra
		});
	};
};

/****************************************************************
 * 返回键退出程序
 * 首次按键，提示‘再按一次退出应用’
 * 1秒内，连续两次按返回键，则退出应用
 ****************************************************************/
function YTHBackQuitApp() {
	var backFirst = null;
	this.QuitApp = function() {
		if (!backFirst) {
			backFirst = new Date().getTime();
			mui.toast('再按一次退出应用程序');
			setTimeout(function() {
				backFirst = null;
			}, 1000);
		} else {
			if ((new Date()).getTime() - backFirst < 1000) {
				(new YTHRuntimeFun()).AppQuit();
			}
		}
	};
};

/****************************************************************
 * text控件日期选择
 * 默认当前日期，限定1900-01-01至2100-12-31之间
 ****************************************************************/
function YTHCalendar() {};
//Text 控件绑定日期选择
YTHCalendar.prototype.TxtDatePicker = function(txtCtl) {
	txtCtl.addEventListener('tap', function() {
		var nowDate = new Date();
		var minDate = new Date();
		minDate.setFullYear(1900, 0, 1);
		var maxDate = new Date();
		maxDate.setFullYear(2100, 11, 31);
		
		plus.nativeUI.pickDate(function(e) {
			var dt = e.date;
			txtCtl.value = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
		}, function(e) {
			txtCtl.value = '';
		}, {
			title: "请选择日期",
			date: nowDate,
			minDate: minDate,
			maxDate: maxDate
		});
	});
};
//Text 控件绑定日期选择，执行选择成功后回调
YTHCalendar.prototype.TxtDatePickerCB = function(txtCtl, successCB) {
	txtCtl.addEventListener('tap', function() {
		var nowDate = new Date();
		var minDate = new Date();
		minDate.setFullYear(1900, 0, 1);
		var maxDate = new Date();
		maxDate.setFullYear(2100, 11, 31);
		
		plus.nativeUI.pickDate(function(e) {
			var dt = e.date;
			txtCtl.value = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
			if(successCB) successCB();
		}, function(e) {
			txtCtl.value = '';
		}, {
			title: "请选择日期",
			date: nowDate,
			minDate: minDate,
			maxDate: maxDate
		});
	});
};
/****************************************************************
 * 服务连接地址
 * ServiceUrl - http://192.168.51.43:8735/YTHMAPPService/Common/VerifyServiceGet
 * ReleaseUrl - http://ythmapp.ut.com.cn/prelease/appreleaseservice.svc
 ****************************************************************/
function YTHServiceUrl() {
	//服务连接服务器配置默认值
	this.initSerUrlHost = {
		"SUIPAdd": YTHConstValue.DefaultSerUrlHost[0],
		"SUPort": YTHConstValue.DefaultSerUrlHost[1]
	};
	//服务连接服务路径配置默认值
	this.SerUrlPath = {
		"SUCommon": "/YTHMAPPService/Common/"
	};
};
//获取服务连接地址（对象），从plus.storage中读取，如果未存储则返回默认值
YTHServiceUrl.prototype.GetSerUrlHost = function() {
	var suhSto = plus.storage.getItem("YTHServiceUrlHost");
	return Boolean(suhSto) ? JSON.parse(suhSto) : this.initSerUrlHost;
};
//获取服务连接地址IP，从plus.storage中读取，如果未存储则返回默认值
YTHServiceUrl.prototype.GetSUIPAdd = function() {
	var suhSto = this.GetSerUrlHost();
	return suhSto.SUIPAdd;
};
//设置服务连接地址IP，并保存到plus.storage中
YTHServiceUrl.prototype.SetSUIPAdd = function(argIP) {
	if (!Boolean(argIP)) return;
	var suhSto = this.GetSerUrlHost();
	suhSto.SUIPAdd = argIP;
	plus.storage.removeItem("YTHServiceUrlHost");//iphone有用
	plus.storage.setItem("YTHServiceUrlHost", JSON.stringify(suhSto));
};
//获取服务连接地址Port，从plus.storage中读取，如果未存储则返回默认值
YTHServiceUrl.prototype.GetSUPort = function() {
	var suhSto = this.GetSerUrlHost();
	return suhSto.SUPort;
};
//设置服务连接地址Port，并保存到plus.storage中
YTHServiceUrl.prototype.SetSUPort = function(argPort) {
	if (!Boolean(argPort)) return;
	var suhSto = this.GetSerUrlHost();
	suhSto.SUPort = argPort;
	plus.storage.removeItem("YTHServiceUrlHost");//iphone有用
	plus.storage.setItem("YTHServiceUrlHost", JSON.stringify(suhSto));
};
//获取 Common 服务连接地址，从plus.storage中读取Host，如果未存储则返回默认值
YTHServiceUrl.prototype.GetSUCommon = function() {
	var suhSto = this.GetSerUrlHost();
	var suCommon = "http:/" + "/" + suhSto.SUIPAdd + ":" + suhSto.SUPort + this.SerUrlPath.SUCommon;
	return suCommon;
};

/****************************************************************
 * 消息提醒HTML代码
 * 获取系统消息提醒的HTML代码
 ****************************************************************/
function YTHHtmlMsg() {};
YTHHtmlMsg.prototype.GetBeforeSend = function() {
	var html = '<div style="font-size: 14px; text-align: center; padding-top: 18%; padding-bottom: 18%; color: #999999;">';
	html += '<span class="mui-spinner"></span>';
	html += '</div>';
	return html;
};
YTHHtmlMsg.prototype.GetServicesError = function(errormsg) {
	var html = '<div style="font-size: 14px; text-align: center; padding-top: 18%; padding-bottom: 18%; color: #999999;">';
	html += errormsg;
	html += '</div>';
	return html;
};
YTHHtmlMsg.prototype.GetServicesEmpty = function() {
	var html = '<div style="font-size: 14px; text-align: center; padding-top: 18%; padding-bottom: 18%; color: #999999;">';
	html += '暂无数据！';
	html += '</div>';
	return html;
};
YTHHtmlMsg.prototype.GetSendError = function(status, error) {
	var html = '<div style="font-size: 14px; text-align: center; padding-top: 18%; padding-bottom: 18%; color: #999999;">';
	
	var msg = YTHConstValue.SystemIsDebug ? '服务请求失败: ' + status + ', ' + error : '服务请求失败';
	if(status.toLowerCase().indexOf("timeout") > -1)
		msg = "网络故障，请求超时";
	else if(status.toLowerCase().indexOf("abort") > -1)
		msg = "网络故障或服务连接异常";
	else if(error.toLowerCase().indexOf("refused") > -1)
		msg = "网络故障或应用服务拒绝响应";
	else if(error.toLowerCase().indexOf("illegal") > -1)
		msg = "服务请求地址不合法";
	else if(error.toLowerCase().indexOf("not found") > -1)
		msg = "服务请求地址不存在";
	html += msg;
	
	html += '</div>';
	return html;
};



/****************************************************************
 * 消息提醒text代码
 * 获取系统消息提醒的text代码
 ****************************************************************/
function YTHTextMsg() {};
YTHTextMsg.prototype.GetServicesError = function(errormsg) {
	var msg = errormsg;
	return msg;
};
YTHTextMsg.prototype.GetSendError = function(status, error) {
	var msg = YTHConstValue.SystemIsDebug ? '服务请求失败: ' + status + ', ' + error : '服务请求失败';
	if(status.toLowerCase().indexOf("timeout") > -1)
		msg = "网络故障，请求超时";
	else if(status.toLowerCase().indexOf("abort") > -1)
		msg = "网络故障或服务连接异常";
	else if(error.toLowerCase().indexOf("refused") > -1)
		msg = "网络故障或应用服务拒绝响应";
	else if(error.toLowerCase().indexOf("illegal") > -1)
		msg = "服务请求地址不合法";
	else if(error.toLowerCase().indexOf("not found") > -1)
		msg = "服务请求地址不存在";
	
	return msg;
};



/****************************************************************
 * Ajax服务调用参数格式化
 ****************************************************************/
function YTHFormatSerParam() {};
//将JSON对象格式化成 argServiceParam 格式
YTHFormatSerParam.prototype.Format = function(param, getObj) {
	var fpm = {
		"argServiceParam": encodeURIComponent(JSON.stringify(param))
	};
	return Boolean(getObj) ? fpm : JSON.stringify(fpm);
};
//为JSON对象参数新增用户信息，并格式化成 argServiceParam 格式
YTHFormatSerParam.prototype.FormatAttachUser = function(param, getObj) {
	var bizParam = param || {};
	var uContext = (new YTHUserContext()).GetUserContext();
	bizParam.UserName = uContext.UserName;
	bizParam.Token = uContext.Token;
	var fpm = {
		"argServiceParam": encodeURIComponent(JSON.stringify(bizParam))
	};
	return Boolean(getObj) ? fpm : JSON.stringify(fpm);
};



/****************************************************************
 * 登录用户信息
 ****************************************************************/
function YTHUserContext() {
	//登录用户初始化信息
	this.initContext = {
		"UserName": "",
		"Department": "",
		"RoleList": [],
		"Token": "",
		"AutoLogin": false,
		"GestureLocker": [false, ""]
	};
};
//从plus.storage中读取当前用户信息
//如果未存储数据，则返回初始化信息
//如果 storage 已存储，须以 initContext 为准进行校验，以免数据存储不完整
YTHUserContext.prototype.GetUserContext = function() {
	var ucStoStr = plus.storage.getItem("YTHUserContext");
	if(Boolean(ucStoStr)) {
		var ucStoObj = JSON.parse(ucStoStr);
		var ucIniObj = this.initContext;
		for (var property in ucIniObj) {
            if (typeof(ucStoObj[property]) == "undefined") ucStoObj[property] = ucIniObj[property];
        }
		return ucStoObj;
	} else {
		return this.initContext;
	}
};
//设置登录用户信息，并存储（允许一次只保存一部分数据，如果属性不存在，则自动新增）
YTHUserContext.prototype.SetUserContext = function(objPartCtx) {
	var ucSet = objPartCtx || {};
	var ucSto = this.GetUserContext();
	for (var property in ucSet) {
		if (typeof(ucSto[property]) != "undefined") ucSto[property] = ucSet[property];
	}
	plus.storage.setItem("YTHUserContext", JSON.stringify(ucSto));
};
//清空登录用户信息
YTHUserContext.prototype.ClearUserContext = function() {
	plus.storage.removeItem("YTHUserContext");
};



/****************************************************************
 * 其他公共函数库
 ****************************************************************/
function YTHUtilFun() {};
//获取最近 X 天日期
YTHUtilFun.prototype.GetLatelyDate = function(dtLen) {
	var arrDate = [], dtObj, dtStr;
	if(!Boolean(dtLen)) return arrDate;
	for (var i = 0; i < dtLen; i++) {
		dtObj = new Date();
		dtObj.setDate(dtObj.getDate() - i);
		dtStr = dtObj.getFullYear() + "-" + (dtObj.getMonth() + 1) + "-" + dtObj.getDate();
		arrDate.push(dtStr);
	}
	return arrDate;
};

//图片压缩
YTHUtilFun.prototype.CompressImage = function(srcFile,dstFile,qualityValue,sizeValue){
	//plus.nativeUI.showWaiting();
	plus.zip.compressImage({
		src:srcFile,
		dst:dstFile,
		quality:qualityValue,
		width:sizeValue+"%",
		height:sizeValue+"%",
		overwrite:true
	},
	function(i){
	//plus.nativeUI.closeWaiting();
	},function(e){
	//plus.nativeUI.closeWaiting();
	});
}