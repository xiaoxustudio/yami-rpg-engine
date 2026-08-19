import { getListConfig } from '@ui-kit';
import { relate, getRelativeCoords } from '@app/utils/element-utils';
import { Window } from '@app/legacy/tools/window-object.ts';
import { $ } from '@app/utils/dom';
import {
	addScrollbars,
	dispatchChangeEvent,
	hasClass,
	show,
	hide,
	on,
	read,
	write,
	clear,
	rect
} from '@app/utils/element-utils.ts';
import { Timer } from '@app/utils/timer';
import { ctrl } from '@app/utils/event-accessors';
import { Inspector } from '@app/legacy/inspector/inspector.ts';

import { Reference } from '@app/legacy/log/related-references.ts';
import { Editor } from '@app/services/project/editor.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Cursor } from '@app/legacy/tools/pointer-object.ts';
import { UndoManager } from '@app/legacy/tools/undo-manager.ts';
import { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { Menu } from '@app/legacy/components/menu-list.ts';
import { TreeList } from '@app/legacy/components/tree-list.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Easing } from '@app/legacy/data/transition-window.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Particle } from '@app/legacy/particle/particle-window.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { EventBus } from '@app/legacy/module/eventbus.ts';
import { History } from '@app/legacy/tools/history.ts';
import { t, createGetter } from '@app/i18n';
import { StageColor } from '@app/utils/stage-color';
import { ImageTexture } from '@app/engine/webgl/image-texture.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import type { MenuItem } from '@ui-kit';
import type { GlobalClipboardHost } from '@app/legacy/types/global-clipboard.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { DynamicShape } from '@app/legacy/types/legacy-shapes.ts';

interface ControlPoint {
	x: number;
	y: number;
	angle: number;
}

interface UIControlPoints {
	rotate: Record<'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	resize: Record<'T' | 'L' | 'R' | 'B' | 'TL' | 'TR' | 'BL' | 'BR', ControlPoint>;
	list: ControlPoint[];
}

interface UIShape {
	page: HTMLElement;
	head: HTMLElement;
	body: HTMLElement;
	screen: HTMLElement & { rawScrollLeft: number; rawScrollTop: number };
	history: History;
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
	[k: string]: any;
}

type UINodeShape = { class: string; children: UINodeShape[]; [k: string]: any };

interface UIContextShape {
	meta: { guid: string; path: string };
	ui?: { width: number; height: number; nodes: UINodeShape[] } & Record<string, unknown>;
	editor?: {
		target: UINodeShape | null;
		root: UINodeShape | null;
		history: History;
		centerX: number;
		centerY: number;
	} & Record<string, unknown>;
	fontChanged?: boolean;
	languageChanged?: boolean;
	scalingChanged?: boolean;
	[k: string]: any;
}

