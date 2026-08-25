import type { DisplayMode, SendChannel, YamiBridgeApi } from './preload-api.ts';
import type { DirLocation, ServerConfig, ToExcelBody } from './channels.ts';

const bridge = window.yami;

if (!bridge) {
	throw new Error('[YamiIpc] preload bridge (window.yami) 未加载');
}

export const YamiIpc: YamiBridgeApi = {
	invoke: {
		startServer: (config: ServerConfig) => bridge.invoke.startServer(config),
		stopServer: () => bridge.invoke.stopServer(),
		toQrcode: (url: string) => bridge.invoke.toQrcode(url),
		getLocalIp: () => bridge.invoke.getLocalIp(),
		toExcel: (body: ToExcelBody) => bridge.invoke.toExcel(body),
		fromExcel: () => bridge.invoke.fromExcel(),
		getDirPath: (location: DirLocation) => bridge.invoke.getDirPath(location),
		writeFile: (filePath: string, text: string | Uint8Array, check?: boolean) =>
			bridge.invoke.writeFile(filePath, text, check),
		waitWriteFile: () => bridge.invoke.waitWriteFile(),
		buildApk: (config: Record<string, unknown>) => bridge.invoke.buildApk(config),
		stopBuildApk: () => bridge.invoke.stopBuildApk(),
		tscFile: (code: string) => bridge.invoke.tscFile(code),
		updateMaxMinIcon: () => bridge.invoke.updateMaxMinIcon(),
		showOpenDialog: (options: unknown) => bridge.invoke.showOpenDialog(options),
		showSaveDialog: (options: unknown) => bridge.invoke.showSaveDialog(options),
		trashItem: (filePath: string) => bridge.invoke.trashItem(filePath),
		relaunchApp: () => bridge.invoke.relaunchApp()
	},
	sync: {
		getServerState: () => bridge.sync.getServerState(),
		getDirPathSync: (location: DirLocation) => bridge.sync.getDirPathSync(location),
		clipboardHas: (format: string) => bridge.sync.clipboardHas(format),
		clipboardRead: (format: string) => bridge.sync.clipboardRead(format),
		clipboardWrite: (format: string, object: unknown) =>
			bridge.sync.clipboardWrite(format, object),
		isBuildingApk: () => bridge.sync.isBuildingApk(),
		getCommandLineSwitch: (name: string) => bridge.sync.getCommandLineSwitch(name),
		hasCommandLineSwitch: (name: string) => bridge.sync.hasCommandLineSwitch(name)
	},
	send: {
		minimizeWindow: () => bridge.send.minimizeWindow(),
		maximizeWindow: () => bridge.send.maximizeWindow(),
		closeWindow: () => bridge.send.closeWindow(),
		preventCloseWindow: () => bridge.send.preventCloseWindow(),
		forceCloseWindow: () => bridge.send.forceCloseWindow(),
		toggleFullScreen: () => bridge.send.toggleFullScreen(),
		openPath: (targetPath: string) => bridge.send.openPath(targetPath),
		openVscode: (scriptPath: string, line: number, column: number) =>
			bridge.send.openVscode(scriptPath, line, column),
		showItemInFolder: (filePath: string) => bridge.send.showItemInFolder(filePath),
		createPlayerWindow: (projectPath: string) => bridge.send.createPlayerWindow(projectPath),
		setDevicePixelRatio: (ratio: number) => bridge.send.setDevicePixelRatio(ratio),
		openDevTools: () => bridge.send.openDevTools(),
		setDisplayMode: (display: DisplayMode) => bridge.send.setDisplayMode(display),
		startTsc: (projectDir: string) => bridge.send.startTsc(projectDir),
		stopTsc: () => bridge.send.stopTsc(),
		addCommandLineSwitch: (name: string, value?: string) =>
			bridge.send.addCommandLineSwitch(name, value),
		removeCommandLineSwitch: (name: string) => bridge.send.removeCommandLineSwitch(name)
	},
	events: {
		on: (channel: SendChannel, listener) => bridge.events.on(channel, listener),
		once: (channel: SendChannel, listener) => bridge.events.once(channel, listener)
	}
};
