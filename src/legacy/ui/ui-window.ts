import { $ } from '@/util/dom.ts';
import {
	addClass,
	addScrollbars,
	dispatchChangeEvent,
	removeClass,
	hasClass,
	show,
	hide,
	on,
	read,
	write,
	clear,
	rect
} from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { Inspector } from '@/inspector/inspector.ts';
function getWindow() {
	return (window as any).Window;
}
import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { GUID } from '@/file/guid.ts';
import { Cursor } from '@/tools/pointer-object.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import { UIInstanceList } from './element-instance-list.ts';
import { Scene } from '@/scene/scene-window.ts';
import { Menu } from '@/components/menu-list.ts';
import { TreeList } from '@/components/tree-list.ts';
import { Data } from '@/data/data-object.ts';
import { Easing } from '@/data/transition-window.ts';
import { File } from '@/file/file-system-core.ts';
import { Layout } from '@/layout/layout.ts';
import { Particle } from '@/particle/particle-window.ts';
import { Title } from '@/title/title-bar.ts';
import { EventBus } from '@/module/eventbus.ts';
import { History } from '@/tools/history.ts';
import { Local } from '@/tools/localization.ts';
import { StageColor } from '@/util/stage-color.ts';
import { ImageTexture } from '@/webgl/image-texture.ts';
import { Matrix } from '@/webgl/matrix2.ts';
import { GL } from '@/webgl/webgl-init.ts';

export const UI = {
	state: 'closed',
	page: $('#ui'),
	head: $('#ui-head'),
	body: hide($('#ui-body')),
	screen: $('#ui-screen'),
	marquee: $('#ui-marquee') || ({} as any),
	searcher: $('#ui-searcher'),
	list: $('#ui-list') || ({} as any),
	dragging: null as any,
	target: null as any,
	hover: null as any,
	history: null as any,
	controlPoints: null as any,
	controlPointActive: null as any,
	controlPointRotation: null as any,
	controlPointTexture: null as any,
	translationKey: 0b0000,
	translationTimer: null as any,
	background: null as any,
	foreground: null as any,
	matrix: null as any,
	zoom: null as any,
	zoomTimer: null as any,
	scale: null as any,
	scaleX: null as any,
	scaleY: null as any,
	outerWidth: null as any,
	outerHeight: null as any,
	scrollLeft: null as any,
	scrollTop: null as any,
	scrollRight: null as any,
	scrollBottom: null as any,
	centerX: null as any,
	centerY: null as any,
	centerOffsetX: null as any,
	centerOffsetY: null as any,
	padding: null as any,
	paddingLeft: null as any,
	paddingTop: null as any,
	inspectorTypeMap: null as any,
	context: null as any,
	meta: null as any,
	width: null as any,
	height: null as any,
	nodes: null as any,
	root: null as any,
	initialize: null as any,
	open: null as any,
	load: null as any,
	save: null as any,
	close: null as any,
	destroy: null as any,
	copy: null as any,
	paste: null as any,
	duplicate: null as any,
	create: null as any,
	createPrefab: null as any,
	delete: null as any,
	toggle: null as any,
	undo: null as any,
	redo: null as any,
	setZoom: null as any,
	setSize: null as any,
	setHover: null as any,
	setTarget: null as any,
	revealTarget: null as any,
	shiftAnchor: null as any,
	shiftTarget: null as any,
	resizeTarget: null as any,
	rotateTarget: null as any,
	setControlPoint: null as any,
	updateHover: null as any,
	updateTarget: null as any,
	updateTargetItem: null as any,
	updateElementFont: null as any,
	updateElementLanguage: null as any,
	updateElementTextScaling: null as any,
	updateIndexedColor: null as any,
	updateControlPoints: null as any,
	updateAllTexts: null as any,
	updateAllPrinters: null as any,
	updateAllReferences: null as any,
	updateElement: null as any,
	deleteElement: null as any,
	updateHead: null as any,
	resize: null as any,
	getPointerCoords: null as any,
	updateCamera: null as any,
	updateTransform: null as any,
	registerPreset: null as any,
	unregisterPreset: null as any,
	createPrefabItem: null as any,
	hasPrefab: null as any,
	setAsPrefab: null as any,
	unsetAsPrefab: null as any,
	clearInvalidPrefabs: null as any,
	createElement: null as any,
	loadElement: null as any,
	drawBackground: null as any,
	drawElements: null as any,
	drawCoordinateAxes: null as any,
	drawHoverWireframe: null as any,
	drawTargetWireframe: null as any,
	drawTargetAnchor: null as any,
	drawControlPoints: null as any,
	selectControlPoint: null as any,
	selectObject: null as any,
	requestRendering: null as any,
	renderingFunction: null as any,
	stopRendering: null as any,
	switchSettings: null as any,
	planToSave: null as any,
	saveToConfig: null as any,
	loadFromConfig: null as any,
	saveToProject: null as any,
	loadFromProject: null as any,
	webglRestored: null as any,
	windowResize: null as any,
	themechange: null as any,
	localizationchange: null as any,
	keydown: null as any,
	headPointerdown: null as any,
	switchPointerdown: null as any,
	shortcutPointerdown: null as any,
	zoomFocus: null as any,
	zoomInput: null as any,
	screenKeydown: null as any,
	translationKeyup: null as any,
	screenWheel: null as any,
	screenUserscroll: null as any,
	screenBlur: null as any,
	marqueePointerdown: null as any,
	marqueePointermove: null as any,
	marqueePointerleave: null as any,
	marqueeDoubleclick: null as any,
	pointerup: null as any,
	pointermove: null as any,
	menuPopup: null as any,
	searcherInput: null as any,
	listKeydown: null as any,
	listPointerdown: null as any,
	listSelect: null as any,
	listRecord: null as any,
	listPopup: null as any,
	listOpen: null as any,
	listRename: null as any,
	listChange: null as any,
	listPageResize: null as any,
	Element: null as any,
	Root: null as any,
	Image: null as any,
	Text: null as any,
	TextBox: null as any,
	DialogBox: null as any,
	ProgressBar: null as any,
	Button: null as any,
	Animation: null as any,
	Video: null as any,
	Window: null as any,
	Container: null as any,
	Reference: null as any,
	createShortcut: null as any
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
	UI.list.updateItemClass = Scene.list.updateItemClass;
	// 否则 UI.initialize 早跑时会推入 undefined，updateNodeElement 调 undefined(item) 炸
	UI.list.updaters.push(UI.list.updateItemClass);
});
UI.list.createIcon = null;
UI.list.updateIcon = null;
UI.list.updateHead = null;
UI.list.createConditionIcon = null;
UI.list.updateConditionIcon = null;
EventBus.once('editor_loaded', () => {
	UI.list.createEventIcon = Scene.list.createEventIcon;
	UI.list.updateEventIcon = Scene.list.updateEventIcon;
	UI.list.createScriptIcon = Scene.list.createScriptIcon;
	UI.list.updateScriptIcon = Scene.list.updateScriptIcon;
	UI.list.createVisibilityIcon = Scene.list.createVisibilityIcon;
	UI.list.updateVisibilityIcon = Scene.list.updateVisibilityIcon;
	UI.list.createLockIcon = Scene.list.createLockIcon;
	UI.list.updateLockIcon = Scene.list.updateLockIcon;
	// 上面 8 个方法是从 Scene.list 复制而来，赋值完成后才能往 creators/updaters 推；否则 UI.initialize 早跑时会推入 undefined，updateNodeElement 调 undefined(item) 炸
	const { list } = UI;
	list.creators.push(list.createEventIcon);
	list.creators.push(list.updateEventIcon);
	list.creators.push(list.createScriptIcon);
	list.creators.push(list.updateScriptIcon);
	list.creators.push(list.createVisibilityIcon);
	list.updaters.push(list.updateVisibilityIcon);
	list.creators.push(list.createLockIcon);
	list.updaters.push(list.updateLockIcon);
});
UI.list.onCreate = null;
UI.list.onRemove = null;
UI.list.onDelete = null;
UI.list.onResume = null;

