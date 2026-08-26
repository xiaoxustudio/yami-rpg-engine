import type { DirLocation, ServerConfig, ToExcelBody } from './channels.ts';

export interface ApkLogEntry {
	done: boolean;
	msg: string;
}

export type DisplayMode = 'windowed' | 'maximized' | 'fullscreen';

export type MaxMinState = 'maximize' | 'unmaximize' | 'enter-full-screen';

export const SEND_CHANNELS = [
	'maximize',
	'unmaximize',
	'enter-full-screen',
	'leave-full-screen',
	'before-close-window',
	'apk-log',
	'tsc-log',
	'player-window-closed'
] as const;

export type SendChannel = (typeof SEND_CHANNELS)[number];

export interface YamiInvokeApi {
	startServer(config: ServerConfig): Promise<unknown>;
	stopServer(): Promise<unknown>;
	toQrcode(url: string): Promise<string | undefined>;
	getLocalIp(): Promise<string[]>;
	toExcel(body: ToExcelBody): Promise<unknown>;
	fromExcel(): Promise<unknown[]>;
	getDirPath(location: DirLocation): Promise<string | undefined>;
	writeFile(filePath: string, text: string | Uint8Array, check?: boolean): Promise<unknown>;
	waitWriteFile(): Promise<unknown>;
	buildApk(config: Record<string, unknown>): Promise<unknown>;
	stopBuildApk(): Promise<unknown>;
	tscFile(code: string): Promise<{ error?: unknown; res?: string }>;
	updateMaxMinIcon(): Promise<MaxMinState>;
	showOpenDialog(options: unknown): Promise<unknown>;
	showSaveDialog(options: unknown): Promise<unknown>;
	trashItem(filePath: string): Promise<unknown>;
	relaunchApp(): Promise<{ success: boolean; message?: string }>;
}

export interface YamiSyncApi {
	getServerState(): boolean;
	getDirPathSync(location: DirLocation): string | undefined;
	clipboardHas(format: string): boolean;
	clipboardRead(format: string): unknown;
	clipboardWrite(format: string, object: unknown): void;
	isBuildingApk(): boolean;
	getCommandLineSwitch(name: string): string;
	hasCommandLineSwitch(name: string): boolean;
}

export interface YamiSendApi {
	minimizeWindow(): void;
	maximizeWindow(): void;
	closeWindow(): void;
	preventCloseWindow(): void;
	forceCloseWindow(): void;
	toggleFullScreen(): void;
	openPath(targetPath: string): void;
	openVscode(scriptPath: string, line: number, column: number): void;
	showItemInFolder(filePath: string): void;
	createPlayerWindow(projectPath: string): void;
	setDevicePixelRatio(ratio: number): void;
	openDevTools(): void;
	setDisplayMode(display: DisplayMode): void;
	startTsc(projectDir: string): void;
	stopTsc(): void;
	addCommandLineSwitch(name: string, value?: string): void;
	removeCommandLineSwitch(name: string): void;
}

export interface YamiEventApi {
	on(channel: SendChannel, listener: (...args: unknown[]) => void): void;
	once(channel: SendChannel, listener: (...args: unknown[]) => void): void;
}

export interface YamiBridgeApi {
	invoke: YamiInvokeApi;
	sync: YamiSyncApi;
	send: YamiSendApi;
	events: YamiEventApi;
}
