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
// oxlint-disable-next-line no-explicit-any
export type ParticleMethod = ((...args: any[]) => any) | null;

export type ParticleEmitterDataShape = {
	layers: ParticleLayerDataShape[];
} & Record<string, unknown>;

export type ParticleLayerDataShape = ParticleLayerData;

export type ParticleElementShape = {
	x: number;
	y: number;
	anchorX: number;
	anchorY: number;
	rotationAngle: number;
	scaleFactor: number;
};

export type ParticleLayerShape = EngineParticleLayerShape;

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
	startX: number;
	startY: number;
	scale: number;
	angle: number;
	speed: number;
	opacity: number;
	matrix: Matrix | null;
	layers: ParticleLayerShape[];
	bounding: ParticleOuterRectShape;
	hasArea: boolean;
	outerLeft: number;
	outerTop: number;
	outerRight: number;
	outerBottom: number;
	outerWidth: number;
	outerHeight: number;
	active: boolean;
	selected: boolean;
	disabled: boolean;
	isEmpty: () => boolean;
	getLayer: (data: object) => ParticleLayerShape | undefined;
	layer: { order?: 'before' | 'after' };
	draw: () => void;
	emitParticles: (deltaTime: number) => void;
	updateParticles: (deltaTime: number) => number;
	calculateOuterRect: () => ParticleOuterRectShape;
	update: (deltaTime: number) => void;
	updateLayers: () => void;
	updateEasing: () => void;
	clear: () => void;
	destroy: () => void;
}

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

export interface ParticleHistoryData {
	item: { hidden: boolean } & Record<string, unknown>;
	oldValue: boolean;
	newValue: boolean;
	response?: Record<string, unknown>;
	[k: string]: unknown;
}

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
		create: (dItem?: unknown) => unknown;
		copy: (item?: unknown) => unknown;
		paste: (dItem?: unknown) => unknown;
		delete: (item?: unknown) => unknown;
		onCreate: (item?: unknown) => unknown;
		onRemove: (item?: unknown) => unknown;
		onDelete: ((item?: unknown) => unknown) | null;
		onResume: ((item?: unknown) => unknown) | null;
		unselect: ((item?: unknown) => unknown) | null;
		updateItemName: ((item?: unknown) => unknown) | null;
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
	Emitter: { new (data: ParticleEmitterDataShape): ParticleEmitterShape };
	Layer: {
		new (emitter: ParticleEmitterShape, data: ParticleLayerDataShape): ParticleLayerShape;
	};
	Element: {
		new (layer: ParticleElementLayer): ParticleElementShape;
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
