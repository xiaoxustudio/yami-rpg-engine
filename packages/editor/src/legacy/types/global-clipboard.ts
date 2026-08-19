import { GlobalClipboard } from '@app/utils/clipboard';

export interface GlobalClipboardHost {
	has(type: string): boolean;
	read(type: string): any;
	write(type: string, data: unknown): void;
}

export function getGlobalClipboard(): GlobalClipboardHost {
	return GlobalClipboard;
}
