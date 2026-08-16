import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import type { GlobalClipboardHost } from '../types/global-clipboard';

// Clipboard 是浏览器内置 interface, 直接 `(Clipboard as any).has = ...` 形式 TS 不允许给静态 interface 赋值新属性. 用 Object.assign 触发 type-safe 赋值.
// 用 sendSync 同步接口: 调用方都按同步读取 (const copy = Clipboard.read(...)) 使用, invoke 返回 Promise 会导致 copy.id 等访问到 undefined. 主进程 clipboard.readBuffer/writeBuffer 本身就是同步 API, 走 sendSync + event.returnValue 即可
export const GlobalClipboard: GlobalClipboardHost = {
	has(format: string): boolean {
		return ipcRenderer.sendSync(CHANNELS.on.clipboardHas, format) as boolean;
	},
	read(format: string): unknown {
		return ipcRenderer.sendSync(CHANNELS.on.clipboardRead, format);
	},
	write(format: string, object: unknown): void {
		ipcRenderer.sendSync(CHANNELS.on.clipboardWrite, format, object);
	}
};
