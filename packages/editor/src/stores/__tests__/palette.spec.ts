import { describe, expect, it } from 'vitest';
import { getPaletteStore, paletteStateKeys } from '@app/stores/palette';

describe('usePaletteStore（Phase 10——Palette 工具栏状态桥接）', () => {
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

	it('无 window.Palette 时 syncState 兜底默认值', () => {
		const store = getPaletteStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.mode).toBe('normal');
		expect(store.tileset).toBe(null);
	});
});
