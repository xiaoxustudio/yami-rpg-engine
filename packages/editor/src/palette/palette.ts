import { PaletteEngine } from '@app/engine/palette/palette-engine.ts';
import type { MarkCanvasShape, MarkPosition } from '@app/engine/palette/palette-engine.ts';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import type { Timer } from '@app/utils/timer';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import type { EditorProjectShape } from '@app/stores/editor';
import type { PaletteMode, PaletteState, PaletteTilesetShape } from '@app/stores/palette';

export interface PaletteDragEvent extends PointerEvent {
	mode: string;
	active: boolean;
	startX: number;
	startY: number;
	startIndex: number;
	latest: PointerEvent;
	scrollLeft: number;
	scrollTop: number;
	priorities: number[];
	tags: number[];
	tiles: number[];
}

export interface PaletteMarqueeExtensions {
	visible: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	originX: number;
	originY: number;
	customSelect: (key: 'source' | 'destination', x?: number, y?: number) => void;
	customUnselect: (key: 'source' | 'destination') => void;
	customShiftAutoTile: () => void;
	select: (x?: number, y?: number, width?: number, height?: number) => void;
	resize: () => void;
}

export interface PaletteCanvasElement extends HTMLCanvasElement {
	dpr?: number;
}

export interface PaletteShape {
	page: YamiElement;
	head: YamiElement;
	body: YamiElement;
	window: YamiElement;
	canvas: PaletteCanvasElement;
	context: CanvasRenderingContext2D;
	screen: YamiElement;
	marquee: YamiElement & PaletteMarqueeExtensions;
	itemScroll: YamiElement;
	itemPriority: YamiElement;
	itemTag: YamiElement;
	itemTerrain: YamiElement;
	itemEdit: YamiElement;
	zoomSlider: YamiElement;
	meta: FileMeta | null;
	images: Record<string, HTMLImageElement | symbol | null>;
	symbol: symbol | null;
	markCanvas: MarkCanvasShape | null;
	dragging: PaletteDragEvent | null;
	zoomTimer: Timer;
	openIndex: number;
	gridColor: string;
	tilesetMap: Record<string, string>;
	explicit: boolean;
	scale: number;
	scaleX: number;
	scaleY: number;
	scaledTileWidth: number;
	scaledTileHeight: number;
	outerWidth: number;
	outerHeight: number;
	screenWidth: number;
	screenHeight: number;
	scrollLeft: number;
	scrollTop: number;
	scrollRight: number;
	scrollBottom: number;
	centerOffsetX: number;
	centerOffsetY: number;
	paddingLeft: number;
	paddingTop: number;
	centerX: number;
	centerY: number;
	initialize: () => void;
	open: (meta: FileMeta | null) => void;
	close: () => void;
	suspend: () => void;
	resume: () => void;
	setZoom: (zoom: number) => void;
	setImage: (image: string) => void;
	setSize: (width: number, height: number) => void;
	setTileSize: (tileWidth: number, tileHeight: number) => void;
	setTerrain: (x: number, y: number, offset: number) => void;
	loadImages: () => Promise<void>;
	updateHead: () => void;
	resize: () => void;
	updateInfo: (index?: number | null) => void;
	editAutoTile: (index: number) => void;
	copyAutoTile: (index: number) => void;
	pasteAutoTile: (index: number) => void;
	deleteAutoTile: (index: number) => void;
	openSelection: () => void;
	editSelection: () => void;
	editTagAt: (x: number, y: number) => void;
	skipScrollEvent: (enabled?: boolean) => void;
	switchScroll: (enabled?: boolean) => void;
	switchPriority: (enabled?: boolean) => void;
	switchTag: (enabled?: boolean) => void;
	switchTerrain: (enabled?: boolean) => void;
	switchEdit: (enabled?: boolean) => void;
	saveToProject: (project: EditorProjectShape) => void;
	loadFromProject: (project: EditorProjectShape) => void;
	windowResize: (event: YamiEvent) => void;
	themechange: (event: YamiEvent) => void;
	screenKeydown: (event: KeyboardEvent) => void;
	screenWheel: (event: WheelEvent) => void;
	screenUserscroll: (event: YamiEvent) => void;
	screenBlur: (event: YamiEvent) => void;
	marqueePointerdown: (event: PointerEvent) => void;
	marqueePointermove: (event: PointerEvent) => void;
	marqueePointerleave: (event: PointerEvent) => void;
	marqueeDoubleclick: (event: PointerEvent) => void;
	marqueePopup: (event: PointerEvent) => void;
	pointerup: (event: PointerEvent) => void;
	pointercancel: (event: PointerEvent) => void;
	pointermove: (event: PointerEvent) => void;
	getTileCoords: (event: PointerEvent, clamp?: boolean) => { x: number; y: number };
	updateCamera: (x?: number, y?: number) => void;
	updateTransform: () => void;
	updateBackground: () => void;
	createMarkCanvas: () => MarkCanvasShape;
	rebuildMarkCanvas: (canvas: MarkCanvasShape) => void;
	ensureMarkPosition: (canvas: MarkCanvasShape, text: string, key?: string) => MarkPosition;
	drawTileset: () => void;
	drawTiles: () => void;
	drawTileGrid: () => void;
	drawPriorities: () => void;
	drawTags: () => void;
	drawTerrains: () => void;
	selectTiles: (x: number, y: number, width: number, height: number) => void;
	copyTilesFromScene: (x: number, y: number, width: number, height: number) => void;
	flipTiles: () => void;
	scrollToSelection: (shiftKey: boolean) => void;
	requestRendering: () => void;
	renderingFunction: () => void;
	stopRendering: () => void;
	state: PaletteState;
	mode: PaletteMode;
	zoom: number | null;
	showGrid: boolean;
	scrollable: boolean;
	activeIndex: number | null;
	tileset: PaletteTilesetShape | null;
}

