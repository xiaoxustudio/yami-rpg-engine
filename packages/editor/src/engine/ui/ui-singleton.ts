import { elementDataOf } from '@ui-kit';
import { uiEls } from '@app/engine/ui/element-registry';
import { hide } from '@app/utils/element-utils.ts';
import { registryElement } from '@app/utils/element-registry.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { Scene } from '@app/scene/scene-window.ts';
import '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';

import type { UIElementInstance, UINodeShape } from '@app/engine/ui/element-classes.ts';
import type { TreeListElement } from '@app/components/tree-list.ts';
import type { HoverNode } from './ui-facade.ts';
import type { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import type { Timer } from '@app/utils/timer';
import type { History } from '@app/tools/history.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiMouseEvent } from '@app/types/editor-event';

export interface ControlPoint {
	x: number;
	y: number;
	angle: number;
}

export interface UIControlPoints {
	rotate: Record<'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	resize: Record<'T' | 'L' | 'R' | 'B' | 'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	list: ControlPoint[];
}

export interface UIShape {
	page: YamiElement;
	head: YamiElement;
	body: YamiElement;
	screen: YamiElement;
	history: History | null;
	controlPoints: UIControlPoints | null;
	controlPointActive: ControlPoint | null;
	controlPointRotation: number;
	translationKey: number;
	translationTimer: Timer | null;
	zoomTimer: Timer | null;
	background: StageColor;
	foreground: StageColor;
	matrix: Matrix;
	scale: number;
	scaleX: number;
	scaleY: number;
	outerWidth: number;
	outerHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	centerX: number;
	centerY: number;
	centerOffsetX: number;
	centerOffsetY: number;
	padding: number;
	paddingLeft: number;
	paddingTop: number;
	inspectorTypeMap: Record<string, string>;

	marquee: YamiElement & {
		resize: () => void;
		pointerevent?: UIPointerEvent | null;
	};
	hover: HoverNode | null;
	controlPointTexture: ImageTexture | null;

	list: UIListNodeShape;
	searcher: Omit<YamiElement, 'input'> & {
		addKeydownFilter?(): void;
		input?: HTMLInputElement | null;
	};
	dragging: UIDragEvent | null;
	nodes: UINodeShape[] | null;
	context: UIContextShape | null;
	root: UIElementInstance | null;
	meta: { guid: string; path: string } | null;
	load: ((context: UIContextShape) => void) | null;
	open: ((context: UIContextShape) => void) | null;
	destroy: ((context: UIContextShape) => void) | null;
	listKeydown: ((event: KeyboardEvent) => void) | null;
	switchPointerdown: ((event: PointerEvent) => void) | null;
	screenKeydown: ((event: KeyboardEvent) => void) | null;
	createElement: ((node: UINodeShape, main?: boolean) => UIElementInstance) | null;

	state: string;
	target: UINodeShape | null;
	zoom: number | null;
	width: number | null;
	height: number | null;
	mode: string | null;
}

export type { UINodeShape };

export interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		root: UIElementInstance | null;
		history: History;
		centerX: number;
		centerY: number;
	} & Record<string, unknown>;
	fontChanged?: boolean;
	languageChanged?: boolean;
	scalingChanged?: boolean;
}

export type UIPointerEvent = YamiMouseEvent & {
	dragKey?: boolean;
	absoluteAnchorX?: number;
	absoluteAnchorY?: number;
	lastAngle?: number;
	rotationRadians?: number;
	startRotation?: number;
	startWidth?: number;
	startHeight?: number;
	node?: UINodeShape;
	enabled?: boolean;
	startX?: number;
	startY?: number;
};

export type UIListNodeShape = TreeListElement & {
	/** `ui-file.ts:242` 的 `createShortcut` 用它给引用节点起名（树列表自带的去重命名）。 */
	generateUniqueName(item: UINodeShape): string;
};

export type UIDragEvent = UIPointerEvent & {
	mode: string;
	scrollLeft: number;
	scrollTop: number;
	absoluteAnchorX: number;
	absoluteAnchorY: number;
	lastAngle: number;
	rotationRadians: number;
	startRotation: number;
	startWidth: number;
	startHeight: number;
	startX: number;
	startY: number;
};

export const UI = {
	page: uiEls.get('ui') as YamiElement,
	head: uiEls.get('ui-head') as YamiElement,
	body: hide(uiEls.get('ui-body') as YamiElement),
	screen: uiEls.get('ui-screen') as YamiElement,
	marquee: ((uiEls.get('ui-marquee') as YamiElement) ||
		({} as YamiElement)) as UIShape['marquee'],
	searcher: registryElement<UIShape['searcher']>(uiEls, 'ui-searcher')!,
	list: registryElement<UIListNodeShape>(uiEls, 'ui-list') ?? ({} as UIListNodeShape),
	dragging: null as UIDragEvent | null,
	hover: null as HoverNode | null,
	translationKey: 0b0000,
	translationTimer: null as Timer | null,
	zoomTimer: null as Timer | null
} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;

elementDataOf<{ page?: HTMLElement | null }>(UI.list).page = uiEls.get('ui-element') as YamiElement;
elementDataOf<{ head: HTMLElement }>(UI.list).head = uiEls.get('ui-list-head') as YamiElement;
EventBus.once('editor_loaded', () => {
	UI.list.restoreRecursiveStates = Scene.list
		.restoreRecursiveStates as UIShape['list']['restoreRecursiveStates'];
	UI.list.setRecursiveStates = Scene.list
		.setRecursiveStates as UIShape['list']['setRecursiveStates'];
});

const uiBridgeKeys = ['state', 'target', 'zoom', 'width', 'height', 'mode'] as const;

for (const key of uiBridgeKeys) {
	Object.defineProperty(UI, key, {
		get: () => getUIStore()[key],
		set: (value: unknown) => {
			Reflect.set(getUIStore(), key, value);
		},
		configurable: true
	});
}

/**
 * ⚠️ 顺序有意义：`ui-initialize` 先建 DOM 引用与定时器、`ui-file` 挂文档生命周期；
 * 其余域只做赋值，彼此不依赖加载顺序。
 *
 * ⚠️ **必须动态 import**：这些域模块静态 import 本模块的 `UI`，静态引入会先于本模块体求值、踩 TDZ。行为上两者等价（域模块只做赋值）。
 */
const loadUiDomains = async () => {
	await import('@app/engine/ui/ui-initialize.ts');
	await import('@app/engine/ui/ui-file.ts');
	await import('@app/engine/ui/ui-transform.ts');
	await import('@app/engine/ui/ui-prefab.ts');
	await import('@app/engine/ui/ui-events.ts');
	await import('@app/engine/ui/ui-pointer.ts');
	await import('@app/engine/ui/ui-list.ts');
};

export const uiWindowReady = Promise.all([
	import('@app/engine/ui/element-register.ts'),
	loadUiDomains(),
	import('@app/engine/ui/ui-members.ts').then((m) => Object.assign(UI, m.uiMembers))
])
	.then(() => undefined)
	.catch(() => undefined);
