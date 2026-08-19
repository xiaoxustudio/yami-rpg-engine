import { getListConfig } from '@ui-kit';
import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { Window } from '@app/legacy/tools/window-object.ts';
import { $ } from '@app/utils/dom';
import {
	addClass,
	addSetScrollMethod,
	hasClass,
	hide,
	on,
	read,
	rect,
	removeClass,
	show,
	write
} from '@app/utils/element-utils.ts';
import { ctrl } from '@app/utils/event-accessors';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Cursor } from '@app/legacy/tools/pointer-object.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { Menu } from '@app/legacy/components/menu-list.ts';
import { TreeList } from '@app/legacy/components/tree-list.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Layout } from '@app/engine/layout/layout.ts';

import { History } from '@app/legacy/tools/history.ts';
import { createGetter } from '@app/i18n';
import { UndoManager } from '@app/legacy/tools/undo-manager.ts';
import type { GlobalClipboardHost } from '@app/legacy/types/global-clipboard.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { EditorConfigShape, EditorProjectShape } from '@app/stores/editor';
import { getParticleStore, type ParticleTargetShape } from '@app/stores/particle';

import { StageColor } from '@app/utils/stage-color';
import { Timer } from '@app/utils/timer';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { ParticleEngine, type ParticleElementLayer } from '@app/engine/particle/particle-engine.ts';

type ParticleState = 'closed' | 'open';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type ParticleMethod = ((...args: any[]) => any) | null;

type ParticleEmitterDataShape = {
	layers: ParticleLayerDataShape[];
} & Record<string, unknown>;

type ParticleLayerDataShape = {
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

type ParticleElementShape = {
	x: number;
	y: number;
	anchorX: number;
	anchorY: number;
	rotationAngle: number;
	scaleFactor: number;
	[k: string]: any;
};

export interface ParticleLayerShape {
	data: { name?: string; hidden?: boolean } & Record<string, unknown>;
	elements: Array<Record<string, any>> & { count: number };
	unitWidth: number;
	unitHeight: number;
	texture: unknown;
	draw: (opacity?: number) => void;
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
	[k: string]: any;
}

// 粒子编辑器上下文（tab 传入 + open/load 运行时挂载 editor）
interface ParticleContextShape {
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
interface ParticleHistoryData {
	item: { hidden: boolean } & Record<string, unknown>;
	oldValue: boolean;
	newValue: boolean;
	response?: Record<string, unknown>;
	[k: string]: unknown;
}

// config 中 colors 运行时必有（save/load 访问 colors.particleBackground）
type ParticleConfigShape = EditorConfigShape & { colors: NonNullable<EditorConfigShape['colors']> };

interface ParticleShape {
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
		stage: Record<string, any>;
	}
};

Particle.Emitter = ParticleEngine.Emitter;
Particle.Layer = ParticleEngine.Layer;
Particle.Element = ParticleEngine.Element;

Particle.list.create = null as unknown as (...args: unknown[]) => any;
Particle.list.copy = null as unknown as (...args: unknown[]) => any;
Particle.list.paste = null as unknown as (...args: unknown[]) => any;
Particle.list.delete = null as unknown as (...args: unknown[]) => any;
getListConfig(Particle.list).onCreate = null as unknown as (item: unknown) => void;
getListConfig(Particle.list).onRemove = null as unknown as (item: unknown) => void;
getListConfig(Particle.list).onDelete = null as unknown as (item: unknown) => void;
getListConfig(Particle.list).onResume = null as unknown as (item: unknown) => void;

Particle.initialize = function () {
	this.page = $('#particle');
	this.head = $('#particle-head') as unknown as HTMLElement & { width: number };
	this.body = hide($('#particle-body'));
	this.info = $('#particle-info');
	this.screen = $('#particle-screen') as unknown as HTMLElement & {
		rawScrollLeft: number;
		rawScrollTop: number;
	};
	const oldMarquee = this.marquee;
	this.marquee = $('#particle-marquee') as unknown as HTMLElement & { pointerevent: unknown };
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	const oldList = this.list;
	this.list = $('#particle-list') as unknown as never;
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	this.screen && addSetScrollMethod(this.screen);

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (timer) => {
			if (getParticleStore().state === 'open' && this.dragging === null) {
				const key = this.translationKey;
				const step = (Timer.deltaTime * 1.5) / this.scale!;
				let x = 0;
				let y = 0;
				if (key & 0b0001) {
					x -= step;
				}
				if (key & 0b0010) {
					y -= step;
				}
				if (key & 0b0100) {
					x += step;
				}
				if (key & 0b1000) {
					y += step;
				}
				const screen = this.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				const cx = Math.roundTo(this.centerX! + x, 4);
				const cy = Math.roundTo(this.centerY! + y, 4);
				this.updateCamera!(cx, cy);
				this.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering!();
				}
			} else {
				return false;
			}
		}
	});

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer) => {
			if (getParticleStore().state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize!();
				this.requestRendering!();
			} else {
				this.scale = timer.end;
				return false;
			}
		}
	});

	this.padding = 800;

	this.matrix = new Matrix();

	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => this.layers);

	History.processors['particle-layer-create'] =
		History.processors['particle-layer-delete'] =
		History.processors['particle-layer-remove'] =
			(operation: string, data: ParticleHistoryData) => {
				list.restore(operation, data.response);
			};
	History.processors['particle-layer-hidden'] = (
		operation: string,
		data: ParticleHistoryData
	) => {
		const { item, oldValue, newValue } = data;
		item.hidden = operation === 'undo' ? oldValue : newValue;
		list.update();
		Particle.requestRendering!();
		Particle.planToSave!();
	};

	window.addEventListener('themechange', this.themechange!);
	window.addEventListener('datachange', this.datachange!);
	window.addEventListener('keydown', this.keydown!);
	on(this.page, 'resize', this.windowResize!);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored!);
	// head/toolbar/control/zoom/screen(keydown/wheel)/marquee(pointerdown) 经 Vue 模板转发（LayoutPanel @pointerdown/@input/@focus/@keydown/@wheel）
	on($('#particle-speed'), 'input', this.speedInput!);
	on(this.screen, 'userscroll', this.screenUserscroll!);
	on(this.screen, 'blur', this.screenBlur!);
	on(this.marquee, 'pointermove', this.marqueePointermove!);
	on(this.marquee, 'pointerleave', this.marqueePointerleave!);
	on(this.list, 'keydown', this.listKeydown!);
	on(this.list, 'keydown', this.listKeydown!);
	on(this.list, 'select', this.listSelect!);
	on(this.list, 'record', this.listRecord!);
	on(this.list, 'popup', this.listPopup!);
	on(this.list, 'change', this.listChange!);
};

