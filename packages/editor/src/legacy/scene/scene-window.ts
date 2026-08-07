import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { addScrollbars, hide, show, on, write, clear, rect } from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { File } from '@/file/file-system-core.ts';

import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { GUID } from '@/file/guid.ts';
import { Codec } from '@/codec/codec.ts';
import { Data } from '@/data/data-object.ts';
import { Inspector } from '@/inspector/inspector.ts';
import { Layout } from '@/layout/layout.ts';
import { Palette } from '@/palette/palette.ts';
import { Particle } from '@/particle/particle-window.ts';
import { ObjectFolder } from './default-object-folder.ts';
import { SceneShift } from './move-scene.ts';
import { TilemapShortcuts } from './tilemap-shortcut-list.ts';
import { History } from '@/tools/history.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import { Matrix } from '@/webgl/matrix2.ts';
import { GL } from '@/webgl/webgl-init.ts';

type SceneState = 'closed' | 'open' | 'loading';

// 通用可空方法契约（运行时挂载的具体方法签名各异，统一用宽类型）
type SceneMethod = ((...args: any[]) => any) | null;

// 列表运行时挂载的扩展方法（Scene.list / UI.list 共享，ui-window.ts:218-238 调用）
interface SceneListExtensions {
	// 列表基础方法（Scene.list.* 运行时挂载）
	create: ((...args: any[]) => any) | null;
	copy: ((...args: any[]) => any) | null;
	paste: ((...args: any[]) => any) | null;
	delete: ((...args: any[]) => any) | null;
	toggle: ((...args: any[]) => any) | null;
	cancelSearch: ((...args: any[]) => any) | null;
	createIcon: ((...args: any[]) => any) | null;
	updateIcon: ((...args: any[]) => any) | null;
	updateHead: ((...args: any[]) => any) | null;
	createConditionIcon: ((...args: any[]) => any) | null;
	updateConditionIcon: ((...args: any[]) => any) | null;
	createEventIcon: ((...args: any[]) => any) | null;
	updateEventIcon: ((...args: any[]) => any) | null;
	createScriptIcon: ((...args: any[]) => any) | null;
	updateScriptIcon: ((...args: any[]) => any) | null;
	createVisibilityIcon: ((...args: any[]) => any) | null;
	updateVisibilityIcon: ((...args: any[]) => any) | null;
	createLockIcon: ((...args: any[]) => any) | null;
	updateLockIcon: ((...args: any[]) => any) | null;
	restoreRecursiveStates: ((...args: any[]) => any) | null;
	setRecursiveStates: ((...args: any[]) => any) | null;
	updateItemClass: ((...args: any[]) => any) | null;
	onCreate: ((...args: any[]) => any) | null;
	onRemove: ((...args: any[]) => any) | null;
	onDelete: ((...args: any[]) => any) | null;
	onResume: ((...args: any[]) => any) | null;
	// creators/updaters 数组（运行时挂载，供 push 挂载方法）
	creators: any[];
	updaters: any[];
}

interface SceneShape {
	state: SceneState;
	page: HTMLElement;
	head: HTMLElement & { width?: number; left?: number };
	body: HTMLElement & { hide(): HTMLElement; show(): HTMLElement };
	info: HTMLElement;
	screen: HTMLElement;
	// marquee 运行时挂载 .resize()/.terrain/.previewTiles/.pointerevent/.save/.switch/.select/.getTiles 等大量扩展 用 [ k: string ]: any 索引签名兜底所有运行时挂载字段，避免穷举
	marquee: HTMLElement & { [k: string]: any };
	// searcher 运行时挂载 .deleteInputContent/.input 等扩展（scene-list.ts:97 调用）
	searcher: HTMLElement & { [k: string]: any };
	list: HTMLElement & SceneListExtensions & { [k: string]: any };
	// editor properties（运行时挂载具体值，统一 any | null）
	[k: string]: any;
}

