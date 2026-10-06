import { particleEls } from '@app/particle/element-registry';
import { registryElement } from '@app/utils/element-registry';
import { hide } from '@app/utils/element-utils.ts';
import { getParticleStore } from '@app/stores/particle';

import type { EditorConfigShape } from '@app/stores/editor';
import type { History } from '@app/tools/history.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Timer } from '@app/utils/timer';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type {
	ParticleElementLayer,
	ParticleLayerData,
	ParticleLayerShape as EngineParticleLayerShape,
	ParticleStageShape
} from '@app/engine/particle/particle-engine.ts';
import type { YamiElement } from '@app/types/element-api';
import type { DragEventItem } from '@app/scene/scene-events.ts';
// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
// oxlint-disable-next-line no-explicit-any
export type ParticleMethod = ((...args: any[]) => any) | null;

export type ParticleEmitterDataShape = {
	layers: ParticleLayerDataShape[];
} & Record<string, unknown>;

/**
 * 图层数据 —— **直接引用引擎侧那一份**。
 *
 * 同名声明合并到 `particle-engine.ts` 的 `ParticleLayerData`；这里却还留着一份更窄的副本，
 * 于是 `new Particle.Emitter(data)` 的入参对不上（本轮摘掉 `ParticleEngine` 的索引签名时露出来）。
 * 保留别名只是为了不动调用点（`particle-file.ts` 的 `ParticleEmitterDataShape`）。
 */
export type ParticleLayerDataShape = ParticleLayerData;

export type ParticleElementShape = {
	x: number;
	y: number;
	anchorX: number;
	anchorY: number;
	rotationAngle: number;
	scaleFactor: number;
};

/**
 * 图层实例 —— **就是引擎侧那一份**（`ParticleLayerShape`，本文件不再另写一份）。
 *
 * 原先这里是一份更窄的副本（`data` / `elements` / `unitWidth` / `unitHeight` / `texture` / `draw`
 * 加 5 个 inspector 方法），与引擎的同名声明各自漂移：本轮摘掉 `ParticleEngine` 的索引签名后，
 * `Particle.Layer` 的构造签名当场对不上（缺 `emitter` / `textureWidth` / `easing` / `capacity` / `reserves` …）。
 * 合并之后「一份形状」既是构造签名、也是读侧视图。
 */
export type ParticleLayerShape = EngineParticleLayerShape;

/** `calculateOuterRect()` 的产物（也直接挂在发射器上作 `bounding`，见 `scene-context.ts`） */
export interface ParticleOuterRectShape {
	left: number;
	top: number;
	right: number;
	bottom: number;
	width: number;
	height: number;
	hasArea: boolean;
}

export interface ParticleEmitterShape {
	// —— 变换 / 外观（引擎与动画播放器都读写：`animation-player.ts` 的 `emitter.scale/speed/opacity/angle`）——
	startX: number;
	startY: number;
	scale: number;
	angle: number;
	speed: number;
	opacity: number;
	matrix: Matrix | null;
	layers: ParticleLayerShape[];
	// —— 包围盒：`calculateOuterRect()` 的结果由**调用方**回写（`animation-motion.ts` / `scene-context.ts`）——
	bounding: ParticleOuterRectShape;
	hasArea: boolean;
	outerLeft: number;
	outerTop: number;
	outerRight: number;
	outerBottom: number;
	outerWidth: number;
	outerHeight: number;
	// —— 编辑器状态（粒子列表 / 指针用它们高亮当前发射器）——
	active: boolean;
	selected: boolean;
	// —— 引擎运行期接口 ——
	disabled: boolean;
	isEmpty: () => boolean;
	/** 按数据对象同一性取图层实例（实现见引擎，入参只做引用比较 ⇒ `object`；找不到时 `undefined`） */
	getLayer: (data: object) => ParticleLayerShape | undefined;
	/** 来源图层（动画播放器装配时挂上）。唯一读点是 `emitter.layer.order`（决定粒子画在精灵前/后），
	 *  取值见运行期契约 `AnimationParticleOrder`（`yami.animation.d.ts`）。 */
	layer: { order?: 'before' | 'after' };
	draw: () => void;
	emitParticles: (deltaTime: number) => void;
	updateParticles: (deltaTime: number) => number;
	// —— 窗口侧已声明的方法 ——
	calculateOuterRect: () => ParticleOuterRectShape;
	update: (deltaTime: number) => void;
	updateLayers: () => void;
	updateEasing: () => void;
	clear: () => void;
	destroy: () => void;
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
	/**
	 * 要求这五项与 `ParticleStageShape` 相容。它们由 `particle-initialize.ts:94`
	 * （`this.matrix = new Matrix()`）与 `resize` 赋真值，全仓没有一处写回 `null`；
	 * 字面量里那 5 行 `null` 占位已删（只参与绘制期算术）。
	 */
	matrix: Matrix;
	zoomTimer: Timer | null;
	scale: number | null;
	outerWidth: number | null;
	outerHeight: number | null;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
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
		 * `particle-file.ts:23` 存 `Particle` 单例、`animation-file.ts:21` 存 `Animation` 单例、
		 * `scene-window.ts:1067` 存 `Scene` 单例；唯一读点在 `particle-engine.ts`
		 * （`.multiply(stage.matrix)` 与两组 `scroll*`）。两边现在引用**同一个**
		 * `ParticleStageShape`（`engine/particle/particle-engine.ts` 导出）。
		 */
		stage: ParticleStageShape;
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
	zoomTimer: null,
	scale: null,
	outerWidth: null,
	outerHeight: null,
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
	'scaleY',
	// `restartKey`/`translationKey`/`showAxes` 都是纯 UI 开关，无每帧读写
	'restartKey',
	'translationKey',
	'showAxes'
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