Particle.open = function (this: typeof Particle, context: ParticleContextShape) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();

	Particle.Element.stage = this;

	const { meta } = context;
	if (!context.particle) {
		context.particle = Data.particles[meta.guid];
	}
	if (context.particle) {
		getParticleStore().state = 'open';
		this.context = context;
		this.meta = meta;
		show(this.body);
		this.load!(context);
		this.resize!();
		this.requestAnimation!();
		this.requestRendering!();
	} else {
		Layout.manager.switch('directory');
		Window.confirm!(
			{
				message: `Failed to read file: ${meta.path}`
			},
			[
				{
					label: 'Confirm'
				}
			]
		);
	}
};

Particle.load = function (this: typeof Particle, context: ParticleContextShape) {
	if (!context.editor) {
		context.editor = {
			target: null,
			emitter: new Particle.Emitter(context.particle! as unknown as ParticleEmitterDataShape),
			history: new History(100),
			centerX: 0,
			centerY: 0,
			paused: false
		};
	}
	const { particle, editor } = context;

	this.layers = (particle! as { layers: ParticleLayerShape[] }).layers;

	this.emitter = editor.emitter;
	this.history = editor.history;
	this.centerX = editor.centerX;
	this.centerY = editor.centerY;

	this.switchPause!(editor.paused);

	this.list.update();

	this.emitter.updateEasing();

	this.computeOuterRect!();

	this.setTarget!(editor.target);

	UndoManager.setActive(Particle);
};

Particle.save = function () {
	if (getParticleStore().state === 'open') {
		const { editor } = this.context!;

		editor.target = getParticleStore().target;
		editor.emitter = this.emitter;
		editor.history = this.history!;
		editor.centerX = this.centerX!;
		editor.centerY = this.centerY!;
		editor.paused = getParticleStore().paused;
	}
};

Particle.close = function () {
	if (getParticleStore().state !== 'closed') {
		this.screen?.blur();
		this.setTarget!(null);
		getParticleStore().state = 'closed';
		this.context = null;
		this.meta = null;
		this.layers = null;
		this.emitter = null as unknown as ParticleEmitterShape;
		this.history = null;
		hide(this.body);
		this.stopAnimation!();
		this.stopRendering!();
		UndoManager.setActive(null);
	}
};

Particle.destroy = function (this: typeof Particle, context: ParticleContextShape) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	context.editor.emitter.destroy();
	TreeList.deleteCaches(
		(context.particle! as { layers: unknown }).layers as Parameters<
			typeof TreeList.deleteCaches
		>[0]
	);
};

Particle.restart = function () {
	this.emitter.clear();
	this.requestRendering!();
};

Particle.undo = function () {
	if (getParticleStore().state === 'open' && !this.dragging && this.history!.canUndo()) {
		this.history!.restore('undo');
	}
};

Particle.redo = function () {
	if (getParticleStore().state === 'open' && !this.dragging && this.history!.canRedo()) {
		this.history!.restore('redo');
	}
};

Particle.setSpeed = (function IIFE() {
	return function (this: ParticleShape, speed: number) {
		getParticleStore().speed = speed;
		const numberBox = $('#particle-speed');
		if (numberBox) write(numberBox, speed);
	};
})();

