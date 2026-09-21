import { elementDataOf } from '@ui-kit';
import { uiEls } from '@app/engine/ui/element-registry';
import { hide } from '@app/utils/element-utils.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';

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
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

// oxlint-disable-next-line no-explicit-any
export type UINodeShape = { class: string; children: UINodeShape[]; [k: string]: any };

export interface UIContextShape {
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
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
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

export const UI = {
	page: uiEls.get('ui') as YamiElement,
	head: uiEls.get('ui-head') as YamiElement,
	body: hide(uiEls.get('ui-body') as YamiElement),
	screen: uiEls.get('ui-screen') as YamiElement,
	marquee: (uiEls.get('ui-marquee') as YamiElement) || {},
	searcher: uiEls.get('ui-searcher') as YamiElement,
	list: (uiEls.get('ui-list') as YamiElement) || {},
	dragging: null as UIPointerEvent | null,
	hover: null as UINodeShape | null,
	controlPoints: null,
	controlPointActive: null,
	translationKey: 0b0000,
	translationTimer: null,
	zoomTimer: null,
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
} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;

UI.marquee.resize = null;

// P4b：`page` 走显式元素数据（字段已从 DATA_FIELDS 摘除）
elementDataOf<{ page?: HTMLElement | null }>(UI.list).page = uiEls.get('ui-element') as YamiElement;
elementDataOf<{ head: HTMLElement }>(UI.list).head = uiEls.get('ui-list-head') as YamiElement;
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

export const uiWindowReady = Promise.all([
	import('@app/engine/ui/element-register.ts'),
	import('./register.ts')
])
	.then(() => undefined)
	.catch(() => undefined);
