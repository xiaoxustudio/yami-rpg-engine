export const CHANNELS = {
	invoke: {
		startServer: 'start-server',
		stopServer: 'stop-server',
		toQrcode: 'to-qrcode',
		getLocalIp: 'get-local-ip',
		toExcel: 'to-excel',
		fromExcel: 'from-excel',
		getDirPath: 'get-dir-path',
		writeFile: 'write-file',
		waitWriteFile: 'wait-write-file',
		buildApk: 'build-apk',
		stopBuildApk: 'stop-build-apk',
		tscFile: 'tsc-file',
		updateMaxMinIcon: 'update-max-min-icon',
		showOpenDialog: 'show-open-dialog',
		showSaveDialog: 'show-save-dialog',
		trashItem: 'trash-item',
		relaunchApp: 'relaunch-app'
	},
	on: {
		getServerState: 'get-server-state',
		getDirPathSync: 'get-dir-path-sync',
		clipboardHas: 'clipboard-has',
		clipboardRead: 'clipboard-read',
		clipboardReadText: 'clipboard-read-text',
		clipboardWrite: 'clipboard-write',
		clipboardWriteText: 'clipboard-write-text',
		isBuildingApk: 'isBuilding-apk',
		startTsc: 'start-tsc',
		stopTsc: 'stop-tsc',
		minimizeWindow: 'minimize-window',
		maximizeWindow: 'maximize-window',
		closeWindow: 'close-window',
		preventCloseWindow: 'prevent-close-window',
		forceCloseWindow: 'force-close-window',
		toggleFullScreen: 'toggle-full-screen',
		openPath: 'open-path',
		openVscode: 'open-vscode',
		showItemInFolder: 'show-item-in-folder',
		createPlayerWindow: 'create-player-window',
		setDevicePixelRatio: 'set-device-pixel-ratio',
		openDevTools: 'open-devTools',
		setDisplayMode: 'set-display-mode',
		getCommandLineSwitch: 'get-command-line-switch',
		addCommandLineSwitch: 'add-command-line-switch',
		removeCommandLineSwitch: 'remove-command-line-switch',
		hasCommandLineSwitch: 'has-command-line-switch'
	},
	send: {
		maximize: 'maximize',
		unmaximize: 'unmaximize',
		enterFullScreen: 'enter-full-screen',
		leaveFullScreen: 'leave-full-screen',
		beforeCloseWindow: 'before-close-window',
		apkLog: 'apk-log',
		tscLog: 'tsc-log',
		playerWindowClosed: 'player-window-closed'
	}
} as const;

export interface ServerConfig {
	path: string;
	port: number;
}

export interface ToExcelBody {
	langs: string[];
	list: unknown[];
}

export type DirLocation = 'appData' | 'documents' | 'desktop' | 'appPath';

export type WriteFileCheck = boolean | undefined;

export type TscFileCode = string;

export type StartTscProjectDir = string;
