import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import type { GlobalClipboardHost } from '@app/legacy/types/global-clipboard';

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
