import type {
	IpcMainInvokeEvent as EIpcMainInvokeEvent,
	IpcMainEvent as EIpcMainEvent
} from 'electron';
import type { ApkConfig } from './apk.ts';

export type IpcMainInvokeEvent = EIpcMainInvokeEvent;
export type IpcMainEvent = EIpcMainEvent;

export type BuildApkConfig = ApkConfig;

export type {
	ServerConfig,
	ToExcelBody,
	DirLocation,
	WriteFileCheck,
	TscFileCode,
	StartTscProjectDir
} from '../../src/services/ipc/channels.ts';

export interface BrowserWindowExtension {
	/** 发送 IPC 消息到渲染进程 */
	send(channel: string, ...args: unknown[]): void;
	config?: unknown;
	stopCloseEvent?: boolean;
	cancelForceClose?: () => void;
}
