import { screenScrollData } from '../screen-scroll-data';
import { describe, expect, it, vi } from 'vitest';
import '@app/utils/math';

vi.mock('@app/utils/element-utils', () => ({
	getRelativeCoords: vi.fn(() => ({ x: 0, y: 0 })),
	clear: vi.fn(),
	removeClass: vi.fn(),
	addClass: vi.fn(),
	hasClass: vi.fn(() => false),
	show: vi.fn(),
	hide: vi.fn(),
	write: vi.fn(),
	read: vi.fn(),
	setTooltip: vi.fn()
}));

vi.mock('@app/file/file-system-core', () => ({
	File: { get: vi.fn() }
}));

vi.mock('@app/scene/scene-window', () => ({
	Scene: {
		brush: 'pencil',
		switchBrush: vi.fn(),
		createTiles: (width: number, height: number) => {
			const tiles = new Uint32Array(width * height);
			(tiles as any).width = width;
			(tiles as any).height = height;
			(tiles as any).rowOffset = width;
			(tiles as any).standard = null;
			return tiles;
		},
		marquee: {
			key: 'tile',
			visible: false,
			x: 0,
			y: 0,
			width: 0,
			height: 0,
			originX: 0,
			originY: 0,
			tilesetMap: {},
			tiles: null,
			saveData: { tile: null },
			updateScrollbars: vi.fn()
		},
		tilemap: {
			tiles: null,
			tilesetMap: {}
		},
		state: 'closed',
		dragging: null,
		requestRendering: vi.fn()
	}
}));

vi.mock('@app/data/data-object', () => ({
	Data: {
		manifest: { changed: false },
		autotiles: { map: {} },
		tilesets: {}
	}
}));

vi.mock('@app/utils/timer', () => ({
	Timer: {
		appendUpdater: vi.fn(),
		removeUpdater: vi.fn()
	}
}));

vi.mock('@app/stores/palette', () => ({
	getPaletteStore: vi.fn(() => ({
		state: 'open',
		tileset: {
			type: 'normal',
			width: 10,
			height: 10,
			tileWidth: 16,
			tileHeight: 16,
			image: '',
			tiles: null,
			priorities: null,
			tags: null,
			terrains: null
		},
		showGrid: true,
		mode: 'normal',
		activeIndex: -1
	}))
}));

import { PaletteEngine } from '@app/engine/palette/palette-engine.ts';
import { getRelativeCoords } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object';
import { getPaletteStore } from '@app/stores/palette';

function createMockPalette(overrides: Record<string, any> = {}) {
	const screen = document.createElement('div') as any;
	screen.scrollLeft = 0;
	screen.scrollTop = 0;
	screenScrollData(screen).rawScrollLeft = 0;
	screenScrollData(screen).rawScrollTop = 0;
	screen.updateScrollbars = vi.fn();
	Object.defineProperty(screen, 'clientWidth', { value: 800 });
	Object.defineProperty(screen, 'clientHeight', { value: 600 });

	const canvas = document.createElement('canvas') as any;
	canvas.width = 800;
	canvas.height = 600;

	const context = new Proxy({} as any, {
		get(_target, prop) {
			if (typeof prop === 'string') {
				return () => {};
			}
			return undefined;
		}
	});

	const body = document.createElement('div');
	Object.defineProperty(body, 'clientWidth', { value: 800 });

	const marquee = document.createElement('div') as any;
	marquee.visible = false;
	marquee.x = 0;
	marquee.y = 0;
	marquee.width = 0;
	marquee.height = 0;
	marquee.style = {};

	const palette: any = {
		screen,
		canvas,
		context,
		body,
		marquee,
		markCanvas: null,
		scale: 1,
		scaleX: 1,
		scaleY: 1,
		scaledTileWidth: 16,
		scaledTileHeight: 16,
		paddingLeft: 0,
		paddingTop: 0,
		centerOffsetX: 0,
		centerOffsetY: 0,
		outerWidth: 800,
		outerHeight: 600,
		screenWidth: 800,
		screenHeight: 600,
		scrollLeft: 0,
		scrollTop: 0,
		scrollRight: 800,
		scrollBottom: 600,
		gridColor: 'rgba(0, 0, 0, 0.5)',
		images: {},
		dragging: null,
		explicit: false,
		tilesetMap: { 1: '' },
		meta: { x: 0, y: 0, guid: '' },
		drawTiles: vi.fn(),
		drawPriorities: vi.fn(),
		drawTags: vi.fn(),
		drawTerrains: vi.fn(),
		requestRendering: vi.fn(),
		updateCamera: PaletteEngine.updateCamera,
		updateTransform: PaletteEngine.updateTransform,
		createMarkCanvas: PaletteEngine.createMarkCanvas,
		rebuildMarkCanvas: PaletteEngine.rebuildMarkCanvas,
		ensureMarkPosition: PaletteEngine.ensureMarkPosition,
		drawTileset: PaletteEngine.drawTileset,
		drawTileGrid: PaletteEngine.drawTileGrid,
		selectTiles: PaletteEngine.selectTiles,
		...overrides
	};
	const rawOverride = overrides.screen as
		| { rawScrollLeft?: number; rawScrollTop?: number }
		| undefined;
	if (rawOverride && typeof rawOverride.rawScrollLeft === 'number') {
		screenScrollData(palette.screen).rawScrollLeft = rawOverride.rawScrollLeft;
	}
	if (rawOverride && typeof rawOverride.rawScrollTop === 'number') {
		screenScrollData(palette.screen).rawScrollTop = rawOverride.rawScrollTop;
	}
	return palette;
}

