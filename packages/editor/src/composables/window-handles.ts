/**
 * 窗口帧的**能力句柄表**（按窗口 id）。
 *
 * 旧契约把 `open` / `close` / `setTitle` / `absolute` / `setPosition` 挂在窗口根元素上，
 * 窗口管理器（`command-custom`、`useArrayWindow`、`image-crop-window`）拿元素调方法。
 * 现在 `WindowFrame` 挂载时把能力登记到这张表，卸载时清空；DOM 语义（`style` / 事件）
 * 仍走 `handle.root`，但方法不再挂在元素上。
 */
export interface WindowHandle {
	root: HTMLElement | null;
	open?(): void;
	close?(): boolean;
	maximize?(): void;
	unmaximize?(): void;
	focus?(): void;
	blur?(): void;
	setTitle?(text: string): void;
	absolute?(left: number, top: number): void;
	setPosition?(x: number, y: number, rect: DOMRect): void;
	on?(type: string, listener: (event: Event) => void): void;
}

const handles = new Map<string, WindowHandle>();

export const setWindowHandle = (id: string, handle: WindowHandle): void => {
	if (id !== '') handles.set(id, handle);
};

export const clearWindowHandle = (id: string, handle: WindowHandle): void => {
	if (handles.get(id) === handle) handles.delete(id);
};

export const getWindowHandle = (id: string): WindowHandle | null => handles.get(id) ?? null;
