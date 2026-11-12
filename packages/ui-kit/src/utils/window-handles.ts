/**
 * 窗口帧能力句柄（按窗口 id）——ui-kit 侧真源。
 *
 * `YMWindowFrame` 挂载时登记自己的 open/close/setTitle 等方法，窗口管理器
 * （editor 的 `window-object`、`command-custom` 等）按 id 取句柄，而不是把方法挂在
 * 窗口根元素上。editor 的 `composables/window-handles.ts` 只是转出这份契约。
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
