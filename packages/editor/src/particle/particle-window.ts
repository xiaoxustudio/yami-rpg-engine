import { getListConfig } from '@ui-kit';
import { $ } from '@app/utils/dom';
import { hide } from '@app/utils/element-utils.ts';
import { getParticleStore } from '@app/stores/particle';

import type { EditorConfigShape } from '@app/stores/editor';
import type { History } from '@app/tools/history.ts';
import type { StageColor } from '@app/utils/stage-color';
import type { Timer } from '@app/utils/timer';
import type { Matrix } from '@app/engine/webgl/matrix2.ts';
import type { ParticleElementLayer } from '@app/engine/particle/particle-engine.ts';
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
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
};

export interface ParticleLayerShape {
	data: { name?: string; hidden?: boolean } & Record<string, unknown>;
	// oxlint-disable-next-line no-explicit-any
	elements: Array<Record<string, any>> & { count: number };
	unitWidth: number;
	unitHeight: number;
	texture: unknown;
	draw: (opacity?: number) => void;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
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
	screen: HTMLElement & { rawScrollLeft: number; rawScrollTop: number };
	marquee: HTMLElement & { pointerevent: unknown };
	list: HTMLElement & {
		// 运行时挂载的列表方法（Scene.list / Particle.list 共享）
		create: ((dItem?: unknown) => unknown) | null;
		copy: ((item?: unknown) => unknown) | null;
		paste: ((dItem?: unknown) => unknown) | null;
		delete: ((item?: unknown) => unknown) | null;
		onCreate: ((item?: unknown) => unknown) | null;
		onRemove: ((item?: unknown) => unknown) | null;
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
	dragging:
		| (PointerEvent & {
				mode?: 'object-move' | 'scroll';
				dragKey?: boolean;
				enabled?: boolean;
				startX?: number;
				startY?: number;
				scrollLeft?: number;
				scrollTop?: number;
		  })
		| null;
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
	emitter: ParticleEmitterShape;
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
		// oxlint-disable-next-line no-explicit-any
		stage: Record<string, any>;
	};
}

export const Particle: ParticleShape = {
	page: $('#particle'),
	head: $('#particle-head') as unknown as HTMLElement & {
		left: number;
		width: number;
		padding?: number;
	},
	body: hide($('#particle-body')),
	info: $('#particle-info'),
	screen: $('#particle-screen') as unknown as HTMLElement & {
		rawScrollLeft: number;
		rawScrollTop: number;
		pointerevent: unknown;
	},
	marquee: $('#particle-marquee') as unknown as HTMLElement & { pointerevent: unknown },
	list: ($('#particle-list') as unknown as never) || ({} as never),
	dragging: null,
	history: null,
	restartKey: false,
	translationKey: 0b0000,
	translationTimer: null,
	showAxes: true,
	background: null as unknown as StageColor,
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
	emitter: null as unknown as ParticleEmitterShape,
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
	listChange: null,
	Emitter: null as unknown as { new (data: ParticleEmitterDataShape): ParticleEmitterShape },
	Layer: null as unknown as {
		new (emitter: ParticleEmitterShape, data: ParticleLayerDataShape): ParticleLayerShape;
	},
	Element: null as unknown as {
		new (layer: ParticleElementLayer): ParticleElementShape;
		// oxlint-disable-next-line no-explicit-any
		stage: Record<string, any>;
	}
};

// oxlint-disable-next-line no-explicit-any
Particle.list.create = null as unknown as (...args: unknown[]) => any;
// oxlint-disable-next-line no-explicit-any
Particle.list.copy = null as unknown as (...args: unknown[]) => any;
// oxlint-disable-next-line no-explicit-any
Particle.list.paste = null as unknown as (...args: unknown[]) => any;
// oxlint-disable-next-line no-explicit-any
Particle.list.delete = null as unknown as (...args: unknown[]) => any;
getListConfig(Particle.list).onCreate = null as unknown as (item: unknown) => void;
getListConfig(Particle.list).onRemove = null as unknown as (item: unknown) => void;
getListConfig(Particle.list).onDelete = null as unknown as (item: unknown) => void;
getListConfig(Particle.list).onResume = null as unknown as (item: unknown) => void;
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
			(getParticleStore() as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