Particle.setZoom = (function IIFE() {
	return function (this: ParticleShape, zoom: number) {
		const slider = $('#particle-zoom');
		if (getParticleStore().zoom !== zoom) {
			let scale;
			switch (zoom) {
				case 0:
					scale = 0.25;
					break;
				case 1:
					scale = 0.5;
					break;
				case 2:
					scale = 1;
					break;
				case 3:
					scale = 2;
					break;
				case 4:
					scale = 4;
					break;
				default:
					return;
			}
			getParticleStore().zoom = zoom;
			if (slider) write(slider, zoom);
			if (getParticleStore().state === 'open') {
				const timer = this.zoomTimer!;
				timer.start = this.scale!;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

Particle.setTarget = function (target: ParticleTargetShape) {
	if (getParticleStore().target !== target) {
		getParticleStore().target = target;
		this.updateTargetItem!();
		this.requestRendering!();
		if (target) {
			Inspector.open('particleLayer', target);
		} else {
			Inspector.close();
		}
	}
};

Particle.updateTarget = function () {
	const item = read(this.list);
	if (item !== getParticleStore().target) {
		this.setTarget!(item);
	}
};

Particle.updateTargetItem = function () {
	const { target } = getParticleStore();
	if (target !== null) {
		const { list } = this;
		if (read(list) !== target) {
			list.selectWithNoEvent(target);
			if (target) {
				list.scrollToSelection();
			}
		}
	}
};

Particle.updateParticleInfo = function () {
	const { emitter, info } = this;
	const words = Command.words;
	for (const layer of emitter.layers) {
		const { name } = layer.data;
		const { count } = layer.elements;
		words.push(`${name} ${count}`);
	}
	const content = words.join('\n');
	if (info.textContent !== content) {
		info.textContent = content;
	}
};

Particle.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement!(head)!;
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
		const width = nRect.right - iRect.right;
		if (head.width !== width) {
			head.width = width;
			const [start, center, end] = head.children as unknown as HTMLElement[];
			end.style.marginLeft = '';
			const sRect = rect(start);
			const cRect = rect(center);
			const eRect = rect(end);
			const spacing = eRect.left - sRect.right - cRect.width;
			const difference = sRect.right - nRect.left - eRect.width;
			const margin = Math.min(spacing, difference);
			end.style.marginLeft = `${margin}px`;
		}
	}
};

Particle.resize = function () {
	if (getParticleStore().state === 'open' && this.screen && this.screen.clientWidth !== 0) {
		const scale = this.scale!;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const stageWidth = screenWidth + this.padding!;
		const stageHeight = screenHeight + this.padding!;
		const innerWidth = Math.round(stageWidth * scale);
		const innerHeight = Math.round(stageHeight * scale);
		const outerWidth = Math.max(screenWidth, innerWidth);
		const outerHeight = Math.max(screenHeight, innerHeight);
		const dpr = window.devicePixelRatio;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX = screenWidth / 2;
		this.centerOffsetY = screenHeight / 2;
		getParticleStore().scaleX = innerWidth / stageWidth;
		getParticleStore().scaleY = innerHeight / stageHeight;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize(screenWidth, screenHeight);
		this.updateCamera!();
		this.updateTransform!();
	}
};

Particle.getPointerCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: ParticleShape, event: PointerEvent) {
		const coords = getRelativeCoords(event, this.marquee);
		const dpr = window.devicePixelRatio;
		point.x = (coords.x * dpr - (this.outerWidth! >> 1)) / getParticleStore().scaleX!;
		point.y = (coords.y * dpr - (this.outerHeight! >> 1)) / getParticleStore().scaleY!;
		return point;
	};
})();

Particle.updateCamera = function (
	this: ParticleShape,
	x: number = this.centerX!,
	y: number = this.centerY!
) {
	const screen = this.screen;
	const dpr = window.devicePixelRatio;
	const scrollX = x * getParticleStore().scaleX! + this.outerWidth! / 2;
	const scrollY = y * getParticleStore().scaleY! + this.outerHeight! / 2;
	const toleranceForDPR = 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX!, 0, this.outerWidth! - GL.width) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY!, 0, this.outerHeight! - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr;
};