UI.initialize = function (this: any) {
	this.page = $('#ui');
	this.head = $('#ui-head');
	this.body = hide($('#ui-body'));
	this.screen = $('#ui-screen');
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
	addScrollbars(this.screen);

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
		list: null as any
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
	}).then((image: any) => {
		if (!image) return;
		image.guid = 'ui:control-point';
		this.controlPointTexture = new ImageTexture(image);
		this.controlPointTexture.base.protected = true;
	});

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (timer: any) => {
			if (this.state === 'open' && this.dragging === null) {
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
				this.updateCamera(cx, cy);
				this.updateTransform();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					this.requestRendering();
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
		update: (timer: any) => {
			if (this.state === 'open') {
				const { elapsed, duration, start, end } = timer;
				const time = elapsed / duration;
				this.scale = start * (1 - time) + end * time;
				this.resize();
				this.requestRendering();
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
	list.removable = true;
	list.renamable = true;
	list.bind(() => this.nodes);
	// 其 updaters.push 已挪进 EventBus.once('editor_loaded') 回调，此处推入会拿到 undefined，updateNodeElement 调 undefined(item) 会炸
	list.creators.push(list.createConditionIcon);
	list.creators.push(list.updateConditionIcon);
	// 其 creators/updaters.push 已挪进 EventBus.once('editor_loaded') 回调，此处推入会拿到 undefined，updateNodeElement 调 undefined(item) 会炸

	History.processors['ui-object-create'] = (operation: any, data: any) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['ui-object-delete'] = (operation: any, data: any) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['ui-object-remove'] = (operation: any, data: any) => {
		const { response } = data;
		const { item } = response;
		list.restore(operation, response);
		UI.updateElement(item);
	};
	History.processors['ui-object-toggle'] = (operation: any, data: any) => {
		const { item, oldValue, newValue } = data;
		if (operation === 'undo') {
			item.enabled = oldValue;
		} else {
			item.enabled = newValue;
		}
		list.updateConditionIcon(item);
		UI.planToSave();
	};
	History.processors['ui-object-hidden'] = (operation: any, data: any) => {
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
		UI.requestRendering();
		UI.planToSave();
	};
	History.processors['ui-object-locked'] = (operation: any, data: any) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates(item, 'locked', oldValues);
		} else {
			list.setRecursiveStates(item, 'locked', newValue);
		}
		list.update();
		UI.planToSave();
	};
	History.processors['ui-target-anchor'] = (operation: any, data: any) => {
		const { editor, target, anchorX, anchorY } = data;
		const { instances, transform } = target;
		data.anchorX = transform.anchorX;
		data.anchorY = transform.anchorY;
		// transform.anchorX = anchorX transform.anchorY = anchorY
		instances.set('transform-anchorX', anchorX);
		instances.set('transform-anchorY', anchorY);
		if (editor.target === target) {
			write(editor, { anchorX, anchorY });
		}
		instances.resize();
		UI.setTarget(target);
		UI.requestRendering();
		UI.planToSave();
	};
	History.processors['ui-target-shift'] = (operation: any, data: any) => {
		const { editor, target, x, y } = data;
		const { instances, transform } = target;
		data.x = transform.x;
		data.y = transform.y;
		// transform.x = x transform.y = y
		instances.set('transform-x', x);
		instances.set('transform-y', y);
		if (editor.target === target) {
			write(editor, { x, y });
		}
		instances.resize();
		UI.setTarget(target);
		UI.requestRendering();
		UI.planToSave();
	};
	History.processors['ui-target-resize'] = (operation: any, data: any) => {
		const { editor, target, width, height } = data;
		const { instances, transform } = target;
		data.width = transform.width;
		data.height = transform.height;
		// transform.width = width transform.height = height
		instances.set('transform-width', width);
		instances.set('transform-height', height);
		if (editor.target === target) {
			write(editor, { width, height });
		}
		instances.resize();
		UI.setTarget(target);
		UI.requestRendering();
		UI.planToSave();
	};
	History.processors['ui-target-rotate'] = (operation: any, data: any) => {
		const { editor, target, rotation } = data;
		const { instances, transform } = target;
		data.rotation = transform.rotation;
		// transform.rotation = rotation
		instances.set('transform-rotation', rotation);
		if (editor.target === target) {
			write(editor, { rotation });
		}
		instances.resize();
		UI.setTarget(target);
		UI.requestRendering();
		UI.planToSave();
	};

	window.on('themechange', this.themechange);
	window.on('localizationchange', this.localizationchange);
	window.on('keydown', this.keydown);
	window.on('keydown', Reference.getKeydownListener!(list));
	on(this.page, 'resize', this.windowResize);
	on(this.head, 'pointerdown', this.headPointerdown);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored);
	on($('#ui-head-start'), 'pointerdown', this.switchPointerdown);
	on($('#ui-head-center'), 'pointerdown', this.shortcutPointerdown);
	on($('#ui-zoom'), 'focus', this.zoomFocus);
	on($('#ui-zoom'), 'input', this.zoomInput);
	on(this.screen, 'keydown', this.screenKeydown);
	on(this.screen, 'wheel', this.screenWheel);
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	on(this.marquee, 'pointerdown', this.marqueePointerdown);
	on(this.marquee, 'pointermove', this.marqueePointermove);
	on(this.marquee, 'pointerleave', this.marqueePointerleave);
	on(this.marquee, 'doubleclick', this.marqueeDoubleclick);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	on(list, 'select', this.listSelect);
	on(list, 'record', this.listRecord);
	on(list, 'popup', this.listPopup);
	on(list, 'open', this.listOpen);
	on(list, 'change', this.listChange);
	on(list.page, 'resize', this.listPageResize);
};

UI.open = function (this: any, context: any) {
	if (this.context === context) {
		return;
	}
	this.save();
	this.close();

	Particle.Element.stage = this;

	const { meta } = context;
	if (!context.ui) {
		context.ui = Data.ui[meta.guid];
	}
	if (context.ui) {
		this.state = 'open';
		this.context = context;
		this.meta = meta;
		show(this.body);
		this.load(context);
		this.resize();
		this.requestRendering();
	} else {
		Layout.manager.switch('directory');
		getWindow().confirm(
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

UI.load = function (this: any, context: any) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		context.editor = {
			target: null as any,
			root: new UI.Root(),
			history: new History(100),
			centerX: context.ui.width / 2,
			centerY: context.ui.height / 2
			// listScrollTop: 0,
		};
	}
	const { ui, editor } = context;

	this.width = ui.width;
	this.height = ui.height;
	this.nodes = ui.nodes;

	this.root = editor.root;
	this.history = editor.history;
	this.centerX = editor.centerX;
	this.centerY = editor.centerY;

	if (firstLoad) {
		const nodes = this.nodes;
		const length = nodes.length;
		for (let i = 0; i < length; i++) {
			this.loadElement(nodes[i], this.root);
		}
	} else {
		this.updateAllReferences();
	}

	this.list.update();
	// this.list.scrollTop = editor.listScrollTop

	this.setTarget(editor.target);

	if (this.context.fontChanged) {
		this.updateElementFont();
	}

	if (this.context.languageChanged) {
		this.updateElementLanguage();
	}

	if (this.context.scalingChanged) {
		this.updateElementTextScaling();
	}

	UndoManager.setActive(UI);
};

UI.save = function (this: any) {
	if (this.state === 'open') {
		const { ui, editor } = this.context;

		ui.width = this.width;
		ui.height = this.height;
		ui.nodes = this.nodes;

		editor.target = this.target;
		editor.root = this.root;
		editor.history = this.history;
		editor.centerX = this.centerX;
		editor.centerY = this.centerY;
		// editor.listScrollTop = this.list.scrollTop
	}
};

UI.close = function (this: any) {
	if (this.state !== 'closed') {
		this.screen.blur();
		if (Inspector.type === 'fileUI') {
			Inspector.close();
		}
		this.setTarget(null);
		this.state = 'closed';
		this.context = null;
		this.meta = null;
		this.nodes = null;
		this.root = null;
		this.history = null;
		write(this.searcher, '');
		clear(this.list);
		hide(this.body);
		this.stopRendering();
		UndoManager.setActive(null);
	}
};

UI.destroy = function (this: any, context: any) {
	if (!context.editor) return;
	if (this.context === context) {
		this.save();
		this.close();
	}
	// 销毁UI组件实例
	context.editor.root.destroy();
	TreeList.deleteCaches(context.ui.nodes);
};

UI.copy = function (this: any) {
	if (this.state === 'open' && this.target !== null) {
		this.list.copy(this.target);
	}
};

UI.paste = function (this: any, x: any, y: any) {
	if (this.state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.centerX;
			y = this.centerY;
		}
		this.list.paste(null, (data: any) => {
			const { transform } = data;
			transform.x = Math.round(x);
			transform.x = 0;
			transform.y = Math.round(y);
			transform.y = 0;
		});
	}
};

