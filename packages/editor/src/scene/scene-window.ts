import { elementDataOf } from '@ui-kit';
import type { MenuItem } from '@ui-kit';
import { sceneEls } from '@app/scene/element-registry';
import { registryElement } from '@app/utils/element-registry';
import { Window } from '@app/tools/window-object.ts';
import { addScrollbars, hide, show, on, write, clear, rect } from '@app/utils/element-utils.ts';
import { getListConfig } from '@ui-kit';
import { Timer } from '@app/utils/timer';
import { File } from '@app/file/file-system-core.ts';

import { Reference } from '@app/log/related-references.ts';
import { Editor } from '@app/services/project/editor.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Layout, headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { Palette } from '@app/palette/palette.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { ObjectFolder } from './default-object-folder.ts';
import type { SceneItem } from './scene-list.ts';
import type { TileBuffer } from '@app/engine/scene/scene-edit-engine.ts';
import { SceneShift } from './move-scene.ts';
import { TilemapShortcuts } from './tilemap-shortcut-list.ts';
import { History } from '@app/tools/history.ts';
import { UndoManager } from '@app/tools/undo-manager.ts';
import { Matrix } from '@app/engine/webgl/matrix2.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import type { EditorConfigShape, EditorProjectShape } from '@app/stores/editor';

interface SceneListItem {
	class: string;
	element: HTMLElement & { [k: string]: unknown };
	name?: string;
	shortcut?: number;
	parent?: SceneListItem;
	children?: SceneListItem[];
}

interface SceneSearcherExtensions {
	deleteInputContent?(): void;
	addCloseButton?(): void;
	addKeydownFilter?(): void;
}

export type SceneMarqueeSaveData = {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX?: number;
	scaleY?: number;
	offsetX?: number;
	offsetY?: number;
	tiles?: TileBuffer;
	terrain?: number;
};

interface SceneMarqueeExtensions {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	visible: boolean;
	saveData: Record<string, SceneMarqueeSaveData | null>;
	save: (key?: string | null) => void;
	restore: (key?: string) => void;
	resize: () => void;
	clear: () => void;
	select: (x?: number, y?: number, width?: number, height?: number) => void;
	switch: (key: string) => void;
	selectInPencilMode: (x?: number, y?: number, width?: number, height?: number) => void;
	selectInRectMode: (x?: number, y?: number, width?: number, height?: number) => void;
	selectInCopyMode: (x?: number, y?: number, width?: number, height?: number) => void;
	selectInObjectMode: (x: number, y: number) => void;
	getTiles: (raw: boolean) => unknown;
	offsetX: number;
	offsetY: number;
	tilesetMap: Record<string, string>;
	tiles: TileBuffer;
	terrain: number;
	previewTiles: boolean;
	pointerevent: PointerEvent | null;
	borderColor: number[];
	backgroundColor: number[];
	borderColorNormal: number[];
	borderColorCopy: number[];
	borderColorRect: number[];
	backgroundColorNormal: number[];
	backgroundColorCopy: number[];
	backgroundColorRect: number[];
	backgroundColorInvalid: number[];
}

interface SceneListExtensions {
	create: ((dItem?: unknown) => unknown) | null;
	copy: ((item: SceneListItem) => unknown) | null;
	paste:
		| ((
				dItem: SceneListItem | 'auto' | null,
				// oxlint-disable-next-line no-explicit-any
				callback: ((item: any) => void) | undefined
		  ) => void)
		| null;
	delete: ((item: SceneListItem) => unknown) | null;
	toggle: ((item: SceneListItem) => unknown) | null;
	cancelSearch: (() => unknown) | null;
	updateHead: (() => unknown) | null;
	restoreRecursiveStates:
		| ((item: SceneListItem, key: string, states: SceneListItem[]) => unknown)
		| null;
	setRecursiveStates: ((item: SceneListItem, key: string, state: boolean) => unknown) | null;
	onCreate: ((item: SceneListItem) => unknown) | null;
	onRemove: ((item?: unknown) => unknown) | null;
	onDelete: ((item: SceneListItem) => unknown) | null;
	onResume: ((item: SceneListItem) => unknown) | null;
	creators: unknown[];
	updaters: unknown[];

