"use strict";

//获取游戏信息
let gameInfo = null;
fetch('./list.json', {
		methods: 'GET',
		cache: 'no-cache'
	})
	//回调函数
	.then(response => {
		return response.json();
	})
	//处理服务器数据
	.then(data => {
		//获取id
		let id = location.search.substring(2);
		//数据化获取的1d
		id = decodeURI(id);
		//获取游戏信息
		gameInfo = data.filter(function(gameobj) {
			return gameobj.i == id;
		});
		// 判断数据是否存在
		if (id != "") {
			if (gameInfo == "") {
				nodata();
			}
		} else {
			nodata();
		}

		let showload = document.getElementById('btn_load');
		showload.classList.add("btnload");
		showload.classList.remove("showload");
		showload.innerHTML = '点击开始游戏';

		//监听加载按钮
		document.getElementById('btn_load').onclick = function() {
			//载入游戏
			//Initialize Iodine:
			Iodine = new GameBoyAdvanceEmulator();
			//Initialize the graphics:
			registerBlitterHandler();
			//Initialize the audio:
			registerAudioHandler();
			//Register the save handler callbacks:
			registerSaveHandlers();
			//Hook the GUI controls.
			registerGUIEvents();
			//Enable Sound:
			Iodine.enableAudio();
			//Download the BIOS:
			downloadBIOS();
			downloadROM(gameInfo[0].i);
			cocoMessage.success("启动游戏引擎！", 2000);
			//浏览器全屏
			let de = document.documentElement;
			if (de.requestFullscreen) {
				de.requestFullscreen();
			} else if (de.mozRequestFullScreen) {
				de.mozRequestFullScreen();
			} else if (de.webkitRequestFullScreen) {
				de.webkitRequestFullScreen();
			}
			this.style.display = 'none';
			// 隐藏标题
			document.getElementById('name').style.display = 'none';
		}

		// let showload = document.getElementById('btn_load');
		// let req = new XMLHttpRequest();
		// req.open("GET", "./roms/" + gameInfo[0].i + ".zip");
		// req.overrideMimeType("text/plain; charset=x-user-defined");
		// req.onerror = (e) => console.error('这个错误发生在游戏加载环节', e);
		// req.onprogress = (e) => {
		// 	// 显示加载进度
		// 	showload.innerHTML = '加载中(' + (e.loaded / e.total * 100).toFixed(0) + '%)';
		// };
		// req.onloadstart = function() {
		// 	cocoMessage.warning("ROM载入中！", 2000);
		// };
		// req.onload = function() {
		// 	if (this.status === 200) {
		// 		let nes = null;
		// 		let nzip = new JSZip();
		// 		cocoMessage.success("ROM载入成功！", 2000);
		// 		nzip.loadAsync(this.responseText)
		// 			.then(zip => {
		// 				cocoMessage.warning("释放资源中！", 2000);
		// 				let zdata = zip.file(gameInfo[0].i + ".nes");
		// 				if (!zdata) {
		// 					showload.onclick = null;
		// 					cocoMessage.error("资源释放失败！", 2000);
		// 					showload.classList.remove("btnload");
		// 					showload.classList.add("showload");
		// 					showload.innerHTML = '初始化失败';
		// 				} else {
		// 					zdata.async("binarystring")
		// 						.then(res => {
		// 							nes = res;
		// 							cocoMessage.success("资源配置完成！", 2000);
		// 							showload.classList.add("btnload");
		// 							showload.classList.remove("showload");
		// 							showload.innerHTML = '点击开始游戏';
		// 						})
		// 				}
		// 			})
		// 		//监听加载按钮
		// 		document.getElementById('btn_load').onclick = function() {
		// 			nes_boot(nes);
		// 			nes_init();
		// 			cocoMessage.success("启动游戏引擎！", 2000);
		// 			//浏览器全屏
		// 			let de = document.documentElement;
		// 			if (de.requestFullscreen) {
		// 				de.requestFullscreen();
		// 			} else if (de.mozRequestFullScreen) {
		// 				de.mozRequestFullScreen();
		// 			} else if (de.webkitRequestFullScreen) {
		// 				de.webkitRequestFullScreen();
		// 			}
		// 			this.style.display = 'none';
		// 			// 隐藏标题
		// 			document.getElementById('name').style.display = 'none';
		// 		}
		// 	} else if (this.status === 0) {
		// 		req.onerror();
		// 		showload.innerHTML = '请求数据失败';
		// 		cocoMessage.error("请求数据失败！", 2000);
		// 	} else {
		// 		req.onerror();
		// 		showload.innerHTML = 'ROM加载失败';
		// 		cocoMessage.error("ROM加载失败！", 2000);
		// 	}
		// };
		// req.send();
		//展示游戏名称
		document.getElementById('name').innerHTML = gameInfo[0].n + gameInfo[0].v;
		// 修改title
		document.title = gameInfo[0].n + gameInfo[0].v + ' - ' + 'GBA游戏盒';
	})
	.catch(err => console.error('获取游戏信息失败'))
