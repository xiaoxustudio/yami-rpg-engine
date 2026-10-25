interface ClipboardBridge {
	sync?: {
		clipboardReadText?: () => string;
		clipboardWriteText?: (text: string) => void;
	};
}

/**
 * 写入纯文本剪贴板。
 *
 * Electron 渲染进程的 `navigator.clipboard.writeText` 受 session 权限限制，
 * 在编辑器里会抛 NotAllowedError；优先走 preload 暴露的主进程 bridge。
 */
export function writeClipboardText(text: string): void {
	const bridge = (globalThis as { yami?: ClipboardBridge }).yami;
	if (bridge?.sync?.clipboardWriteText) {
		bridge.sync.clipboardWriteText(text);
		return;
	}
	if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
		void navigator.clipboard.writeText(text).catch((error: unknown) => {
			console.warn('[clipboard] writeText failed:', error);
		});
	}
}

export function readClipboardText(): string {
	const bridge = (globalThis as { yami?: ClipboardBridge }).yami;
	return bridge?.sync?.clipboardReadText?.() ?? '';
}