type UIPointerEvent = PointerEvent & {
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

export const UI: UIShape = {
	page: $('#ui'),
	head: $('#ui-head'),
	body: hide($('#ui-body')),
	screen: $('#ui-screen') as HTMLElement & { rawScrollLeft: number; rawScrollTop: number },
	marquee: $('#ui-marquee') || {},
	searcher: $('#ui-searcher'),
	list: $('#ui-list') || {},
	dragging: null,
	hover: null,
	history: null as unknown as History,
	controlPoints: null,
	controlPointActive: null,
	controlPointRotation: null as unknown as number,
	translationKey: 0b0000,
	translationTimer: null,
	background: null as unknown as StageColor,
	foreground: null as unknown as StageColor,
	matrix: null as unknown as Matrix,
	zoomTimer: null,
	scale: null as unknown as number,
	scaleX: null as unknown as number,
	scaleY: null as unknown as number,
	outerWidth: null as unknown as number,
	outerHeight: null as unknown as number,
	scrollLeft: null as unknown as number,
	scrollTop: null as unknown as number,
	scrollRight: null as unknown as number,
	scrollBottom: null as unknown as number,
	centerX: null as unknown as number,
	centerY: null as unknown as number,
	centerOffsetX: null as unknown as number,
	centerOffsetY: null as unknown as number,
	padding: null as unknown as number,
	paddingLeft: null as unknown as number,
	paddingTop: null as unknown as number,
	inspectorTypeMap: null as unknown as Record<string, string>,
	context: null,
	meta: null,
	nodes: null,
	root: null,
	initialize: null,
	open: null,
	load: null,
	save: null,
	close: null,
	destroy: null,
	copy: null,
	paste: null,
	duplicate: null,
	create: null,
	createPrefab: null,
	delete: null,
	toggle: null,
	undo: null,
	redo: null,
	setZoom: null,
	setSize: null,
	setHover: null,
	setTarget: null,
	revealTarget: null,
	shiftAnchor: null,
	shiftTarget: null,
	resizeTarget: null,
	rotateTarget: null,
	setControlPoint: null,
	updateHover: null,
	updateTarget: null,
	updateTargetItem: null,
	updateElementFont: null,
	updateElementLanguage: null,
	updateElementTextScaling: null,
	updateIndexedColor: null,
	updateControlPoints: null,
	updateAllTexts: null,
	updateAllPrinters: null,
	updateAllReferences: null,
	updateElement: null,
	deleteElement: null,
	updateHead: null,
	resize: null,
	getPointerCoords: null,
	updateCamera: null,
	updateTransform: null,
	registerPreset: null,
	unregisterPreset: null,
	createPrefabItem: null,
	hasPrefab: null,
	setAsPrefab: null,
	unsetAsPrefab: null,
	clearInvalidPrefabs: null,
	createElement: null,
	loadElement: null,
	drawBackground: null,
	drawElements: null,
	drawCoordinateAxes: null,
	drawHoverWireframe: null,
	drawTargetWireframe: null,
	drawTargetAnchor: null,
	drawControlPoints: null,
	selectControlPoint: null,
	selectObject: null,
	requestRendering: null,
	renderingFunction: null,
	stopRendering: null,
	switchSettings: null,
	planToSave: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	webglRestored: null,
	windowResize: null,
	themechange: null,
	localizationchange: null,
	keydown: null,
	headPointerdown: null,
	switchPointerdown: null,
	shortcutPointerdown: null,
	zoomFocus: null,
	zoomInput: null,
	screenKeydown: null,
	translationKeyup: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	marqueeDoubleclick: null,
	pointerup: null,
	pointermove: null,
	menuPopup: null,
	searcherInput: null,
	listKeydown: null,
	listPointerdown: null,
	listSelect: null,
	listRecord: null,
	listPopup: null,
	listOpen: null,
	listRename: null,
	listChange: null,
	listPageResize: null,
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
	createShortcut: null
};

UI.marquee.resize = null;

UI.list.page = $('#ui-element');
UI.list.head = $('#ui-list-head');
UI.list.copy = null;
UI.list.paste = null;
UI.list.delete = null;
UI.list.toggle = null;
UI.list.cancelSearch = null;
EventBus.once('editor_loaded', () => {
	UI.list.restoreRecursiveStates = Scene.list.restoreRecursiveStates;
	UI.list.setRecursiveStates = Scene.list.setRecursiveStates;
	// Scene.list.* 真定义（scene-list.ts）在 editor_loaded 时才确定，提前赋值会固化拿 null
});
UI.list.updateHead = null;
getListConfig(UI.list).onCreate = null as unknown as (item: unknown) => void;
getListConfig(UI.list).onRemove = null as unknown as (item: unknown) => void;
getListConfig(UI.list).onDelete = null as unknown as (item: unknown) => void;
getListConfig(UI.list).onResume = null as unknown as (item: unknown) => void;

UI.initialize = function (this: UIShape) {
	this.page = $('#ui');
	this.head = $('#ui-head');
	this.body = hide($('#ui-body'));
	this.screen = $('#ui-screen') as HTMLElement & { rawScrollLeft: number; rawScrollTop: number };
	const oldMarquee = this.marquee;
	this.marquee = $('#ui-marquee');
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	this.searcher = $('#ui-searcher');
	const oldList = this.list;
	this.list = $('#ui-list');
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	this.list.page = $('#ui-element');
	this.list.head = $('#ui-list-head');
	this.screen && addScrollbars(this.screen);

	const points = {
		rotate: {
			TL: { x: 0, y: 0, angle: 225 },
			TR: { x: 0, y: 0, angle: 315 },
			BL: { x: 0, y: 0, angle: 135 },
			BR: { x: 0, y: 0, angle: 45 }
		},
		resize: {
			T: { x: 0, y: 0, angle: 270 },
			L: { x: 0, y: 0, angle: 180 },
			R: { x: 0, y: 0, angle: 0 },
			B: { x: 0, y: 0, angle: 90 },
			TL: { x: 0, y: 0, angle: 225 },
			TR: { x: 0, y: 0, angle: 315 },
			BL: { x: 0, y: 0, angle: 135 },
			BR: { x: 0, y: 0, angle: 45 }
		},
		list: null as unknown as { x: number; y: number; angle: number }[]
	};
	// 控制点按优先级从低到高排序
	points.list = [
		points.rotate.TL,
		points.rotate.TR,
		points.rotate.BL,
		points.rotate.BR,
		points.resize.T,
		points.resize.L,
		points.resize.R,
		points.resize.B,
		points.resize.TL,
		points.resize.TR,
		points.resize.BL,
		points.resize.BR
	];
	this.controlPoints = points;

	File.get!({
		local: 'Images/ui_control_point.png',
		type: 'image'
	}).then((image: { guid?: string; [k: string]: unknown }) => {
		if (!image) return;
		image.guid = 'ui:control-point';
		this.controlPointTexture = new ImageTexture(image);
		this.controlPointTexture.base.protected = true;
	});

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (timer: Timer) => {
			if (getUIStore().state === 'open' && this.dragging === null) {
				const key = this.translationKey;
				const step = (Timer.deltaTime * 1.5) / this.scale;
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
				const cx = Math.roundTo(this.centerX + x, 4);
				const cy = Math.roundTo(this.centerY + y, 4);
				this.updateCamera!(cx, cy);
				this.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering!();
					this.marquee.resize();
					this.screen.updateScrollbars();
				}
			} else {
				return false;
			}
		}
	});

	this.zoomTimer = new Timer({
		duration: 80,
		update: (timer: Timer) => {
			if (getUIStore().state === 'open') {
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

	this.inspectorTypeMap = {
		image: 'uiImage',
		text: 'uiText',
		textbox: 'uiTextBox',
		dialogbox: 'uiDialogBox',
		progressbar: 'uiProgressBar',
		button: 'uiButton',
		animation: 'uiAnimation',
		video: 'uiVideo',
		window: 'uiWindow',
		container: 'uiContainer',
		reference: 'uiReference'
	};

	this.searcher.addCloseButton();
	this.searcher.addKeydownFilter();

	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => this.nodes);

	History.processors['ui-object-create'] = (
		operation: string,
		data: { response: { item: UINodeShape } & Record<string, unknown> }
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['ui-object-delete'] = (
		operation: string,
		data: { response: { item: UINodeShape } & Record<string, unknown> }
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['ui-object-remove'] = (
		operation: string,
		data: { response: { item: UINodeShape } & Record<string, unknown> }
	) => {
		const { response } = data;
		const { item } = response;
		list.restore(operation, response);
		UI.updateElement!(item);
	};
	History.processors['ui-object-toggle'] = (
		operation: string,
		data: { item: UINodeShape; oldValue: boolean; newValue: boolean }
	) => {
		const { item, oldValue, newValue } = data;
		if (operation === 'undo') {
			item.enabled = oldValue;
		} else {
			item.enabled = newValue;
		}
		list.update();
		UI.planToSave!();
	};
	History.processors['ui-object-hidden'] = (
		operation: string,
		data: {
			item: UINodeShape;
			oldValues1: unknown[];
			oldValues2: unknown[];
			newValue: boolean;
		}
	) => {
		const { item, oldValues1, oldValues2, newValue } = data;
		const { instance } = item;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'hidden', oldValues1);
			list.restoreRecursiveStates(instance, 'visible', oldValues2);
		} else {
			list.setRecursiveStates(item, 'hidden', newValue);
			list.setRecursiveStates(instance, 'visible', !newValue);
		}
		list.update();
		UI.requestRendering!();
		UI.planToSave!();
	};
	History.processors['ui-object-locked'] = (
		operation: string,
		data: { item: UINodeShape; oldValues: unknown[]; newValue: boolean }
	) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'locked', oldValues);
		} else {
			list.setRecursiveStates(item, 'locked', newValue);
		}
		list.update();
		UI.planToSave!();
	};
	History.processors['ui-target-anchor'] = (
		operation: string,
		data: { editor: DynamicShape; target: UINodeShape; anchorX: number; anchorY: number }
	) => {
		const { editor, target, anchorX, anchorY } = data;
		const { instances, transform } = target;
		data.anchorX = transform.anchorX;
		data.anchorY = transform.anchorY;
		// transform.anchorX = anchorX transform.anchorY = anchorY
		instances.setProperty('transform-anchorX', anchorX);
		instances.setProperty('transform-anchorY', anchorY);
		if (editor.target === target) {
			write(editor, { anchorX, anchorY });
		}
		instances.resize();
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
	};
	History.processors['ui-target-shift'] = (
		operation: string,
		data: { editor: DynamicShape; target: UINodeShape; x: number; y: number }
	) => {
		const { editor, target, x, y } = data;
		const { instances, transform } = target;
		data.x = transform.x;
		data.y = transform.y;
		// transform.x = x transform.y = y
		instances.setProperty('transform-x', x);
		instances.setProperty('transform-y', y);
		if (editor.target === target) {
			write(editor, { x, y });
		}
		instances.resize();
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
	};
	History.processors['ui-target-resize'] = (
		operation: string,
		data: { editor: DynamicShape; target: UINodeShape; width: number; height: number }
	) => {
		const { editor, target, width, height } = data;
		const { instances, transform } = target;
		data.width = transform.width;
		data.height = transform.height;
		// transform.width = width transform.height = height
		instances.setProperty('transform-width', width);
		instances.setProperty('transform-height', height);
		if (editor.target === target) {
			write(editor, { width, height });
		}
		instances.resize();
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
	};
	History.processors['ui-target-rotate'] = (
		operation: string,
		data: { editor: DynamicShape; target: UINodeShape; rotation: number }
	) => {
		const { editor, target, rotation } = data;
		const { instances, transform } = target;
		data.rotation = transform.rotation;
		// transform.rotation = rotation
		instances.setProperty('transform-rotation', rotation);
		if (editor.target === target) {
			write(editor, { rotation });
		}
		instances.resize();
		UI.setTarget!(target);
		UI.requestRendering!();
		UI.planToSave!();
	};

	window.addEventListener('themechange', this.themechange);
	window.addEventListener('localizationchange', this.localizationchange);
	window.addEventListener('keydown', this.keydown);
	window.addEventListener('keydown', Reference.getKeydownListener!(list));
	on(this.page, 'resize', this.windowResize);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored);
	// head/toolbar/zoom/screen(keydown/wheel)/marquee(pointerdown/doubleclick) 经 Vue 模板转发（LayoutPanel @pointerdown/@input/@focus/@keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	on(this.marquee, 'pointermove', this.marqueePointermove);
	on(this.marquee, 'pointerleave', this.marqueePointerleave);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	// list select/record/popup/open 经 Vue 模板转发（LayoutPanel @select/@record/@popup/@open → UI.list*）
	// list change 经 Vue 模板转发（LayoutPanel @change → UI.listChange）
	on(list.page, 'resize', this.listPageResize);
};

UI.open = function (this: UIShape, context: UIContextShape) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();

	Particle.Element.stage = this;

	const { meta } = context;
	if (!context.ui) {
		context.ui = Data.ui[meta.guid];
	}
	if (context.ui) {
		getUIStore().state = 'open';
		this.context = context;
		this.meta = meta;
		show(this.body);
		this.load!(context);
		this.resize!();
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

UI.load = function (this: UIShape, context: UIContextShape) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		context.editor = {
			target: null,
			root: new UI.Root!(),
			history: new History(100),
			centerX: context.ui!.width / 2,
			centerY: context.ui!.height / 2
			// listScrollTop: 0,
		};
	}
	const { ui, editor } = context;

	getUIStore().width = ui!.width;
	getUIStore().height = ui!.height;
	this.nodes = ui!.nodes;

	this.root = editor!.root;
	this.history = editor!.history;
	this.centerX = editor!.centerX;
	this.centerY = editor!.centerY;

	if (firstLoad) {
		const nodes = this.nodes;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			this.loadElement!(nodes[i], this.root);
		}
	} else {
		this.updateAllReferences!();
	}

	this.list.update();
	// this.list.scrollTop = editor.listScrollTop

	this.setTarget!(editor!.target);

	if (this.context.fontChanged) {
		this.updateElementFont!();
	}

	if (this.context.languageChanged) {
		this.updateElementLanguage!();
	}

	if (this.context.scalingChanged) {
		this.updateElementTextScaling!();
	}

	UndoManager.setActive!(UI);
};

