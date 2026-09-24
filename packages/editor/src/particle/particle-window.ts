import { particleEls } from '@app/particle/element-registry';
import { registryElement } from '@app/utils/element-registry';
import { hide } from '@app/utils/element-utils.ts';
import { getParticleStore } from '@app/stores/particle';

import type { EditorConfigShape } from '@app/stores/editor';
import type { History } from '@app/tools/history.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Timer } from '@app/utils/timer';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { ParticleElementLayer } from '@app/engine/particle/particle-engine.ts';
import type { YamiElement } from '@app/types/element-api';
import type { DragEventItem } from '@app/scene/scene-events.ts';
// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
// oxlint-disable-next-line no-explicit-any
export type ParticleMethod = ((...args: any[]) => any) | null;

export type ParticleEmitterDataShape = {
	layers: ParticleLayerDataShape[];
} & Record<string, unknown>;

export type ParticleLayerDataShape = {
	interval: number;
	delay: number;
	area: {
		type: 'edge' | 'point' | 'rectangle' | 'circle';
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		radius?: number;
	} & Record<string, unknown>;
} & Record<string, unknown>;

export type ParticleElementShape = {
	x: number;
	y: number;
	anchorX: number;
	anchorY: number;
	rotationAngle: number;
	scaleFactor: number;
};

export interface ParticleLayerShape {
	data: { name?: string; hidden?: boolean } & Record<string, unknown>;
	// oxlint-disable-next-line no-explicit-any
	elements: Array<Record<string, any>> & { count: number };
	unitWidth: number;
	unitHeight: number;
	texture: unknown;
	draw: (opacity?: number) => void;
}

