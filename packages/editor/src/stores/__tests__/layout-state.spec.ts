import { describe, expect, it } from 'vitest';
import { getLayoutStore, layoutStateKeys } from '@app/stores/layout';
import { Layout } from '@/layout/layout.ts';

describe('useLayoutStore（Layout 布局状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getLayoutStore();
		expect(store.dragging).toBe(null);
		expect(store.resizing).toBe(null);
		expect(store.focusableSelector).toBe(null);
		expect(store.focusableElements).toBe(null);
	});

	it('状态键完整（4 项）', () => {
		const store = getLayoutStore();
		expect(layoutStateKeys).toHaveLength(4);
		for (const key of layoutStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回（拖拽/缩放/焦点）', () => {
		const store = getLayoutStore();
		const dragging = { clientX: 10, target: document.createElement('div') };
		const resizing = { mode: 'col-resize', outer: document.createElement('div') };
		store.dragging = dragging;
		store.resizing = resizing;
		store.focusableSelector = 'input, textarea, button';
		store.focusableElements = [document.createElement('div')];
		expect(store.dragging).toBe(dragging);
		expect(store.resizing).toBe(resizing);
		expect(store.focusableSelector).toBe('input, textarea, button');
		expect(store.focusableElements).toHaveLength(1);
		store.dragging = null;
		store.resizing = null;
		store.focusableSelector = null;
		store.focusableElements = null;
	});

	it('桥接：Layout 与 store 双向读写一致', () => {
		const store = getLayoutStore();
		const dragging = { clientX: 20 };
		Layout.dragging = dragging;
		expect(store.dragging).toBe(dragging);
		Layout.resizing = { mode: 'row-resize' };
		expect(store.resizing.mode).toBe('row-resize');
		store.dragging = null;
		store.resizing = null;
		expect(Layout.dragging).toBe(null);
		expect(Layout.resizing).toBe(null);
	});

	it('syncState 拉取 Layout 状态（currentPage）', () => {
		const store = getLayoutStore();
		Layout.manager = { index: 'scene' } as any;
		store.syncState();
		expect(store.currentPage).toBe('scene');
		Layout.manager = { index: null } as any;
		store.syncState();
		expect(store.currentPage).toBe('home');
	});
});
