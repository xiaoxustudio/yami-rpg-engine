import { describe, expect, it } from 'vitest';
import { getAutoTileStore, autoTileStateKeys } from '@app/stores/autoTile';

describe('useAutoTileStore（AutoTile 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getAutoTileStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.templates).toBe(null);
		expect(store.template).toBe(null);
		expect(store.nodeIndex).toBe(null);
		expect(store.frameIndex).toBe(null);
		expect(store.offsetX).toBe(null);
		expect(store.offsetY).toBe(null);
		expect(store.imageId).toBe(null);
		expect(store.changed).toBe(false);
	});

	it('状态键完整（10 项）', () => {
		const store = getAutoTileStore();
		expect(autoTileStateKeys).toHaveLength(10);
		for (const key of autoTileStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getAutoTileStore();
		store.templates = [{ id: 'a' }];
		expect(store.templates).toEqual([{ id: 'a' }]);
		store.template = { id: 'a' };
		expect(store.template).toEqual({ id: 'a' });
		store.nodeIndex = 2;
		expect(store.nodeIndex).toBe(2);
		store.frameIndex = 3;
		expect(store.frameIndex).toBe(3);
		store.offsetX = 4;
		expect(store.offsetX).toBe(4);
		store.offsetY = 5;
		expect(store.offsetY).toBe(5);
		store.imageId = 'img';
		expect(store.imageId).toBe('img');
		store.changed = true;
		expect(store.changed).toBe(true);
		store.templates = null;
		store.template = null;
		store.nodeIndex = null;
		store.frameIndex = null;
		store.offsetX = null;
		store.offsetY = null;
		store.imageId = null;
		store.changed = false;
	});

	it('无 AutoTile 时 syncState 兜底默认值', () => {
		const store = getAutoTileStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.templates).toBe(null);
		expect(store.template).toBe(null);
		expect(store.nodeIndex).toBe(null);
		expect(store.frameIndex).toBe(null);
		expect(store.offsetX).toBe(null);
		expect(store.offsetY).toBe(null);
		expect(store.imageId).toBe(null);
		expect(store.changed).toBe(false);
	});
});
