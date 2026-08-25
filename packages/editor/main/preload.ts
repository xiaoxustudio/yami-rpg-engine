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
	// oxlint-disable-next-line no-explicit-any
	on: (channel: SendChannel, listener: (...args: any[]) => void) => {
		if (!isSendChannel(channel)) return;
		ipcRenderer.on(channel, (...args: unknown[]) => listener(...args));
	},
	// oxlint-disable-next-line no-explicit-any
	once: (channel: SendChannel, listener: (...args: any[]) => void) => {
		if (!isSendChannel(channel)) return;
		ipcRenderer.once(channel, (...args: unknown[]) => listener(...args));
	}
};

const api: YamiBridgeApi = { invoke, sync, send, events };

try {
	contextBridge.exposeInMainWorld('yami', api);
} catch {
	// contextIsolation:false 时 contextBridge 不可用，直接挂载到页面 window
	// oxlint-disable-next-line no-explicit-any
	(window as any).yami = api;
}
