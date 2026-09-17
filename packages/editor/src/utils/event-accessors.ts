/**
 * 事件访问器（P4d）：**不再**往 `Event.prototype` 上装访问器。
 *
 * 原先这里有 `Object.defineProperties(Event.prototype, { dragKey: … })`，配合
 * `utils/keyboard.ts` 的 `Event.prototype.spaceKey` 让**任何**事件都"看起来"带这两个键——
 * 拼错、漏传、以及原生事件被误读都不会报错。现在改成显式函数：调用方写出 `isDragKey(event)`，
 * 语义（空格或 Alt）与原访问器逐字相同。
 */

/** 空格键是否按下（由 `utils/keyboard.ts` 的 keydown/keyup 维护）。 */
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