UI.save = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		const { ui, editor } = this.context;

		ui.width = getUIStore().width!;
		ui.height = getUIStore().height!;
		ui.nodes = this.nodes;

		editor.target = getUIStore().target;
		editor.root = this.root;
		editor.history = this.history;
		editor.centerX = this.centerX;
		editor.centerY = this.centerY;
		// editor.listScrollTop = this.list.scrollTop
	}
};

UI.close = function (this: UIShape) {
	if (getUIStore().state !== 'closed') {
		this.screen.blur();
		if (Inspector.type === 'fileUI') {
			Inspector.close!();
		}
		this.setTarget!(null);
		getUIStore().state = 'closed';
		this.context = null;
		this.meta = null;
		this.nodes = null;
		this.root = null;
		this.history = null as unknown as History;
		write(this.searcher, '');
		clear(this.list);
		hide(this.body);
		this.stopRendering!();
		UndoManager.setActive!(null);
	}
};

UI.destroy = function (this: UIShape, context: UIContextShape) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	// 销毁UI组件实例
	context.editor.root!.destroy();
	TreeList.deleteCaches!(
		context.ui!.nodes as unknown as Parameters<typeof TreeList.deleteCaches>[0]
	);
};

UI.copy = function (this: UIShape) {
	if (getUIStore().state === 'open' && getUIStore().target !== null) {
		this.list.copy(getUIStore().target);
	}
};

UI.paste = function (this: UIShape, x?: number, y?: number) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.centerX;
			y = this.centerY;
		}
		this.list.paste(null, (data: { transform: { x: number; y: number } }) => {
			const { transform } = data;
			transform.x = Math.round(x!);
			transform.x = 0;
			transform.y = Math.round(y!);
			transform.y = 0;
		});
	}
};

UI.duplicate = function (this: UIShape) {
	if (getUIStore().target) {
		this.list.duplicate(getUIStore().target);
	}
};

UI.create = function (this: UIShape, kind: string, x: number, y: number) {
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = Inspector[key];
	const node = editor.create();
	node.transform.x = x;
	node.transform.y = y;
	this.list.addNodeTo(node);
};

UI.createPrefab = function (
	this: UIShape,
	prefab: {
		name: string;
		presetId: string;
		transform: { x: number; y: number; [k: string]: unknown };
		[k: string]: unknown;
	},
	parent: UINodeShape | null,
	x?: number,
	y?: number
) {
	const reference = Inspector.uiReference.create!();
	reference.name = prefab.name;
	reference.prefabId = prefab.presetId;
	reference.synchronous = true;
	reference.transform = { ...prefab.transform };
	if (typeof x === 'number') {
		reference.transform.x = x;
		reference.transform.x2 = 0;
	}
	if (typeof y === 'number') {
		reference.transform.y = y;
		reference.transform.y2 = 0;
	}
	this.list.addNodeTo(reference, parent);
};

UI.createShortcut = function (this: UIShape, item: UINodeShape) {
	const reference = Inspector.uiReference.create!();
	reference.name = this.list.generateUniqueName(item);
	reference.prefabId = item.presetId;
	reference.synchronous = true;
	reference.transform = { ...item.transform };
	const index = item.parent.children.indexOf(item);
	const next = item.parent.children[index + 1];
	if (next) {
		this.list.addNodeTo(reference, next, true);
	} else {
		this.list.addNodeTo(reference, item.parent);
	}
};

UI.delete = function (this: UIShape) {
	if (getUIStore().state === 'open' && getUIStore().target !== null && this.dragging === null) {
		this.list.delete(getUIStore().target);
	}
};

UI.toggle = function (this: UIShape) {
	this.list.toggle(getUIStore().target);
};

UI.undo = function (this: UIShape) {
	if (getUIStore().state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo');
		this.marquee.resize();
	}
};

UI.redo = function (this: UIShape) {
	if (getUIStore().state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo');
		this.marquee.resize();
	}
};

UI.setSize = function (this: UIShape, width: number, height: number) {
	const currentWidth = getUIStore().width;
	if (currentWidth !== width) {
		this.centerX = (this.centerX * width) / currentWidth!;
		getUIStore().width = width;
	}
	const currentHeight = getUIStore().height;
	if (currentHeight !== height) {
		this.centerY = (this.centerY * height) / currentHeight!;
		getUIStore().height = height;
	}
	this.resize!();
	this.requestRendering!();
};

UI.setHover = function (this: UIShape, hover: UINodeShape | null) {
	if (this.hover !== hover) {
		this.hover = hover;
		this.requestRendering!();
	}
};

UI.setTarget = function (this: UIShape, target: UINodeShape | null) {
	if (getUIStore().target !== target) {
		getUIStore().target = target;
		this.updateTargetItem!();
		this.requestRendering!();
		if (target) {
			const map = this.inspectorTypeMap;
			const key = map[target.class];
			Inspector.open!(key, target);
		} else {
			Inspector.close!();
		}
	}
};

UI.revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer: Timer) => {
			const { target } = timer;
			if (target === getUIStore().target) {
				const easing = Easing.EasingMap.easeInOut;
				const time = easing.ease(timer.elapsed / timer.duration);
				const x = timer.startX * (1 - time) + timer.endX * time;
				const y = timer.startY * (1 - time) + timer.endY * time;
				const screen = UI.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				UI.updateCamera!(x, y);
				UI.updateTransform!();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					UI.requestRendering!();
					UI.marquee.resize();
					UI.screen.updateScrollbars();
				}
			} else {
				timer.target = null;
				return false;
			}
		},
		callback: (timer: Timer) => {
			timer.target = null;
		}
	});
	return function (this: UIShape) {
		const target = getUIStore().target;
		if (target && !timer.target) {
			const instance = target.instance;
			const matrix = instance.matrix;
			const L = instance.x;
			const T = instance.y;
			const R = L + instance.width;
			const B = T + instance.height;
			const a = matrix[0];
			const b = matrix[1];
			const c = matrix[3];
			const d = matrix[4];
			const e = matrix[6];
			const f = matrix[7];
			const x1 = a * L + c * T + e;
			const y1 = b * L + d * T + f;
			const x2 = a * L + c * B + e;
			const y2 = b * L + d * B + f;
			const x3 = a * R + c * B + e;
			const y3 = b * R + d * B + f;
			const x4 = a * R + c * T + e;
			const y4 = b * R + d * T + f;
			const x = (x1 + x2 + x3 + x4) / 4;
			const y = (y1 + y2 + y3 + y4) / 4;
			const toleranceX = 0.5 / this.scaleX;
			const toleranceY = 0.5 / this.scaleY;
			const { centerX, centerY } = this;
			// 目标和摄像机的位置不一定相等
			if (Math.abs(x - centerX) > toleranceX || Math.abs(y - centerY) > toleranceY) {
				timer.target = target;
				timer.startX = centerX;
				timer.startY = centerY;
				timer.endX = x;
				timer.endY = y;
				timer.elapsed = 0;
				timer.add();
			}
		}
	};
})();

UI.updateHover = function (this: UIShape) {
	if (this.hover && !this.hover.instance) {
		this.setHover!(null);
	}
};

UI.updateTarget = function (this: UIShape) {
	const item = read(this.list);
	if (item !== getUIStore().target) {
		this.setTarget!(item);
	}
};

UI.updateTargetItem = function (this: UIShape) {
	const { target } = this;
	if (target !== null) {
		const { list } = this;
		if (read(list) !== target) {
			list.selectWithNoEvent(target);
			if (target) {
				list.expandToSelection();
				list.scrollToSelection();
			}
		}
	}
};

