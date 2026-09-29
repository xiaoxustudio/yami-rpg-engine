import { contextBridge, ipcRenderer } from 'electron';
import { CHANNELS } from '../src/services/ipc/channels.ts';
import { SEND_CHANNELS } from '../src/services/ipc/preload-api.ts';
import type { DirLocation, ServerConfig, ToExcelBody } from '../src/services/ipc/channels.ts';
import type {
	DisplayMode,
	SendChannel,
	YamiBridgeApi,
	YamiEventApi,
	YamiInvokeApi,
	YamiSendApi,
	YamiSyncApi
} from '../src/services/ipc/preload-api.ts';

const isSendChannel = (channel: string): channel is SendChannel =>
	SEND_CHANNELS.includes(channel as SendChannel);

const invoke: YamiInvokeApi = {
	startServer: (config: ServerConfig) => ipcRenderer.invoke(CHANNELS.invoke.startServer, config),
	stopServer: () => ipcRenderer.invoke(CHANNELS.invoke.stopServer),
	toQrcode: (url: string) => ipcRenderer.invoke(CHANNELS.invoke.toQrcode, url),
	getLocalIp: () => ipcRenderer.invoke(CHANNELS.invoke.getLocalIp),
	toExcel: (body: ToExcelBody) => ipcRenderer.invoke(CHANNELS.invoke.toExcel, body),
	fromExcel: () => ipcRenderer.invoke(CHANNELS.invoke.fromExcel),
	getDirPath: (location: DirLocation) => ipcRenderer.invoke(CHANNELS.invoke.getDirPath, location),
	writeFile: (filePath: string, text: string | Uint8Array, check?: boolean) =>
		ipcRenderer.invoke(CHANNELS.invoke.writeFile, filePath, text, check),
	waitWriteFile: () => ipcRenderer.invoke(CHANNELS.invoke.waitWriteFile),
	buildApk: (config: Record<string, unknown>) =>
		ipcRenderer.invoke(CHANNELS.invoke.buildApk, config),
	stopBuildApk: () => ipcRenderer.invoke(CHANNELS.invoke.stopBuildApk),
	tscFile: (code: string) => ipcRenderer.invoke(CHANNELS.invoke.tscFile, code),
	updateMaxMinIcon: () => ipcRenderer.invoke(CHANNELS.invoke.updateMaxMinIcon),
	showOpenDialog: (options: unknown) =>
		ipcRenderer.invoke(CHANNELS.invoke.showOpenDialog, options),
	showSaveDialog: (options: unknown) =>
		ipcRenderer.invoke(CHANNELS.invoke.showSaveDialog, options),
	trashItem: (filePath: string) => ipcRenderer.invoke(CHANNELS.invoke.trashItem, filePath),
	relaunchApp: () => ipcRenderer.invoke(CHANNELS.invoke.relaunchApp)
};

const sync: YamiSyncApi = {
	getServerState: () => ipcRenderer.sendSync(CHANNELS.on.getServerState),
	getDirPathSync: (location: DirLocation) =>
		ipcRenderer.sendSync(CHANNELS.on.getDirPathSync, location),
	clipboardHas: (format: string) => ipcRenderer.sendSync(CHANNELS.on.clipboardHas, format),
	clipboardRead: (format: string) => ipcRenderer.sendSync(CHANNELS.on.clipboardRead, format),
	clipboardWrite: (format: string, object: unknown) =>
		ipcRenderer.sendSync(CHANNELS.on.clipboardWrite, format, object),
	isBuildingApk: () => ipcRenderer.sendSync(CHANNELS.on.isBuildingApk),
	getCommandLineSwitch: (name: string) =>
		ipcRenderer.sendSync(CHANNELS.on.getCommandLineSwitch, name),
	hasCommandLineSwitch: (name: string) =>
		ipcRenderer.sendSync(CHANNELS.on.hasCommandLineSwitch, name)
};