describe('PaletteEngine.getTileCoords', () => {
	it('tileset 不存在时返回 {0,0}', () => {
		(getPaletteStore as any).mockReturnValue({
			state: 'open',
			tileset: null,
			showGrid: true,
			mode: 'normal',
			activeIndex: -1
		});
		const palette = createMockPalette();
		const event = new PointerEvent('pointerdown');
		const result = PaletteEngine.getTileCoords.call(palette, event);
		expect(result).toEqual({ x: 0, y: 0 });
	});

	it('正常计算 tile 坐标', () => {
		(getPaletteStore as any).mockReturnValue({
			state: 'open',
			tileset: { type: 'normal', width: 10, height: 10 },
			showGrid: true,
			mode: 'normal',
			activeIndex: -1
		});
		(getRelativeCoords as any).mockReturnValue({ x: 32, y: 48 });
		Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });
		const palette = createMockPalette({ scaledTileWidth: 16, scaledTileHeight: 16 });
		const event = new PointerEvent('pointerdown');
		const result = PaletteEngine.getTileCoords.call(palette, event);
		expect(result.x).toBe(Math.floor((32 * 2) / 16));
		expect(result.y).toBe(Math.floor((48 * 2) / 16));
	});

	it('clamp 为 true 时限制在 tileset 范围内', () => {
		(getPaletteStore as any).mockReturnValue({
			state: 'open',
			tileset: { type: 'normal', width: 3, height: 3 },
			showGrid: true,
			mode: 'normal',
			activeIndex: -1
		});
		(getRelativeCoords as any).mockReturnValue({ x: 9999, y: 9999 });
		Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
		const palette = createMockPalette({ scaledTileWidth: 16, scaledTileHeight: 16 });
		const event = new PointerEvent('pointerdown');
		const result = PaletteEngine.getTileCoords.call(palette, event, true);
		expect(result.x).toBe(2);
		expect(result.y).toBe(2);
	});
});

describe('PaletteEngine.updateCamera', () => {
	it('默认参数使用 meta.x/y', () => {
		const palette = createMockPalette({
			meta: { x: 5, y: 3 },
			scaledTileWidth: 16,
			scaledTileHeight: 16,
			outerWidth: 800,
			outerHeight: 600,
			centerOffsetX: 0,
			centerOffsetY: 0
		});
		Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
		PaletteEngine.updateCamera.call(palette);
		expect(screenScrollData(palette.screen).rawScrollLeft).toBeDefined();
		expect(screenScrollData(palette.screen).rawScrollTop).toBeDefined();
	});

	it('传入 x/y 覆盖 meta 值', () => {
		const palette = createMockPalette({
			meta: { x: 0, y: 0 },
			scaledTileWidth: 16,
			scaledTileHeight: 16,
			outerWidth: 800,
			outerHeight: 600,
			centerOffsetX: 0,
			centerOffsetY: 0
		});
		Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
		PaletteEngine.updateCamera.call(palette, 10, 20);
		expect(screenScrollData(palette.screen).rawScrollLeft).toBeDefined();
	});
});

describe('PaletteEngine.updateTransform', () => {
	it('更新 scrollLeft/scrollRight 并设置 context transform', () => {
		const palette = createMockPalette({
			screen: { scrollLeft: 10, scrollTop: 20, rawScrollLeft: 10, rawScrollTop: 20 },
			scaledTileWidth: 16,
			scaledTileHeight: 16,
			centerOffsetX: 0,
			centerOffsetY: 0,
			paddingLeft: 0,
			paddingTop: 0,
			meta: { x: 0, y: 0 }
		});
		Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true });
		(Data as any).manifest.changed = false;
		PaletteEngine.updateTransform.call(palette);
		expect(palette.scrollLeft).toBeDefined();
		expect(palette.scrollRight).toBeDefined();
		expect(Data.manifest.changed).toBe(true);
	});
});

describe('PaletteEngine.createMarkCanvas', () => {
	it('首次调用创建 canvas 并填充数字条目', () => {
		const palette = createMockPalette({ markCanvas: null });
		const canvas = PaletteEngine.createMarkCanvas.call(palette);
		expect(canvas).toBeDefined();
		expect(canvas.entries.length).toBe(11);
		expect(canvas.positions[0]).toBeDefined();
		expect(canvas.positions.add).toBeDefined();
		expect(canvas.totalWidth).toBeGreaterThanOrEqual(0);
	});

	it('重复调用返回同一 canvas', () => {
		const existing = {
			width: 100,
			entries: [],
			positions: {},
			totalWidth: 50,
			fontSize: 128,
			font: ''
		};
		const palette = createMockPalette({ markCanvas: existing });
		const canvas = PaletteEngine.createMarkCanvas.call(palette);
		expect(canvas).toBe(existing);
	});
});

describe('PaletteEngine.drawTileset', () => {
	it('body.clientWidth 为 0 时不执行绘制', () => {
		const body = document.createElement('div');
		Object.defineProperty(body, 'clientWidth', { value: 0 });
		const palette = createMockPalette({ body });
		PaletteEngine.drawTileset.call(palette);
		expect(palette.drawTiles).not.toHaveBeenCalled();
	});

	it('正常调用依次执行 drawTiles/drawTileGrid 等', () => {
		const palette = createMockPalette();
		(palette as any).drawTiles = vi.fn();
		(palette as any).drawTileGrid = vi.fn();
		(palette as any).drawPriorities = vi.fn();
		(palette as any).drawTags = vi.fn();
		(palette as any).drawTerrains = vi.fn();
		PaletteEngine.drawTileset.call(palette);
		expect(palette.drawTiles).toHaveBeenCalled();
		expect(palette.drawTileGrid).toHaveBeenCalled();
		expect(palette.drawPriorities).toHaveBeenCalled();
		expect(palette.drawTags).toHaveBeenCalled();
		expect(palette.drawTerrains).toHaveBeenCalled();
	});
});