UI.updateElementFont = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context.fontChanged) {
			delete this.context.fontChanged;
		}
		const update = (element: UINodeShape) => {
			if (
				element instanceof UI.Text ||
				element instanceof UI.TextBox ||
				element instanceof UI.DialogBox ||
				element instanceof UI.Button
			) {
				let el = element;
				if (el instanceof UI.Button) {
					el = el.shadowText;
				}
				if (el.printer !== null) {
					el.printer.reset();
					if (el._font === '') {
						el._font = undefined;
						el.font = '';
					}
					this.requestRendering!();
				}
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		update(this.root);
	}
};

UI.updateElementLanguage = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context.languageChanged) {
			delete this.context.languageChanged;
		}
		const update = (elements: UINodeShape[]) => {
			for (const element of elements) {
				element.updateTextContent?.();
				update(element.children);
			}
		};
		update(this.root.children);
		this.requestRendering!();
	}
};

UI.updateElementTextScaling = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		if (this.context.scalingChanged) {
			delete this.context.scalingChanged;
		}
		const update = (elements: UINodeShape[]): void => {
			for (const element of elements) {
				element.updatePrinter?.();
				update(element.children);
			}
		};
		update(this.root.children);
		this.requestRendering!();
	}
};

UI.updateIndexedColor = function (this: UIShape, index: number) {
	if (getUIStore().state === 'open') {
		const TextElement = UI.Text;
		const regexp = new RegExp(`<color:${index}>`, 'i');
		const update = (element: UINodeShape): void => {
			if (element instanceof TextElement && regexp.test(element.content)) {
				element.printer.reset();
				this.requestRendering!();
			}
			const children = element.children;
			const length = children.length;
			for (let i = 0; i < length; i++) {
				update(children[i]);
			}
		};
		update(this.root);
	}
};

UI.updateAllTexts = function (this: UIShape) {
	if (!Title.tabBar.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.languageChanged = true;
		}
	}
	this.updateElementLanguage!();
};

UI.updateAllPrinters = function (this: UIShape) {
	if (!Title.tabBar.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.scalingChanged = true;
		}
	}
	this.updateElementTextScaling!();
};

UI.updateAllReferences = function (this: UIShape) {
	if (getUIStore().state === 'open') {
		const update = (elements: UINodeShape[]): void => {
			for (const element of elements) {
				if (element instanceof UI.Reference) {
					element.update();
				} else {
					update(element.children);
				}
			}
		};
		update(this.root.children);
	}
};

UI.updateElement = function (this: UIShape, target: UINodeShape) {
	let nodes;
	let instance;
	if (this.nodes.includes(target)) {
		nodes = this.nodes;
		instance = this.root;
	} else {
		const find = (node: UINodeShape): UINodeShape | null => {
			const children = node.children;
			if (children.includes(target)) {
				return node;
			}
			for (const child of children) {
				const result = find(child);
				if (result) {
					return result;
				}
			}
			return null;
		};
		const node = find({
			instance: this.root,
			children: this.nodes
		} as unknown as UINodeShape);
		if (node) {
			nodes = node.children;
			instance = node.instance;
		}
	}
	if (instance) {
		instance.appendChildTo(target.instance, nodes.indexOf(target));
	}
	this.requestRendering!();
};

UI.deleteElement = function (this: UIShape, target: UINodeShape) {
	target.instance.remove();
	target.instance.destroy();
};

UI.updateHead = function (this: UIShape) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement!(head)!;
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
		// 调整居中组件的位置 const width = nRect.right - iRect.right if (head.width !== width) { head.width = width const [start, center, end] = head.children end.style.marginLeft = '0' const sRect = start.rect() const cRect = center.rect() const eRect = end.rect() const spacing = eRect.left - sRect.right - cRect.width const difference = sRect.right - nRect.left - eRect.width const margin = Math.min(spacing, difference) end.style.marginLeft = `${margin}px` }
	}
};

