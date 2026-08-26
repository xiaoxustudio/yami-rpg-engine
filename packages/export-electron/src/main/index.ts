// [YAMI RPG PLAYER] 主线程
// 逻辑移植自 Runtime 产物 resources/app/main.js，保持行为一致

import { app, Menu, BrowserWindow, ipcMain } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import fs from 'fs';
import path from 'path';

// 如果启动时包含 --dirname 参数或 YAMI_PLAYER_DIR 环境变量
// 表示应用运行在 Node.js 调试模式中
// 重定向根目录并开启应用的调试模式
let debug = false;
let dirname = app.getAppPath();
const regexp = /^--dirname=(.+)$/;
for (const arg of process.argv) {
	const match = arg.match(regexp);
	if (match) {
		dirname = path.resolve(dirname, match[1]);
		debug = true;
		break;
	}
}
if (!debug && process.env.YAMI_PLAYER_DIR) {
	dirname = path.resolve(dirname, process.env.YAMI_PLAYER_DIR);
	debug = true;
}

// 开启叠加渲染模式，支持在游戏中启用 steam ui
// 目前存在以下小问题：
// 如果有黑边(带鱼屏用户)，弹出成就社交界面时
// 被steam ui接管后渲染的脏矩形区域画面有残留
// 因为浏览器认为那部分没有改变，没有重新绘制的必要
// 注释掉脚本可关闭这个功能
app.commandLine.appendSwitch('in-process-gpu');
app.commandLine.appendSwitch('disable-direct-composition');
// app.commandLine.appendSwitch('disable-gpu'); // 禁用GPU加速
// app.commandLine.appendSwitch('disable-gpu-compositing'); // 禁用GPU合成

// ******************************** 文件系统 ********************************

// 获取存档目录
ipcMain.handle('get-dir-path', (event, location: string) => {
	switch (location) {
		case 'app-data':
			return app.getPath('appData');
		case 'documents':
			return app.getPath('documents');
		case 'desktop':
			return app.getPath('desktop');
		case 'local':
			return app.getAppPath();
	}
});

// 写入文件
ipcMain.handle('write-file', (event, filePath: string, text: string, check?: boolean) => {
	return protectPromise(writeFile(filePath, text, check));
});

// 等待写入文件
ipcMain.handle('wait-write-file', () => {
	return Promise.allSettled(promises);
});

const FSP = fs.promises;
const writeFile = async (filePath: string, text: string, check?: boolean) => {
	if (check) await FSP.stat(filePath);
	return FSP.writeFile(filePath, text);
};

// 保护承诺对象
const promises: Array<Promise<unknown>> = [];
const protectPromise = function (promise: Promise<unknown>) {
	promises.push(promise);
	void promise.finally(() => {
		const index = promises.indexOf(promise);
		if (index !== -1) {
			void promises.splice(index, 1);
		}
	});
	return promise;
};

// ******************************** 注册事件 ********************************
let player: BrowserWindow | null = null;

interface PlayerWindow extends BrowserWindow {
	config?: { width: number; height: number };
	stopCloseEvent?: boolean;
	send(channel: string, ...args: unknown[]): void;
}

// 准备完毕
app.on('ready', () => {
	createPlayerMenu();
	player = createPlayerWindow();
});

// 窗口全部关闭后退出应用
app.on('window-all-closed', () => {
	app.quit();
});

// 阻止退出直到写入完成
app.on('before-quit', async (event) => {
	event.preventDefault();
	await Promise.allSettled(promises);
	app.exit();
});

// ******************************** 创建播放器菜单栏 ********************************

const createPlayerMenu = function () {
	// 设置子菜单
	const submenu: MenuItemConstructorOptions[] = [
		{
			label: 'FullScreen',
			accelerator: 'F11',
			// oxlint-disable-next-line no-explicit-any
			role: 'toggleFullScreen' as any
		}
	];

	// 添加开发者工具
	// submenu.push({
	//   label: 'Toogle DevTools',
	//   accelerator: 'F12',
	//   role: 'toggleDevTools',
	// })

	// 创建模板
	const template: MenuItemConstructorOptions[] = [
		{
			label: 'Menu',
			submenu
		}
	];

	// 设置菜单
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
};

// ******************************** 创建播放器窗口 ********************************

