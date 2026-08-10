export interface GlobalClipboardHost {
	has(type: string): boolean;
	read(type: string): any;
	write(type: string, data: unknown): void;
}

export function getGlobalClipboard(): GlobalClipboardHost {
	return (globalThis as unknown as Record<string, unknown>).Clipboard as GlobalClipboardHost;
}