Particle.updateTransform = function () {
	const screen = this.screen;
	const dpr = window.devicePixelRatio;
	const left = Math.roundTo(screen.scrollLeft * dpr - (this.outerWidth! >> 1), 4);
	const top = Math.roundTo(screen.scrollTop * dpr - (this.outerHeight! >> 1), 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	this.scrollLeft = left / getParticleStore().scaleX!;
	this.scrollTop = top / getParticleStore().scaleY!;
	this.scrollRight = right / getParticleStore().scaleX!;
	this.scrollBottom = bottom / getParticleStore().scaleY!;
	this.matrix!.reset()
		.scale(getParticleStore().scaleX!, getParticleStore().scaleY!)
		.translate(-this.scrollLeft!, -this.scrollTop!);
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX!;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY!;
	this.centerX = Math.roundTo((scrollX - this.outerWidth! / 2) / getParticleStore().scaleX!, 4);
	this.centerY = Math.roundTo((scrollY - this.outerHeight! / 2) / getParticleStore().scaleY!, 4);
};

Particle.updateElements = function (deltaTime: number) {
	this.emitter.update(deltaTime * getParticleStore().speed!);
};

Particle.drawElements = function () {
	for (const layer of this.emitter.layers) {
		if (!layer.data.hidden) layer.draw();
	}
};

Particle.drawBackground = function () {
	const gl = GL;
	gl.clearColor(...this.background.getGLRGBA());
	gl.clear(gl.COLOR_BUFFER_BIT);
};

Particle.drawCoordinateAxes = function () {
	if (this.showAxes) {
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(Particle.matrix);
		// 避免缩放时虚线抖动
		const L = -10000 / getParticleStore().scaleX!;
		const T = -10000 / getParticleStore().scaleY!;
		const R = 10000 / getParticleStore().scaleX!;
		const B = 10000 / getParticleStore().scaleY!;
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		const x1 = a * L + e;
		const y1 = b * L + f;
		const x2 = a * R + e;
		const y2 = b * R + f;
		const x3 = c * T + e;
		const y3 = d * T + f;
		const x4 = c * B + e;
		const y4 = d * B + f;
		vertices[0] = x1;
		vertices[1] = y1 + 0.5;
		vertices[2] = 0;
		vertices[3] = x2;
		vertices[4] = y2 + 0.5;
		vertices[5] = Math.dist(x1, y1, x2, y2);
		vertices[6] = x3 + 0.5;
		vertices[7] = y3;
		vertices[8] = 0;
		vertices[9] = x4 + 0.5;
		vertices[10] = y4;
		vertices[11] = Math.dist(x3, y3, x4, y4);
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.dashedLineProgram.use();
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform4f(program.u_Color, 0.5, 0, 1, 1);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
		gl.drawArrays(gl.LINES, 0, 4);
	}
};

Particle.drawEmitterWireframe = function () {
	let color;
	const emitter = this.emitter;
	if (emitter.active) color = 0xffffffff;
	if (emitter.selected) color = 0xffc0ff00;
	if (
		(emitter.outerLeft === 0 &&
			emitter.outerTop === 0 &&
			emitter.outerRight === 0 &&
			emitter.outerBottom === 0) ||
		color === undefined
	) {
		return;
	}
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const colors = gl.arrays[0].uint32;
	const ox = 0.5 / getParticleStore().scaleX!;
	const oy = 0.5 / getParticleStore().scaleY!;
	const L = emitter.outerLeft + ox;
	const T = emitter.outerTop + oy;
	const R = emitter.outerRight - ox;
	const B = emitter.outerBottom - oy;
	vertices[0] = L;
	vertices[1] = T;
	colors[2] = color;
	vertices[3] = L;
	vertices[4] = B;
	colors[5] = color;
	vertices[6] = R;
	vertices[7] = B;
	colors[8] = color;
	vertices[9] = R;
	vertices[10] = T;
	colors[11] = color;
	const program = gl.graphicProgram.use();
	const matrix = gl.matrix.project(gl.flip, gl.width, gl.height).multiply(Particle.matrix);
	gl.bindVertexArray(program.vao);
	gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 12);
	gl.drawArrays(gl.LINE_LOOP, 0, 4);
};

Particle.drawEmitterAnchor = function () {
	const emitter = this.emitter;
	if (!emitter.selected) return;
	const X = emitter.startX;
	const Y = emitter.startY;
	if (!this.selectEmitter!(X, Y)) {
		emitter.selected = false;
		return;
	}
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = this.matrix!;
	const a = matrix[0];
	const b = matrix[1];
	const c = matrix[3];
	const d = matrix[4];
	const e = matrix[6];
	const f = matrix[7];
	const x = a * X + c * Y + e;
	const y = b * X + d * Y + f;
	vertices[0] = x + 0.5 - 8;
	vertices[1] = y + 0.5;
	vertices[2] = x + 0.5 + 9;
	vertices[3] = y + 0.5;
	vertices[4] = x + 0.5;
	vertices[5] = y + 0.5 - 8;
	vertices[6] = x + 0.5;
	vertices[7] = y + 0.5 + 9;
	gl.matrix.project(gl.flip, gl.width, gl.height);
	gl.alpha = 1;
	gl.blend = 'normal';
	const program = gl.graphicProgram.use();
	gl.bindVertexArray(program.vao.a10);
	gl.uniformMatrix3fv(program.u_Matrix, false, gl.matrix);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8);
	gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
	gl.drawArrays(gl.LINES, 0, 4);
};

Particle.drawAreaWireframe = function () {
	if (!getParticleStore().showWireframe || !getParticleStore().target) return;
	let vi = 0;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const { area } = getParticleStore().target!;
	switch (area.type) {
		case 'rectangle': {
			const ax = area.x;
			const ay = area.y;
			const aw = area.width;
			const ah = area.height;
			const ox = 0.5 / getParticleStore().scaleX!;
			const oy = 0.5 / getParticleStore().scaleY!;
			const L = ax - aw * 0.5 + ox;
			const T = ay - ah * 0.5 + oy;
			const R = Math.max(L, ax + aw * 0.5 - ox);
			const B = Math.max(T, ay + ah * 0.5 - oy);
			vertices[0] = L;
			vertices[1] = T;
			vertices[2] = L;
			vertices[3] = B;
			vertices[4] = R;
			vertices[5] = B;
			vertices[6] = R;
			vertices[7] = T;
			vi = 8;
			break;
		}
		case 'circle': {
			const ax = area.x;
			const ay = area.y;
			const ar = area.radius;
			const segments = 100;
			const step = (Math.PI * 2) / segments;
			for (let i = 0; i < segments; i++) {
				const angle = i * step;
				vertices[vi] = ax + ar * Math.cos(angle);
				vertices[vi + 1] = ay + ar * Math.sin(angle);
				vi += 2;
			}
			break;
		}
		default:
			return;
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		const matrix = gl.matrix.project(gl.flip, gl.width, gl.height).multiply(Particle.matrix);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.LINE_LOOP, 0, vi / 2);
	}
};

