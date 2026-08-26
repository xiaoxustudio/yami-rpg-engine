export type SceneItem = {
	class: string;
	element: HTMLElement;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
};

export type DragEventItem = PointerEvent & {
	dragKey?: boolean;
	mode?: string;
	scrollLeft?: number;
	scrollTop?: number;
	pointerdownX?: number;
	pointerdownY?: number;
	enabled?: boolean;
	latest?: DragEventItem;
	startX?: number;
	startY?: number;
};

export type ScrollableScreen = HTMLElement & { rawScrollLeft: number; rawScrollTop: number };