export const Scene: SceneShape = {
	state: 'closed',
	page: $('#scene'),
	head: $('#scene-head'),
	body: hide($('#scene-body')),
	info: $('#scene-info'),
	screen: $('#scene-screen'),
	marquee: $('#scene-marquee') || ({} as any),
	searcher: $('#scene-searcher'),
	list: ($('#scene-list') as unknown as never) || ({} as never),
	dragging: null as any,
	tilemap: null as any,
	target: null as any,
	layer: null as any,
	brush: null as any,
	symbol: null as any,
	history: null as any,
	textures: null as any,
	shiftKey: false,
	translationKey: 0b0000,
	translationTimer: null as any,
	showGrid: false,
	showLight: false,
	showAnimation: false,
	animationFrame: null as any,
	animationElapsed: null as any,
	background: null as any,
	matrix: null as any,
	zoom: null as any,
	zoomTimer: null as any,
	scale: null as any,
	scaleX: null as any,
	scaleY: null as any,
	scaledTileWidth: null as any,
	scaledTileHeight: null as any,
	aspectRatio: null as any,
	outerWidth: null as any,
	outerHeight: null as any,
	scrollLeft: null as any,
	scrollTop: null as any,
	scrollRight: null as any,
	scrollBottom: null as any,
	scrollCenterX: null as any,
	scrollCenterY: null as any,
	centerOffsetX: null as any,
	centerOffsetY: null as any,
	lightLeft: null as any,
	lightTop: null as any,
	lightRight: null as any,
	lightBottom: null as any,
	padding: null as any,
	paddingLeft: null as any,
	paddingTop: null as any,
	patternOriginX: null as any,
	patternOriginY: null as any,
	inspectorTypeMap: null as any,
	tilemapLightSamplingModes: null as any,
	defaultLightSamplingModes: null as any,
	startPositionTexture: null as any,
	blendModeMap: null as any,
	activeTilemapId: null as any,
	sharedPoint: null as any,
	previewObject: null as any,
	context: null as any,
	meta: null as any,
	width: null as any,
	height: null as any,
	tileWidth: null as any,
	tileHeight: null as any,
	animationInterval: null as any,
	ambient: null as any,
	terrains: null as any,
	events: null as any,
	scripts: null as any,
	objects: null as any,
	tilemaps: null as any,
	actors: null as any,
	regions: null as any,
	lights: null as any,
	animations: null as any,
	particles: null as any,
	parallaxes: null as any,
	backgrounds: null as any,
	foregrounds: null as any,
	doodads: null as any,
	initialize: null as any,
	open: null as any,
	load: null as any,
	save: null as any,
	close: null as any,
	destroy: null as any,
	shiftTilemap: null as any,
	shiftTerrains: null as any,
	shiftObjects: null as any,
	computeObjectShifting: null as any,
	getDefaultObjectFolder: null as any,
	copy: null as any,
	paste: null as any,
	duplicate: null as any,
	create: null as any,
	delete: null as any,
	toggle: null as any,
	undo: null as any,
	redo: null as any,
	setZoom: null as any,
	setSize: null as any,
	setTileSize: null as any,
	setTilemapSize: null as any,
	setTarget: null as any,
	openTilemap: null as any,
	closeTilemap: null as any,
	computeActiveTilemapId: null as any,
	revealTarget: null as any,
	shiftTarget: null as any,
	redirectTarget: null as any,
	updateTarget: null as any,
	updateTargetInfo: null as any,
	updateTargetItem: null as any,
	updateTargetEditor: null as any,
	updateAnimationInterval: null as any,
	updateLightAreaExpansion: null as any,
	updateActorTeams: null as any,
	updateHead: null as any,
	resize: null as any,
	getTileCoords: null as any,
	getConvertedCoords: null as any,
	getParallaxAnchor: null as any,
	getGridContext: null as any,
	rasterizeScrollPosition: null as any,
	updateLightTexParameters: null as any,
	updateCamera: null as any,
	updateTransform: null as any,
	registerPreset: null as any,
	unregisterPreset: null as any,
	sortLayers: null as any,
	loadObjects: null as any,
	loadTextures: null as any,
	loadAllContexts: null as any,
	loadActorContext: null as any,
	loadLightContext: null as any,
	loadAnimationContext: null as any,
	loadParallaxContext: null as any,
	loadParticleContext: null as any,
	loadObjectContext: null as any,
	reloadObjectContext: null as any,
	destroyObjectContext: null as any,
	createPreviewObject: null as any,
	deletePreviewObject: null as any,
	updateParallaxes: null as any,
	drawScene: null as any,
	drawBackgrounds: null as any,
	drawForegrounds: null as any,
	updateAnimations: null as any,
	updateParticles: null as any,
	drawTileLayer: null as any,
	drawGridLayer: null as any,
	drawRegionLayer: null as any,
	drawRegionBorders: null as any,
	drawObjectLayer: null as any,
	drawDirectLightLayer: null as any,
	drawNameLayer: null as any,
	drawTerrainLayer: null as any,
	drawLightTextures: null as any,
	drawTilemap: null as any,
	drawTilePreview: null as any,
	drawTileMarquee: null as any,
	drawTerrainMarquee: null as any,
	drawTilemapWireframe: null as any,
	drawAnimationWireframe: null as any,
	drawAnimationAnchor: null as any,
	drawLightWireframe: null as any,
	drawRegionWireframe: null as any,
	drawParticleEmitterWireframe: null as any,
	drawParallaxWireframe: null as any,
	drawOvalWireframe: null as any,
	drawTargetAnchor: null as any,
	drawRectWireframe: null as any,
	drawRectWireframeOnTilemap: null as any,
	setRectWireframeVertices: null as any,
	createStartPositionTexture: null as any,
	drawStartPosition: null as any,
	selectObject: null as any,
	selectRegion: null as any,
	selectLight: null as any,
	selectParticleEmitter: null as any,
	selectSortedLayer: null as any,
	edit: null as any,
	editInPencilMode: null as any,
	editInRectMode: null as any,
	editInOvalMode: null as any,
	editInFillMode: null as any,
	setTile: null as any,
	setTileFrame: null as any,
	setTerrain: null as any,
	createTiles: null as any,
	cloneTiles: null as any,
	createTerrains: null as any,
	getNewTilesetIndex: null as any,
	requestAnimation: null as any,
	updateAnimation: null as any,
	stopAnimation: null as any,
	requestRendering: null as any,
	renderingFunction: null as any,
	stopRendering: null as any,
	switchLayer: null as any,
	switchBrush: null as any,
	switchGrid: null as any,
	switchLight: null as any,
	switchAnimation: null as any,
	switchSettings: null as any,
	switchTerrain: null as any,
	resetAnimations: null as any,
	updateFont: null as any,
	planToSave: null as any,
	planToSaveTerrains: null as any,
	beginMapRecord: null as any,
	closeMapRecord: null as any,
	saveMapRecord: null as any,
	recordMapData: null as any,
	restoreMapData: null as any,
	undoMapData: null as any,
	redoMapData: null as any,
	createHistory: null as any,
	createDefaultAnimation: null as any,
	getObjectFile: null as any,
	openFileLocation: null as any,
	saveToConfig: null as any,
	loadFromConfig: null as any,
	saveToProject: null as any,
	loadFromProject: null as any,
	webglRestored: null as any,
	windowResize: null as any,
	themechange: null as any,
	dprchange: null as any,
	datachange: null as any,
	keydown: null as any,
	headPointerdown: null as any,
	switchPointerdown: null as any,
	layerPointerdown: null as any,
	brushPointerdown: null as any,
	zoomFocus: null as any,
	zoomInput: null as any,
	screenKeydown: null as any,
	shiftKeyup: null as any,
	translationKeyup: null as any,
	screenWheel: null as any,
	screenUserscroll: null as any,
	screenBlur: null as any,
	screenDragenter: null as any,
	screenDragleave: null as any,
	screenDragover: null as any,
	screenDrop: null as any,
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
	Textures: null as any,
	Point: null as any
};