UI.resize = function (this: UIShape) {
	if (getUIStore().state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const width = getUIStore().width!;
		const height = getUIStore().height!;
		const scaledPadding = Math.round(this.padding * scale);
		const innerWidth = Math.round((width * scale) / 2) * 2;
		const innerHeight = Math.round((height * scale) / 2) * 2;
		const screenBox = CSS.getDevicePixelContentBoxSize(this.screen);
		const screenWidth = screenBox.width;
		const screenHeight = screenBox.height;
		const paddingLeft = Math.max((screenWidth - innerWidth) >> 1, scaledPadding);
		const paddingTop = Math.max((screenHeight - innerHeight) >> 1, scaledPadding);
		const paddingRight = Math.max(screenWidth - innerWidth - paddingLeft, scaledPadding);
		const paddingBottom = Math.max(screenHeight - innerHeight - paddingTop, scaledPadding);
		const outerWidth = innerWidth + paddingLeft + paddingRight;
		const outerHeight = innerHeight + paddingTop + paddingBottom;
		const dpr = window.devicePixelRatio;
		this.scaleX = innerWidth / width;
		this.scaleY = innerHeight / height;
		this.outerWidth = outerWidth;
		this.outerHeight = outerHeight;
		this.centerOffsetX =
			outerWidth > screenWidth ? screenWidth / 2 : paddingLeft + innerWidth / 2;
		this.centerOffsetY =
			outerHeight > screenHeight ? screenHeight / 2 : paddingTop + innerHeight / 2;
		this.paddingLeft = paddingLeft;
		this.paddingTop = paddingTop;
		this.marquee.style.width = `${outerWidth / dpr}px`;
		this.marquee.style.height = `${outerHeight / dpr}px`;
		GL.resize!(screenWidth, screenHeight);
		this.updateCamera!();
		this.updateTransform!();
		this.root.resize();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};

UI.registerPreset = (function IIFE() {
	const generatePresetId = () => {
		const { uiPresets } = Data;
		let id: string;
		do {
			id = GUID.generate64bit();
		} while (id in uiPresets);
		return id;
	};
	const registerPreset = (node: UINodeShape) => {
		const { uiPresets } = Data;
		// 新元素或元素ID冲突，生成新ID
		if (node.presetId === '' || node.presetId in uiPresets) {
			node.presetId = generatePresetId();
		}
		uiPresets[node.presetId] = {
			uiId: UI.meta.guid,
			data: node
		};
		for (const child of node.children) {
			registerPreset(child);
		}
	};
	return function (this: UIShape, node: UINodeShape) {
		registerPreset(node);
	};
})();

UI.unregisterPreset = function (this: UIShape, node: UINodeShape) {
	delete Data.uiPresets[node.presetId];
	for (const child of node.children) {
		UI.unregisterPreset!(child);
	}
};

UI.createPrefabItem = function (
	this: UIShape,
	parent?: UINodeShape | null,
	x?: number,
	y?: number
) {
	const uiPrefabs = Editor.project!.uiPrefabs!;
	const items: Array<{ label: string; data: UINodeShape; click: () => void }> = [];
	if (uiPrefabs.length !== 0) {
		const click = function (this: { data: UINodeShape }) {
			UI.createPrefab!(this.data, parent, x, y);
		};
		const map = Data.uiPresets;
		for (const guid of uiPrefabs) {
			const preset = map[guid];
			if (preset !== undefined) {
				items.push({
					label: preset.data.name,
					data: preset.data,
					click: click
				});
			}
		}
	}
	return {
		label: t('menuUIList.create.prefab'),
		enabled: items.length !== 0,
		submenu: items.sort((a, b) => a.label.localeCompare(b.label))
	};
};

UI.hasPrefab = function (this: UIShape, node: UINodeShape) {
	return Editor.project!.uiPrefabs!.includes(node.presetId);
};

UI.setAsPrefab = function (this: UIShape, node: UINodeShape) {
	if (Editor.project!.uiPrefabs!.push(node.presetId)) {
		UI.list.update();
	}
};

UI.unsetAsPrefab = function (this: UIShape, node: UINodeShape) {
	if (Editor.project!.uiPrefabs!.splice(Editor.project!.uiPrefabs!.indexOf(node.presetId), 1)) {
		UI.list.update();
	}
};

UI.clearInvalidPrefabs = function (this: UIShape, uiPrefabs: string[]) {
	let i = uiPrefabs.length;
	while (--i >= 0) {
		const guid = uiPrefabs[i];
		if (!Data.uiPresets[guid]) {
			uiPrefabs.splice(i, 1);
		}
	}
};

UI.createElement = function (this: UIShape, node: UINodeShape, main?: boolean) {
	let instance;
	switch (node.class) {
		case 'image':
			instance = new UI.Image!(node);
			break;
		case 'text':
			instance = new UI.Text!(node);
			break;
		case 'textbox':
			instance = new UI.TextBox!(node);
			break;
		case 'dialogbox':
			instance = new UI.DialogBox!(node);
			break;
		case 'progressbar':
			instance = new UI.ProgressBar!(node);
			break;
		case 'button':
			instance = new UI.Button!(node);
			break;
		case 'animation':
			instance = new UI.Animation!(node);
			break;
		case 'video':
			instance = new UI.Video!(node);
			break;
		case 'window':
			instance = new UI.Window!(node);
			break;
		case 'container':
			instance = new UI.Container!(node);
			break;
		case 'reference':
			instance = new UI.Reference!(node);
			break;
	}
	instance.node = node;
	if (main) {
		Object.defineProperty(node, 'instance', {
			configurable: true,
			value: instance
		});
	}
	if (!node.instances) {
		Object.defineProperty(node, 'instances', {
			configurable: true,
			value: new UIInstanceList()
		});
	}
	node.instances.push(instance);
	return instance;
};

UI.loadElement = function (this: UIShape, node: UINodeShape, parent?: UINodeShape) {
	const instance = this.createElement!(node, true);
	if (parent !== undefined) {
		parent.appendChild(instance);
	}
	for (const child of node.children) {
		UI.loadElement!(child, instance);
	}
};

UI.selectObject = (function IIFE() {
	const find = (elements: UINodeShape[], x: number, y: number): UINodeShape | null => {
		const length = elements.length;
		for (let i = length - 1; i >= 0; i--) {
			const element = elements[i];
			const target = find(element.children, x, y);
			if (target) return target;
			if (
				element.visible &&
				element.node.instance === element &&
				!element.node.locked &&
				element.isPointIn(x, y)
			) {
				return element.node;
			}
		}
		return null;
	};
	return function (this: UIShape, x: number, y: number) {
		return find(this.root.children, x, y);
	};
})();

UI.switchSettings = function (this: UIShape) {
	if (!hasClass(Inspector.fileUI.button, 'selected')) {
		Inspector.open!('fileUI', UI);
	} else {
		Inspector.close!();
	}
};

UI.planToSave = function (this: UIShape) {
	File.planToSave!(this.meta);
};

UI.saveToConfig = function (this: UIShape, config: { colors: Record<string, string> }) {
	config.colors.uiBackground = this.background.hex;
	config.colors.uiForeground = this.foreground.hex;
};

UI.loadFromConfig = function (this: UIShape, config: { colors: Record<string, string> }) {
	this.background = new StageColor(config.colors.uiBackground, () => this.requestRendering!());
	this.foreground = new StageColor(config.colors.uiForeground, () => {
		if (getUIStore().state === 'open') {
			this.root.resize();
			this.requestRendering!();
		}
	});
};

UI.saveToProject = function (
	this: UIShape,
	project: { ui: { zoom?: number } & Record<string, unknown>; uiPrefabs?: string[] }
) {
	const { ui, uiPrefabs } = project;
	ui.zoom = getUIStore().zoom ?? ui.zoom;
	UI.clearInvalidPrefabs!(uiPrefabs ?? []);
};

UI.loadFromProject = function (this: UIShape, project: { ui: { zoom: number } }) {
	const { ui } = project;
	this.setZoom!(ui.zoom);
};

UI.webglRestored = function (this: UIShape, event: Event) {
	if (getUIStore().state === 'open') {
		UI.requestRendering!();
	}
};

UI.windowResize = function (this: UIShape, event: Event) {
	this.updateHead!();
	if (getUIStore().state === 'open') {
		this.resize!();
		this.updateCamera!();
		this.requestRendering!();
	}
}.bind(UI);

UI.themechange = function (this: UIShape, event: Event) {
	this.requestRendering!();
}.bind(UI);

UI.localizationchange = function (this: UIShape, event: Event) {
	this.updateAllTexts!();
}.bind(UI);

UI.keydown = function (this: UIShape, event: KeyboardEvent) {
	if (getUIStore().state === 'open' && UI.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			return;
		} else if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					UI.switchSettings!();
					break;
			}
		} else {
			return;
		}
	}
};

UI.headPointerdown = function (this: UIShape, event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== UI.screen) {
			UI.screen.focus();
		}
	}
};

UI.switchPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				switch (element.getAttribute('value')) {
					case 'settings':
						return UI.switchSettings!();
				}
			}
			break;
		}
	}
};

UI.shortcutPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'item')) {
				UI.create!(element.getAttribute('value'), 0, 0);
			}
			break;
		}
	}
};

UI.zoomFocus = function (this: UIShape, event: Event) {
	UI.screen.focus();
};

UI.zoomInput = function (this: UIShape, event: Event & { value?: number }) {
	UI.setZoom!(read(this));
};