	update: () => unknown;
	resize: () => unknown;
	bind: (data: () => unknown) => unknown;
	rename: (item: unknown) => unknown;
	restore: (operation: string, response: unknown) => unknown;
	searchNodesDebounced: (keyword: string) => unknown;
	selectWithNoEvent: (item: unknown) => unknown;
	expandToSelection: () => unknown;
	scrollToSelection: () => unknown;
	unselect: (item: unknown) => unknown;
	updateItemName: (item: unknown) => unknown;
	addNodeTo: (item: unknown, dItem?: unknown, insertBefore?: boolean) => unknown;
	duplicate: (item: SceneItem) => unknown;
	getItemByProperties: (properties: { class: string; name: string }) => SceneItem | undefined;
	createFolder: () => {
		class: string;
		name: string;
		expanded: boolean;
		hidden: boolean;
		locked: boolean;
		children: unknown[];
	};
	createTilemapShortcutItems: (tilemap: SceneItem) => MenuItem[];
	updateFolderState: (item: SceneItem, key: string) => unknown;
	canSwitchState: (item: SceneItem) => boolean;
}

export interface SceneShape {
	page: YamiElement;
	head: HTMLElement & { width?: number };
	body: YamiElement;
	info: YamiElement;
	screen: YamiElement;
	// oxlint-disable-next-line no-explicit-any
	marquee: HTMLElement & SceneMarqueeExtensions;
	searcher: HTMLElement & SceneSearcherExtensions;
	list: HTMLElement & SceneListExtensions;
	initialize: (() => void) | null;
	open: ((context: SceneContextShape) => void) | null;
	close: (() => void) | null;
	load: ((context: SceneContextShape) => void) | null;
	save: (() => void) | null;
	destroy: ((context: SceneContextShape) => void) | null;
	copy: ((item?: unknown) => void) | null;
	paste: ((x?: number, y?: number) => void) | null;
	duplicate: ((item?: unknown) => void) | null;
	create: ((kind: string, x: number, y: number) => void) | null;
	toggle: ((item?: unknown) => void) | null;
	undo: (() => void) | null;
	redo: (() => void) | null;
	planToSave: (() => void) | null;
	requestRendering: () => void;
	matrix: Matrix;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	saveToConfig: ((config: EditorConfigShape) => void) | null;
	loadFromConfig: ((config: EditorConfigShape) => void) | null;
	saveToProject: ((project: EditorProjectShape) => void) | null;
	loadFromProject: ((project: EditorProjectShape) => void) | null;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

interface TilemapsShape extends Array<unknown> {
	shortcuts: TilemapShortcuts;
}

interface RegionsShape extends Array<unknown> {
	visibleList: unknown[] & { count: number };
}

interface SceneDataShape {
	width: number;
	height: number;
	tileWidth: number;
	tileHeight: number;
	ambient: unknown;
	terrainArray?: Uint8Array;
	terrainChanged?: boolean;
	events: unknown[];
	scripts: unknown[];
	objects: Array<{ class: string; children?: unknown[] }>;
	[k: string]: unknown;
}

interface SceneEditorShape {
	target: unknown;
	tilemap: unknown;
	history: History;
	textures?: { destroy: () => void };
	tilemaps: TilemapsShape;
	actors: { player?: { destroy: () => void }; [k: string]: unknown }[];
	regions: unknown[];
	lights: { [k: string]: unknown }[];
	animations: { player?: { destroy: () => void }; [k: string]: unknown }[];
	particles: { emitter?: { destroy: () => void }; [k: string]: unknown }[];
	parallaxes: { player?: { destroy: () => void }; [k: string]: unknown }[];
	backgrounds: unknown[];
	foregrounds: unknown[];
	doodads: unknown[];
	animationFrame: number;
	animationElapsed: number;
	animationInterval: number;
	[k: string]: unknown;
}

export interface SceneContextShape {
	meta: Record<string, unknown> & { guid: string; path: string };
	scene?: SceneDataShape;
	editor?: SceneEditorShape;
	changed?: boolean;
}

type PresetNodeShape = { presetId: string; children?: unknown } & Record<string, unknown>;

export const Scene = {
	page: sceneEls.get('scene') as YamiElement,
	head: sceneEls.get('scene-head') as YamiElement,
	body: hide(sceneEls.get('scene-body') as YamiElement),
	info: sceneEls.get('scene-info') as YamiElement,
	screen: sceneEls.get('scene-screen') as YamiElement,
	marquee:
		registryElement<SceneShape['marquee']>(sceneEls, 'scene-marquee') ??
		({} as SceneShape['marquee']),
	searcher: sceneEls.get('scene-searcher') as YamiElement,
	list: (sceneEls.get('scene-list') as never) || ({} as never),
	dragging: null,
	brush: null,
	symbol: null,
	history: null,
	textures: null,
	shiftKey: false,
	translationKey: 0b0000,
	translationTimer: null,
	showLight: false,
	showAnimation: false,
	animationFrame: null,
	animationElapsed: null,
	background: null,
	zoomTimer: null,
	scale: null,
	scaledTileWidth: null,
	scaledTileHeight: null,
	aspectRatio: null,
	outerWidth: null,
	outerHeight: null,
	scrollCenterX: null,
	scrollCenterY: null,
	centerOffsetX: null,
	centerOffsetY: null,
	lightLeft: null,
	lightTop: null,
	lightRight: null,
	lightBottom: null,
	padding: null,
	paddingLeft: null,
	paddingTop: null,
	patternOriginX: null,
	patternOriginY: null,
	inspectorTypeMap: null,
	tilemapLightSamplingModes: null,
	defaultLightSamplingModes: null,
	startPositionTexture: null,
	blendModeMap: null,
	activeTilemapId: null,
	sharedPoint: null,
	previewObject: null,
	context: null,
	meta: null,
	width: null,
	height: null,
	tileWidth: null,
	tileHeight: null,
	animationInterval: null,
	ambient: null,
	terrains: null,
	events: null,
	scripts: null,
	objects: null,
	tilemaps: null,
	actors: null,
	regions: null,
	lights: null,
	animations: null,
	particles: null,
	parallaxes: null,
	backgrounds: null,
	foregrounds: null,
	doodads: null,
	initialize: null,
	open: null,
	load: null,
	save: null,
	close: null,
	destroy: null,
	shiftTilemap: null,
	shiftTerrains: null,
	shiftObjects: null,
	computeObjectShifting: null,
	getDefaultObjectFolder: null,
	copy: null,
	paste: null,
	duplicate: null,
	create: null,
	delete: null,
	toggle: null,
	undo: null,
	redo: null,
	setZoom: null,
	setSize: null,
	setTileSize: null,
	setTilemapSize: null,
	setTarget: null,
	openTilemap: null,
	closeTilemap: null,
	computeActiveTilemapId: null,
	revealTarget: null,
	shiftTarget: null,
	redirectTarget: null,
	updateTarget: null,
	updateTargetInfo: null,
	updateTargetItem: null,
	updateTargetEditor: null,
	updateAnimationInterval: null,
	updateLightAreaExpansion: null,
	updateActorTeams: null,
	updateHead: null,
	resize: null,
	getTileCoords: null,
	getConvertedCoords: null,
	getParallaxAnchor: null,
	getGridContext: null,
	rasterizeScrollPosition: null,
	updateLightTexParameters: null,
	updateCamera: null,
	updateTransform: null,
	registerPreset: null,
	unregisterPreset: null,
	sortLayers: null,
	loadObjects: null,
	loadTextures: null,
	loadAllContexts: null,
	loadActorContext: null,
	loadLightContext: null,
	loadAnimationContext: null,
	loadParallaxContext: null,
	loadParticleContext: null,
	loadObjectContext: null,
	reloadObjectContext: null,
	destroyObjectContext: null,
	createPreviewObject: null,
	deletePreviewObject: null,
	updateParallaxes: null,
	drawScene: null,
	drawBackgrounds: null,
	drawForegrounds: null,
	updateAnimations: null,
	updateParticles: null,
	drawTileLayer: null,
	drawGridLayer: null,
	drawRegionLayer: null,
	drawRegionBorders: null,
	drawObjectLayer: null,
	drawDirectLightLayer: null,
	drawNameLayer: null,
	drawTerrainLayer: null,
	drawLightTextures: null,
	drawTilemap: null,
	drawTilePreview: null,
	drawTileMarquee: null,
	drawTerrainMarquee: null,
	drawTilemapWireframe: null,
	drawAnimationWireframe: null,
	drawAnimationAnchor: null,
	drawLightWireframe: null,
	drawRegionWireframe: null,
	drawParticleEmitterWireframe: null,
	drawParallaxWireframe: null,
	drawOvalWireframe: null,
	drawTargetAnchor: null,
	drawRectWireframe: null,
	drawRectWireframeOnTilemap: null,
	setRectWireframeVertices: null,
	createStartPositionTexture: null,
	drawStartPosition: null,
	selectObject: null,
	selectRegion: null,
	selectLight: null,
	selectParticleEmitter: null,
	selectSortedLayer: null,
	edit: null,
	editInPencilMode: null,
	editInRectMode: null,
	editInOvalMode: null,
	editInFillMode: null,
	setTile: null,
	setTileFrame: null,
	setTerrain: null,
	createTiles: null,
	cloneTiles: null,
	createTerrains: null,
	getNewTilesetIndex: null,
	requestAnimation: null,
	updateAnimation: null,
	stopAnimation: null,
	renderingFunction: null,
	stopRendering: null,
	switchLayer: null,
	switchBrush: null,
	switchGrid: null,
	switchLight: null,
	switchAnimation: null,
	switchSettings: null,
	switchTerrain: null,
	resetAnimations: null,
	updateFont: null,
	planToSave: null,
	planToSaveTerrains: null,
	beginMapRecord: null,
	closeMapRecord: null,
	saveMapRecord: null,
	recordMapData: null,
	restoreMapData: null,
	undoMapData: null,
	redoMapData: null,
	createHistory: null,
	createDefaultAnimation: null,
	getObjectFile: null,
	openFileLocation: null,
	saveToConfig: null,
	loadFromConfig: null,
	saveToProject: null,
	loadFromProject: null,
	webglRestored: null,
	windowResize: null,
	themechange: null,
	dprchange: null,
	datachange: null,
	keydown: null,
	headPointerdown: null,
	switchPointerdown: null,
	layerPointerdown: null,
	brushPointerdown: null,
	zoomFocus: null,
	zoomInput: null,
	screenKeydown: null,
	shiftKeyup: null,
	translationKeyup: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	screenDragenter: null,
	screenDragleave: null,
	screenDragover: null,
	screenDrop: null,
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
	Textures: null,
	Point: null
} satisfies Partial<SceneShape> as Partial<SceneShape> as SceneShape;

interface SceneMarqueeData {
	key: string | null;
}
const marqueeData = (el: unknown): SceneMarqueeData => elementDataOf<SceneMarqueeData>(el);

Scene.marquee.pointerevent = null;
Scene.marquee.previewTiles = false;

elementDataOf<{ page?: HTMLElement | null }>(Scene.list).page = sceneEls.get(
	'scene-object'
) as YamiElement;
elementDataOf<{ head: HTMLElement }>(Scene.list).head = sceneEls.get(
	'scene-list-head'
) as YamiElement;

Scene.initialize = function (this: SceneShape) {
	this.page = sceneEls.get('scene') as YamiElement;
	this.head = sceneEls.get('scene-head') as YamiElement;
	this.body = hide(sceneEls.get('scene-body') as YamiElement);
	this.info = sceneEls.get('scene-info') as YamiElement;
	this.screen = sceneEls.get('scene-screen') as YamiElement;
	const oldMarquee = this.marquee;
	this.marquee = registryElement<SceneShape['marquee']>(sceneEls, 'scene-marquee')!;
	if (oldMarquee && this.marquee && oldMarquee !== this.marquee) {
		Object.assign(this.marquee, oldMarquee);
	}
	this.searcher = sceneEls.get('scene-searcher') as YamiElement;
	const oldList = this.list;
	this.list = registryElement<HTMLElement & SceneListExtensions>(sceneEls, 'scene-list')!;
	if (oldList && this.list && oldList !== this.list) {
		Object.assign(this.list, oldList);
	}
	elementDataOf<{ page?: HTMLElement | null }>(this.list).page = sceneEls.get(
		'scene-object'
	) as YamiElement;
	elementDataOf<{ head: HTMLElement }>(this.list).head = sceneEls.get(
		'scene-list-head'
	) as YamiElement;
	if (this.screen) addScrollbars(this.screen);

	this.translationTimer = new Timer({
		duration: Infinity,
		update: (_timer: Timer) => {
			if (getSceneStore().state === 'open' && this.dragging === null) {
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
				const cx = roundTo(meta.x + x, 4);
				const cy = roundTo(meta.y + y, 4);
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
			if (getSceneStore().state === 'open') {
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

	marqueeData(this.marquee).key = 'tile';
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

	this.searcher?.addCloseButton?.();
	this.searcher?.addKeydownFilter?.();

	const { list } = this;
	getListConfig(list).removable = true;
	getListConfig(list).renamable = true;
	list.bind(() => this.objects);

	History.processors['scene-folder-rename'] = (
		operation: string,
		data: { response: unknown }
	) => {
		const { response } = data;
		list.restore(operation, response);
	};
	History.processors['scene-object-create'] = (
		operation: string,
		data: { response: unknown; parent: SceneItem }
	) => {
		const { response, parent } = data;
		list.restore(operation, response);
		list.updateFolderState(parent, 'hidden');
		list.updateFolderState(parent, 'locked');
	};
	History.processors['scene-object-delete'] = (
		operation: string,
		data: { response: { item: { parent: SceneItem } } }
	) => {
		const { response } = data;
		const parent = response.item.parent;
		list.restore(operation, response);
		list.updateFolderState(parent, 'hidden');
		list.updateFolderState(parent, 'locked');
	};
	History.processors['scene-object-remove'] = (
		operation: string,
		data: { response: { source: { parent: SceneItem }; destination: { parent: SceneItem } } }
	) => {
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
	History.processors['scene-object-toggle'] = (
		operation: string,
		data: { item: { enabled: boolean }; oldValue: boolean; newValue: boolean }
	) => {
		const { item, oldValue, newValue } = data;
		if (operation === 'undo') {
			item.enabled = oldValue;
		} else {
			item.enabled = newValue;
		}
		list.update();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-object-hidden'] = (
		operation: string,
		data: { item: { parent: unknown }; oldValues: unknown; newValue: unknown }
	) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates!(
				item as SceneListItem,
				'hidden',
				oldValues as SceneListItem[]
			);
		} else {
			list.setRecursiveStates!(item as SceneListItem, 'hidden', newValue as boolean);
		}
		list.updateFolderState(item.parent as SceneListItem, 'hidden');
		list.update();
		Scene.requestRendering!();
		Scene.planToSave!();
	};
	History.processors['scene-object-locked'] = (
		operation: string,
		data: { item: { parent: unknown }; oldValues: unknown; newValue: unknown }
	) => {
		const { item, oldValues, newValue } = data;
		if (operation === 'undo') {
			list.restoreRecursiveStates!(
				item as SceneListItem,
				'locked',
				oldValues as SceneListItem[]
			);
		} else {
			list.setRecursiveStates!(item as SceneListItem, 'locked', newValue as boolean);
		}
		list.updateFolderState(item.parent as SceneListItem, 'locked');
		list.update();
		Scene.planToSave!();
	};
	History.processors['scene-resize'] = (
		_operation: string,
		data: {
			editor: { target: unknown };
			width: number;
			height: number;
			terrains: unknown;
		}
	) => {
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
	History.processors['scene-tilemap-resize'] = (
		_operation: string,
		data: {
			editor: { target: unknown };
			tilemap: {
				width: number;
				height: number;
				tiles: unknown;
				tilesetMap: unknown;
				changed?: boolean;
			};
			width: number;
			height: number;
			tiles: unknown;
			tilesetMap: unknown;
		}
	) => {
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
	History.processors['scene-tilemap-shortcut'] = (
		_operation: string,
		data: { tilemap: { shortcut: unknown }; shortcut: unknown }
	) => {
		const { tilemap, shortcut } = data;
		data.shortcut = tilemap.shortcut;
		tilemap.shortcut = shortcut;
		Scene.setTarget!(tilemap);
		Scene.tilemaps.shortcuts.update();
		Scene.planToSave!();
	};
	History.processors['scene-tilemap-shift'] = (
		operation: string,
		data: {
			tilemap: {
				width: number;
				height: number;
				tiles: { rowOffset: number; [index: number]: number };
				changed?: boolean;
			};
			shiftX: number;
			shiftY: number;
		}
	) => {
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
	History.processors['scene-shift'] = (
		operation: string,
		data: { shiftX: number; shiftY: number; changes: unknown }
	) => {
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
	History.processors['scene-tilemap-change'] = (
		operation: string,
		data: {
			tilemap: { tiles: unknown; tilesetMap: unknown; changed?: boolean };
			changes: unknown;
			tilesetMap: unknown;
		}
	) => {
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
	History.processors['scene-terrain-change'] = (
		operation: string,
		data: { terrains: unknown; changes: unknown }
	) => {
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
	History.processors['scene-target-shift'] = (
		_operation: string,
		data: {
			editor: { target: unknown };
			target: { x: number; y: number };
			x: number;
			y: number;
		}
	) => {
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
	History.processors['scene-target-redirect'] = (
		_operation: string,
		data: {
			editor: { target: unknown };
			target: { angle: number; player: { setAngle(angle: number): void } };
			angle: number;
		}
	) => {
		const { editor, target, angle } = data;
		data.angle = target.angle;
		target.angle = angle;
		target.player.setAngle(radians(angle));
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
	on(elementDataOf<{ page?: HTMLElement | null }>(list).page, 'resize', this.listPageResize);

	ObjectFolder.initialize!();
	SceneShift.initialize!();
	TilemapShortcuts.initialize!();
};

Scene.open = function (this: SceneShape, context: SceneContextShape) {
	if (this.context === context) {
		return;
	}
	this.save!();
	this.close!();
	const { meta } = context;
	this.context = context;
	this.meta = meta;

	Particle.Element.stage = this;

	Layout.activateLayoutPage?.(this.page);

	if (context.scene) {
		getSceneStore().state = 'open';
		this.load!(context);
		show(this.body);
		this.resize!();
		this.requestAnimation!();
		this.requestRendering!();
		return;
	}

	const scene = Data.scenes[meta.guid];
	if (scene) {
		context.scene = Codec.decodeScene!(scene) as SceneDataShape;
		getSceneStore().state = 'loading';
		this.load!(context);
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

const emptyListWithCursor = <T>(): T => [] as T;

Scene.load = function (this: SceneShape, context: SceneContextShape) {
	const firstLoad = !context.editor;
	if (firstLoad) {
		const tilemaps = emptyListWithCursor<TilemapsShape>();
		tilemaps.shortcuts = new TilemapShortcuts(tilemaps as TilemapShortcuts['tilemaps']);

		const regions = emptyListWithCursor<RegionsShape>();
		regions.visibleList = Object.assign([] as unknown[], { count: 0 });

		context.changed = false;
		context.editor = {
			target: null,
			tilemap: null,
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
		};
	}
	const scene = context.scene!;
	const editor = context.editor!;

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

	this.tilemaps.shortcuts.update();

	this.setTarget!(editor.target);

	if (editor.tilemap) {
		this.openTilemap!(editor.tilemap);
	}
	if (getSceneStore().layer === null) {
		this.switchLayer!('object');
	}

	if (this.ambient) {
		GL.setAmbientLight!(this.ambient);
	}
	UndoManager.setActive!(Scene as never);
};

Scene.save = function (this: SceneShape) {
	if (getSceneStore().state === 'open') {
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

		editor.target = getSceneStore().target;
		editor.tilemap = getSceneStore().tilemap;
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

		if (this.context.changed) {
			this.context.changed = false;
			Data.scenes[this.meta.guid] = Codec.encodeScene!(scene);
		}
	}
};

Scene.close = function (this: SceneShape) {
	if (getSceneStore().state !== 'closed') {
		this.screen?.blur();
		this.closeTilemap!();
		this.setTarget!(null);
		this.deletePreviewObject!();
		if (Inspector.type === 'fileScene') {
			Inspector.close!();
		}
		getSceneStore().state = 'closed';
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

Scene.destroy = function (this: SceneShape, context: SceneContextShape) {
	const { editor } = context;
	if (!editor) return;
	if (this.context === context) {
		this.save!();
		this.close!();
	}
	editor.textures!.destroy();
	delete editor.textures;
	for (const actor of editor.actors) {
		actor.player!.destroy();
		delete actor.player;
		delete actor.data;
	}
	for (const light of editor.lights) {
		delete light.instance;
	}
	for (const animation of editor.animations) {
		animation.player!.destroy();
		delete animation.player;
		delete animation.data;
	}
	for (const particle of editor.particles) {
		particle.emitter?.destroy();
		delete particle.emitter;
	}
	for (const parallax of editor.parallaxes) {
		parallax.player!.destroy();
		delete parallax.player;
	}
};

Scene.shiftTilemap = function (
	this: SceneShape,
	tilemap: {
		width: number;
		height: number;
		tiles: { rowOffset: number; [index: number]: number };
	},
	offsetX: number,
	offsetY: number
) {
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

Scene.shiftTerrains = function (this: SceneShape, offsetX: number, offsetY: number) {
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

Scene.shiftObjects = function (
	this: SceneShape,
	changes: { targets: { x: number; y: number }[]; posX: number[]; posY: number[] }
) {
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

Scene.computeObjectShifting = function (this: SceneShape, ox: number, oy: number) {
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
	const targets = Array.from({ length: length });
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

Scene.getDefaultObjectFolder = function (this: SceneShape, kind: string) {
	const name = (Editor.project!.scene as { defaultFolders: Record<string, unknown> })
		.defaultFolders[kind];
	return !name
		? null
		: this.list.getItemByProperties({
				class: 'folder',
				name: name as string
			});
};

Scene.copy = function (this: SceneShape) {
	if (getSceneStore().state === 'open' && getSceneStore().target !== null) {
		this.list.copy!(getSceneStore().target);
	}
};

Scene.paste = function (this: SceneShape, x?: number, y?: number) {
	if (getSceneStore().state === 'open' && this.dragging === null) {
		if (x === undefined) {
			x = this.meta.x;
			y = this.meta.y;
		}
		this.list.paste!('auto', (data: { class: string; x: number; y: number }) => {
			switch (data.class) {
				case 'tilemap':
				case 'actor':
				case 'region':
				case 'light':
				case 'animation':
				case 'particle':
				case 'parallax':
					data.x = clamp(Math.floor(x!), 0, this.width - 1) + 0.5;
					data.y = clamp(Math.floor(y!), 0, this.height - 1) + 0.5;
					break;
			}
		});
	}
};

Scene.duplicate = function (this: SceneShape) {
	if (getSceneStore().target) {
		this.list.duplicate(getSceneStore().target);
	}
};

Scene.create = function (this: SceneShape, kind: string, x: number, y: number) {
	const dItem = this.getDefaultObjectFolder!(kind);
	const map = this.inspectorTypeMap;
	const key = map[kind];
	const editor = Inspector[key as keyof typeof Inspector];
	const object = editor.create();
	object.x = x;
	object.y = y;
	this.list.addNodeTo(object, dItem);
};

Scene.delete = function (this: SceneShape) {
	if (
		getSceneStore().state === 'open' &&
		getSceneStore().target !== null &&
		this.dragging === null
	) {
		this.list.delete!(getSceneStore().target);
	}
};

Scene.toggle = function (this: SceneShape) {
	this.list.toggle!(getSceneStore().target);
};

Scene.undo = function (this: SceneShape) {
	if (getSceneStore().state === 'open' && !this.dragging && this.history.canUndo()) {
		this.history.restore('undo');
	}
};

Scene.redo = function (this: SceneShape) {
	if (getSceneStore().state === 'open' && !this.dragging && this.history.canRedo()) {
		this.history.restore('redo');
	}
};

Scene.updateAnimationInterval = function (this: SceneShape) {
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

Scene.updateLightAreaExpansion = function (
	this: SceneShape,
	last: {
		expansionLeft: number;
		expansionTop: number;
		expansionRight: number;
		expansionBottom: number;
	}
) {
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

Scene.updateActorTeams = function (this: SceneShape) {
	this.list.update();
};

Scene.updateHead = function (this: SceneShape) {
	const { page, head } = this;
	if (page.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
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
	const registerPreset = (node: PresetNodeShape) => {
		const { scenePresets } = Data;
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
	return function (this: SceneShape, node: PresetNodeShape) {
		registerPreset(node);
	};
})();

Scene.unregisterPreset = function (this: SceneShape, node: PresetNodeShape) {
	delete Data.scenePresets[node.presetId];
	if (node.children instanceof Array) {
		for (const child of node.children) {
			Scene.unregisterPreset!(child);
		}
	}
};

Scene.sortLayers = (function IIFE() {
	const sorter = (a: { order: number }, b: { order: number }) => a.order - b.order;
	return function (this: SceneShape) {
		this.backgrounds.sort(sorter);
		this.foregrounds.sort(sorter);
		this.doodads.sort(sorter);
	};
})();

Scene.planToSave = function (this: SceneShape) {
	File.planToSave!(this.meta);
	this.context.changed = true;
};

Scene.planToSaveTerrains = function (this: SceneShape) {
	this.context.scene.terrainChanged = true;
};

const sceneBridgeKeys = [
	'state',
	'target',
	'mode',
	'tilemap',
	'layer',
	'showGrid',
	'zoom',
	'scaleX',
	'scaleY',
	'brush',
	'symbol',
	'showLight',
	'showAnimation',
	'activeTilemapId'
] as const;
import { getSceneStore } from '@app/stores/scene';
import type { YamiElement } from '@app/types/element-api';
import { clamp, roundTo, radians } from '@app/utils/math';

for (const key of sceneBridgeKeys) {
	Object.defineProperty(Scene, key, {
		get: () => getSceneStore()[key],
		set: (value: unknown) => {
			Reflect.set(getSceneStore(), key, value);
		},
		configurable: true
	});
}

export const sceneWindowReady = import('./register.ts')
	.then(() => undefined)
	.catch(() => undefined);