UI.duplicate = function (this: any) {
	if (this.target) {
		this.list.duplicate(this.target);
	}
};

UI.create = function (this: any, kind: any, x: any, y: any) {
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = Inspector[key];
	const node = editor.create();
	node.transform.x = x;
	node.transform.y = y;
	this.list.addNodeTo(node);
};

UI.createPrefab = function (this: any, prefab: any, parent: any, x: any, y: any) {
	const reference = Inspector.uiReference.create();
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

UI.createShortcut = function (this: any, item: any) {
	const reference = Inspector.uiReference.create();
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

UI.delete = function (this: any) {
	if (this.state === 'open' && this.target !== null && this.dragging === null) {
		this.list.delete(this.target);
	}
};

UI.toggle = function (this: any) {
	this.list.toggle(this.target);
};

UI.undo = function (this: any) {
	if (this.state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo');
		this.marquee.resize();
	}
};

UI.redo = function (this: any) {
	if (this.state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo');
		this.marquee.resize();
	}
};

UI.setZoom = (function IIFE() {
	return function (this: any, zoom: any) {
		const slider = $('#ui-zoom');
		if (this.zoom !== zoom) {
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
			this.zoom = zoom;
			if (slider) write(slider, zoom);
			if (this.state === 'open') {
				const timer = this.zoomTimer;
				timer.start = this.scale;
				timer.end = scale;
				timer.elapsed = 0;
				timer.add();
			} else {
				this.scale = scale;
			}
		}
	};
})();

UI.setSize = function (this: any, width: any, height: any) {
	if (this.width !== width) {
		this.centerX = (this.centerX * width) / this.width;
		this.width = width;
	}
	if (this.height !== height) {
		this.centerY = (this.centerY * height) / this.height;
		this.height = height;
	}
	this.resize();
	this.requestRendering();
};

UI.setHover = function (this: any, hover: any) {
	if (this.hover !== hover) {
		this.hover = hover;
		this.requestRendering();
	}
};

UI.setTarget = function (this: any, target: any) {
	if (this.target !== target) {
		this.target = target;
		this.updateTargetItem();
		this.requestRendering();
		if (target) {
			const map = this.inspectorTypeMap;
			const key = map[target.class];
			Inspector.open(key, target);
		} else {
			Inspector.close();
		}
	}
};

UI.revealTarget = (function IIFE() {
	const timer = new Timer({
		duration: 200,
		update: (timer: any) => {
			const { target } = timer;
			if (target === UI.target) {
				const easing = (Easing.EasingMap as any).easeInOut;
				const time = easing.ease(timer.elapsed / timer.duration);
				const x = timer.startX * (1 - time) + timer.endX * time;
				const y = timer.startY * (1 - time) + timer.endY * time;
				const screen = UI.screen;
				const sl = screen.scrollLeft;
				const st = screen.scrollTop;
				UI.updateCamera(x, y);
				UI.updateTransform();
				if (screen.scrollLeft !== sl || screen.scrollTop !== st) {
					UI.requestRendering();
					UI.marquee.resize();
					UI.screen.updateScrollbars();
				}
			} else {
				timer.target = null;
				return false;
			}
		},
		callback: (timer: any) => {
			timer.target = null;
		}
	});
	return function (this: any) {
		const target = this.target;
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

UI.shiftAnchor = function (this: any, anchorX: any, anchorY: any) {
	const target = this.target;
	if (target !== null) {
		this.planToSave();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-anchor';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				anchorX: transform.anchorX,
				anchorY: transform.anchorY
			});
		}
		// transform.anchorX = anchorX transform.anchorY = anchorY
		instances.set('transform-anchorX', anchorX);
		instances.set('transform-anchorY', anchorY);
		instances.resize();
		this.requestRendering();

		if (editor.target === target) {
			write(editor, { anchorX, anchorY });
		}
	}
};

UI.shiftTarget = function (this: any, x: any, y: any) {
	const target = this.target;
	if (target !== null) {
		this.planToSave();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-shift';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				x: transform.x,
				y: transform.y
			});
		}
		// transform.x = x transform.y = y
		instances.set('transform-x', x);
		instances.set('transform-y', y);
		instances.resize();
		this.requestRendering();

		if (editor.target === target) {
			write(editor, {
				x: x,
				y: y
			});
		}
	}
};

UI.resizeTarget = function (this: any, width: any, height: any) {
	const target = this.target;
	if (target !== null) {
		this.planToSave();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-resize';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				width: transform.width,
				height: transform.height
			});
		}
		if (width !== undefined) {
			// transform.width = width
			instances.set('transform-width', width);
		}
		if (height !== undefined) {
			// transform.height = height
			instances.set('transform-height', height);
		}
		instances.resize();
		this.requestRendering();

		if (editor.target === target) {
			write(editor, {
				width: width,
				height: height
			});
		}
	}
};

UI.rotateTarget = function (this: any, rotation: any) {
	const target = this.target;
	if (target !== null) {
		this.planToSave();
		const instances = target.instances;
		const transform = target.transform;
		const editor = Inspector.uiElement;
		const history = this.history;
		const index = history.index;
		const length = history.length;
		const record = history[index];
		const type = 'ui-target-rotate';
		if (
			index !== length - 1 ||
			record === undefined ||
			record.type !== type ||
			record.target !== target
		) {
			history.save({
				type: type,
				editor: editor,
				target: target,
				rotation: transform.rotation
			});
		}
		// transform.rotation = rotation
		instances.set('transform-rotation', rotation);
		instances.resize();
		this.requestRendering();

		if (editor.target === target) {
			write(editor, { rotation });
		}
	}
};

UI.setControlPoint = function (this: any, point: any) {
	if (this.controlPointActive !== point) {
		this.controlPointActive = point;
		const points = this.controlPoints;
		let cursor;
		switch (point) {
			case null:
				cursor = '';
				break;
			case points.rotate.TL:
			case points.rotate.TR:
			case points.rotate.BL:
			case points.rotate.BR:
				cursor = 'alias';
				break;
			case points.resize.T:
			case points.resize.L:
			case points.resize.R:
			case points.resize.B:
			case points.resize.TL:
			case points.resize.TR:
			case points.resize.BL:
			case points.resize.BR: {
				const angle = Math.modDegrees(point.angle + this.controlPointRotation, 180);
				if (angle < 22.5 || angle >= 157.5) {
					cursor = 'ew-resize';
				} else if (angle < 67.5) {
					cursor = 'nwse-resize';
				} else if (angle < 112.5) {
					cursor = 'ns-resize';
				} else {
					cursor = 'nesw-resize';
				}
				break;
			}
		}
		this.body.style.cursor = cursor;
	}
};

UI.updateHover = function (this: any) {
	if (this.hover && !this.hover.instance) {
		this.setHover(null);
	}
};

UI.updateTarget = function (this: any) {
	const item = read(this.list);
	if (item !== this.target) {
		this.setTarget(item);
	}
};

