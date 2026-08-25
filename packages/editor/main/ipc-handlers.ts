import { app, ipcMain, dialog, shell, clipboard, BrowserWindow } from 'electron';
import type { BrowserWindowExtension } from './types/main.ts';
import { CHANNELS } from '../src/services/ipc/channels.ts';
import { promises as FSP } from 'fs';
import path from 'path';
import { getServerState, startServer, toQrcode, getLocalIp } from './services/server.ts';
import { toExcel, fromExcel } from './services/excel.ts';
import { startTSC, stopTSC, compileTscFile } from './services/tsc.ts';
import { getWindowFromEvent, createPlayerWindow } from './window-manager.ts';
import * as apkProcessor from './apk.ts';

const writeFile = async (filePath: string, text: string, check?: boolean) => {
	if (check) await FSP.stat(filePath);
	return FSP.writeFile(filePath, text);
};

// oxlint-disable-next-line no-explicit-any
export const promises: Promise<any>[] = [];
// oxlint-disable-next-line no-explicit-any
const protectPromise = function (promise: Promise<any>) {
	promises.push(promise);
	void promise.finally(() => {
		const index = promises.indexOf(promise);
		if (index !== -1) {
			void promises.splice(index, 1);
		}
	});
	return promise;
};

ipcMain.on(CHANNELS.on.getServerState, (event) => {
	event.returnValue = getServerState();
});

ipcMain.handle(CHANNELS.invoke.startServer, (event, config) => {
	startServer(event, config);
});

ipcMain.handle(CHANNELS.invoke.toQrcode, (event, url) => {
	return toQrcode(url);
});

ipcMain.handle(CHANNELS.invoke.getLocalIp, () => {
	return getLocalIp();
});

ipcMain.handle(CHANNELS.invoke.toExcel, (event, body) => {
	return toExcel(event, body);
});

ipcMain.handle(CHANNELS.invoke.fromExcel, (event) => {
	return fromExcel(event);
});

// 获取存档目录
ipcMain.on(CHANNELS.on.getDirPathSync, (event, location) => {
	switch (location) {
		case 'app-data':
			event.returnValue = app.getPath('appData');
			break;
		case 'documents':
			event.returnValue = app.getPath('documents');
			break;
		case 'desktop':
			event.returnValue = app.getPath('desktop');
			break;
		case 'local':
			event.returnValue = app.getAppPath();
			break;
	}
});

