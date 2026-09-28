import { describe, expect, it } from 'vitest';
import { getPaletteStore, paletteStateKeys } from '@app/stores/palette';
import { Palette } from '@app/palette/palette.ts';

describe('usePaletteStore（Palette 工具栏状态反转：store 为源）', () => {
	it('初始状态默认值', () => {
		const store = getPaletteStore();
		expect(store.state).toBe('closed');
		expect(store.mode).toBe('normal');
		expect(store.zoom).toBe(null);
		expect(store.showGrid).toBe(true);
		expect(store.scrollable).toBe(false);
		expect(store.activeIndex).toBe(null);
		expect(store.tileset).toBe(null);
	});

	it('状态键完整（7 项）', () => {
		const store = getPaletteStore();
		expect(paletteStateKeys).toHaveLength(7);
		for (const key of paletteStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('setMode/setState/setActiveIndex 读写', () => {
		const store = getPaletteStore();
		store.setMode('priority');
		expect(store.mode).toBe('priority');
		store.setState('open');
		expect(store.state).toBe('open');
		store.setActiveIndex(42);
		expect(store.activeIndex).toBe(42);
		store.setMode('normal');
		store.setState('closed');
		store.setActiveIndex(null);
	});

	it('zoom/scrollable/tileset 直接赋值', () => {
		const store = getPaletteStore();
		store.zoom = 3;
		expect(store.zoom).toBe(3);
		store.scrollable = true;
		expect(store.scrollable).toBe(true);
		store.tileset = { width: 8, tags: [] };
		expect(store.tileset.width).toBe(8);
		store.zoom = null;
		store.scrollable = false;
		store.tileset = null;
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getPaletteStore();
		Palette.state = 'open';
		expect(store.state).toBe('open');
		Palette.mode = 'tag';
		expect(store.mode).toBe('tag');
		Palette.zoom = 2;
		expect(store.zoom).toBe(2);
		Palette.showGrid = false;
		expect(store.showGrid).toBe(false);
		Palette.scrollable = true;
		expect(store.scrollable).toBe(true);
		Palette.activeIndex = 7;
		expect(store.activeIndex).toBe(7);
		// 夹具按 `PaletteTilesetShape` 的必填项给全（`height`/`tileWidth`/`tileHeight`/`tiles`
		// 在本用例里用不到，但接口里是必填 —— 真源 `Data.tilesets[guid]` 一定有）
		Palette.tileset = {
			type: 'auto',
			width: 8,
			height: 8,
			tileWidth: 16,
			tileHeight: 16,
			tags: [],
			tiles: {}
		};
		expect(store.tileset?.width).toBe(8);
		Palette.state = 'closed';
		Palette.mode = 'normal';
		Palette.zoom = null;
		Palette.showGrid = true;
		Palette.scrollable = false;
		Palette.activeIndex = null;
		Palette.tileset = null;
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getPaletteStore();
		store.state = 'loading';
		expect(Palette.state).toBe('loading');
		store.mode = 'terrain';
		expect(Palette.mode).toBe('terrain');
		store.zoom = 4;
		expect(Palette.zoom).toBe(4);
		store.showGrid = false;
		expect(Palette.showGrid).toBe(false);
		store.activeIndex = 3;
		expect(Palette.activeIndex).toBe(3);
		store.tileset = { width: 16, tags: [0] };
		expect(Palette.tileset?.width).toBe(16);
		store.state = 'closed';
		store.mode = 'normal';
		store.zoom = null;
		store.showGrid = true;
		store.activeIndex = null;
		store.tileset = null;
	});
});
