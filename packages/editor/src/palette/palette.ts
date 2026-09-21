import { PaletteEngine } from '@app/engine/palette/palette-engine.ts';

// oxlint-disable-next-line no-explicit-any
export const Palette: Record<string, any> = {
	page: null,
	head: null,
	body: null,
	window: null,
	canvas: null,
	context: null,
	screen: null,
	marquee: null,
	itemScroll: null,
	itemPriority: null,
	itemTag: null,
	itemTerrain: null,
	itemEdit: null,
	zoomSlider: null,
	symbol: null,
	meta: null,
	images: null,
	priorities: null,
	terrains: null,
	dragging: null,
	explicit: false,
	openIndex: null,
	gridColor: null,
	zoomTimer: null,
	scale: null,
	scaleX: null,
	scaleY: null,
	scaledTileWidth: null,
	scaledTileHeight: null,
	outerWidth: null,
	outerHeight: null,
	screenWidth: null,
	screenHeight: null,
	scrollLeft: null,
	scrollTop: null,
	scrollRight: null,
	scrollBottom: null,
	centerOffsetX: null,
	centerOffsetY: null,
	paddingLeft: null,
	paddingTop: null,
	centerX: null,
	centerY: null,
	markCanvas: null,
	tilesetMap: {},
	initialize: null,
	open: null,
	close: null,
	suspend: null,
	resume: null,
	setZoom: null,
	setImage: null,
	setSize: null,
	setTileSize: null,
	setTerrain: null,
	loadImages: null,
	updateHead: null,
	resize: null,
	updateInfo: null,
	editAutoTile: null,
	copyAutoTile: null,
	pasteAutoTile: null,
	deleteAutoTile: null,
	openSelection: null,
	editSelection: null,
	editTagAt: null,
	skipScrollEvent: null,
	switchScroll: null,
	switchPriority: null,
	switchTag: null,
	switchTerrain: null,
	switchEdit: null,
	saveToProject: null,
	loadFromProject: null,
	windowResize: null,
	themechange: null,
	screenKeydown: null,
	screenWheel: null,
	screenUserscroll: null,
	screenBlur: null,
	marqueePointerdown: null,
	marqueePointermove: null,
	marqueePointerleave: null,
	marqueeDoubleclick: null,
	marqueePopup: null,
	pointerup: null,
	pointermove: null
};

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