UI.updateTargetItem = function () {
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

UI.updateElementFont = function (this: any) {
	if (this.state === 'open') {
		if (this.context.fontChanged) {
			delete this.context.fontChanged;
		}
		const update = (element: any) => {
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
					this.requestRendering();
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

UI.updateElementLanguage = function (this: any) {
	if (this.state === 'open') {
		if (this.context.languageChanged) {
			delete this.context.languageChanged;
		}
		const update = (elements: any) => {
			for (const element of elements) {
				element.updateTextContent?.();
				update(element.children);
			}
		};
		update(this.root.children);
		this.requestRendering();
	}
};

UI.updateElementTextScaling = function (this: any) {
	if (this.state === 'open') {
		if (this.context.scalingChanged) {
			delete this.context.scalingChanged;
		}
		const update = (elements: any): void => {
			for (const element of elements) {
				element.updatePrinter?.();
				update(element.children);
			}
		};
		update(this.root.children);
		this.requestRendering();
	}
};

UI.updateIndexedColor = function (this: any, index: any) {
	if (this.state === 'open') {
		const TextElement = UI.Text;
		const regexp = new RegExp(`<color:${index}>`, 'i');
		const update = (element: any): void => {
			if (element instanceof TextElement && regexp.test(element.content)) {
				element.printer.reset();
				this.requestRendering();
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

UI.updateControlPoints = function (this: any) {
	if (this.target !== null) {
		const POINT_RADIUS = 4 / this.scale;
		const { instance } = this.target;
		const points = this.controlPoints;
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
		const angle1 = Math.atan2(y1 - y2, x1 - x2);
		const angle2 = Math.atan2(y2 - y3, x2 - x3);
		const angle3 = Math.atan2(y3 - y4, x3 - x4);
		const angle4 = Math.atan2(y4 - y1, x4 - x1);
		const ox1 = -Math.cos(angle3) * POINT_RADIUS;
		const oy1 = Math.sin(angle1) * POINT_RADIUS;
		const ox2 = -Math.cos(angle4) * POINT_RADIUS;
		const oy2 = Math.sin(angle2) * POINT_RADIUS;
		const ox3 = Math.cos(angle3) * POINT_RADIUS;
		const oy3 = Math.sin(angle3) * POINT_RADIUS;
		const ox4 = Math.cos(angle4) * POINT_RADIUS;
		const oy4 = Math.sin(angle4) * POINT_RADIUS;

		const { rotate } = points;
		rotate.TL.x = x1 + (ox1 - ox4) * 3;
		rotate.TL.y = y1 + (oy1 - oy4) * 3;
		rotate.TR.x = x4 + (ox4 - ox3) * 3;
		rotate.TR.y = y4 + (oy4 - oy3) * 3;
		rotate.BL.x = x2 + (ox2 - ox1) * 3;
		rotate.BL.y = y2 + (oy2 - oy1) * 3;
		rotate.BR.x = x3 + (ox3 - ox2) * 3;
		rotate.BR.y = y3 + (oy3 - oy2) * 3;
		const { resize } = points;
		resize.T.x = (x4 + x1) / 2 + ox1;
		resize.T.y = (y4 + y1) / 2 + oy1;
		resize.L.x = (x1 + x2) / 2 + ox2;
		resize.L.y = (y1 + y2) / 2 + oy2;
		resize.R.x = (x3 + x4) / 2 + ox4;
		resize.R.y = (y3 + y4) / 2 + oy4;
		resize.B.x = (x2 + x3) / 2 + ox3;
		resize.B.y = (y2 + y3) / 2 + oy3;
		resize.TL.x = x1 + ox1 - ox4;
		resize.TL.y = y1 + oy1 - oy4;
		resize.TR.x = x4 + ox4 - ox3;
		resize.TR.y = y4 + oy4 - oy3;
		resize.BL.x = x2 + ox2 - ox1;
		resize.BL.y = y2 + oy2 - oy1;
		resize.BR.x = x3 + ox3 - ox2;
		resize.BR.y = y3 + oy3 - oy2;
		let element = instance;
		let rotation = element.transform.rotation;
		while ((element = element.parent)?.transform) {
			rotation += element.transform.rotation;
		}
		this.controlPointRotation = rotation;
	}
};

UI.updateAllTexts = function (this: any) {
	if (!Title.tabBar.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.languageChanged = true;
		}
	}
	this.updateElementLanguage();
};

UI.updateAllPrinters = function (this: any) {
	if (!Title.tabBar.data) return;
	for (const context of Title.tabBar.data) {
		if (context.type === 'ui') {
			context.scalingChanged = true;
		}
	}
	this.updateElementTextScaling();
};

UI.updateAllReferences = function (this: any) {
	if (this.state === 'open') {
		const update = (elements: any): void => {
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

UI.updateElement = function (this: any, target: any) {
	let nodes;
	let instance;
	if (this.nodes.includes(target)) {
		nodes = this.nodes;
		instance = this.root;
	} else {
		const find = (node: any): any => {
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
		});
		if (node) {
			nodes = node.children;
			instance = node.instance;
		}
	}
	if (instance) {
		instance.appendChildTo(target.instance, nodes.indexOf(target));
	}
	this.requestRendering();
};

UI.deleteElement = function (target: any) {
	target.instance.remove();
	target.instance.destroy();
};

UI.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement!(head) as any;
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild);
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
		// 调整居中组件的位置 const width = nRect.right - iRect.right if (head.width !== width) { head.width = width const [start, center, end] = head.children end.style.marginLeft = '0' const sRect = start.rect() const cRect = center.rect() const eRect = end.rect() const spacing = eRect.left - sRect.right - cRect.width const difference = sRect.right - nRect.left - eRect.width const margin = Math.min(spacing, difference) end.style.marginLeft = `${margin}px` }
	}
};

UI.resize = function (this: any) {
	if (this.state === 'open' && this.screen.clientWidth !== 0) {
		const scale = this.scale;
		const scaledPadding = Math.round(this.padding * scale);
		const innerWidth = Math.round((this.width * scale) / 2) * 2;
		const innerHeight = Math.round((this.height * scale) / 2) * 2;
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
		this.scaleX = innerWidth / this.width;
		this.scaleY = innerHeight / this.height;
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
		GL.resize(screenWidth, screenHeight);
		this.updateCamera();
		this.updateTransform();
		this.root.resize();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
};

UI.getPointerCoords = (function IIFE() {
	const point = { x: 0, y: 0 };
	return function (this: any, event: any) {
		const coords = event.getRelativeCoords(this.marquee);
		const dpr = window.devicePixelRatio;
		point.x = (coords.x * dpr - this.paddingLeft) / this.scaleX;
		point.y = (coords.y * dpr - this.paddingTop) / this.scaleY;
		return point;
	};
})();

UI.updateCamera = function (this: any, x = this.centerX, y = this.centerY) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const scrollX = x * this.scaleX + this.paddingLeft;
	const scrollY = y * this.scaleY + this.paddingTop;
	const toleranceForDPR = 0.0001;
	screen.rawScrollLeft =
		Math.clamp(scrollX - this.centerOffsetX, 0, this.outerWidth - GL.width) / dpr;
	screen.rawScrollTop =
		Math.clamp(scrollY - this.centerOffsetY, 0, this.outerHeight - GL.height) / dpr;
	screen.scrollLeft = (scrollX - (GL.width >> 1) + toleranceForDPR) / dpr;
	screen.scrollTop = (scrollY - (GL.height >> 1) + toleranceForDPR) / dpr;
};

UI.updateTransform = function (this: any) {
	const dpr = window.devicePixelRatio;
	const screen = this.screen;
	const left = Math.roundTo(screen.scrollLeft * dpr - this.paddingLeft, 4);
	const top = Math.roundTo(screen.scrollTop * dpr - this.paddingTop, 4);
	const right = left + GL.width;
	const bottom = top + GL.height;
	this.scrollLeft = left / this.scaleX;
	this.scrollTop = top / this.scaleY;
	this.scrollRight = right / this.scaleX;
	this.scrollBottom = bottom / this.scaleY;
	this.matrix
		.reset()
		.scale(this.scaleX, this.scaleY)
		.translate(-this.scrollLeft, -this.scrollTop);
	const scrollX = screen.rawScrollLeft * dpr + this.centerOffsetX;
	const scrollY = screen.rawScrollTop * dpr + this.centerOffsetY;
	this.centerX = Math.roundTo((scrollX - this.paddingLeft) / this.scaleX, 4);
	this.centerY = Math.roundTo((scrollY - this.paddingTop) / this.scaleY, 4);
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
	const registerPreset = (node: any) => {
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
	return function (node: any) {
		registerPreset(node);
	};
})();

UI.unregisterPreset = function (node: any) {
	delete Data.uiPresets[node.presetId];
	for (const child of node.children) {
		UI.unregisterPreset(child);
	}
};

UI.createPrefabItem = function (this: any, parent: any, x: any, y: any) {
	const { uiPrefabs } = Editor.project;
	const items = [];
	if (uiPrefabs.length !== 0) {
		const click = function (this: any) {
			UI.createPrefab(this.data, parent, x, y);
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
		label: Local.get('menuUIList.create.prefab'),
		enabled: items.length !== 0,
		submenu: items.sort((a: any, b: any) => a.label.localeCompare(b.label))
	};
};

UI.hasPrefab = function (node: any) {
	return Editor.project.uiPrefabs.includes(node.presetId);
};

UI.setAsPrefab = function (node: any) {
	if (Editor.project.uiPrefabs.push(node.presetId)) {
		UI.list.updateIcon(node);
	}
};

UI.unsetAsPrefab = function (node: any) {
	if (Editor.project.uiPrefabs.splice(Editor.project.uiPrefabs.indexOf(node.presetId), 1)) {
		UI.list.updateIcon(node);
	}
};

UI.clearInvalidPrefabs = function (uiPrefabs: any) {
	let i = uiPrefabs.length;
	while (--i >= 0) {
		const guid = uiPrefabs[i];
		if (!Data.uiPresets[guid]) {
			uiPrefabs.splice(i, 1);
		}
	}
};

UI.createElement = function (node: any, main: any) {
	let instance;
	switch (node.class) {
		case 'image':
			instance = new UI.Image(node);
			break;
		case 'text':
			instance = new UI.Text(node);
			break;
		case 'textbox':
			instance = new UI.TextBox(node);
			break;
		case 'dialogbox':
			instance = new UI.DialogBox(node);
			break;
		case 'progressbar':
			instance = new UI.ProgressBar(node);
			break;
		case 'button':
			instance = new UI.Button(node);
			break;
		case 'animation':
			instance = new UI.Animation(node);
			break;
		case 'video':
			instance = new UI.Video(node);
			break;
		case 'window':
			instance = new UI.Window(node);
			break;
		case 'container':
			instance = new UI.Container(node);
			break;
		case 'reference':
			instance = new UI.Reference(node);
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

UI.loadElement = function (this: any, node: any, parent: any) {
	const instance = this.createElement(node, true);
	if (parent !== undefined) {
		parent.appendChild(instance);
	}
	for (const child of node.children) {
		UI.loadElement(child, instance);
	}
};

UI.drawBackground = function (this: any) {
	const gl = GL;
	gl.clearColor(...this.background.getGLRGBA());
	gl.clear(gl.COLOR_BUFFER_BIT);
};

UI.drawElements = function (this: any) {
	this.root.draw();
};

UI.drawCoordinateAxes = function (this: any) {
	if (this.target !== null) {
		const { parent } = this.target.instance;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(UI.matrix).multiply(parent.matrix);
		const PL = parent.x;
		const PT = parent.y;
		const PR = PL + parent.width;
		const PB = PT + parent.height;
		const TL = PL - 10000 / this.scaleX;
		const TT = PT - 10000 / this.scaleY;
		const TR = PR + 10000 / this.scaleX;
		const TB = PB + 10000 / this.scaleY;
		const a = matrix[0];
		const b = matrix[1];
		const c = matrix[3];
		const d = matrix[4];
		const e = matrix[6];
		const f = matrix[7];
		const x1 = a * TL + c * PT + e;
		const y1 = b * TL + d * PT + f;
		const x2 = a * TR + c * PT + e;
		const y2 = b * TR + d * PT + f;
		const x3 = a * TL + c * PB + e;
		const y3 = b * TL + d * PB + f;
		const x4 = a * TR + c * PB + e;
		const y4 = b * TR + d * PB + f;
		const x5 = a * PL + c * TT + e;
		const y5 = b * PL + d * TT + f;
		const x6 = a * PL + c * TB + e;
		const y6 = b * PL + d * TB + f;
		const x7 = a * PR + c * TT + e;
		const y7 = b * PR + d * TT + f;
		const x8 = a * PR + c * TB + e;
		const y8 = b * PR + d * TB + f;
		vertices[0] = x1;
		vertices[1] = y1 + 0.5;
		vertices[2] = 0;
		vertices[3] = x2;
		vertices[4] = y2 + 0.5;
		vertices[5] = Math.dist(x1, y1, x2, y2);
		vertices[6] = x3;
		vertices[7] = y3 + 0.5;
		vertices[8] = 0;
		vertices[9] = x4;
		vertices[10] = y4 + 0.5;
		vertices[11] = Math.dist(x3, y3, x4, y4);
		vertices[12] = x5 + 0.5;
		vertices[13] = y5;
		vertices[14] = 0;
		vertices[15] = x6 + 0.5;
		vertices[16] = y6;
		vertices[17] = Math.dist(x5, y5, x6, y6);
		vertices[18] = x7 + 0.5;
		vertices[19] = y7;
		vertices[20] = 0;
		vertices[21] = x8 + 0.5;
		vertices[22] = y8;
		vertices[23] = Math.dist(x7, y7, x8, y8);
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.dashedLineProgram.use();
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform4f(program.u_Color, 0.5, 0, 1, 1);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 24);
		gl.drawArrays(gl.LINES, 0, 8);
	}
};

UI.drawHoverWireframe = function (this: any) {
	if (this.hover !== null && this.hover !== this.target) {
		const { instance } = this.hover;
		if (instance.visible) {
			instance.drawWireframe(0xffffffff);
		}
	}
};

UI.drawTargetWireframe = function (this: any) {
	if (this.target !== null) {
		const { instance } = this.target;
		instance.drawWireframe(0xffc0ff00);
	}
};

UI.drawTargetAnchor = function (this: any) {
	if (this.target !== null) {
		const { instance } = this.target;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		const matrix = gl.matrix.set(UI.matrix).multiply(instance.matrix);
		const transform = instance.transform;
		const X = instance.x + instance.width * transform.anchorX;
		const Y = instance.y + instance.height * transform.anchorY;
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
		matrix.project(gl.flip, gl.width, gl.height);
		gl.alpha = 1;
		gl.blend = 'normal';
		const program = gl.graphicProgram.use();
		gl.bindVertexArray(program.vao.a10);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, 8);
		gl.vertexAttrib4f(program.a_Color, 1, 0, 0, 1);
		gl.drawArrays(gl.LINES, 0, 4);
	}
};

UI.drawControlPoints = function (this: any) {
	const target = this.target;
	const texture = this.controlPointTexture;
	if (target !== null && texture !== null) {
		this.updateControlPoints();
		const POINT_RADIUS = 4 / this.scale;
		const gl = GL;
		const vertices = gl.arrays[0].float32;
		let vi = 0;
		const { list } = this.controlPoints;
		const length = list.length;
		for (let i = 4; i < length; i++) {
			const { x, y } = list[i];
			const dl = x - POINT_RADIUS;
			const dt = y - POINT_RADIUS;
			const dr = x + POINT_RADIUS;
			const db = y + POINT_RADIUS;
			vertices[vi] = dl;
			vertices[vi + 1] = dt;
			vertices[vi + 2] = 0;
			vertices[vi + 3] = 0;
			vertices[vi + 4] = dl;
			vertices[vi + 5] = db;
			vertices[vi + 6] = 0;
			vertices[vi + 7] = 1;
			vertices[vi + 8] = dr;
			vertices[vi + 9] = db;
			vertices[vi + 10] = 1;
			vertices[vi + 11] = 1;
			vertices[vi + 12] = dr;
			vertices[vi + 13] = dt;
			vertices[vi + 14] = 1;
			vertices[vi + 15] = 0;
			vi += 16;
		}
		gl.blend = 'normal';
		const program = gl.imageProgram.use();
		const matrix = gl.matrix.project(gl.flip, gl.width, gl.height).multiply(UI.matrix);
		gl.bindVertexArray(program.vao);
		gl.uniformMatrix3fv(program.u_Matrix, false, matrix);
		gl.uniform1i(program.u_LightMode, 0);
		gl.uniform1i(program.u_ColorMode, 0);
		gl.uniform4f(program.u_Tint, 0, 0, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW, 0, vi);
		gl.bindTexture(gl.TEXTURE_2D, texture.base.glTexture);
		gl.drawElements(gl.TRIANGLES, (vi / 16) * 6, gl.UNSIGNED_INT, 0);
	}
};

UI.selectControlPoint = function (this: any, x: any, y: any) {
	if (this.target !== null && !(this.target.class === 'reference' && this.target.synchronous)) {
		const radius = 6 / this.scale;
		const { list } = this.controlPoints;
		for (let i = list.length - 1; i >= 0; i--) {
			const point = list[i];
			const sx = point.x - radius;
			const ex = point.x + radius;
			const sy = point.y - radius;
			const ey = point.y + radius;
			if (x >= sx && x < ex && y >= sy && y < ey) {
				return point;
			}
		}
	}
	return null;
};

UI.selectObject = (function IIFE() {
	const find = (elements: any, x: any, y: any): any => {
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
	return function (this: any, x: any, y: any) {
		return find(this.root.children, x, y);
	};
})();

UI.requestRendering = function (this: any) {
	if (this.state === 'open') {
		Timer.appendUpdater!('stageRendering', this.renderingFunction);
	}
};

UI.renderingFunction = function () {
	if (GL.width * GL.height !== 0) {
		UI.drawBackground();
		UI.drawElements();
		UI.drawCoordinateAxes();
		UI.drawHoverWireframe();
		UI.drawTargetWireframe();
		UI.drawTargetAnchor();
		UI.drawControlPoints();
	}
};

UI.stopRendering = function (this: any) {
	Timer.removeUpdater!('stageRendering', this.renderingFunction);
};

UI.switchSettings = function () {
	if (!hasClass(Inspector.fileUI.button, 'selected')) {
		Inspector.open('fileUI', UI);
	} else {
		Inspector.close();
	}
};

UI.planToSave = function (this: any) {
	File.planToSave!(this.meta);
};

UI.saveToConfig = function (this: any, config: any) {
	config.colors.uiBackground = this.background.hex;
	config.colors.uiForeground = this.foreground.hex;
};

UI.loadFromConfig = function (this: any, config: any) {
	this.background = new StageColor(config.colors.uiBackground, () => this.requestRendering());
	this.foreground = new StageColor(config.colors.uiForeground, () => {
		if (this.state === 'open') {
			this.root.resize();
			this.requestRendering();
		}
	});
};

UI.saveToProject = function (this: any, project: any) {
	const { ui, uiPrefabs } = project;
	ui.zoom = this.zoom ?? ui.zoom;
	UI.clearInvalidPrefabs(uiPrefabs ?? []);
};

UI.loadFromProject = function (this: any, project: any) {
	const { ui } = project;
	this.setZoom(ui.zoom);
};

UI.webglRestored = function (this: any, event: any) {
	if (UI.state === 'open') {
		UI.requestRendering();
	}
};

UI.windowResize = function (this: any, event: any) {
	this.updateHead();
	if (this.state === 'open') {
		this.resize();
		this.updateCamera();
		this.requestRendering();
	}
}.bind(UI);

UI.themechange = function (this: any, event: any) {
	this.requestRendering();
}.bind(UI);

UI.localizationchange = function (this: any, event: any) {
	this.updateAllTexts();
}.bind(UI);

UI.keydown = function (this: any, event: any) {
	if (UI.state === 'open' && UI.dragging === null) {
		if (event.cmdOrCtrlKey) {
			return;
		} else if (event.altKey) {
			switch (event.code) {
				case 'KeyS':
					UI.switchSettings();
					break;
			}
		} else {
			return;
		}
	}
};

UI.headPointerdown = function (this: any, event: any) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		if (document.activeElement !== UI.screen) {
			UI.screen.focus();
		}
	}
};

UI.switchPointerdown = function (this: any, event: any) {
	switch (event.button) {
		case 0: {
			const element = event.target;
			if (element.tagName === 'ITEM') {
				switch (element.getAttribute('value')) {
					case 'settings':
						return UI.switchSettings();
				}
			}
			break;
		}
	}
};

UI.shortcutPointerdown = function (this: any, event: any) {
	switch (event.button) {
		case 0: {
			const element = event.target;
			if (element.tagName === 'ITEM') {
				UI.create(element.getAttribute('value'), 0, 0);
			}
			break;
		}
	}
};

UI.zoomFocus = function (this: any, event: any) {
	UI.screen.focus();
};

UI.zoomInput = function (this: any, event: any) {
	UI.setZoom(read(this));
};

UI.screenKeydown = function (this: any, event: any) {
	if (this.state === 'open' && this.dragging === null) {
		if (event.cmdOrCtrlKey) {
			switch (event.code) {
				case 'KeyX':
					this.copy();
					this.delete();
					return;
				case 'KeyC':
					this.copy();
					return;
				case 'KeyV':
					this.paste();
					return;
				case 'KeyD':
					this.duplicate();
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
				this.revealTarget();
				break;
			case 'Slash':
				this.toggle();
				break;
			case 'Delete':
				this.delete();
				break;
			case 'Escape':
				this.setTarget(null);
				break;
			case 'KeyA':
				if ((this.translationKey & 0b0001) === 0) {
					this.translationKey |= 0b0001;
					this.translationTimer.add();
					this.screen.beginScrolling();
					window.on('keyup', this.translationKeyup);
				}
				break;
			case 'KeyW':
				if ((this.translationKey & 0b0010) === 0) {
					this.translationKey |= 0b0010;
					this.translationTimer.add();
					this.screen.beginScrolling();
					window.on('keyup', this.translationKeyup);
				}
				break;
			case 'KeyD':
				if ((this.translationKey & 0b0100) === 0) {
					this.translationKey |= 0b0100;
					this.translationTimer.add();
					this.screen.beginScrolling();
					window.on('keyup', this.translationKeyup);
				}
				break;
			case 'KeyS':
				if ((this.translationKey & 0b1000) === 0) {
					this.translationKey |= 0b1000;
					this.translationTimer.add();
					this.screen.beginScrolling();
					window.on('keyup', this.translationKeyup);
				}
				break;
			case 'ArrowLeft':
			case 'ArrowUp':
			case 'ArrowRight':
			case 'ArrowDown':
				if (this.target !== null) {
					event.preventDefault();
					const transform = this.target.transform;
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
					if (event.cmdOrCtrlKey) {
						const ax = Math.roundTo(transform.anchorX - offsetX * 0.5, 4);
						const ay = Math.roundTo(transform.anchorY - offsetY * 0.5, 4);
						return this.shiftAnchor(ax, ay);
					}
					if (event.shiftKey) {
						offsetX *= 10;
						offsetY *= 10;
					}
					const x = Math.roundTo(transform.x + offsetX, 4);
					const y = Math.roundTo(transform.y + offsetY, 4);
					this.shiftTarget(x, y);
				}
				break;
			case 'Minus':
			case 'NumpadSubtract':
				this.setZoom(this.zoom - 1);
				break;
			case 'Equal':
			case 'NumpadAdd':
				this.setZoom(this.zoom + 1);
				break;
			case 'Digit0':
			case 'Numpad0':
				this.setZoom(2);
				break;
		}
	}
}.bind(UI);

UI.translationKeyup = function (this: any, event: any) {
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
		this.translationTimer.remove();
		this.screen.endScrolling();
		window.off('keyup', this.translationKeyup);
	}
}.bind(UI);

UI.screenWheel = function (this: any, event: any) {
	if (this.state === 'open' && this.dragging === null) {
		event.preventDefault();
		if (event.deltaY !== 0) {
			const step = event.deltaY > 0 ? -1 : 1;
			this.setZoom(this.zoom + step);
		}
	}
}.bind(UI);

UI.screenUserscroll = function (this: any, event: any) {
	if (this.state === 'open') {
		this.screen.rawScrollLeft = this.screen.scrollLeft;
		this.screen.rawScrollTop = this.screen.scrollTop;
		this.updateTransform();
		this.requestRendering();
		this.marquee.resize();
		this.screen.updateScrollbars();
	}
}.bind(UI);

UI.screenBlur = function (this: any, event: any) {
	this.translationKeyup();
	this.pointerup();
	// this.marqueePointerleave()
}.bind(UI);

UI.marqueePointerdown = function (this: any, event: any) {
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
				window.on('pointerup', this.pointerup);
				window.on('pointermove', this.pointermove);
				return;
			}
			if (this.controlPointActive && this.target) {
				const { transform } = this.target;
				const points = this.controlPoints;
				this.dragging = event;
				switch (this.controlPointActive) {
					case points.rotate.TL:
					case points.rotate.TR:
					case points.rotate.BL:
					case points.rotate.BR: {
						const { instance } = this.target;
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
						const { x, y } = event.getRelativeCoords(GL.canvas);
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
				window.on('pointerup', this.pointerup);
				window.on('pointermove', this.pointermove);
				return;
			}
			const { x, y } = this.getPointerCoords(event);
			let object;
			if (event.cmdOrCtrlKey && this.target) {
				object = this.target;
			}
			if (object === undefined) {
				object = this.selectObject(x, y);
			}
			if (object) {
				this.dragging = event;
				event.mode = 'object-move';
				event.node = object;
				event.enabled = false;
				event.startX = object.transform.x;
				event.startY = object.transform.y;
				window.on('pointerup', this.pointerup);
				window.on('pointermove', this.pointermove);
				this.requestRendering();
			}
			this.setTarget(object);
			break;
		}
		case 2:
			this.dragging = event;
			event.mode = 'ready-to-scroll';
			event.scrollLeft = this.screen.scrollLeft;
			event.scrollTop = this.screen.scrollTop;
			window.on('pointerup', this.pointerup);
			window.on('pointermove', this.pointermove);
			break;
	}
}.bind(UI);

UI.marqueePointermove = function (this: any, event: any) {
	if (!this.dragging) {
		this.marquee.pointerevent = event;
		const { x, y } = this.getPointerCoords(event);
		if (this.target) {
			const point = this.selectControlPoint(x, y);
			if (point) {
				this.setHover(null);
				this.setControlPoint(point);
				return;
			}
		}
		if (this.controlPointActive) {
			this.setControlPoint(null);
		}
		const object = this.selectObject(x, y);
		this.setHover(object);
	}
}.bind(UI);

UI.marqueePointerleave = function (this: any, event: any) {
	if (this.marquee.pointerevent) {
		this.marquee.pointerevent = null;
		this.setHover(null);
	}
}.bind(UI);

UI.marqueeDoubleclick = function (this: any, event: any) {
	if (this.target) {
		this.screenBlur();
		this.revealTarget();
	}
}.bind(UI);

UI.pointerup = function (this: any, event: any) {
	const { dragging } = this;
	if (dragging === null) {
		return;
	}
	if (event === undefined) {
		event = dragging;
	}
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'object-rotate':
			case 'object-resize':
				break;
			case 'object-move':
				this.requestRendering();
				break;
			case 'ready-to-scroll':
				if (event.target === this.marquee) {
					const { x, y } = this.getPointerCoords(event);
					const object = this.selectObject(x, y);
					this.setTarget(object);
					this.menuPopup(event);
				}
				break;
			case 'scroll':
				this.screen.endScrolling();
				Cursor.close!('cursor-grab');
				break;
		}
		this.dragging = null;
		window.off('pointerup', this.pointerup);
		window.off('pointermove', this.pointermove);
	}
}.bind(UI);

UI.pointermove = function (this: any, event: any) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		const dpr = window.devicePixelRatio;
		switch (dragging.mode) {
			case 'object-rotate':
				if (this.target) {
					const { x, y } = event.getRelativeCoords(GL.canvas);
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
					const transform = this.target.transform;
					if (transform.rotation !== rotation) {
						this.rotateTarget(rotation);
					}
					dragging.lastAngle = currentAngle;
				}
				break;
			case 'object-resize':
				if (this.target) {
					const { instance } = this.target;
					const { parent, transform } = instance;
					const points = this.controlPoints;
					const point = this.controlPointActive;
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
						this.resizeTarget(width, height);
					}
				}
				break;
			case 'object-move':
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
				if (this.target) {
					const transform = this.target.transform;
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
						this.shiftTarget(x, y);
					}
				}
				break;
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

UI.menuPopup = function (this: any, event: any) {
	this.translationKeyup();
	const { x, y } = this.getPointerCoords(event);
	const target = this.target;
	const selected = !!target;
	const pastable = (Clipboard as any).has('yami.ui.object');
	const get = Local.createGetter('menuUIList');
	const items = [
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.image'),
					click: () => {
						this.create('image', x, y);
					}
				},
				{
					label: get('create.text'),
					click: () => {
						this.create('text', x, y);
					}
				},
				{
					label: get('create.textBox'),
					click: () => {
						this.create('textbox', x, y);
					}
				},
				{
					label: get('create.dialogBox'),
					click: () => {
						this.create('dialogbox', x, y);
					}
				},
				{
					label: get('create.progressBar'),
					click: () => {
						this.create('progressbar', x, y);
					}
				},
				{
					label: get('create.button'),
					click: () => {
						this.create('button', x, y);
					}
				},
				{
					label: get('create.animation'),
					click: () => {
						this.create('animation', x, y);
					}
				},
				{
					label: get('create.video'),
					click: () => {
						this.create('video', x, y);
					}
				},
				{
					label: get('create.window'),
					click: () => {
						this.create('window', x, y);
					}
				},
				{
					label: get('create.container'),
					click: () => {
						this.create('container', x, y);
					}
				},
				{
					label: get('create.reference'),
					click: () => {
						this.create('reference', x, y);
					}
				},
				{
					label: get('create.shortcut'),
					enabled: selected && target.class !== 'reference',
					click: () => {
						this.createShortcut(target);
					}
				},
				UI.createPrefabItem(null, x, y)
			]
		},
		{
			label: get('toggle'),
			accelerator: '/',
			enabled: selected,
			click: () => {
				this.toggle();
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
				this.copy();
				this.delete();
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: selected,
			click: () => {
				this.copy();
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				this.paste(x, y);
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: selected,
			click: () => {
				this.duplicate();
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: selected,
			click: () => {
				this.delete();
			}
		},
		{
			label: get('copy-id'),
			enabled: selected,
			click: () => {
				navigator.clipboard.writeText(target.presetId);
			}
		},
		{
			label: get('find-references'),
			enabled: selected,
			click: () => {
				Reference.openRelated!(target.presetId);
			}
		}
	];
	if (selected) {
		if (!UI.hasPrefab(target)) {
			items.push({
				label: get('set-as-prefab'),
				enabled: target.class !== 'reference',
				click: () => {
					UI.setAsPrefab(target);
				}
			});
		} else {
			items.push({
				label: get('unset-as-prefab'),
				enabled: target.class !== 'reference',
				click: () => {
					UI.unsetAsPrefab(target);
				}
			});
		}
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		items
	);
};

UI.searcherInput = function (this: any, event: any) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input.value;
		UI.list.searchNodesDebounced(text);
	}
};

