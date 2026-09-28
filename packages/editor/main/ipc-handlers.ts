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

/**
 * `on` 通道路径入参的统一体检：非空字符串、不含 NUL、且**归一化后是绝对路径**。
 *
 * 合法返回规范化后的绝对路径，不合法返回 `null` 由调用方静默忽略。
 * 此前 `openPath` / `trashItem` 只查了非空与 NUL、没过 `isAbsolute`，
 * 与 `writeFile` / `openVscode` / `showItemInFolder` 的口径不一致。
 */
function resolveIpcPath(value: unknown): string | null {
	if (typeof value !== 'string' || value.length === 0 || value.includes('\0')) return null;
	const normalized = path.normalize(value);
	return path.isAbsolute(normalized) ? normalized : null;
}

const writeFile = async (filePath: string, text: string | Uint8Array, check?: boolean) => {
	if (typeof filePath !== 'string' || filePath.length === 0 || filePath.includes('\0')) {
		throw new Error('invalid file path');
	}
	if (!path.isAbsolute(path.normalize(filePath))) {
		throw new Error('file path must be absolute');
	}
	if (check) await FSP.stat(filePath);
	return FSP.writeFile(filePath, text);
};

export const promises: Promise<unknown>[] = [];
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

ipcMain.on(CHANNELS.on.getServerState, (event) => {
	event.returnValue = getServerState();
});

ipcMain.handle(CHANNELS.invoke.startServer, (event, config) => {
	return startServer(event, config);
});

ipcMain.handle(CHANNELS.invoke.toQrcode, (_event, url) => {
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

ipcMain.handle(CHANNELS.invoke.getDirPath, (_event, location) => {
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

ipcMain.handle(CHANNELS.invoke.writeFile, (_event, filePath, text, check) => {
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
	try {
		event.returnValue = string ? JSON.parse(string) : null;
	} catch {
		event.returnValue = null;
	}
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

ipcMain.on(CHANNELS.on.openPath, (_event, targetPath) => {
	const safePath = resolveIpcPath(targetPath);
	if (safePath === null) return;
	void shell.openPath(safePath);
});

// 使用VSCode打开脚本
ipcMain.on(CHANNELS.on.openVscode, (_event, scriptPath, line, column) => {
	const normalized = resolveIpcPath(scriptPath);
	if (normalized === null) return;
	// 剔除会污染 vscode:// URI 的片段/查询字符，防止协议参数注入
	const url = `${normalized}:${Number(line) || 0}:${Number(column) || 0}`.replace(/[?#]/g, '');
	void shell.openExternal(`vscode://file/${url}`);
});

ipcMain.on(CHANNELS.on.showItemInFolder, (_event, filePath) => {
	const safePath = resolveIpcPath(filePath);
	if (safePath === null) return;
	shell.showItemInFolder(safePath);
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

// 与 writeFile 同形：async 助手把校验失败变成 rejected promise，
// 渲染进程侧 `await` 得到的是可捕获的错误而不是同步异常
const trashItem = async (filePath: string) => {
	const safePath = resolveIpcPath(filePath);
	if (safePath === null) throw new Error('invalid file path');
	return shell.trashItem(safePath);
};

ipcMain.handle(CHANNELS.invoke.trashItem, (_event, filePath) => {
	return trashItem(filePath);
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
	if (!config) return;
	const width = Math.round(config.width / ratio);
	const height = Math.round(config.height / ratio);
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

ipcMain.on(CHANNELS.on.addCommandLineSwitch, (_event, name, value) => {
	if (value) {
		app.commandLine.appendSwitch(name, value);
	} else {
		app.commandLine.appendSwitch(name);
	}
});

ipcMain.on(CHANNELS.on.removeCommandLineSwitch, (_event, name) => {
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
		const sender = event.sender;
		if (!sender.isDestroyed()) sender.send(CHANNELS.send.apkLog, data);
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

ipcMain.on(CHANNELS.on.startTsc, (_event, projectDir) => {
	startTSC(path.normalize(projectDir));
});

ipcMain.on(CHANNELS.on.stopTsc, () => {
	stopTSC();
});

ipcMain.handle(CHANNELS.invoke.tscFile, async (_event, code) => {
	return compileTscFile(code);
});