export const Palette = {
	explicit: false,
	tilesetMap: {},
	dragging: null
} satisfies Partial<PaletteShape> as Partial<PaletteShape> as PaletteShape;

export interface ClipboardShape {
	has(format: string): boolean;
	read(format: string): { tile: unknown; priority: unknown; terrain: unknown } | undefined;
	write(format: string, object: { tile: unknown; priority: unknown; terrain: unknown }): void;
}

Palette.getTileCoords = PaletteEngine.getTileCoords;
Palette.updateCamera = PaletteEngine.updateCamera;
Palette.updateTransform = PaletteEngine.updateTransform;
Palette.updateBackground = PaletteEngine.updateBackground;
Palette.createMarkCanvas = PaletteEngine.createMarkCanvas;
Palette.rebuildMarkCanvas = PaletteEngine.rebuildMarkCanvas;
Palette.ensureMarkPosition = PaletteEngine.ensureMarkPosition;
Palette.drawTileset = PaletteEngine.drawTileset;
Palette.drawTiles = PaletteEngine.drawTiles;
Palette.drawTileGrid = PaletteEngine.drawTileGrid;
Palette.drawPriorities = PaletteEngine.drawPriorities;
Palette.drawTags = PaletteEngine.drawTags;
Palette.drawTerrains = PaletteEngine.drawTerrains;
Palette.selectTiles = PaletteEngine.selectTiles;
Palette.copyTilesFromScene = PaletteEngine.copyTilesFromScene;
Palette.flipTiles = PaletteEngine.flipTiles;
Palette.scrollToSelection = PaletteEngine.scrollToSelection;
Palette.requestRendering = PaletteEngine.requestRendering;
Palette.renderingFunction = PaletteEngine.renderingFunction;
Palette.stopRendering = PaletteEngine.stopRendering;

const paletteBridgeKeys = [
	'state',
	'mode',
	'zoom',
	'showGrid',
	'scrollable',
	'activeIndex',
	'tileset'
] as const;
import { getPaletteStore } from '@app/stores/palette';

for (const key of paletteBridgeKeys) {
	Object.defineProperty(Palette, key, {
		get: () => getPaletteStore()[key],
		set: (value: unknown) => {
			Reflect.set(getPaletteStore(), key, value);
		},
		configurable: true
	});
}

export const paletteReady = import('./register.ts').then(() => undefined).catch(() => undefined);