Particle.drawElementWireframes = function () {
	if (!getParticleStore().showWireframe) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const matrix = gl.matrix;
	let vi = 0;
	for (const layer of this.emitter.layers) {
		if (layer.data.hidden) continue;
		const { texture } = layer;
		if (texture instanceof ImageTexture) {
			const elements = layer.elements;
			const count = elements.count;
			const sw = layer.unitWidth;
			const sh = layer.unitHeight;
			for (let i = 0; i < count; i++) {
				const element = elements[i];
				const ax = element.anchorX + 0.5;
				const ay = element.anchorY + 0.5;
				matrix
					.set(Particle.matrix)
					.translate(element.x, element.y)
					.rotate(element.rotationAngle)
					.scale(element.scaleFactor, element.scaleFactor)
					.translate(-ax * sw, -ay * sh);
				const R = sw;
				const B = sh;
				const a = matrix[0];
				const b = matrix[1];
				const c = matrix[3];
				const d = matrix[4];
				const e = matrix[6];
				const f = matrix[7];
				const x1 = e;
				const y1 = f;
				const x2 = c * B + e;
				const y2 = d * B + f;
				const x3 = a * R + c * B + e;
				const y3 = b * R + d * B + f;
				const x4 = a * R + e;
				const y4 = b * R + f;
				const angle1 = Math.atan2(y1 - y2, x1 - x2);
				const angle2 = Math.atan2(y2 - y3, x2 - x3);
				const angle3 = Math.atan2(y3 - y4, x3 - x4);
				const angle4 = Math.atan2(y4 - y1, x4 - x1);
				const ox1 = Math.cos(angle1) * 0.5;
				const oy1 = Math.sin(angle1) * 0.5;
				const ox2 = Math.cos(angle2) * 0.5;
				const oy2 = Math.sin(angle2) * 0.5;
				const ox3 = Math.cos(angle3) * 0.5;
				const oy3 = Math.sin(angle3) * 0.5;
				const ox4 = Math.cos(angle4) * 0.5;
				const oy4 = Math.sin(angle4) * 0.5;
				const bx1 = x1 + ox4 - ox1;
				const by1 = y1 + oy4 - oy1;
				const bx2 = x2 + ox1 - ox2;
				const by2 = y2 + oy1 - oy2;
				const bx3 = x3 + ox2 - ox3;
				const by3 = y3 + oy2 - oy3;
				const bx4 = x4 + ox3 - ox4;
				const by4 = y4 + oy3 - oy4;
				vertices[vi] = bx1;
				vertices[vi + 1] = by1;
				vertices[vi + 2] = bx2;
				vertices[vi + 3] = by2;
				vertices[vi + 4] = bx2;
				vertices[vi + 5] = by2;
				vertices[vi + 6] = bx3;
				vertices[vi + 7] = by3;
				vertices[vi + 8] = bx3;
				vertices[vi + 9] = by3;
				vertices[vi + 10] = bx4;
				vertices[vi + 11] = by4;
				vertices[vi + 12] = bx4;
				vertices[vi + 13] = by4;
				vertices[vi + 14] = bx1;
				vertices[vi + 15] = by1;
				vi += 16;
			}
		}
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		matrix.project(gl.flip, gl.width, gl.height);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 1, 1, 1);
		gl.drawArrays(gl.LINES, 0, vi / 2);
	}
};

Particle.drawElementAnchors = function () {
	if (!getParticleStore().showAnchor) return;
	const gl = GL;
	const vertices = gl.arrays[0].float32;
	const lines = gl.arrays[1].float32;
	const matrix = gl.matrix;
	let vi = 0;
	let li = 0;
	for (const layer of this.emitter.layers) {
		const elements = layer.elements;
		const count = elements.count;
		const sw = layer.unitWidth;
		const sh = layer.unitHeight;
		for (let i = 0; i < count; i++) {
			const element = elements[i];
			matrix.set(Particle.matrix).translate(element.x, element.y);
			const x = matrix[6];
			const y = matrix[7];
			vertices[vi] = x + 0.5 - 8;
			vertices[vi + 1] = y + 0.5;
			vertices[vi + 2] = x + 0.5 + 9;
			vertices[vi + 3] = y + 0.5;
			vertices[vi + 4] = x + 0.5;
			vertices[vi + 5] = y + 0.5 - 8;
			vertices[vi + 6] = x + 0.5;
			vertices[vi + 7] = y + 0.5 + 9;
			vi += 8;
			const ax = element.anchorX;
			const ay = element.anchorY;
			if (ax === 0 && ay === 0) {
				continue;
			}
			matrix
				.rotate(element.rotationAngle)
				.scale(element.scaleFactor, element.scaleFactor)
				.translate(-ax * sw, -ay * sh);
			const cx = matrix[6];
			const cy = matrix[7];
			lines[li] = x + 0.5;
			lines[li + 1] = y + 0.5;
			lines[li + 2] = cx + 0.5;
			lines[li + 3] = cy + 0.5;
			li += 4;
		}
	}
	if (vi !== 0) {
		const program = gl.graphicProgram.use();
		matrix.project(gl.flip, gl.width, gl.height);
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.LINES, 0, vi / 2);
		if (li !== 0) {
			gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STREAM_DRAW, 0, li);
			gl.vertexAttrib4f(program.a_Color, 0, 1, 0, 1);
			gl.drawArrays(gl.LINES, 0, li / 2);
		}
	}
};