Scene.marquee.key = null;
Scene.marquee.offsetX = null;
Scene.marquee.offsetY = null;
Scene.marquee.tilesetMap = null;
Scene.marquee.tiles = null;
Scene.marquee.terrain = null;
Scene.marquee.previewTiles = false;
Scene.marquee.pointerevent = null;
Scene.marquee.save = null as unknown as (...args: unknown[]) => any;
Scene.marquee.switch = null;
Scene.marquee.resize = null as unknown as (...args: unknown[]) => any;
(Scene.marquee as any).clear = null as unknown as (...args: unknown[]) => any;
Scene.marquee.select = null as unknown as (...args: unknown[]) => any;
Scene.marquee.selectInPencilMode = null;
Scene.marquee.selectInRectMode = null;
Scene.marquee.selectInCopyMode = null;
Scene.marquee.selectInObjectMode = null;
Scene.marquee.getTiles = null;

Scene.list.page = $('#scene-object');
Scene.list.head = $('#scene-list-head');
Scene.list.copy = null as unknown as (...args: unknown[]) => any;
Scene.list.paste = null as unknown as (...args: unknown[]) => any;
Scene.list.duplicate = null as unknown as (...args: unknown[]) => any;
Scene.list.delete = null as unknown as (...args: unknown[]) => any;
Scene.list.toggle = null as unknown as (...args: unknown[]) => any;
Scene.list.cancelSearch = null as unknown as (...args: unknown[]) => any;
Scene.list.createFolder = null as unknown as (...args: unknown[]) => any;
Scene.list.createTilemapShortcutItems = null;
Scene.list.restoreRecursiveStates = null as unknown as (...args: unknown[]) => any;
Scene.list.setRecursiveStates = null as unknown as (...args: unknown[]) => any;
Scene.list.updateItemClass = null as unknown as (...args: unknown[]) => any;
Scene.list.updateFolderState = null;
Scene.list.canSwitchState = null;
Scene.list.createIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateHead = null as unknown as (...args: unknown[]) => any;
Scene.list.updateTilemapClass = null;
Scene.list.createConditionIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateConditionIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.createEventIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateEventIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.createScriptIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateScriptIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.createVisibilityIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateVisibilityIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.createLockIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.updateLockIcon = null as unknown as (...args: unknown[]) => any;
Scene.list.onCreate = null;
Scene.list.onRemove = null;
Scene.list.onDelete = null;
Scene.list.onResume = null;

