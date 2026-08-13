import { describe, expect, it } from 'vitest';
import { getUIStore, uiStateKeys } from '@app/stores/ui';

describe('useUIStore（UI 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getUIStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.zoom).toBe(null);
		expect(store.width).toBe(null);
		expect(store.height).toBe(null);
		expect(store.mode).toBe(null);
	});

	it('状态键完整（6 项）', () => {
		const store = getUIStore();
		expect(uiStateKeys).toHaveLength(6);
		for (const key of uiStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getUIStore();
		store.zoom = 2;
		expect(store.zoom).toBe(2);
		store.mode = 'select';
		expect(store.mode).toBe('select');
		store.width = 480;
		expect(store.width).toBe(480);
		store.height = 320;
		expect(store.height).toBe(320);
		store.target = { class: 'image', children: [] };
		expect(store.target?.class).toBe('image');
		store.zoom = null;
		store.mode = null;
		store.width = null;
		store.height = null;
		store.target = null;
	});

	it('无 UI 时 syncState 兜底默认值', () => {
		const store = getUIStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.zoom).toBe(null);
		expect(store.width).toBe(null);
		expect(store.height).toBe(null);
		expect(store.mode).toBe(null);
	});
});