Particle.computeOuterRect = function () {
	const emitter = this.emitter;
	const sx = emitter.startX;
	const sy = emitter.startY;
	const rect = emitter.calculateOuterRect();
	emitter.outerLeft = sx + rect.left;
	emitter.outerTop = sy + rect.top;
	emitter.outerRight = sx + rect.right;
	emitter.outerBottom = sy + rect.bottom;
	if (rect.hasArea) {
		this.requestRendering!();
	}
};

Particle.selectEmitter = function (x: number, y: number) {
	const emitter = this.emitter;
	if (
		x >= emitter.outerLeft &&
		y >= emitter.outerTop &&
		x < emitter.outerRight &&
		y < emitter.outerBottom
	) {
		return true;
	}
	return false;
};

Particle.requestAnimation = function () {
	if (getParticleStore().state === 'open' && !getParticleStore().paused) {
		Timer.appendUpdater!('stageAnimation', this.updateAnimation!);
	}
};

Particle.updateAnimation = function (deltaTime: number) {
	Particle.updateElements!(deltaTime);
	Particle.updateParticleInfo!();
	if (Timer.updaters.stageRendering !== Particle.renderingFunction) {
		Particle.renderingFunction!();
	}
};

Particle.stopAnimation = function () {
	Timer.removeUpdater!('stageAnimation', this.updateAnimation!);
};

Particle.requestRendering = function () {
	if (getParticleStore().state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction!);
	}
};

Particle.renderingFunction = function () {
	if (GL.width * GL.height !== 0) {
		Particle.drawBackground!();
		Particle.drawElements!();
		Particle.drawCoordinateAxes!();
		Particle.drawAreaWireframe!();
		Particle.drawElementWireframes!();
		Particle.drawElementAnchors!();
		Particle.drawEmitterWireframe!();
		Particle.drawEmitterAnchor!();
	}
};

Particle.stopRendering = function () {
	Timer.removeUpdater!('stageRendering', this.renderingFunction!);
};

Particle.switchWireframe = (function IIFE() {
	return function (this: ParticleShape, enabled: boolean = !getParticleStore().showWireframe) {
		const item = $('#particle-view-wireframe');
		if (enabled) {
			addClass(item, 'selected');
		} else {
			removeClass(item, 'selected');
		}
		getParticleStore().showWireframe = enabled;
		this.requestRendering!();
	};
})();

Particle.switchAnchor = (function IIFE() {
	return function (this: ParticleShape, enabled: boolean = !getParticleStore().showAnchor) {
		const item = $('#particle-view-anchor');
		if (enabled) {
			addClass(item, 'selected');
		} else {
			removeClass(item, 'selected');
		}
		getParticleStore().showAnchor = enabled;
		this.requestRendering!();
	};
})();

Particle.switchPause = (function IIFE() {
	return function (this: ParticleShape, enabled: boolean = !getParticleStore().paused) {
		const item = $('#particle-control-pause');
		getParticleStore().paused = enabled;
		if (enabled) {
			addClass(item, 'selected');
			this.stopAnimation!();
		} else {
			removeClass(item, 'selected');
			this.requestAnimation!();
		}
	};
})();

Particle.planToSave = function () {
	File.planToSave!(this.meta);
};

Particle.saveToConfig = function (config: ParticleConfigShape) {
	config.colors.particleBackground = this.background.hex;
};

Particle.loadFromConfig = function (config: ParticleConfigShape) {
	this.background = new StageColor(config.colors.particleBackground!, () =>
		this.requestRendering!()
	);
};

Particle.saveToProject = function (project: EditorProjectShape) {
	const { particle } = project;
	particle.wireframe = getParticleStore().showWireframe ?? particle.wireframe;
	particle.anchor = getParticleStore().showAnchor ?? particle.anchor;
	particle.speed = getParticleStore().speed ?? particle.speed;
	particle.zoom = getParticleStore().zoom ?? particle.zoom;
};

Particle.loadFromProject = function (project: EditorProjectShape) {
	const { particle } = project;
	this.switchWireframe!(particle.wireframe);
	this.switchAnchor!(particle.anchor);
	this.setSpeed!(particle.speed);
	this.setZoom!(particle.zoom);
};

Particle.webglRestored = function (event: Event) {
	if (getParticleStore().state === 'open') {
		Particle.requestRendering!();
	}
};

Particle.windowResize = function (this: ParticleShape, event: Event) {
	this.updateHead!();
	if (getParticleStore().state === 'open') {
		this.resize!();
		this.updateCamera!();
		this.requestRendering!();
	}
}.bind(Particle);