Scene.initialize = function (this: any) {
	this.page = $('#scene');
	this.head = $('#scene-head');
	this.body = hide($('#scene-body'));
	this.info = $('#scene-info');
	this.screen = $('#scene-screen');
	const oldMarquee = this.marquee;
	this.marquee = $('#scene-marquee');
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	this.searcher = $('#scene-searcher');
	const oldList = this.list;
	this.list = $('#scene-list');
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	this.list.page = $('#scene-object');
	this.list.head = $('#scene-list-head');
	this.screen && addScrollbars(this.screen);

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (timer: any) => {
			if (this.state === 'open' && this.dragging === null) {
				const key = this.translationKey;
				const meta = this.meta;
				const step = (Timer.deltaTime * 0.04) / this.scale;
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
				const cx = Math.roundTo(meta.x + x, 4);
				const cy = Math.roundTo(meta.y + y, 4);
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
		update: (timer: any) => {
			if (this.state === 'open') {
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

	this.marquee.key = 'tile';
	this.marquee.x = 0;
	this.marquee.y = 0;
	this.marquee.width = 1;
	this.marquee.height = 1;
	this.marquee.offsetX = 0;
	this.marquee.offsetY = 0;
	this.marquee.tilesetMap = Palette.tilesetMap;
	this.marquee.tiles = this.createTiles!(1, 1);
	this.marquee.terrain = 0b10;
	this.marquee.save('eraser');
	this.marquee.save('tile');
	this.marquee.save('object');
	this.marquee.save('terrain');
	this.marquee.backgroundColorNormal = [0, 192 / 255, 1, 0.2];
	this.marquee.borderColorNormal = [1, 1, 1, 1];
	this.marquee.backgroundColorCopy = [0, 1, 0, 0.2];
	this.marquee.borderColorCopy = [0, 1, 0, 1];
	this.marquee.backgroundColorRect = [0, 192 / 255, 1, 0.2];
	this.marquee.borderColorRect = [1, 1, 1, 1];
	this.marquee.backgroundColorInvalid = [192 / 255, 0, 0, 0.2];

	this.padding = 800;

	this.matrix = new Matrix();

	this.inspectorTypeMap = {
		actor: 'sceneActor',
		region: 'sceneRegion',
		light: 'sceneLight',
		animation: 'sceneAnimation',
		parallax: 'sceneParallax',
		particle: 'sceneParticle',
		tilemap: 'sceneTilemap'
	};

	this.tilemapLightSamplingModes = {
		raw: 0,
		global: 1,
		ambient: 2
	};

	this.defaultLightSamplingModes = {
		raw: 0,
		global: 0,
		anchor: 0
	};

	this.blendModeMap = {
		0: 'normal',
		1: 'additive',
		2: 'subtract',
		normal: 0,
		additive: 1,
		subtract: 2
	};

	this.sharedPoint = new Scene.Point!();

	this.searcher.addCloseButton();
	this.searcher.addKeydownFilter();

	const { list } = this;
	list.removable = true;
	list.renamable = true;
	(list as any).bind(() => this.objects);
	list.updaters?.push(list.updateItemClass);
	list.creators?.push(list.updateTilemapClass);
	list.creators?.push(list.createConditionIcon);
	list.creators?.push(list.updateConditionIcon);
	list.creators?.push(list.createEventIcon);
	list.creators?.push(list.updateEventIcon);
	list.creators?.push(list.createScriptIcon);
	list.creators?.push(list.updateScriptIcon);
	list.creators?.push(list.createVisibilityIcon);
	list.updaters?.push(list.updateVisibilityIcon);
	list.creators?.push(list.createLockIcon);
	list.updaters?.push(list.updateLockIcon);

	History.processors['scene-folder-rename'] = (operation: any, data: any) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['scene-object-create'] = (operation: any, data: any) => {
		const { response, parent } = data;
		list.restore(operation, response);
		list.updateFolderState(parent, 'hidden');
		list.updateFolderState(parent, 'locked');
	};
	History.processors['scene-object-delete'] = (operation: any, data: any) => {
		const { response } = data;
		const parent = response.item.parent;
		list.restore(operation, response);
		list.updateFolderState(parent, 'hidden');
		list.updateFolderState(parent, 'locked');
	};
	History.processors['scene-object-remove'] = (operation: any, data: any) => {
		const { response } = data;
		const sParent = response.source.parent;
		const dParent = response.destination.parent;
		list.restore(operation, response);
		list.updateFolderState(sParent, 'hidden');
		list.updateFolderState(sParent, 'locked');
		if (sParent !== dParent) {
			list.updateFolderState(dParent, 'hidden');
			list.updateFolderState(dParent, 'locked');
		}
	};
	History.processors['scene-object-toggle'] = (operation: any, data: any) => {
		const { item, oldValue, newValue } = data;
		if (operation === 'undo') {
			item.enabled = oldValue;
		} else {
			item.enabled = newValue;
		}
		list.updateConditionIcon!(item);
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-object-hidden'] = (operation: any, data: any) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates!(item, 'hidden', oldValues);
		} else {
			list.setRecursiveStates!(item, 'hidden', newValue);
		}
		list.updateFolderState(item.parent, 'hidden');
		list.update();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-object-locked'] = (operation: any, data: any) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates!(item, 'locked', oldValues);
		} else {
			list.setRecursiveStates!(item, 'locked', newValue);
		}
		list.updateFolderState(item.parent, 'locked');
		list.update();
		Scene.planToSave!();
	};
	History.processors['scene-resize'] = (operation: any, data: any) => {
		const { editor, width, height, terrains } = data;
		const { scene } = Scene.context;
		data.width = Scene.width;
		data.height = Scene.height;
		data.terrains = Scene.terrains;
		Scene.width = width;
		Scene.height = height;
		Scene.terrains = terrains;
		if (editor.target === scene) {
			write(editor, { width, height });
		} else {
			Inspector.open!('fileScene', scene);
		}
		Scene.planToSaveTerrains!();
		Scene.resize!();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-tilemap-resize'] = (operation: any, data: any) => {
		const { editor, tilemap, width, height, tiles, tilesetMap } = data;
		data.width = tilemap.width;
		data.height = tilemap.height;
		data.tiles = tilemap.tiles;
		tilemap.width = width;
		tilemap.height = height;
		tilemap.tiles = tiles;
		tilemap.tilesetMap = tilesetMap;
		tilemap.changed = true;
		if (editor.target === tilemap) {
			write(editor, { width, height });
		}
		Scene.setTarget!(tilemap);
		Scene.marquee.resize();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-tilemap-shortcut'] = (operation: any, data: any) => {
		const { tilemap, shortcut } = data;
		data.shortcut = tilemap.shortcut;
		tilemap.shortcut = shortcut;
		Scene.setTarget!(tilemap);
		Scene.tilemaps.shortcuts.update();
		Scene.planToSave!();
	};
	History.processors['scene-tilemap-shift'] = (operation: any, data: any) => {
		const { tilemap, shiftX, shiftY } = data;
		if (operation === 'undo') {
			Scene.shiftTilemap!(tilemap, -shiftX, -shiftY);
		} else {
			Scene.shiftTilemap!(tilemap, shiftX, shiftY);
		}
		tilemap.changed = true;
		Scene.setTarget!(tilemap);
		Scene.planToSave!();
	};
	History.processors['scene-shift'] = (operation: any, data: any) => {
		const { shiftX, shiftY, changes } = data;
		if (operation === 'undo') {
			Scene.shiftTerrains!(-shiftX, -shiftY);
		} else {
			Scene.shiftTerrains!(shiftX, shiftY);
		}
		Scene.shiftObjects!(changes);
		Scene.planToSaveTerrains!();
		Scene.planToSave!();
	};
	History.processors['scene-tilemap-change'] = (operation: any, data: any) => {
		const { tilemap, changes, tilesetMap } = data;
		switch (operation) {
			case 'undo':
				Scene.undoMapData!(tilemap.tiles, changes);
				break;
			case 'redo':
				Scene.redoMapData!(tilemap.tiles, changes);
				break;
		}
		tilemap.tilesetMap = tilesetMap;
		tilemap.changed = true;
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-terrain-change'] = (operation: any, data: any) => {
		const { terrains, changes } = data;
		switch (operation) {
			case 'undo':
				Scene.undoMapData!(terrains, changes);
				break;
			case 'redo':
				Scene.redoMapData!(terrains, changes);
				break;
		}
		Scene.planToSaveTerrains!();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-target-shift'] = (operation: any, data: any) => {
		const { editor, target, x, y } = data;
		data.x = target.x;
		data.y = target.y;
		target.x = x;
		target.y = y;
		if (editor.target === target) {
			write(editor, { x, y });
		}
		Scene.setTarget!(target);
		Scene.updateTargetInfo!();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-target-redirect'] = (operation: any, data: any) => {
		const { editor, target, angle } = data;
		data.angle = target.angle;
		target.angle = angle;
		target.player.setAngle(Math.radians(angle));
		if (editor.target === target) {
			write(editor, { angle });
		}
		Scene.setTarget!(target);
		Scene.requestRendering!();
		Scene.planToSave!();
	};

	window.addEventListener('themechange', this.themechange);
	window.addEventListener('dprchange', this.dprchange);
	window.addEventListener('datachange', this.datachange);
	window.addEventListener('keydown', this.keydown);
	window.addEventListener('keydown', Reference.getKeydownListener!(list));
	on(this.page, 'resize', this.windowResize);
	on(GL.canvas, 'webglcontextrestored', this.webglRestored);
	// head/toolbar/zoom/screen(keydown/wheel)/marquee(pointerdown/doubleclick) 经 Vue 模板转发（ScenePage @pointerdown/@input/@focus/@keydown/@wheel）
	on(this.screen, 'userscroll', this.screenUserscroll);
	on(this.screen, 'blur', this.screenBlur);
	on(this.screen, 'dragenter', this.screenDragenter);
	on(this.screen, 'dragleave', this.screenDragleave);
	on(this.screen, 'dragover', this.screenDragover);
	on(this.screen, 'drop', this.screenDrop);
	on(this.marquee, 'pointermove', this.marqueePointermove);
	on(this.marquee, 'pointerleave', this.marqueePointerleave);
	on(this.searcher, 'input', this.searcherInput);
	on(this.searcher, 'compositionend', this.searcherInput);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	on(list, 'pointerdown', Reference.getPointerdownListener!(list), {
		capture: true
	});
	// list select/record/popup/open 经 Vue 模板转发（LayoutPanel @select/@record/@popup/@open → Scene.list*）
	// list change 经 Vue 模板转发（LayoutPanel @change → Scene.listChange）
	on(list.page, 'resize', this.listPageResize);

	ObjectFolder.initialize!();
	SceneShift.initialize!();
	TilemapShortcuts.initialize!();
};

Scene.open = function (this: any, context: any) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();
	const { meta } = context;
	this.context = context;
	this.meta = meta;

	Particle.Element.stage = this;

	if (context.scene) {
		this.state = 'open';
		this.load!(context);
		show(this.body);
		// 因此在这里调用resize
		this.resize!();
		this.requestAnimation!();
		this.requestRendering!();
		return;
	}

	const scene = Data.scenes[meta.guid];
	if (scene) {
		context.scene = Codec.decodeScene!(scene);
		this.state = 'loading';
		this.load!(context);
	} else {
		(Layout.manager as any).switch('directory');
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

Scene.load = function (this: any, context: any) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		const tilemaps = [] as any;
		tilemaps.shortcuts = new TilemapShortcuts(tilemaps);

		const regions = [] as any;
		regions.visibleList = [] as any[];
		regions.visibleList.count = 0;

		context.changed = false;
		context.editor = {
			target: null as any,
			tilemap: null as any,
			history: this.createHistory!(),
			textures: new Scene.Textures!(),
			tilemaps: tilemaps,
			actors: [],
			regions: regions,
			lights: [],
			animations: [],
			particles: [],
			parallaxes: [],
			backgrounds: [],
			foregrounds: [],
			doodads: [],
			animationFrame: 0,
			animationElapsed: 0,
			animationInterval: -1
			// listScrollTop: 0,
		};
	}
	const { scene, editor } = context;

	this.width = scene.width;
	this.height = scene.height;
	this.tileWidth = scene.tileWidth;
	this.tileHeight = scene.tileHeight;
	this.ambient = scene.ambient;
	this.terrains = scene.terrainArray;
	this.events = scene.events;
	this.scripts = scene.scripts;
	this.objects = scene.objects;

	this.history = editor.history;
	this.textures = editor.textures;
	this.tilemaps = editor.tilemaps;
	this.actors = editor.actors;
	this.regions = editor.regions;
	this.lights = editor.lights;
	this.animations = editor.animations;
	this.particles = editor.particles;
	this.parallaxes = editor.parallaxes;
	this.backgrounds = editor.backgrounds;
	this.foregrounds = editor.foregrounds;
	this.doodads = editor.doodads;
	this.animationFrame = editor.animationFrame;
	this.animationElapsed = editor.animationElapsed;
	this.animationInterval = editor.animationInterval;
	this.updateAnimationInterval!();

	this.updateFont!();

	if (firstLoad) {
		this.loadObjects!();

		this.loadTextures!();
	}

	this.loadAllContexts!();

	this.list.update();
	// this.list.scrollTop = editor.listScrollTop

	this.tilemaps.shortcuts.update();

	this.setTarget!(editor.target);

	if (editor.tilemap) {
		this.openTilemap!(editor.tilemap);
	}
	if (this.layer === null) {
		this.switchLayer!('object');
	}

	GL.setAmbientLight!(this.ambient);
	UndoManager.setActive!(Scene);
};

Scene.save = function (this: any) {
	if (this.state === 'open') {
		const { scene, editor } = this.context;

		scene.width = this.width;
		scene.height = this.height;
		scene.tileWidth = this.tileWidth;
		scene.tileHeight = this.tileHeight;
		scene.ambient = this.ambient;
		scene.terrainArray = this.terrains;
		scene.events = this.events;
		scene.scripts = this.scripts;
		scene.objects = this.objects;

		editor.target = this.target;
		editor.tilemap = this.tilemap;
		editor.history = this.history;
		editor.textures = this.textures;
		editor.tilemaps = this.tilemaps;
		editor.actors = this.actors;
		editor.regions = this.regions;
		editor.lights = this.lights;
		editor.animations = this.animations;
		editor.particles = this.particles;
		editor.parallaxes = this.parallaxes;
		editor.backgrounds = this.backgrounds;
		editor.foregrounds = this.foregrounds;
		editor.doodads = this.doodads;
		editor.animationFrame = this.animationFrame;
		editor.animationElapsed = this.animationElapsed;
		editor.animationInterval = this.animationInterval;
		// editor.listScrollTop = this.list.scrollTop

		if (this.context.changed) {
			this.context.changed = false;
			Data.scenes[this.meta.guid] = Codec.encodeScene!(scene);
		}
	}
};

Scene.close = function (this: any) {
	if (this.state !== 'closed') {
		this.screen?.blur();
		this.closeTilemap!();
		this.setTarget!(null);
		this.deletePreviewObject!();
		if (Inspector.type === 'fileScene') {
			Inspector.close!();
		}
		this.state = 'closed';
		this.symbol = null;
		this.context = null;
		this.meta = null;
		this.width = null;
		this.height = null;
		this.tileWidth = null;
		this.tileHeight = null;
		this.ambient = null;
		this.terrains = null;
		this.events = null;
		this.scripts = null;
		this.objects = null;
		this.tilemaps = null;
		this.actors = null;
		this.regions = null;
		this.lights = null;
		this.animations = null;
		this.particles = null;
		this.parallaxes = null;
		this.backgrounds = null;
		this.foregrounds = null;
		this.doodads = null;
		this.history = null;
		this.textures = null;
		this.closeMapRecord!();
		if (this.searcher) {
			write(this.searcher, '');
		}
		if (typeof this.marquee?.clear === 'function') {
			this.marquee.clear();
		}
		clear(this.list);
		hide(this.body);
		this.stopAnimation!();
		this.stopRendering!();
		UndoManager.setActive!(null);
	}
};

Scene.destroy = function (this: any, context: any) {
	const { editor } = context;
	if (!editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	editor.textures.destroy();
	delete editor.textures;
	for (const actor of editor.actors) {
		actor.player.destroy();
		delete actor.player;
		delete actor.data;
	}
	for (const light of editor.lights) {
		delete light.instance;
	}
	for (const animation of editor.animations) {
		animation.player.destroy();
		delete animation.player;
		delete animation.data;
	}
	for (const particle of editor.particles) {
		particle.emitter?.destroy();
		delete particle.emitter;
	}
	for (const parallax of editor.parallaxes) {
		parallax.player.destroy();
		delete parallax.player;
	}
};

Scene.shiftTilemap = function (this: any, tilemap: any, offsetX: number, offsetY: number) {
	const width = tilemap.width;
	const height = tilemap.height;
	if (width === 0 || height === 0) {
		return;
	}
	const ox = ((offsetX % width) + width) % width;
	const oy = ((offsetY % height) + height) % height;
	const sTiles = GL.arrays[0].uint32;
	const dTiles = tilemap.tiles;
	const tro = dTiles.rowOffset;
	sTiles.set(dTiles);
	for (let y = 0; y < height; y++) {
		const siy = y * tro;
		const diy = ((y + oy) % height) * tro;
		for (let x = 0; x < width; x++) {
			const si = x + siy;
			const di = ((x + ox) % width) + diy;
			dTiles[di] = sTiles[si];
		}
	}
	this.requestRendering!();
};

Scene.shiftTerrains = function (this: any, offsetX: number, offsetY: number) {
	const width = this.width;
	const height = this.height;
	if (width === 0 || height === 0) {
		return;
	}
	const ox = ((offsetX % width) + width) % width;
	const oy = ((offsetY % height) + height) % height;
	const sTerrains = GL.arrays[0].uint8;
	const dTerrains = this.terrains;
	const pro = dTerrains.rowOffset;
	sTerrains.set(dTerrains);
	for (let y = 0; y < height; y++) {
		const siy = y * pro;
		const diy = ((y + oy) % height) * pro;
		for (let x = 0; x < width; x++) {
			const si = x + siy;
			const di = ((x + ox) % width) + diy;
			dTerrains[di] = sTerrains[si];
		}
	}
	this.requestRendering!();
};

Scene.shiftObjects = function (this: any, changes: any) {
	const { targets, posX, posY } = changes;
	const length = targets.length;
	for (let i = 0; i < length; i++) {
		const target = targets[i];
		const x = posX[i];
		const y = posY[i];
		posX[i] = target.x;
		posY[i] = target.y;
		target.x = x;
		target.y = y;
	}
	this.requestRendering!();
};

Scene.computeObjectShifting = function (this: any, ox: number, oy: number) {
	const MIN = -128;
	const MAX = 640;
	const keys = [
		'actors',
		'regions',
		'lights',
		'animations',
		'particles',
		'parallaxes',
		'tilemaps'
	];
	let index = 0;
	let length = 0;
	for (const key of keys) {
		length += this[key].length;
	}
	const clamp = Math.clamp;
	const targets = new Array(length);
	const posX = new Float64Array(length);
	const posY = new Float64Array(length);
	for (const key of keys) {
		const list = this[key];
		const length = list.length;
		for (let i = 0; i < length; i++) {
			const target = list[i];
			targets[index] = target;
			posX[index] = clamp(target.x + ox, MIN, MAX);
			posY[index] = clamp(target.y + oy, MIN, MAX);
			index++;
		}
	}
	return { targets, posX, posY };
};

Scene.getDefaultObjectFolder = function (this: any, kind: string) {
	const name = (Editor.project as any).scene.defaultFolders[kind];
	return !name
		? null
		: this.list.getItemByProperties({
				class: 'folder',
				name: name
			});
};

Scene.copy = function (this: any) {
	if (this.state === 'open' && this.target !== null) {
		this.list.copy!(this.target);
	}
};

Scene.paste = function (this: any, x: any, y: any) {
	if (this.state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.meta.x;
			y = this.meta.y;
		}
		this.list.paste!('auto', (data: any) => {
			switch (data.class) {
				case 'tilemap':
				case 'actor':
				case 'region':
				case 'light':
				case 'animation':
				case 'particle':
				case 'parallax':
					data.x = Math.clamp(Math.floor(x), 0, this.width - 1) + 0.5;
					data.y = Math.clamp(Math.floor(y), 0, this.height - 1) + 0.5;
					break;
			}
		});
	}
};

Scene.duplicate = function (this: any) {
	if (this.target) {
		this.list.duplicate(this.target);
	}
};

Scene.create = function (this: any, kind: string, x: number, y: number) {
	const dItem = this.getDefaultObjectFolder!(kind);
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = (Inspector as Record<string, any>)[key];
	const object = editor.create();
	object.x = x;
	object.y = y;
	this.list.addNodeTo(object, dItem);
};

Scene.delete = function (this: any) {
	if (this.state === 'open' && this.target !== null && this.dragging === null) {
		this.list.delete!(this.target);
	}
};

Scene.toggle = function (this: any) {
	this.list.toggle!(this.target);
};

Scene.undo = function (this: any) {
	if (this.state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Scene.redo = function (this: any) {
	if (this.state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Scene.updateAnimationInterval = function (this: any) {
	const { animationInterval } = Data.config.scene;
	if (this.animationInterval !== animationInterval) {
		if (animationInterval === 0 && this.animationFrame !== 0) {
			this.animationFrame = 0;
			this.requestRendering!();
		}
		this.animationElapsed = 0;
		this.animationInterval = animationInterval;
	}
};

Scene.updateLightAreaExpansion = function (this: any, last: any) {
	if (this.showLight) {
		const light = Data.config.lightArea;
		if (
			last.expansionLeft !== light.expansionLeft ||
			last.expansionTop !== light.expansionTop ||
			last.expansionRight !== light.expansionRight ||
			last.expansionBottom !== light.expansionBottom
		) {
			GL.reflectedLightMap.innerWidth = 0;
			GL.reflectedLightMap.paddingLeft = undefined;
			GL.resizeLightMap!();
			this.updateLightTexParameters!();
			this.updateTransform!();
			this.requestRendering!();
		}
	}
};

Scene.updateActorTeams = function (this: any) {
	const list = this.list;
	for (const actor of this.actors) {
		list.updateIcon!(actor);
	}
};

Scene.updateHead = function (this: any) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const { nav } = (Layout.getGroupOfElement as any)(head);
		const nRect = rect(nav);
		const iRect = rect(nav.lastChild);
		const left = iRect.right - nRect.left;
		if (head.left !== left) {
			head.left = left;
			head.style.left = `${left}px`;
		}
		const width = nRect.right - iRect.right;
		if (head.width !== width) {
			head.width = width;
			const [start, center, end] = Array.from(head.children) as HTMLElement[];
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

Scene.registerPreset = (function IIFE() {
	const generatePresetId = () => {
		const { scenePresets } = Data;
		let id;
		do {
			id = GUID.generate64bit();
		} while (id in scenePresets);
		return id;
	};
	const registerPreset = (node: any) => {
		const { scenePresets } = Data;
		// 新对象或对象ID冲突，生成新ID
		if (node.presetId === '' || node.presetId in scenePresets) {
			node.presetId = generatePresetId();
		}
		scenePresets[node.presetId] = {
			sceneId: Scene.meta.guid,
			data: node
		};
		if (node.children instanceof Array) {
			for (const child of node.children) {
				registerPreset(child);
			}
		}
	};
	return function (this: any, node: any) {
		registerPreset(node);
	};
})();

Scene.unregisterPreset = function (this: any, node: any) {
	delete Data.scenePresets[node.presetId];
	if (node.children instanceof Array) {
		for (const child of node.children) {
			Scene.unregisterPreset!(child);
		}
	}
};

Scene.sortLayers = (function IIFE() {
	const sorter = (a: any, b: any) => a.order - b.order;
	return function (this: SceneShape) {
		this.backgrounds.sort(sorter);
		this.foregrounds.sort(sorter);
		this.doodads.sort(sorter);
	};
})();

Scene.planToSave = function (this: any) {
	File.planToSave!(this.meta);
	this.context.changed = true;
};

Scene.planToSaveTerrains = function (this: any) {
	this.context.scene.terrainChanged = true;
};