UI.listKeydown = function (this: any, event: any) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	if (event.cmdOrCtrlKey) {
		switch (event.code) {
			case 'KeyX':
				if (item) {
					this.copy(item);
					this.delete(item);
				}
				break;
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste(null);
				break;
			case 'KeyD':
				this.duplicate(item);
				break;
		}
	} else {
		switch (event.code) {
			case 'Slash':
				this.toggle(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
			case 'Backspace':
				this.cancelSearch();
				break;
			case 'Escape':
				UI.setTarget(null);
				break;
		}
	}
};

UI.listPointerdown = function (this: any, event: any) {
	switch (event.button) {
		case 0: {
			const element = event.target;
			switch (element.tagName) {
				case 'VISIBILITY-ICON': {
					const { item } = element.parentNode;
					const { instance, hidden } = item;
					const backups1 = this.setRecursiveStates(item, 'hidden', !hidden);
					const backups2 = this.setRecursiveStates(instance, 'visible', hidden);
					const length = Math.max(backups1.length, backups2.length);
					for (let i = 0; i < length; i++) {
						if (backups1[i] === backups2[i]) {
							throw new Error('Failed to switch hidden state');
						}
					}
					this.update();
					dispatchChangeEvent(this);
					UI.requestRendering();
					UI.history.save({
						type: 'ui-object-hidden',
						item: item,
						oldValues1: backups1,
						oldValues2: backups2,
						newValue: !hidden
					});
					break;
				}
				case 'LOCK-ICON': {
					const { item } = element.parentNode;
					const { locked } = item;
					const backups = this.setRecursiveStates(item, 'locked', !locked);
					this.update();
					dispatchChangeEvent(this);
					UI.history.save({
						type: 'ui-object-locked',
						item: item,
						oldValues: backups,
						newValue: !locked
					});
					break;
				}
			}
			break;
		}
		case 3:
			this.cancelSearch();
			break;
	}
};