const createPlayerWindow = function (): PlayerWindow {
	// 加载配置文件
	const configPath = path.resolve(dirname, 'Data/config.json');
	const window = JSON.parse(fs.readFileSync(configPath).toString()).window as {
		title: string;
		width: number;
		height: number;
		display?: string;
	};

	// WIN窗口大小调整：减去菜单栏的高度
	let windowHeight = window.height;
	if (process.platform === 'win32') {
		windowHeight = Math.max(windowHeight - 20, 0);
	}

	// 创建窗口
	const player = new BrowserWindow({
		icon: 'Icon/icon.png',
		title: window.title,
		width: window.width,
		height: windowHeight,
		useContentSize: true,
		backgroundColor: 'black',
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			sandbox: false,
			spellcheck: false,
			additionalArguments: debug ? ['--debug-mode'] : []
		}
	}) as PlayerWindow;
	player.config = window;

	// 隐藏菜单栏
	player.setMenuBarVisibility(false);

	// debug 模式转发渲染进程控制台到主进程 stdout
	if (debug) {
		player.webContents.on('console-message', (_event, level, message, line, sourceId) => {
			const levelStr = ['log', 'warning', 'error'][level] ?? 'log';
			console.warn(`[player:${levelStr}] ${message} (${sourceId}:${line})`);
		});
		player.webContents.on('render-process-gone', (_event, details) => {
			console.error(`[player] render-process-gone: ${details.reason}`);
		});
	}

	// 加载页面文件
	void player.loadFile(path.resolve(dirname, 'index.html'));

	// 设置窗口模式
	player.once('ready-to-show', () => {
		player.show();
		if (debug) {
			player.webContents.openDevTools();
		}
		switch (window.display) {
			case 'windowed':
				break;
			case 'maximized':
				player.maximize();
				break;
			case 'fullscreen':
				player.setFullScreen(true);
				break;
		}
	});

	// 侦听窗口关闭事件
	player.on('close', (event) => {
		if (!player.stopCloseEvent) {
			player.send('before-close-window');
			event.preventDefault();
			// 如果渲染线程未响应，超时2秒后关闭窗口
			setTimeout(() => {
				if (!player.stopCloseEvent) {
					player.stopCloseEvent = true;
					player.close();
				}
			}, 2000);
		}
	});
	return player;
};

// ******************************** 进程通信 ********************************

// 获取事件来源窗口
const getWindowFromEvent = function (event: Electron.IpcMainEvent) {
	return BrowserWindow.fromWebContents(event.sender) as PlayerWindow | null;
};

// 强制关闭窗口
ipcMain.on('force-close-window', (event) => {
	const window = getWindowFromEvent(event);
	if (window) {
		window.stopCloseEvent = true;
		window.close();
	}
});

// 打开开发者工具
ipcMain.on('open-devTools', (event) => {
	event.sender.openDevTools();
});

// 设置设备像素比率
ipcMain.on('set-device-pixel-ratio', (event, ratio: number) => {
	const window = BrowserWindow.fromWebContents(event.sender) as PlayerWindow | null;
	if (!window) return;
	// MacOS不像Windows一样锁定窗口最大化
	if (process.platform === 'darwin') {
		if (window.isMaximized() || window.isFullScreen()) {
			return;
		}
	}
	const bounds = window.getContentBounds();
	const config = window.config;
	if (!config) return;
	const width = Math.round(config.width / ratio);
	const height = Math.round(config.height / ratio);
	const x = bounds.x + ((bounds.width - width) >> 1);
	const y = bounds.y + ((bounds.height - height) >> 1);
	// electron bug：非100%缩放时，窗口位置不能完美地被设置
	window.setContentBounds({ x, y, width, height });
});

// 设置显示模式
ipcMain.on('set-display-mode', (event, display: string) => {
	const window = BrowserWindow.fromWebContents(event.sender);
	if (!window) return;
	switch (display) {
		case 'windowed':
			if (window.isFullScreen()) {
				window.setFullScreen(false);
			}
			if (window.isMaximized()) {
				window.unmaximize();
			}
			break;
		case 'maximized':
			if (window.isFullScreen()) {
				window.setFullScreen(false);
			}
			if (!window.isMaximized()) {
				window.maximize();
			}
			break;
		case 'fullscreen':
			if (!window.isFullScreen()) {
				window.setFullScreen(true);
			}
			break;
	}
});

/* commandLine */
// 获取
ipcMain.on('get-command-line-switch', (event, name: string) => {
	event.returnValue = app.commandLine.getSwitchValue(name);
});

// 添加
ipcMain.on('add-command-line-switch', (event, name: string, value?: string) => {
	if (value) {
		app.commandLine.appendSwitch(name, value);
	} else {
		app.commandLine.appendSwitch(name);
	}
});

// 删除
ipcMain.on('remove-command-line-switch', (event, name: string) => {
	app.commandLine.removeSwitch(name);
});

// 是否存在
ipcMain.on('has-command-line-switch', (event, name: string) => {
	event.returnValue = app.commandLine.hasSwitch(name);
});

// 重启应用
ipcMain.handle('relaunch-app', async () => {
	try {
		// 如果有窗口，等待它真正关闭
		if (player) {
			return await new Promise<{ success: boolean; message?: string }>((resolve) => {
				// 监听窗口关闭完成
				player!.once('closed', () => {
					player = null;
					player = createPlayerWindow();
					resolve({ success: true });
				});
				player!.destroy(); // 触发关闭
			});
		}

		player = createPlayerWindow();
		return { success: true };
	} catch (error) {
		return { success: false, message: (error as Error).message };
	}
});