Particle.themechange = function (this: ParticleShape, event: Event) {
	this.requestRendering!();
}.bind(Particle);

Particle.datachange = function (event: Event) {
	if (getParticleStore().state === 'open' && event.key === 'easings') {
		Particle.emitter.updateEasing();
	}
};

Particle.keydown = function (event: KeyboardEvent) {
	if (getParticleStore().state === 'open' && Particle.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			return;
		} else {
			switch (event.code) {
				case 'KeyR':
					if (!Particle.restartKey) {
						Particle.restartKey = true;
						Particle.restart!();
						addClass($('#particle-control-restart'), 'selected');
						window.addEventListener('keyup', Particle.restartKeyup!);
						window.addEventListener('blur', Particle.restartKeyup!);
					}
					break;
				case 'KeyP':
					Particle.switchPause!();
					break;
			}
		}
	}
};

Particle.restartKeyup = function (event: KeyboardEvent) {
	if (!Particle.restartKey) {
		return;
	}
	switch (event.code) {
		case 'KeyR':
		case undefined:
			if (Particle.restartKey) {
				Particle.restartKey = false;
				removeClass($('#particle-control-restart'), 'selected');
				window.removeEventListener('keyup', Particle.restartKeyup!);
				window.removeEventListener('blur', Particle.restartKeyup!);
			}
			break;
	}
};

Particle.headPointerdown = function (event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== Particle.screen) {
			Particle.screen.focus();
		}
	}
};

Particle.viewPointerdown = function (event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'wireframe':
						return Particle.switchWireframe!();
					case 'anchor':
						return Particle.switchAnchor!();
				}
			}
			break;
		}
	}
};

Particle.controlPointerdown = function (event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'restart':
						return Particle.restart!();
					case 'pause':
						return Particle.switchPause!();
				}
			}
			break;
		}
	}
};

Particle.speedInput = function (this: HTMLElement, event: Event) {
	getParticleStore().speed = read(this);
};

Particle.zoomFocus = function (event: Event) {
	Particle.screen.focus();
};

Particle.zoomInput = function (this: HTMLElement, event: Event) {
	Particle.setZoom!(read(this));
};

Particle.screenKeydown = function (this: ParticleShape, event: KeyboardEvent) {
	if (getParticleStore().state === 'open' && this.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		}
		if (event.altKey) {
			return;
		}
		switch (event.code) {
			case 'Minus':
			case 'NumpadSubtract':
				this.setZoom!(getParticleStore().zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				this.setZoom!(getParticleStore().zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				this.setZoom!(2);
				break;
		}
	}
}.bind(Particle);

Particle.screenWheel = function (this: ParticleShape, event: WheelEvent) {
	if (getParticleStore().state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom!(getParticleStore().zoom! + step);
		}
	}
}.bind(Particle);

Particle.screenUserscroll = function (this: ParticleShape, event: Event) {
	if (getParticleStore().state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft;
		this.screen.rawScrollTop = this.screen.scrollTop;
		this.updateTransform!();
		this.requestRendering!();
	}
}.bind(Particle);

Particle.screenBlur = function (this: ParticleShape, event: Event) {
	// this.translationKeyup() this.pointerup()
	this.marqueePointerleave!();
}.bind(Particle);

Particle.marqueePointerdown = function (
	this: ParticleShape,
	event: PointerEvent & { dragKey?: boolean; startX?: number; startY?: number; enabled?: boolean }
) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (!event.dragKey) {
				const { emitter } = this;
				if (emitter.active) {
					emitter.selected = true;
					if (getParticleStore().paused) break;
					this.dragging = event;
					event.mode = 'object-move';
					event.enabled = false;
					event.startX = emitter.startX;
					event.startY = emitter.startY;
					window.addEventListener('pointerup', this.pointerup!);
					window.addEventListener('pointermove', this.pointermove!);
				} else {
					emitter.selected = false;
				}
				this.requestRendering!();
				break;
			}
		case 2:
			this.dragging = event;
			event.mode = 'scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			Cursor.open('cursor-grab');
			window.addEventListener('pointerup', this.pointerup!);
			window.addEventListener('pointermove', this.pointermove!);
			break;
	}
}.bind(Particle);

Particle.marqueePointermove = function (this: ParticleShape, event: PointerEvent) {
	if (!this.dragging) {
		this.marquee.pointerevent = event;
		const { x, y } = this.getPointerCoords!(event);
		const active = this.selectEmitter!(x, y);
		if (this.emitter.active !== active) {
			this.emitter.active = active;
			this.requestRendering!();
		}
	}
}.bind(Particle);

Particle.marqueePointerleave = function (this: ParticleShape, event: PointerEvent) {
	if (this.marquee.pointerevent) {
		this.marquee.pointerevent = null;
		if (this.emitter?.active) {
			this.emitter.active = false;
			this.requestRendering!();
		}
	}
}.bind(Particle);

Particle.pointerup = function (event: PointerEvent | undefined) {
	const { dragging } = Particle;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-move':
				break;
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		Particle.dragging = null;
		window.removeEventListener('pointerup', Particle.pointerup!);
		window.removeEventListener('pointermove', Particle.pointermove!);
	}
};