UI.screenKeydown = function (this: UIShape, event: KeyboardEvent) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		if (event.ctrlKey || event.metaKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy!();
					this.delete!();
					return;
				case 'KeyC':
					this.copy!();
					return;
				case 'KeyV':
					this.paste!();
					return;
				case 'KeyD':
					this.duplicate!();
					return;
				case 'ArrowLeft':
				case 'ArrowUp':
				case 'ArrowRight':
				case 'ArrowDown':
					break;
				default:
					return;
			}
		}
		if (event.altKey) {
			return;
		}
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				this.revealTarget!();
				break;
			case 'Slash':
				this.toggle!();
				break;
			case 'Delete':
				this.delete!();
				break;
			case 'Escape':
				this.setTarget!(null);
				break;
			case 'KeyA':
				if ((this.translationKey & 0b0001) === 0) {
					this.translationKey |= 0b0001;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyW':
				if ((this.translationKey & 0b0010) === 0) {
					this.translationKey |= 0b0010;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyD':
				if ((this.translationKey & 0b0100) === 0) {
					this.translationKey |= 0b0100;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'KeyS':
				if ((this.translationKey & 0b1000) === 0) {
					this.translationKey |= 0b1000;
					this.translationTimer!.add();
					this.screen.beginScrolling();
					window.addEventListener('keyup', this.translationKeyup);
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				if (getUIStore().target !== null) {
					event.preventDefault();
					const transform = getUIStore().target!.transform;
					let offsetX = 0;
					let offsetY = 0;
					switch (event.code) {
						case 'ArrowLeft':
							offsetX = -1;
							break;
						case 'ArrowUp':
							offsetY = -1;
							break;
						case 'ArrowRight':
							offsetX = +1;
							break;
						case 'ArrowDown':
							offsetY = +1;
							break;
					}
					if (event.ctrlKey || event.metaKey) {
						const ax = Math.roundTo(transform.anchorX - offsetX * 0.5, 4);
						const ay = Math.roundTo(transform.anchorY - offsetY * 0.5, 4);
						return this.shiftAnchor!(ax, ay);
					}
					if (event.shiftKey) {
						offsetX *= 10;
						offsetY *= 10;
					}
					const x = Math.roundTo(transform.x + offsetX, 4);
					const y = Math.roundTo(transform.y + offsetY, 4);
					this.shiftTarget!(x, y);
				}
				break;
			case 'Minus':
			case 'NumpadSubtract':
				this.setZoom!(getUIStore().zoom! - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				this.setZoom!(getUIStore().zoom! + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				this.setZoom!(2);
				break;
		}
	}
}.bind(UI);

UI.translationKeyup = function (this: UIShape, event?: KeyboardEvent) {
	if (this.translationKey === 0b0000) {
		return;
	}
	if (event === undefined) {
		this.translationKey = 0b0000;
	} else {
		switch (event.code) {
			case 'KeyA':
				this.translationKey &= 0b1110;
				break;
			case 'KeyW':
				this.translationKey &= 0b1101;
				break;
			case 'KeyD':
				this.translationKey &= 0b1011;
				break;
			case 'KeyS':
				this.translationKey &= 0b0111;
				break;
		}
	}
	if (this.translationKey === 0b0000) {
		this.translationTimer!.remove();
		this.screen.endScrolling();
		window.removeEventListener('keyup', this.translationKeyup);
	}
}.bind(UI);

UI.screenWheel = function (this: UIShape, event: WheelEvent) {
	if (getUIStore().state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom!(getUIStore().zoom! + step);
		}
	}
}.bind(UI);

UI.screenUserscroll = function (this: UIShape, event: Event) {
	if (getUIStore().state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft;
		this.screen.rawScrollTop = this.screen.scrollTop;
		this.updateTransform!();
		this.requestRendering!();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
}.bind(UI);

UI.screenBlur = function (this: UIShape, event: FocusEvent) {
	this.translationKeyup!();
	this.pointerup!();
	// this.marqueePointerleave!()
}.bind(UI);

UI.marqueePointerdown = function (this: UIShape, event: UIPointerEvent) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0: {
			if (event.dragKey) {
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.screen.scrollLeft;
				event.scrollTop = this.screen.scrollTop;
				Cursor.open!('cursor-grab');
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const target = getUIStore().target;
			if (this.controlPointActive && target) {
				const { transform } = target;
				const points = this.controlPoints!;
				this.dragging = event;
				switch (this.controlPointActive) {
					case points.rotate.TL:
					case points.rotate.TR:
					case points.rotate.BL:
					case points.rotate.BR: {
						const { instance } = target;
						const matrix = Matrix.instance.set(UI.matrix).multiply(instance.matrix);
						const X = instance.x + instance.width * transform.anchorX;
						const Y = instance.y + instance.height * transform.anchorY;
						const a = matrix[0];
						const b = matrix[1];
						const c = matrix[3];
						const d = matrix[4];
						const e = matrix[6];
						const f = matrix[7];
						const ax = a * X + c * Y + e;
						const ay = b * X + d * Y + f;
						const { x, y } = getRelativeCoords(event, GL.canvas);
						const dpr = window.devicePixelRatio;
						event.mode = 'object-rotate';
						event.absoluteAnchorX = ax;
						event.absoluteAnchorY = ay;
						event.lastAngle = Math.atan2(y * dpr - ay, x * dpr - ax);
						event.rotationRadians = 0;
						event.startRotation = transform.rotation;
						break;
					}
					case points.resize.T:
					case points.resize.L:
					case points.resize.R:
					case points.resize.B:
					case points.resize.TL:
					case points.resize.TR:
					case points.resize.BL:
					case points.resize.BR:
						event.mode = 'object-resize';
						event.startWidth = transform.width;
						event.startHeight = transform.height;
						break;
				}
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				return;
			}
			const { x, y } = this.getPointerCoords!(event);
			let object;
			if ((event.ctrlKey || event.metaKey) && getUIStore().target) {
				object = getUIStore().target;
			}
			if (object === undefined) {
				object = this.selectObject!(x, y);
			}
			if (object) {
				this.dragging = event;
				event.mode = 'object-move';
				event.node = object;
				event.enabled = false;
				event.startX = object.transform.x;
				event.startY = object.transform.y;
				window.addEventListener('pointerup', this.pointerup);
				window.addEventListener('pointermove', this.pointermove);
				this.requestRendering!();
			}
			this.setTarget!(object);
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'ready-to-scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			window.addEventListener('pointerup', this.pointerup);
			window.addEventListener('pointermove', this.pointermove);
			break;
	}
}.bind(UI);

UI.marqueePointermove = function (this: UIShape, event: UIPointerEvent) {
	if (!this.dragging) {
		this.marquee.pointerevent = event;
		const { x, y } = this.getPointerCoords!(event);
		if (getUIStore().target) {
			const point = this.selectControlPoint!(x, y);
			if (point) {
				this.setHover!(null);
				this.setControlPoint!(point);
				return;
			}
		}
		if (this.controlPointActive) {
			this.setControlPoint!(null);
		}
		const object = this.selectObject!(x, y);
		this.setHover!(object);
	}
}.bind(UI);

UI.marqueePointerleave = function (this: UIShape, event: UIPointerEvent) {
	if (this.marquee.pointerevent) {
		this.marquee.pointerevent = null;
		this.setHover!(null);
	}
}.bind(UI);

UI.marqueeDoubleclick = function (this: UIShape, event: UIPointerEvent) {
	if (getUIStore().target) {
		this.screenBlur!();
		this.revealTarget!();
	}
}.bind(UI);

UI.pointerup = function (this: UIShape, event?: UIPointerEvent) {
	const { dragging } = this;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'object-rotate':
			case 'object-resize':
				break;
			case 'object-move':
				this.requestRendering!();
				break;
			case 'ready-to-scroll':
				if (event!.target === this.marquee) {
					const { x, y } = this.getPointerCoords!(event!);
					const object = this.selectObject!(x, y);
					this.setTarget!(object);
					this.menuPopup!(event!);
				}
				break;
			case 'scroll':
				this.screen.endScrolling();
				Cursor.close!('cursor-grab');
				break;
		}
		this.dragging = null;
		window.removeEventListener('pointerup', this.pointerup);
		window.removeEventListener('pointermove', this.pointermove);
	}
}.bind(UI);

UI.pointermove = function (this: UIShape, event: UIPointerEvent) {
	const { dragging } = this;
	if (dragging && relate(dragging, event)) {
		const dpr = window.devicePixelRatio;
		switch (dragging.mode) {
			case 'object-rotate': {
				const target = getUIStore().target;
				if (target) {
					const { x, y } = getRelativeCoords(event, GL.canvas);
					const distX = x * dpr - dragging.absoluteAnchorX;
					const distY = y * dpr - dragging.absoluteAnchorY;
					const currentAngle = Math.atan2(distY, distX);
					const angle = Math.modRadians(currentAngle - dragging.lastAngle);
					dragging.rotationRadians += angle < Math.PI ? angle : angle - Math.PI * 2;
					let rotation = Math.round(
						dragging.startRotation + Math.degrees(dragging.rotationRadians)
					);
					if (event.shiftKey) {
						rotation = Math.round(rotation / 15) * 15;
					}
					const transform = target.transform;
					if (transform.rotation !== rotation) {
						this.rotateTarget!(rotation);
					}
					dragging.lastAngle = currentAngle;
				}
				break;
			}
			case 'object-resize': {
				const target = getUIStore().target;
				if (target) {
					const { instance } = target;
					const { parent, transform } = instance;
					const points = this.controlPoints!;
					const point = this.controlPointActive!;
					const angle = Math.radians(point.angle + this.controlPointRotation);
					const distX = ((event.clientX - dragging.clientX) * dpr) / this.scaleX;
					const distY = ((event.clientY - dragging.clientY) * dpr) / this.scaleY;
					const dist = Math.sqrt(distX ** 2 + distY ** 2);
					const distAngle = Math.atan2(distY, distX);
					const scaleX = Math.abs(transform.scaleX) || 1;
					const scaleY = Math.abs(transform.scaleY) || 1;
					let width = undefined;
					let height = undefined;
					switch (point) {
						case points.resize.T:
						case points.resize.L:
						case points.resize.R:
						case points.resize.B: {
							const offset = dist * Math.cos(distAngle - angle);
							switch (point) {
								case points.resize.T:
								case points.resize.B:
									height = offset / scaleY;
									break;
								case points.resize.L:
								case points.resize.R:
									width = offset / scaleX;
									break;
							}
							break;
						}
						case points.resize.TL:
						case points.resize.TR:
						case points.resize.BL:
						case points.resize.BR:
							if (event.shiftKey) {
								const rectWidth =
									dragging.startWidth + parent.width * transform.width2;
								const rectHeight =
									dragging.startHeight + parent.height * transform.height2;
								const aspectAngle = Math.atan2(rectHeight, rectWidth);
								let startAngle!: number;
								switch (point) {
									case points.resize.TL:
									case points.resize.BR:
										startAngle = angle - Math.PI / 4 + aspectAngle;
										break;
									case points.resize.TR:
									case points.resize.BL:
										startAngle = angle + Math.PI / 4 - aspectAngle;
										break;
								}
								const includedAngle = distAngle - startAngle;
								const offset = dist * Math.cos(includedAngle);
								const offsetX = offset * Math.cos(aspectAngle);
								const offsetY = offset * Math.sin(aspectAngle);
								width = offsetX / scaleX;
								height = offsetY / scaleY;
							} else {
								const startAngle = angle - Math.PI / 4;
								const includedAngle = distAngle - startAngle;
								const offsetX = dist * Math.cos(includedAngle);
								const offsetY = dist * Math.sin(includedAngle);
								switch (point) {
									case points.resize.TL:
									case points.resize.BR:
										width = offsetX / scaleX;
										height = offsetY / scaleY;
										break;
									case points.resize.TR:
									case points.resize.BL:
										width = offsetY / scaleY;
										height = offsetX / scaleX;
										break;
								}
							}
							break;
					}
					if (width !== undefined) {
						const minWidth = -Math.ceil(parent.width * transform.width2);
						width = Math.max(Math.round(dragging.startWidth + width), minWidth);
					}
					if (height !== undefined) {
						const minHeight = -Math.ceil(parent.height * transform.height2);
						height = Math.max(Math.round(dragging.startHeight + height), minHeight);
					}
					if (
						(width !== undefined && transform.width !== width) ||
						(height !== undefined && transform.height !== height)
					) {
						this.resizeTarget!(width, height);
					}
				}
				break;
			}
			case 'object-move': {
				const target = getUIStore().target;
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
				if (target) {
					const transform = target.transform;
					const distX = ((event.clientX - dragging.clientX) * dpr) / this.scaleX;
					const distY = ((event.clientY - dragging.clientY) * dpr) / this.scaleY;
					let x;
					let y;
					if (event.shiftKey) {
						const angle = Math.atan2(distY, distX);
						const directions = 4;
						const proportion = Math.modRadians(angle) / (Math.PI * 2);
						const section = (proportion * directions + 0.5) % directions;
						switch (Math.floor(section)) {
							case 0:
							case 2:
								x = Math.round(dragging.startX + distX);
								y = dragging.startY;
								break;
							case 1:
							case 3:
								x = dragging.startX;
								y = Math.round(dragging.startY + distY);
								break;
						}
					} else {
						x = Math.round(dragging.startX + distX);
						y = Math.round(dragging.startY + distY);
					}
					if (transform.x !== x || transform.y !== y) {
						this.shiftTarget!(x, y);
					}
				}
				break;
			}
			case 'ready-to-scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				if (Math.sqrt(distX ** 2 + distY ** 2) > 4) {
					dragging.mode = 'scroll';
					Cursor.open!('cursor-grab');
				}
				break;
			}
			case 'scroll': {
				const distX = event.clientX - dragging.clientX;
				const distY = event.clientY - dragging.clientY;
				this.screen.beginScrolling();
				this.screen.setScroll(dragging.scrollLeft - distX, dragging.scrollTop - distY);
				break;
			}
		}
	}
}.bind(UI);

