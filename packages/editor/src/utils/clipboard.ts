import { YamiIpc } from '@app/services/ipc/bridge.ts';

export interface GlobalClipboardHost {
	has(type: string): boolean;
	// oxlint-disable-next-line no-explicit-any
	read(type: string): any;
	write(type: string, data: unknown): void;
	writeText(text: string): void;
}

export const GlobalClipboard: GlobalClipboardHost = {
	has(format: string): boolean {
		return YamiIpc.sync.clipboardHas(format);
	},
	read(format: string): unknown {
		return YamiIpc.sync.clipboardRead(format);
	},
	write(format: string, object: unknown): void {
		YamiIpc.sync.clipboardWrite(format, object);
	},
	writeText(text: string): void {
		YamiIpc.sync.clipboardWriteText(text);
	}
};