Particle.pointermove = function (event: PointerEvent) {
	const { dragging } = Particle;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-move': {
				if (!dragging.enabled) {
					const distX = event.clientX - dragging.clientX;
					const distY = event.clientY - dragging.clientY;
					if (
						Math.sqrt(distX ** 2 + distY ** 2) > 4 ||
						event.timeStamp - dragging.timeStamp >= 500
					) {
						dragging.enabled = true;
					} else {
						break;
					}
				}
				const emitter = Particle.emitter;
				const dpr = window.devicePixelRatio;
				const distX =
					((event.clientX - dragging.clientX) * dpr) / getParticleStore().scaleX!;
				const distY =
					((event.clientY - dragging.clientY) * dpr) / getParticleStore().scaleY!;
				const x = Math.round(dragging.startX! + distX);
				const y = Math.round(dragging.startY! + distY);
				if (emitter.startX !== x || emitter.startY !== y) {
					emitter.startX = x;
					emitter.startY = y;
					Particle.computeOuterRect!();
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				Particle.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
		}
	}
};

Particle.listKeydown = function (this: ParticleShape['list'], event: KeyboardEvent) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				this.copy(item);
				this.delete(item);
				break;
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else {
		switch (event.code) {
			case 'Delete':
				this.delete(item);
				break;
			case 'Escape':
				Particle.setTarget!(null);
				break;
		}
	}
};

Particle.listSelect = function (event: Event) {
	Particle.setTarget!(event.value);
};

Particle.listRecord = function (event: Event) {
	const response = event.value;
	switch (response.type) {
		case 'rename': {
			const editor = Inspector.particleLayer;
			const input = editor.nameBox;
			const { item, oldValue, newValue } = response;
			write(input, newValue);
			Particle.updateParticleInfo!();
			Particle.requestRendering!();
			Particle.history!.save({
				type: 'inspector-change',
				editor: editor,
				target: item,
				changes: [
					{
						input,
						oldValue,
						newValue
					}
				]
			});
			break;
		}
		case 'create':
			Particle.history!.save({
				type: 'particle-layer-create',
				response: response
			});
			break;
		case 'delete':
			Particle.history!.save({
				type: 'particle-layer-delete',
				response: response
			});
			break;
		case 'remove':
			Particle.history!.save({
				type: 'particle-layer-remove',
				response: response
			});
			break;
	}
};

Particle.listPopup = function (this: ParticleShape['list'], event: PointerEvent) {
	const item = event.value;
	const get = createGetter('menuParticleList');
	let copyable;
	let pastable;
	let deletable;
	let renamable;
	if (item) {
		copyable = true;
		pastable = (GlobalClipboard as unknown as GlobalClipboardHost).has('yami.particle.layer');
		deletable = true;
		renamable = true;
	} else {
		copyable = false;
		pastable = (GlobalClipboard as unknown as GlobalClipboardHost).has('yami.particle.layer');
		deletable = false;
		renamable = false;
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('insert'),
				click: () => {
					this.create(item);
				}
			},
			{
				type: 'separator'
			},
			{
				label: get('cut'),
				accelerator: ctrl('X'),
				enabled: copyable,
				click: () => {
					this.copy(item);
					this.delete(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: copyable,
				click: () => {
					this.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					this.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					this.delete(item);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: renamable,
				click: () => {
					this.rename(item);
				}
			}
		]
	);
};

Particle.listChange = function (event: Event) {
	Particle.planToSave!();
};

// 列表 - 创建
Particle.list.create = function (dItem) {
	this.addNodeTo(Inspector.particleLayer.create(), dItem);
};

// 列表 - 复制
Particle.list.copy = function (item) {
	if (item) {
		(GlobalClipboard as unknown as GlobalClipboardHost).write('yami.particle.layer', item);
	}
};

// 列表 - 粘贴
Particle.list.paste = function (dItem) {
	const copy = (GlobalClipboard as unknown as GlobalClipboardHost).read('yami.particle.layer');
	if (copy && this.data) {
		this.addNodeTo(copy, dItem);
	}
};

// 列表 - 删除
Particle.list.delete = function (item) {
	if (item) {
		this.deleteNode(item);
	}
};

// 列表 - 在创建数据时回调
getListConfig(Particle.list).onCreate = function () {
	Particle.emitter.updateLayers();
	Particle.computeOuterRect!();
	Particle.requestRendering!();
};

// 列表 - 在迁移数据时回调
getListConfig(Particle.list).onRemove = function () {
	Particle.emitter.updateLayers();
	Particle.requestRendering!();
};

// 列表 - 在删除数据时回调
getListConfig(Particle.list).onDelete = function () {
	Particle.updateTarget!();
	Particle.emitter.updateLayers();
	Particle.emitter.active = false;
	Particle.emitter.selected = false;
	Particle.computeOuterRect!();
	Particle.requestRendering!();
};

// 列表 - 在恢复数据时回调
getListConfig(Particle.list).onResume = function () {
	Particle.emitter.updateLayers();
	Particle.computeOuterRect!();
	Particle.requestRendering!();
};

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
		set: (value: any) => {
			(getParticleStore() as unknown as Record<string, any>)[key] = value;
		},
		configurable: true
	});
}