UI.menuPopup = function (this: UIShape, event: UIPointerEvent) {
	this.translationKeyup!();
	const { x, y } = this.getPointerCoords!(event);
	const target = getUIStore().target;
	const selected = !!target;
	const pastable = (GlobalClipboard as unknown as GlobalClipboardHost).has('yami.ui.object');
	const get = createGetter('menuUIList');
	const items = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.image'),
					click: () => {
						this.create!('image', x, y);
					}
				},
				{
					label: get('create.text'),
					click: () => {
						this.create!('text', x, y);
					}
				},
				{
					label: get('create.textBox'),
					click: () => {
						this.create!('textbox', x, y);
					}
				},
				{
					label: get('create.dialogBox'),
					click: () => {
						this.create!('dialogbox', x, y);
					}
				},
				{
					label: get('create.progressBar'),
					click: () => {
						this.create!('progressbar', x, y);
					}
				},
				{
					label: get('create.button'),
					click: () => {
						this.create!('button', x, y);
					}
				},
				{
					label: get('create.animation'),
					click: () => {
						this.create!('animation', x, y);
					}
				},
				{
					label: get('create.video'),
					click: () => {
						this.create!('video', x, y);
					}
				},
				{
					label: get('create.window'),
					click: () => {
						this.create!('window', x, y);
					}
				},
				{
					label: get('create.container'),
					click: () => {
						this.create!('container', x, y);
					}
				},
				{
					label: get('create.reference'),
					click: () => {
						this.create!('reference', x, y);
					}
				},
				{
					label: get('create.shortcut'),
					enabled: selected && target.class !== 'reference',
					click: () => {
						this.createShortcut!(target);
					}
				},
				UI.createPrefabItem!(null, x, y)
			]
		},
		{
			label: get('toggle'),
			accelerator: '/',
			enabled: selected,
			click: () => {
				this.toggle!();
			}
		},
		{
			type: 'separator'
		},
		{
			label: get('cut'),
			accelerator: ctrl('X'),
			enabled: selected,
			click: () => {
				this.copy!();
				this.delete!();
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: selected,
			click: () => {
				this.copy!();
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste!(x, y);
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: selected,
			click: () => {
				this.duplicate!();
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				this.delete!();
			}
		},
		{
			label: get('copy-id'),
			enabled: selected,
			click: () => {
				navigator.clipboard.writeText(target!.presetId);
			}
		},
		{
			label: get('find-references'),
			enabled: selected,
			click: () => {
				Reference.openRelated!(target!.presetId);
			}
		}
	];
	if (selected) {
		if (!UI.hasPrefab!(target)) {
			items.push({
				label: get('set-as-prefab'),
				enabled: target.class !== 'reference',
				click: () => {
					UI.setAsPrefab!(target);
				}
			});
		} else {
			items.push({
				label: get('unset-as-prefab'),
				enabled: target.class !== 'reference',
				click: () => {
					UI.unsetAsPrefab!(target);
				}
			});
		}
	}
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		items
	);
};

UI.searcherInput = function (this: UIShape, event: InputEvent) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input!.value;
		UI.list.searchNodesDebounced(text);
	}
};

UI.listKeydown = function (this: UIShape, event: KeyboardEvent) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				if (item) {
					this.copy!(item);
					this.delete!(item);
				}
				break;
			case 'KeyC':
				this.copy!(item);
				break;
			case 'KeyV':
				this.paste!(null);
				break;
			case 'KeyD':
				this.duplicate!(item);
				break;
		}
	} else {
		switch (event.code) {
			case 'Slash':
				this.toggle!(item);
				break;
			case 'Delete':
				this.delete!(item);
				break;
			case 'Backspace':
				this.cancelSearch!();
				break;
			case 'Escape':
				UI.setTarget!(null);
				break;
		}
	}
};

UI.listPointerdown = function (this: UIShape, event: PointerEvent) {
	switch (event.button) {
		case 3:
			this.cancelSearch!();
			break;
	}
};

UI.listSelect = function (this: UIShape, event: Event) {
	UI.setTarget!(event.value);
};

UI.listRecord = function (this: UIShape, event: Event) {
	const response = event.value;
	switch (response.type) {
		case 'rename':
			UI.listRename!(response);
			break;
		case 'create':
			UI.history.save({
				type: 'ui-object-create',
				response: response
			});
			break;
		case 'delete':
			UI.history.save({
				type: 'ui-object-delete',
				response: response
			});
			break;
		case 'remove':
			UI.history.save({
				type: 'ui-object-remove',
				response: response
			});
			break;
	}
};