const send: YamiSendApi = {
	minimizeWindow: () => ipcRenderer.send(CHANNELS.on.minimizeWindow),
	maximizeWindow: () => ipcRenderer.send(CHANNELS.on.maximizeWindow),
	closeWindow: () => ipcRenderer.send(CHANNELS.on.closeWindow),
	preventCloseWindow: () => ipcRenderer.send(CHANNELS.on.preventCloseWindow),
	forceCloseWindow: () => ipcRenderer.send(CHANNELS.on.forceCloseWindow),
	toggleFullScreen: () => ipcRenderer.send(CHANNELS.on.toggleFullScreen),
	openPath: (targetPath: string) => ipcRenderer.send(CHANNELS.on.openPath, targetPath),
	openVscode: (scriptPath: string, line: number, column: number) =>
		ipcRenderer.send(CHANNELS.on.openVscode, scriptPath, line, column),
	showItemInFolder: (filePath: string) =>
		ipcRenderer.send(CHANNELS.on.showItemInFolder, filePath),
	createPlayerWindow: (projectPath: string) =>
		ipcRenderer.send(CHANNELS.on.createPlayerWindow, projectPath),
	setDevicePixelRatio: (ratio: number) =>
		ipcRenderer.send(CHANNELS.on.setDevicePixelRatio, ratio),
	openDevTools: () => ipcRenderer.send(CHANNELS.on.openDevTools),
	setDisplayMode: (display: DisplayMode) => ipcRenderer.send(CHANNELS.on.setDisplayMode, display),
	startTsc: (projectDir: string) => ipcRenderer.send(CHANNELS.on.startTsc, projectDir),
	stopTsc: () => ipcRenderer.send(CHANNELS.on.stopTsc),
	addCommandLineSwitch: (name: string, value?: string) =>
		ipcRenderer.send(CHANNELS.on.addCommandLineSwitch, name, value),
	removeCommandLineSwitch: (name: string) =>
		ipcRenderer.send(CHANNELS.on.removeCommandLineSwitch, name)
};

const events: YamiEventApi = {
	on: (channel: SendChannel, listener: (...args: unknown[]) => void) => {
		if (!isSendChannel(channel)) return;
		ipcRenderer.on(channel, (...args: unknown[]) => listener(...args));
	},
	once: (channel: SendChannel, listener: (...args: unknown[]) => void) => {
		if (!isSendChannel(channel)) return;
		ipcRenderer.once(channel, (...args: unknown[]) => listener(...args));
	}
};

const api: YamiBridgeApi = { invoke, sync, send, events };

if (process.contextIsolated) {
	contextBridge.exposeInMainWorld('yami', api);
} else {
	// contextIsolation:false（编辑器依赖渲染进程 Node 桥）时 contextBridge 不可用，直接挂载
	window.yami = api;
}

/**
 * 未捕获错误 / 未处理 rejection 的兜底上报。
 *
 * 放在 preload，而不是原先主进程的 `did-finish-load` + `executeJavaScript`：
 * preload 在页面脚本之前执行，能覆盖**启动期（模块求值）**抛出的错误；原先那套要等
 * 页面加载完成才注册，启动期错误全漏，而且每次加载都要跑一遍字符串求值。
 *
 * ⚠️ ResizeObserver 的口径必须与 `src/main.ts` 的抑制器一致：本监听器注册**更早**，
 * 不过滤就会抢在抑制器之前把这条循环上限告警打成 console.error。
 */
const isResizeObserverNoise = (message: string): boolean =>
	message === 'ResizeObserver loop limit exceeded';

window.addEventListener('error', (event: ErrorEvent) => {
	if (isResizeObserverNoise(event.message)) return;
	console.error(
		'[Uncaught Error]',
		event.error?.stack ?? event.message,
		'@',
		`${event.filename}:${event.lineno}:${event.colno}`
	);
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
	const reason = event.reason as Error | undefined;
	console.error('[Unhandled Rejection]', reason?.stack ?? event.reason);
});