//实例化摇杆信息
let joystick = new Joystick({
	//容器
	el: "#direction",
	//摇杆颜色
	color: 'red',
	//摇杆大小
	size: 100,
	//绑定 上下左右 到 WSAD键
	keyCodes: [87, 83, 65, 68],
	//页面强制横屏时使用90
	rotate: 0,
	//按下时的回调
	btn_down_fn: (event) => {
		keyDown(event);
	},
	// 释放时的回调
	btn_up_fn: (event) => {
		keyUp(event.keyCode);
	},
})
//实例化NES按钮
let nesBtn = new VirtualNesBtn({
	//容器
	el: "#user_btn_box",
	//虚拟按钮按下时的回调 参数evt
	btn_down_fn: (event) => {
		keyDown(event);
	},
	//虚拟按钮弹起时的回调 参数evt
	btn_up_fn: (event) => {
		keyUp(event.keyCode);
	},
	//按顺序分别是 select start b a
	keyCodes: [32, 13, 86, 66]
})
// 设置按钮状态
if (navigator.share) {
	document.getElementById("share").style.display = "inline";
} else {
	console.log("分享功能禁用")
}
// 数据异常处理
function nodata() {
	alert("403访问被拒绝！");
	window.location.href = "/";
	return;
}
//获取设备类型
let isMobile = /(iPhone|iPod|Android|ios|iOS|iPad|WebOS|Symbian|Windows Phone|Phone)/i.test(navigator.userAgent);
//设置操作方式
function mobile() {
	let dire = document.getElementById("direction");
	let btne = document.getElementById("user_btn_box");
	let play1 = document.getElementById("player1");
	let play2 = document.getElementById("player2");
	let qhimg = document.getElementById("qhimg");
	let qhp = document.getElementById("qhp");
	if (isMobile) {
		qhimg.src = "./image/button/key.png";
		qhp.innerHTML = "键盘";
		play1.style.display = "none";
		play2.style.display = "none";
		dire.style.display = "block";
		btne.style.display = "block";
		isMobile = false;
	} else {
		qhimg.src = "./image/button/gmb.png";
		qhp.innerHTML = "触屏";
		dire.style.display = "none";
		btne.style.display = "none";
		play1.style.display = "block";
		play2.style.display = "block";
		isMobile = true;
	}
}
mobile();
//重置游戏配置
function chongzai() {
	window.location.reload();
}
// 分享
function share() {
	navigator.share({
		title: '在线玩《' + gameInfo[0].n + '》',
		url: window.location.href,
		text: '推荐使用电脑，运行更加流畅！在线免费畅玩或下载红白机游戏，包括魂斗罗，超级玛丽，坦克大战等小霸王经典游戏，让我们一同找回童年的快乐！玩红白机游戏，就认准红白机游戏盒！'
	});
}
window.onload = function() {
	//禁止双击缩放
	document.addEventListener('dblclick', function(e) {
		e.preventDefault()
	}, {
		passive: false
	})
	// 下载rom按钮
	document.getElementById('drom').onclick = function() {
		window.open('./roms/' + gameInfo[0].i + '.gba')
	}
	// 初始化遥感信息
	joystick.init();
	//NES按钮实例初始化
	nesBtn.init();
	// 移除遮罩
	document.body.classList.remove('is-loading');
}



var Iodine = null;
var Blitter = null;
var Mixer = null;
var MixerInput = null;
var timerID = null;

function downloadBIOS() {
	downloadFile("./bios/gba_bios.bin", registerBIOS);
}

function registerBIOS() {
	processDownload(this, attachBIOS);
	// downloadROM(location.search.substring(2));
}

function downloadROM(gamename) {
	Iodine.pause();
	// showTempString("Downloading \"" + games[gamename] + ".\"");
	downloadFile("./roms/" + gamename + ".gba", registerROM);
	// 隐藏标题
	document.getElementById('name').style.display = 'none';
}

function registerROM() {
	// clearTempString();
	processDownload(this, attachROM);
	if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(
			/iPad/i)) {
		Iodine.disableAudio();
	}
	Iodine.play();
}

function registerBlitterHandler() {
	Blitter = new GlueCodeGfx();
	Blitter.attachCanvas(document.getElementById("nes-canvas"));
	Blitter.setSmoothScaling(false);
	Iodine.attachGraphicsFrameHandler(function(buffer) {
		Blitter.copyBuffer(buffer);
	});
}

function registerAudioHandler() {
	Mixer = new GlueCodeMixer();
	MixerInput = new GlueCodeMixerInput(Mixer);
	Iodine.attachAudioHandler(MixerInput);
}

function registerGUIEvents() {
	addEvent("keydown", document, keyDown);
	addEvent("keyup", document, keyUpPreprocess);
	addEvent("unload", window, ExportSave);
	Iodine.attachSpeedHandler(function(speed) {
		// document.title = gameInfo[0].n + gameInfo[0].v + ' - ' + '红白机游戏盒';
	});
}

function lowerVolume() {
	Iodine.incrementVolume(-0.04);
}

function raiseVolume() {
	Iodine.incrementVolume(0.04);
}

function writeRedTemporaryText(textString) {
	if (timerID) {
		clearTimeout(timerID);
	}
	// showTempString(textString);
	// timerID = setTimeout(clearTempString, 5000);
}
// function showTempString(textString) {
//     document.getElementById("tempMessage").style.display = "block";
//     document.getElementById("tempMessage").textContent = textString;
// }
// function clearTempString() {
//     document.getElementById("tempMessage").style.display = "none";
// }
//Some wrappers and extensions for non-DOM3 browsers:
function addEvent(sEvent, oElement, fListener) {
	try {
		oElement.addEventListener(sEvent, fListener, false);
	} catch (error) {
		oElement.attachEvent("on" + sEvent, fListener); //Pity for IE.
	}
}

function removeEvent(sEvent, oElement, fListener) {
	try {
		oElement.removeEventListener(sEvent, fListener, false);
	} catch (error) {
		oElement.detachEvent("on" + sEvent, fListener); //Pity for IE.
	}
}