ipcMain.handle(CHANNELS.invoke.getDirPath, (event, location) => {
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

ipcMain.handle(CHANNELS.invoke.writeFile, (event, filePath, text, check) => {
	return protectPromise(writeFile(filePath, text, check));
});

ipcMain.handle(CHANNELS.invoke.waitWriteFile, () => {
	return Promise.allSettled(promises);
});

ipcMain.on(CHANNELS.on.clipboardHas, (event, format: string) => {
	const buffer = clipboard.readBuffer(format);
	event.returnValue = buffer.length !== 0;
});
ipcMain.on(CHANNELS.on.clipboardRead, (event, format: string) => {
	const buffer = clipboard.readBuffer(format);
	const string = buffer.toString();
	event.returnValue = string ? JSON.parse(string) : null;
});
ipcMain.on(CHANNELS.on.clipboardWrite, (event, format: string, object: unknown) => {
	const string = JSON.stringify(object);
	const buffer = Buffer.from(string);
	clipboard.writeBuffer(format, buffer);
	event.returnValue = undefined;
});

ipcMain.on(CHANNELS.on.minimizeWindow, (event) => {
	const window = getWindowFromEvent(event);
	if (window.isMinimized()) {
		window.restore();
	} else {
		window.minimize();
	}
});

ipcMain.on(CHANNELS.on.maximizeWindow, (event) => {
	const window = getWindowFromEvent(event);
	if (!window.isFullScreen()) {
		if (window.isMaximized()) {
			window.unmaximize();
		} else {
			window.maximize();
		}
	}
});

ipcMain.on(CHANNELS.on.closeWindow, (event) => {
	const window = getWindowFromEvent(event);
	window.close();
});

ipcMain.on(CHANNELS.on.preventCloseWindow, (event) => {
	const window = getWindowFromEvent(event);
	window.cancelForceClose?.();
});

ipcMain.on(CHANNELS.on.forceCloseWindow, (event) => {
	const window = getWindowFromEvent(event);
	window.stopCloseEvent = true;
	window.close();
});

ipcMain.on(CHANNELS.on.toggleFullScreen, (event) => {
	const window = getWindowFromEvent(event);
	window.setFullScreen(!window.isFullScreen());
});

ipcMain.on(CHANNELS.on.openPath, (event, targetPath) => {
	void shell.openPath(path.normalize(targetPath));
});

// 使用VSCode打开脚本
ipcMain.on(CHANNELS.on.openVscode, (event, scriptPath, line, column) => {
	if (typeof scriptPath !== 'string' || scriptPath.length === 0 || scriptPath.includes('\0')) {
		return;
	}
	const normalized = path.normalize(scriptPath);
	if (!path.isAbsolute(normalized)) {
		return;
	}
	// 剔除会污染 vscode:// URI 的片段/查询字符，防止协议参数注入
	const url = `${normalized}:${Number(line) || 0}:${Number(column) || 0}`.replace(/[?#]/g, '');
	void shell.openExternal(`vscode://file/${url}`);
});

ipcMain.on(CHANNELS.on.showItemInFolder, (event, filePath) => {
	shell.showItemInFolder(path.normalize(filePath));
});

let currentprojectPath = '';
let currentPlayerWindow: (BrowserWindow & BrowserWindowExtension) | null = null;
ipcMain.on(CHANNELS.on.createPlayerWindow, (event, projectPath) => {
	const window = getWindowFromEvent(event);
	currentprojectPath = projectPath;
	currentPlayerWindow = createPlayerWindow(window, projectPath);
});

ipcMain.handle(CHANNELS.invoke.updateMaxMinIcon, (event) => {
	const window = getWindowFromEvent(event);
	return window.isMaximized()
		? 'maximize'
		: window.isFullScreen()
			? 'enter-full-screen'
			: 'unmaximize';
});

ipcMain.handle(CHANNELS.invoke.showOpenDialog, (event, options) => {
	const window = getWindowFromEvent(event);
	return dialog.showOpenDialog(window, options);
});

ipcMain.handle(CHANNELS.invoke.showSaveDialog, (event, options) => {
	const window = getWindowFromEvent(event);
	return dialog.showSaveDialog(window, options);
});

ipcMain.handle(CHANNELS.invoke.trashItem, (event, filePath) => {
	return shell.trashItem(path.normalize(filePath));
});

// 设置设备像素比率
ipcMain.on(CHANNELS.on.setDevicePixelRatio, (event, ratio) => {
	const window = getWindowFromEvent(event);
	// MacOS不像Windows一样锁定窗口最大化
	if (process.platform === 'darwin') {
		if (window.isMaximized() || window.isFullScreen()) {
			return;
		}
	}
	const bounds = window.getContentBounds();
	const config = (
		window as BrowserWindow &
			BrowserWindowExtension & { config?: { width: number; height: number } }
	).config;
	const width = Math.round(config!.width / ratio);
	const height = Math.round(config!.height / ratio);
	const x = bounds.x + ((bounds.width - width) >> 1);
	const y = bounds.y + ((bounds.height - height) >> 1);
	// electron bug：非100%缩放时，窗口位置不能完美地被设置
	window.setContentBounds({ x, y, width, height });
});

ipcMain.on(CHANNELS.on.openDevTools, (event) => {
	event.sender.openDevTools();
});

ipcMain.on(CHANNELS.on.setDisplayMode, (event, display) => {
	const window = getWindowFromEvent(event);
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

// commandLine
ipcMain.on(CHANNELS.on.getCommandLineSwitch, (event, name) => {
	event.returnValue = app.commandLine.getSwitchValue(name);
});

ipcMain.on(CHANNELS.on.addCommandLineSwitch, (event, name, value) => {
	if (value) {
		app.commandLine.appendSwitch(name, value);
	} else {
		app.commandLine.appendSwitch(name);
	}
});

ipcMain.on(CHANNELS.on.removeCommandLineSwitch, (event, name) => {
	app.commandLine.removeSwitch(name);
});

ipcMain.on(CHANNELS.on.hasCommandLineSwitch, (event, name) => {
	event.returnValue = app.commandLine.hasSwitch(name);
});

// 重启应用
ipcMain.handle(CHANNELS.invoke.relaunchApp, async (event) => {
	try {
		const window = getWindowFromEvent(event);
		// 如果有窗口，等待它真正关闭
		if (currentPlayerWindow) {
			const playerWindow = currentPlayerWindow;
			return await new Promise((resolve) => {
				playerWindow.once('closed', () => {
					currentPlayerWindow = createPlayerWindow(window, currentprojectPath);
					resolve({ success: true });
				});
				playerWindow.destroy();
			});
		}
		currentPlayerWindow = createPlayerWindow(window, currentprojectPath);
		return { success: true };
	} catch (error) {
		return { success: false, message: (error as Error).message };
	}
});

ipcMain.handle(CHANNELS.invoke.buildApk, (event, config) => {
	const send = (data: { done: boolean; msg: string }) => {
		// oxlint-disable-next-line no-explicit-any
		const editor = (globalThis as any).editor;
		if (editor && !editor.isDestroyed()) editor.send(CHANNELS.send.apkLog, data);
	};
	if (apkProcessor.isBuilding()) {
		send({
			done: true,
			msg: `当前已有构建任务正在进行中`
		});
		return;
	}
	try {
		void apkProcessor.main({
			config,
			onProgress: (step: string, percentage: number, isError?: boolean) => {
				if (isError) {
					send({
						done: true,
						msg: `[${percentage}%] 错误: ${step}`
					});
				} else {
					const data = {
						done: false,
						msg: `[${percentage}%] 进度: ${step}`
					};
					if (Number(step) == 100) {
						data.done = true;
					}
					send(data);
				}
			}
		});
	} catch (err) {
		send({
			done: true,
			// oxlint-disable-next-line no-base-to-string
			msg: `错误: ${String(err)}`
		});
	}
});

ipcMain.on(CHANNELS.on.isBuildingApk, (event) => {
	event.returnValue = apkProcessor.isBuilding();
});

ipcMain.handle(CHANNELS.invoke.stopBuildApk, () => {
	apkProcessor.abortBuild();
});

ipcMain.on(CHANNELS.on.startTsc, (event, projectDir) => {
	startTSC(path.normalize(projectDir));
});

ipcMain.on(CHANNELS.on.stopTsc, () => {
	stopTSC();
});

ipcMain.handle(CHANNELS.invoke.tscFile, async (event, code) => {
	return compileTscFile(code);
});