export interface ParticleEmitterShape {
	startX: number;
	startY: number;
	layers: ParticleLayerShape[];
	calculateOuterRect: () => {
		left: number;
		top: number;
		right: number;
		bottom: number;
		width: number;
		height: number;
		hasArea: boolean;
	};
	update: (deltaTime: number) => void;
	updateLayers: () => void;
	updateEasing: () => void;
	clear: () => void;
	destroy: () => void;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

// 粒子编辑器上下文（tab 传入 + open/load 运行时挂载 editor）
export interface ParticleContextShape {
	meta: { guid: string; path: string } & Record<string, unknown>;
	particle?: Record<string, unknown>;
	editor: {
		target: unknown;
		emitter: ParticleEmitterShape;
		history: History;
		centerX: number;
		centerY: number;
		paused: boolean;
	};
	[k: string]: unknown;
}

// history processor 记录数据（particle-layer-create/delete/remove/hidden）
export interface ParticleHistoryData {
	item: { hidden: boolean } & Record<string, unknown>;
	oldValue: boolean;
	newValue: boolean;
	response?: Record<string, unknown>;
	[k: string]: unknown;
}

// config 中 colors 运行时必有（save/load 访问 colors.particleBackground）
export type ParticleConfigShape = EditorConfigShape & {
	colors: NonNullable<EditorConfigShape['colors']>;
};

export interface ParticleShape {
	page: HTMLElement;
	head: HTMLElement & { width: number };
	body: HTMLElement;
	info: HTMLElement;
	screen: YamiElement;
	marquee: YamiElement & { pointerevent: unknown };
	list: YamiElement & {
		// 运行时挂载的列表方法（Scene.list / Particle.list 共享）
		create: (dItem?: unknown) => unknown;
		copy: (item?: unknown) => unknown;
		paste: (dItem?: unknown) => unknown;
		delete: (item?: unknown) => unknown;
		onCreate: (item?: unknown) => unknown;
		onRemove: (item?: unknown) => unknown;
		onDelete: ((item?: unknown) => unknown) | null;
		onResume: ((item?: unknown) => unknown) | null;
		// inspector 调用路径（particle-layer-page.ts:411/426）
		unselect: ((item?: unknown) => unknown) | null;
		updateItemName: ((item?: unknown) => unknown) | null;
		// TreeList 运行时挂载
		data: unknown;
		removable: boolean;
		renamable: boolean;
		bind: (data: () => unknown) => void;
		creators: unknown[];
		updaters: unknown[];
		update: () => void;
		restore: (operation: string, response?: unknown) => void;
		selectWithNoEvent: (target: unknown) => void;
		scrollToSelection: () => void;
		addNodeTo: (node: unknown, dItem?: unknown) => void;
		deleteNode: (item: unknown) => void;
		rename: (item: unknown) => void;
		[k: string]: unknown;
	};
	dragging: DragEventItem | null;
	history: History | null;
	restartKey: boolean;
	translationKey: number;
	translationTimer: Timer | null;
	showAxes: boolean;
	background: StageColor;
	matrix: Matrix | null;
	zoomTimer: Timer | null;
	scale: number | null;
	outerWidth: number | null;
	outerHeight: number | null;
	scrollLeft: number | null;
	scrollTop: number | null;
	scrollRight: number | null;
	scrollBottom: number | null;
	centerX: number | null;
	centerY: number | null;
	centerOffsetX: number | null;
	centerOffsetY: number | null;
	padding: number | null;
	context: ParticleContextShape | null;
	meta: ParticleContextShape['meta'] | null;
	layers: ParticleLayerShape[] | null;
	/**
	 * 窗口打开时由 `editor.emitter` 带过来，`close()` 里清空 ⇒ 关闭后**确实是 null**。
	 * 读侧都落在「窗口已打开」上下文（或已有 `state === 'open'` 守卫）里，故用 `!` 收口。
	 */
	emitter: ParticleEmitterShape | null;
	initialize: (() => void) | null;
	open: ParticleMethod;
	load: ((context: ParticleContextShape) => void) | null;
	save: ParticleMethod;
	close: (() => void) | null;
	destroy: ((context: ParticleContextShape) => void) | null;
	restart: (() => void) | null;
	undo: (() => void) | null;
	redo: (() => void) | null;
	setSpeed: ParticleMethod;
	setZoom: ParticleMethod;
	setTarget: ParticleMethod;
	updateTarget: ParticleMethod;
	updateTargetItem: ParticleMethod;
	updateParticleInfo: (() => void) | null;
	updateHead: (() => void) | null;
	resize: (() => void) | null;
	getPointerCoords: ParticleMethod;
	updateCamera: ParticleMethod;
	updateTransform: ParticleMethod;
	updateElements: ((deltaTime: number) => void) | null;
	drawElements: ParticleMethod;
	drawBackground: ParticleMethod;
	drawCoordinateAxes: ParticleMethod;
	drawEmitterWireframe: ParticleMethod;
	drawEmitterAnchor: ParticleMethod;
	drawAreaWireframe: ParticleMethod;
	drawElementWireframes: ParticleMethod;
	drawElementAnchors: ParticleMethod;
	computeOuterRect: (() => void) | null;
	selectEmitter: ((x: number, y: number) => boolean) | null;
	requestAnimation: (() => void) | null;
	updateAnimation: ((deltaTime: number) => void) | null;
	stopAnimation: (() => void) | null;
	requestRendering: (() => void) | null;
	renderingFunction: (() => void) | null;
	stopRendering: (() => void) | null;
	switchWireframe: ParticleMethod;
	switchAnchor: ParticleMethod;
	switchPause: ParticleMethod;
	planToSave: (() => void) | null;
	saveToConfig: ParticleMethod;
	loadFromConfig: ParticleMethod;
	saveToProject: ParticleMethod;
	loadFromProject: ParticleMethod;
	webglRestored: ParticleMethod;
	windowResize: ParticleMethod;
	themechange: ParticleMethod;
	datachange: ParticleMethod;
	keydown: ParticleMethod;
	restartKeyup: ParticleMethod;
	headPointerdown: ParticleMethod;
	viewPointerdown: ParticleMethod;
	controlPointerdown: ParticleMethod;
	speedInput: ParticleMethod;
	zoomFocus: ParticleMethod;
	zoomInput: ParticleMethod;
	screenKeydown: ParticleMethod;
	screenWheel: ParticleMethod;
	screenUserscroll: ParticleMethod;
	screenBlur: ParticleMethod;
	marqueePointerdown: ParticleMethod;
	marqueePointermove: ParticleMethod;
	marqueePointerleave: ParticleMethod;
	pointerup: ParticleMethod;
	pointermove: ParticleMethod;
	listKeydown: ParticleMethod;
	listSelect: ParticleMethod;
	listRecord: ParticleMethod;
	listPopup: ParticleMethod;
	listChange: ParticleMethod;
	// classes（运行时挂载 ParticleEmitter/ParticleLayer/ParticleElement 类）
	Emitter: { new (data: ParticleEmitterDataShape): ParticleEmitterShape };
	Layer: {
		new (emitter: ParticleEmitterShape, data: ParticleLayerDataShape): ParticleLayerShape;
	};
	Element: {
		new (layer: ParticleElementLayer): ParticleElementShape;
		/**
		 * 元素类的静态共享面（`ParticleElement.stage`）—— **当前舞台**。
		 *
		 * ⚠️ 保留 `Record<string, any>`（第 155 轮实测 → 转成**行为问题**）：三条线索都要收 ——
		 * `particle-file.ts:23` 存 `Particle` 单例、`scene-window.ts:945` 存 `Scene` 单例，
		 * 而唯一读点是 `particle-engine.ts:571` 的 `.multiply(ParticleElement.stage.matrix)`。
		 * 两份单例形状都试过：写任一都会在另一条赋值处报错；收成读点面 `{ matrix: Matrix }` 又暴露
		 * **`SceneShape` 根本没有具名的 `matrix`**（运行期确实有：`scene-window.ts:195` 初始化成
		 * `null`、`:578` 赋 `new Matrix()`，一直靠索引签名兜着）。
		 * ⇒ 要收口得先判定「场景当舞台时 `.matrix` 是否保证非空」（读点直接进 `multiply`，传 `null`
		 * 会当场抛）—— 那是行为判定，不能靠类型猜。
		 */
		// oxlint-disable-next-line no-explicit-any
		stage: Record<string, any>;
	};
}

export const Particle = {
	page: particleEls.get('particle') as YamiElement,
	head: registryElement<HTMLElement & { left: number; width: number; padding?: number }>(
		particleEls,
		'particle-head'
	)!,
	body: hide(particleEls.get('particle-body') as YamiElement),
	info: particleEls.get('particle-info') as YamiElement,
	screen: particleEls.get('particle-screen') as YamiElement & {
		rawScrollLeft: number;
		rawScrollTop: number;
		pointerevent: unknown;
	},
	marquee: particleEls.get('particle-marquee') as YamiElement & {
		pointerevent: unknown;
	},
	list: (particleEls.get('particle-list') as never) || ({} as never),
	dragging: null,
	history: null,
	restartKey: false,
	translationKey: 0b0000,
	translationTimer: null,
	showAxes: true,
	matrix: null,
	zoomTimer: null,
	scale: null,
	outerWidth: null,
	outerHeight: null,
	scrollLeft: null,
	scrollTop: null,
	scrollRight: null,
	scrollBottom: null,
	centerX: null,
	centerY: null,
	centerOffsetX: null,
	centerOffsetY: null,
	padding: null,
	context: null,
	meta: null,
	layers: null,
	initialize: null,
	open: null,
	load: null,
	save: null,
	close: null,
	destroy: null,
	restart: null,
	undo: null,
	redo: null,
	setSpeed: null,
	setZoom: null,
	setTarget: null,
	updateTarget: null,
	updateTargetItem: null,
	updateParticleInfo: null,
	updateHead: null,
	resize: null,
	getPointerCoords: null,
	updateCamera: null,
	updateTransform: null,
	updateElements: null,
	drawElements: null,
	drawBackground: null,
	drawCoordinateAxes: null,
	drawEmitterWireframe: null,
	drawEmitterAnchor: null,
	drawAreaWireframe: null,
	drawElementWireframes: null,
	drawElementAnchors: null,
	computeOuterRect: null,
	selectEmitter: null,
	requestAnimation: null,
	updateAnimation: null,
	stopAnimation: null,
	requestRendering: null,
	renderingFunction: null,
	stopRendering: null,
	switchWireframe: null,
	switchAnchor: null,
	switchPause: null,
	planToSave: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	webglRestored: null,
	windowResize: null,
	themechange: null,
	datachange: null,
	keydown: null,
	restartKeyup: null,
	headPointerdown: null,
	viewPointerdown: null,
	controlPointerdown: null,
	speedInput: null,
	zoomFocus: null,
	zoomInput: null,
	screenKeydown: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	pointerup: null,
	pointermove: null,
	listKeydown: null,
	listSelect: null,
	listRecord: null,
	listPopup: null,
	listChange: null
} satisfies Partial<ParticleShape> as Partial<ParticleShape> as ParticleShape;

const particleBridgeKeys = [
	'state',
	'target',
	'paused',
	'showWireframe',
	'showAnchor',
	'speed',
	'zoom',
	'scaleX',
	'scaleY'
] as const;

for (const key of particleBridgeKeys) {
	Object.defineProperty(Particle, key, {
		get: () => getParticleStore()[key],
		set: (value: unknown) => {
			Reflect.set(getParticleStore(), key, value);
		},
		configurable: true
	});
}

export const particleWindowReady = import('./register.ts')
	.then(() => undefined)
	.catch(() => undefined);