UI.listSelect = function (this: any, event: any) {
	UI.setTarget(event.value);
};

UI.listRecord = function (this: any, event: any) {
	const response = event.value;
	switch (response.type) {
		case 'rename':
			UI.listRename(response);
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

UI.listPopup = function (this: any, event: any) {
	const item = event.value;
	const menuItems = [];
	const get = Local.createGetter('menuUIList');
	const selected = !!item;
	const copyable = selected;
	const pastable = (Clipboard as any).has('yami.ui.object');
	const deletable = selected;
	const renamable = selected;
	menuItems.push({
		label: get('create'),
		submenu: [
			{
				label: get('create.image'),
				click: () => {
					this.addNodeTo(Inspector.uiImage.create(), item);
				}
			},
			{
				label: get('create.text'),
				click: () => {
					this.addNodeTo(Inspector.uiText.create(), item);
				}
			},
			{
				label: get('create.textBox'),
				click: () => {
					this.addNodeTo(Inspector.uiTextBox.create(), item);
				}
			},
			{
				label: get('create.dialogBox'),
				click: () => {
					this.addNodeTo(Inspector.uiDialogBox.create(), item);
				}
			},
			{
				label: get('create.progressBar'),
				click: () => {
					this.addNodeTo(Inspector.uiProgressBar.create(), item);
				}
			},
			{
				label: get('create.button'),
				click: () => {
					this.addNodeTo(Inspector.uiButton.create(), item);
				}
			},
			{
				label: get('create.animation'),
				click: () => {
					this.addNodeTo(Inspector.uiAnimation.create(), item);
				}
			},
			{
				label: get('create.video'),
				click: () => {
					this.addNodeTo(Inspector.uiVideo.create(), item);
				}
			},
			{
				label: get('create.window'),
				click: () => {
					this.addNodeTo(Inspector.uiWindow.create(), item);
				}
			},
			{
				label: get('create.container'),
				click: () => {
					this.addNodeTo(Inspector.uiContainer.create(), item);
				}
			},
			{
				label: get('create.reference'),
				click: () => {
					this.addNodeTo(Inspector.uiReference.create(), item);
				}
			},
			{
				label: get('create.shortcut'),
				enabled: selected && item.class !== 'reference',
				click: () => {
					UI.createShortcut(item);
				}
			},
			UI.createPrefabItem(item)
		]
	});
	if (selected) {
		menuItems.push(
			{
				label: get('reveal'),
				accelerator: 'Enter',
				click: () => {
					UI.revealTarget(item);
				}
			},
			{
				label: get('toggle'),
				accelerator: '/',
				click: () => {
					this.toggle(item);
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
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: copyable,
			click: () => {
				this.duplicate(item);
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
				(this as any).rename(item);
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
		if (!UI.hasPrefab(item)) {
			menuItems.push({
				label: get('set-as-prefab'),
				enabled: item.class !== 'reference',
				click: () => {
					UI.setAsPrefab(item);
				}
			});
		} else {
			menuItems.push({
				label: get('unset-as-prefab'),
				enabled: item.class !== 'reference',
				click: () => {
					UI.unsetAsPrefab(item);
				}
			});
		}
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		menuItems
	);
};

UI.listOpen = function (this: any, event: any) {
	UI.revealTarget(event.value);
};

UI.listRename = function (response: any) {
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

UI.listChange = function (this: any, event: any) {
	UI.planToSave();
};

UI.listPageResize = function (this: any, event: any) {
	UI.list.updateHead();
	UI.list.resize();
};

// 选框 - 调整目标
UI.marquee.resize = function (this: any) {
	if (this.pointerevent) {
		UI.marqueePointermove(this.pointerevent);
	}
};

// 列表 - 复制
UI.list.copy = function (item: any) {
	if (item) {
		(Clipboard as any).write('yami.ui.object', item);
	}
};

// 列表 - 粘贴
UI.list.paste = function (this: any, dItem: any, callback: any) {
	const copy = (Clipboard as any).read('yami.ui.object');
	if (copy && this.data) {
		callback?.(copy);
		this.addNodeTo(copy, dItem);
		UI.requestRendering();
	}
};

// 列表 - 删除
UI.list.delete = function (this: any, item: any) {
	if (item) {
		this.deleteNode(item);
		UI.requestRendering();
	}
};

// 列表 - 开关
UI.list.toggle = function (this: any, item: any) {
	if (item) {
		UI.history.save({
			type: 'ui-object-toggle',
			item: item,
			oldValue: item.enabled,
			newValue: !item.enabled
		});
		item.enabled = !item.enabled;
		this.updateConditionIcon(item);
		dispatchChangeEvent(this);
	}
};

// 列表 - 取消搜索
UI.list.cancelSearch = function (this: any) {
	if (this.display === 'search') {
		const active = document.activeElement;
		UI.searcher.deleteInputContent();
		this.expandToSelection();
		this.scrollToSelection();
		active!.focus();
	}
};

// 列表 - 重写创建图标方法
UI.list.createIcon = (function IIFE() {
	const iconCreators = {
		image: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-image');
			return icon;
		},
		text: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-text');
			return icon;
		},
		textbox: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-textbox');
			return icon;
		},
		dialogbox: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-dialogbox');
			return icon;
		},
		progressbar: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-progressbar');
			return icon;
		},
		button: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-button');
			return icon;
		},
		animation: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-animation');
			return icon;
		},
		video: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-video');
			return icon;
		},
		window: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-window');
			return icon;
		},
		container: () => {
			const icon = document.createElement('node-icon');
			addClass(icon, 'icon-ui-container');
			return icon;
		},
		reference: (item: any) => {
			const icon = document.createElement('node-icon');
			const preset = Data.uiPresets[item.prefabId];
			switch (preset?.data.class ?? 'reference') {
				case 'image':
					addClass(icon, 'icon-ui-image');
					break;
				case 'text':
					addClass(icon, 'icon-ui-text');
					break;
				case 'textbox':
					addClass(icon, 'icon-ui-textbox');
					break;
				case 'dialogbox':
					addClass(icon, 'icon-ui-dialogbox');
					break;
				case 'progressbar':
					addClass(icon, 'icon-ui-progressbar');
					break;
				case 'button':
					addClass(icon, 'icon-ui-button');
					break;
				case 'animation':
					addClass(icon, 'icon-ui-animation');
					break;
				case 'video':
					addClass(icon, 'icon-ui-video');
					break;
				case 'window':
					addClass(icon, 'icon-ui-window');
					break;
				case 'container':
					addClass(icon, 'icon-ui-container');
					break;
				case 'reference':
					addClass(icon, 'icon-ui-reference');
					break;
			}
			if (!hasClass(icon, 'icon-ui-reference')) {
				addClass(icon, 'icon-ui-reference-active');
			}
			return icon;
		}
	};
	return function (item: any) {
		const icon = (iconCreators as any)[item.class](item);
		if (UI.hasPrefab(item)) {
			addClass(icon, 'icon-ui-set-as-prefab');
		}
		return icon;
	};
})();

