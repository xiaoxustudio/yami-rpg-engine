import type { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';

export interface UIElementInstance {
	x: number;
	y: number;
	width: number;
	height: number;
	opacity: number;
	matrix: Matrix;
	transform: UIElementTransform;
	parent: UIElementInstance | null;
	children: UIElementInstance[];
	visible: boolean;
	connected: boolean;
	/** 子元素重绘 / 重算尺寸（`element-base.ts` 的 `children` 循环，均无参） */
	draw(): void;
	resize(): void;
	/**
	 * 画选中/悬停虚线框（`element-base.ts:119`）。实参是**颜色数值**：
	 * 实现把它写进 `colors[i]`（`gl.arrays[0].uint32` 视图）—— 那个 uint32 槽位就是它的口径。
	 * ⚠️ `element-base.ts` 自己的声明写的是 `Array<number> | string`，比实现宽（写进 uint32 槽
	 * 会得到 NaN）；两处调用点（`ui-engine.ts:585` / `:594`）传的都是 `0x…` 数值，本轮把
	 * 实现侧的声明也一并改成 `number`。
	 */
	drawWireframe(color: number): void;
	/** 从父元素的 `children` 里摘掉自己（`element-base.ts:287`，基类方法）。 */
	remove(): void;
	/** 挂子元素（`element-base.ts:250` 的基类方法；`ui-prefab.ts` 装配时调）。 */
	appendChild(element: UIElementInstance | null): void;
	/**
	 * 按索引插入到自己名下（`element-base.ts:266` 的基类方法，`ui-transform.ts` 的移动节点用）。
	 * 首参允许 `null`：实现第一句就是 `element instanceof uiElClasses.Element` 判定 ⇒
	 * 传 `null` 与传 `undefined` 行为完全相同（都什么都不做）。
	 */
	appendChildTo(element: UIElementInstance | null, index: number): void;
	/**
	 * 命中判定（`element-base.ts:350`，基类方法）：`ui-pointer.ts` 的点选路径直接调。
	 * 参数是**元素本地坐标**里的点（调用方已用 `getRelativeCoords` 换算）。
	 */
	isPointIn(x: number, y: number): boolean;
	addReference?(prefabElement: unknown): void;
	tryUpdateReferenceElements?(element: unknown): void;
	node?: UINodeShape | null;
	/** 摧毁自身（`element-base.ts:241` 的基类方法；`ui-file.ts` 关窗时调 `root.destroy()`） */
	destroy(): void;
	font?: string;
	_font?: string;
	shadowText?: UIElementInstance;
	printer?: { reset(): void } | null;
	content?: string;
	updateTextContent?(): void;
	updatePrinter?(): void;
	update?(): void;
}

export interface UIImageElementShape {
	startX: number;
	startY: number;
	transform: { x: number; y: number; width: number; height: number };
	image: string;
	display?: string;
	clip: { set(clip: number[]): void };
	parent: unknown;
	connected: boolean;
	draw(): void;
	resize(): void;
	destroy(): void;
}

export interface UIElementTransform {
	anchorX: number;
	anchorY: number;
	x: number;
	x2: number;
	y: number;
	y2: number;
	width: number;
	width2: number;
	height: number;
	height2: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	skewX: number;
	skewY: number;
	opacity: number;
	[k: string]: unknown;
}

export type UINodeShape = {
	class: string;
	children: UINodeShape[];
	name: string;
	transform: UIElementTransform;
	presetId: string;
	enabled: boolean;
	parent: UINodeShape | null;
	instance?: UIElementInstance;
	instances?: UIInstanceList;
	synchronous?: boolean;
	locked?: boolean;
};

// oxlint-disable-next-line no-explicit-any
export type UIElementCtor = new (data?: any) => any;

export const uiElClasses: {
	Element: UIElementCtor | null;
	Root: UIElementCtor | null;
	Image: UIElementCtor | null;
	Text: UIElementCtor | null;
	TextBox: UIElementCtor | null;
	DialogBox: UIElementCtor | null;
	ProgressBar: UIElementCtor | null;
	Button: UIElementCtor | null;
	Animation: UIElementCtor | null;
	Video: UIElementCtor | null;
	Window: UIElementCtor | null;
	Container: UIElementCtor | null;
	Reference: UIElementCtor | null;
	// oxlint-disable-next-line no-explicit-any
	createElement: ((node: any, main?: boolean) => any) | null;
} = {
	Element: null,
	Root: null,
	Image: null,
	Text: null,
	TextBox: null,
	DialogBox: null,
	ProgressBar: null,
	Button: null,
	Animation: null,
	Video: null,
	Window: null,
	Container: null,
	Reference: null,
	createElement: null
};