UI.listPopup = function (this: UIShape, event: Event) {
	const list = UI.list;
	const item = event.value;
	const menuItems: MenuItem[] = [];
	const get = createGetter('menuUIList');
	const selected = !!item;
	const copyable = selected;
	const pastable = (GlobalClipboard as unknown as GlobalClipboardHost).has('yami.ui.object');
	const deletable = selected;
	const renamable = selected;
	menuItems.push({
		label: get('create'),
		submenu: [
			{
				label: get('create.image'),
				click: () => {
					list.addNodeTo(Inspector.uiImage.create(), item);
				}
			},
			{
				label: get('create.text'),
				click: () => {
					list.addNodeTo(Inspector.uiText.create(), item);
				}
			},
			{
				label: get('create.textBox'),
				click: () => {
					list.addNodeTo(Inspector.uiTextBox.create(), item);
				}
			},
			{
				label: get('create.dialogBox'),
				click: () => {
					list.addNodeTo(Inspector.uiDialogBox.create(), item);
				}
			},
			{
				label: get('create.progressBar'),
				click: () => {
					list.addNodeTo(Inspector.uiProgressBar.create(), item);
				}
			},
			{
				label: get('create.button'),
				click: () => {
					list.addNodeTo(Inspector.uiButton.create(), item);
				}
			},
			{
				label: get('create.animation'),
				click: () => {
					list.addNodeTo(Inspector.uiAnimation.create!(), item);
				}
			},
			{
				label: get('create.video'),
				click: () => {
					list.addNodeTo(Inspector.uiVideo.create(), item);
				}
			},
			{
				label: get('create.window'),
				click: () => {
					list.addNodeTo(Inspector.uiWindow.create!(), item);
				}
			},
			{
				label: get('create.container'),
				click: () => {
					list.addNodeTo(Inspector.uiContainer.create(), item);
				}
			},
			{
				label: get('create.reference'),
				click: () => {
					list.addNodeTo(Inspector.uiReference.create!(), item);
				}
			},
			{
				label: get('create.shortcut'),
				enabled: selected && item.class !== 'reference',
				click: () => {
					UI.createShortcut!(item);
				}
			},
			UI.createPrefabItem!(item)
		]
	});
	if (selected) {
		menuItems.push(
			{
				label: get('reveal'),
				accelerator: 'Enter',
				click: () => {
					UI.revealTarget!(item);
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				click: () => {
					list.toggle(item);
				}
			}
		);
	}
	menuItems.push(
		{
			type: 'separator'
		},
		{
			label: get('cut'),
			accelerator: ctrl('X'),
			enabled: copyable,
			click: () => {
				list.copy(item);
				list.delete(item);
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				list.copy(item);
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				list.paste(item);
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: copyable,
			click: () => {
				list.duplicate(item);
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: deletable,
			click: () => {
				list.delete(item);
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: renamable,
			click: () => {
				this.rename(item);
			}
		},
		{
			label: get('copy-id'),
			enabled: selected,
			click: () => {
				navigator.clipboard.writeText(item.presetId);
			}
		}
	);
	if (copyable) {
		menuItems.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			enabled: copyable,
			click: () => {
				Reference.openRelated!(item.presetId);
			}
		});
	}
	if (selected) {
		if (!UI.hasPrefab!(item)) {
			menuItems.push({
				label: get('set-as-prefab'),
				enabled: item.class !== 'reference',
				click: () => {
					UI.setAsPrefab!(item);
				}
			});
		} else {
			menuItems.push({
				label: get('unset-as-prefab'),
				enabled: item.class !== 'reference',
				click: () => {
					UI.unsetAsPrefab!(item);
				}
			});
		}
	}
	Menu.popup!(
		{
			x: event.clientX,
			y: event.clientY
		},
		menuItems
	);
};

UI.listOpen = function (this: UIShape, event: Event) {
	UI.revealTarget!(event.value);
};

UI.listRename = function (
	this: UIShape,
	response: { item: UINodeShape; oldValue: string; newValue: string }
) {
	const editor = Inspector.uiElement;
	const target = response.item;
	const input = editor.nameBox;
	const { oldValue, newValue } = response;
	write(input, newValue);
	UI.history.save({
		type: 'inspector-change',
		editor: editor,
		target: target,
		changes: [
			{
				input,
				oldValue,
				newValue
			}
		]
	});
};

UI.listChange = function (this: UIShape, event: Event) {
	UI.planToSave!();
};

UI.listPageResize = function (this: UIShape, event: Event) {
	UI.list.updateHead();
	UI.list.resize();
};

// 选框 - 调整目标
UI.marquee.resize = function (this: HTMLElement & { pointerevent?: UIPointerEvent | null }) {
	if (this.pointerevent) {
		UI.marqueePointermove!(this.pointerevent!);
	}
};

// 列表 - 复制
UI.list.copy = function (this: UIShape, item: UINodeShape) {
	if (item) {
		(GlobalClipboard as unknown as GlobalClipboardHost).write('yami.ui.object', item);
	}
};

// 列表 - 粘贴
UI.list.paste = function (
	this: UIShape,
	dItem: UINodeShape | null,
	callback?: (data: unknown) => void
) {
	const copy = (GlobalClipboard as unknown as GlobalClipboardHost).read('yami.ui.object');
	if (copy && this.data) {
		callback?.(copy);
		this.addNodeTo!(copy, dItem);
		UI.requestRendering!();
	}
};

// 列表 - 删除
UI.list.delete = function (this: UIShape, item: UINodeShape) {
	if (item) {
		this.deleteNode!(item);
		UI.requestRendering!();
	}
};

// 列表 - 开关
UI.list.toggle = function (this: UIShape, item: UINodeShape) {
	if (item) {
		UI.history.save({
			type: 'ui-object-toggle',
			item: item,
			oldValue: item.enabled,
			newValue: !item.enabled
		});
		item.enabled = !item.enabled;
		this.update();
		dispatchChangeEvent(this);
	}
};

// 列表 - 取消搜索
UI.list.cancelSearch = function (this: UIShape) {
	if (this.display === 'search') {
		const active = document.activeElement;
		UI.searcher.deleteInputContent();
		this.expandToSelection!();
		this.scrollToSelection!();
		active!.focus();
	}
};

// 列表 - 更新头部位置
UI.list.updateHead = function (this: UIShape) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement!(head)!;
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
	}
};

// 列表 - 在创建数据时回调
getListConfig(UI.list).onCreate = function (this: UIShape, item: UINodeShape) {
	UI.registerPreset!(item);
	UI.loadElement!(item);
	UI.updateElement!(item);
} as (item: unknown) => void;

// 列表 - 在迁移数据时回调
getListConfig(UI.list).onRemove = function (this: UIShape, item: UINodeShape) {
	UI.updateElement!(item);
} as (item: unknown) => void;

// 列表 - 在删除数据时回调
getListConfig(UI.list).onDelete = function (this: UIShape, item: UINodeShape) {
	UI.unregisterPreset!(item);
	UI.deleteElement!(item);
	UI.updateHover!();
	UI.updateTarget!();
	UI.requestRendering!();
} as (item: unknown) => void;

// 列表 - 在恢复数据时回调
getListConfig(UI.list).onResume = function (this: UIShape, item: UINodeShape) {
	UI.registerPreset!(item);
	UI.loadElement!(item);
	UI.updateElement!(item);
} as (item: unknown) => void;

const uiBridgeKeys = ['state', 'target', 'zoom', 'width', 'height', 'mode'] as const;
import { getUIStore } from '@app/stores/ui';

for (const key of uiBridgeKeys) {
	Object.defineProperty(UI, key, {
		get: () => getUIStore()[key],
		set: (value: any) => {
			(getUIStore() as unknown as Record<string, any>)[key] = value;
		},
		configurable: true
	});
}

UI.setZoom = UIEngine.setZoom;
UI.shiftAnchor = UIEngine.shiftAnchor;
UI.shiftTarget = UIEngine.shiftTarget;
UI.resizeTarget = UIEngine.resizeTarget;
UI.rotateTarget = UIEngine.rotateTarget;
UI.setControlPoint = UIEngine.setControlPoint;
UI.updateControlPoints = UIEngine.updateControlPoints;
UI.getPointerCoords = UIEngine.getPointerCoords;
UI.updateCamera = UIEngine.updateCamera;
UI.updateTransform = UIEngine.updateTransform;
UI.drawBackground = UIEngine.drawBackground;
UI.drawElements = UIEngine.drawElements;
UI.drawCoordinateAxes = UIEngine.drawCoordinateAxes;
UI.drawHoverWireframe = UIEngine.drawHoverWireframe;
UI.drawTargetWireframe = UIEngine.drawTargetWireframe;
UI.drawTargetAnchor = UIEngine.drawTargetAnchor;
UI.drawControlPoints = UIEngine.drawControlPoints;
UI.selectControlPoint = UIEngine.selectControlPoint;
UI.requestRendering = UIEngine.requestRendering;
UI.renderingFunction = UIEngine.renderingFunction;
UI.stopRendering = UIEngine.stopRendering;