// 列表 - 更新图标
UI.list.updateIcon = function (this: any, item: any) {
	const { element } = item;
	if (element?.nodeIcon) {
		const icon = this.createIcon(item);
		element.replaceChild(icon, element.nodeIcon);
		element.nodeIcon = icon;
	}
};

// 列表 - 更新头部位置
UI.list.updateHead = function () {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = Layout.getGroupOfElement!(head) as any;
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild);
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
	}
};

// 列表 - 创建条件图标
UI.list.createConditionIcon = function (item: any) {
	const { element } = item;
	const conditionIcon = document.createElement('node-icon');
	addClass(conditionIcon, 'icon-conditional');
	element.appendChild(conditionIcon);
	element.conditionIcon = conditionIcon;
	element.condition = '';
};

// 列表 - 更新条件图标
UI.list.updateConditionIcon = function (item: any) {
	const { element, enabled } = item;
	const condition = enabled ? 'none' : 'absent';
	if (element.condition !== condition) {
		element.condition = condition;
		const icon = element.conditionIcon;
		switch (condition) {
			case 'none':
				removeClass(element, 'weak');
				hide(icon);
				break;
			case 'absent':
				addClass(element, 'weak');
				icon.textContent = '!';
				show(icon);
				break;
		}
	}
};

// 列表 - 在创建数据时回调
UI.list.onCreate = function (item: any) {
	UI.registerPreset(item);
	UI.loadElement(item);
	UI.updateElement(item);
};

// 列表 - 在迁移数据时回调
UI.list.onRemove = function (item: any) {
	UI.updateElement(item);
};

// 列表 - 在删除数据时回调
UI.list.onDelete = function (item: any) {
	UI.unregisterPreset(item);
	UI.deleteElement(item);
	UI.updateHover();
	UI.updateTarget();
	UI.requestRendering();
};

// 列表 - 在恢复数据时回调
UI.list.onResume = function (item: any) {
	UI.registerPreset(item);
	UI.loadElement(item);
	UI.updateElement(item);
};
