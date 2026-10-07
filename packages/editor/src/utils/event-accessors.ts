let spacePressed = false;

export function setSpacePressed(value: boolean): void {
	spacePressed = value;
}

/** 拖拽修饰键：空格或 Alt（原 `Event.prototype.dragKey` 访问器的等价函数）。 */
export function isDragKey(event: { altKey?: boolean } | null | undefined): boolean {
	return spacePressed || event?.altKey === true;
}

export function macRedoKey(e: KeyboardEvent): boolean {
	return process.platform === 'darwin' ? e.metaKey && e.shiftKey && e.code === 'KeyZ' : false;
}

export const ctrl =
	process.platform === 'darwin'
		? function (keyName: string): string {
				return '⌘+' + keyName;
			}
		: function (keyName: string): string {
				return 'Ctrl+' + keyName;
			};
