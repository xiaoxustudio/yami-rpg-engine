import { app, BrowserWindow } from 'electron';
import type { IpcMainEvent, IpcMainInvokeEvent, BrowserWindowExtension } from './types/main.ts';
import { CHANNELS } from '../src/services/ipc/channels.ts';
import * as apkProcessor from './apk.ts';
import { setEditorWindow } from './window-registry.ts';
import { isDebugMode } from './log.ts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { promises as FSP } from 'fs';

export const createEditorWindow = function (
	debug: boolean,
	dirname: string,
	useViteDev: boolean,
	viteDevUrl: string
) {
	const editor = new BrowserWindow({
		title: 'Yami RPG Editor',
		width: 1600,
		height: 900,
		useContentSize: true,
		backgroundColor: 'white',
		frame: process.platform === 'darwin',
		show: false,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			sandbox: false,
			preload: path.resolve(app.getAppPath(), 'dist-electron', 'preload.js'),
			spellcheck: false,
			additionalArguments: debug ? ['--debug-mode'] : []
		}
	}) as BrowserWindow & BrowserWindowExtension;

	editor.setMenuBarVisibility(process.platform === 'darwin');

	editor.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
	editor.webContents.on('will-navigate', (event) => {
		event.preventDefault();
	});

	editor.webContents.on('console-message', (_event, level, message, line, sourceId) => {
		const levelStr = ['log', 'warning', 'error'][level] || 'log';
		const tag = `[renderer:${levelStr}]`;
		const loc = `${sourceId}:${line}`;
		if (level === 2) {
			console.error(`${tag} ${message} (${loc})`);
		} else {
			console.log(`${tag} ${message} (${loc})`);
		}
	});
	editor.webContents.on('did-finish-load', () => {
		editor.webContents
			.executeJavaScript(`
			window.addEventListener('error', (e) => {
				console.error('[Uncaught Error]', e.error && e.error.stack ? e.error.stack : e.message, '@', e.filename + ':' + e.lineno + ':' + e.colno);
			});
			window.addEventListener('unhandledrejection', (e) => {
				console.error('[Unhandled Rejection]', e.reason && e.reason.stack ? e.reason.stack : e.reason);
			});
		`)
			.catch(() => {});
	});

	if (useViteDev) {
		// Vite dev 模式：载 dev server URL，HMR + 模块解析由 Vite 接管
		void editor.loadURL(viteDevUrl);
	} else {
		// prod 模式：载 dist/index.html（vite build 产物）
		const indexPath = path.resolve(dirname, 'dist/index.html');
		void editor.loadFile(indexPath);
	}

	editor.on('maximize', () => editor.send(CHANNELS.send.maximize));
	editor.on('unmaximize', () => editor.send(CHANNELS.send.unmaximize));
	editor.on('enter-full-screen', () => editor.send(CHANNELS.send.enterFullScreen));
	editor.on('leave-full-screen', () => editor.send(CHANNELS.send.leaveFullScreen));

	// 加载配置文件并设置缩放系数
	const configPath = path.resolve(path.join(os.homedir(), '.openyami'), 'config.json');
	const promise = FSP.readFile(configPath);
	editor.once('ready-to-show', () => {
		editor.show();
		editor.maximize();
		promise
			.then((config: Buffer) => {
				editor.webContents.setZoomFactor(JSON.parse(config.toString()).zoom);
			})
			.catch(() => {
				editor.webContents.setZoomFactor(1);
			});
	});

	let forceCloseId: NodeJS.Timeout | null = null;

	// 计划强制关闭应用
	function scheduleForceClose() {
		forceCloseId = setTimeout(() => {
			if (!editor.stopCloseEvent) {
				editor.stopCloseEvent = true;
				editor.close();
			}
		}, 2000);
	}

	// 取消强制关闭应用
	function cancelForceClose() {
		if (forceCloseId !== null) {
			clearTimeout(forceCloseId);
			forceCloseId = null;
		}
	}
	editor.cancelForceClose = cancelForceClose;

	editor.on('close', (event) => {
		if (!editor.stopCloseEvent) {
			apkProcessor.abortBuild();
			editor.send(CHANNELS.send.beforeCloseWindow);
			event.preventDefault();
			scheduleForceClose();
		}
	});

	setEditorWindow(editor);
	editor.on('closed', () => setEditorWindow(null));
};

export const createPlayerWindow = function (
	parent: BrowserWindow & BrowserWindowExtension,
	projectDir: string
): BrowserWindow & BrowserWindowExtension {
	const config = path.resolve(projectDir, 'Data/config.json');
	const window = (
		JSON.parse(fs.readFileSync(config).toString()) as {
			window: {
				title: string;
				width: number;
				height: number;
				display?: string;
			};
		}
	).window;

	// WIN窗口大小调整：减去菜单栏的高度
	let windowHeight = window.height;
	if (process.platform === 'win32') {
		windowHeight = Math.max(windowHeight - 20, 0);
	}

	const player = new BrowserWindow({
		icon: `${projectDir}Icon/icon.png`,
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
			preload: path.resolve(app.getAppPath(), 'dist-electron', 'preload.js'),
			spellcheck: false,
			// 跟随编辑器的 debug 状态：游戏运行时（template-arpg/Script/util.ts）会把它
			// 读成自己的 debug 开关，写死会让「从编辑器启动的游戏」永远处于 debug 模式
			additionalArguments: isDebugMode() ? ['--debug-mode'] : []
		}
	}) as BrowserWindow & BrowserWindowExtension;
	player.config = window;

	player.setMenuBarVisibility(false);

	player.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
	player.webContents.on('will-navigate', (event) => {
		event.preventDefault();
	});

	void player.loadFile(`${projectDir}index.html`);

	player.once('ready-to-show', () => {
		player.show();
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

	player.on('close', (event) => {
		if (!player.stopCloseEvent) {
			player.send(CHANNELS.send.beforeCloseWindow);
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

	player.once('closed', () => {
		if (parent && !parent?.isDestroyed()) {
			parent.send(CHANNELS.send.playerWindowClosed);
		}
	});
	return player;
};

// 获取事件来源窗口
export const getWindowFromEvent = function (
	event: IpcMainEvent | IpcMainInvokeEvent
): BrowserWindow & BrowserWindowExtension {
	return BrowserWindow.fromWebContents(event.sender) as BrowserWindow & BrowserWindowExtension;
};
