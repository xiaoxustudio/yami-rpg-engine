import { describe, expect, it } from 'vitest';
import { getAutoTileStore, autoTileStateKeys } from '@app/stores/autoTile';
import { AutoTile } from '@app/palette/auto-tile.ts';

describe('useAutoTileStore（AutoTile 窗口状态反转：store 为源）', () => {
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

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getAutoTileStore();
		AutoTile.templates = [{ id: 'a', name: '', cover: 0, nodes: [] }];
		expect(store.templates).toEqual([{ id: 'a', name: '', cover: 0, nodes: [] }]);
		AutoTile.template = { id: 'a', name: '', cover: 0, nodes: [] };
		expect(store.template).toEqual({ id: 'a', name: '', cover: 0, nodes: [] });
		AutoTile.nodeIndex = 1;
		expect(store.nodeIndex).toBe(1);
		AutoTile.frameIndex = 2;
		expect(store.frameIndex).toBe(2);
		AutoTile.offsetX = 3;
		expect(store.offsetX).toBe(3);
		AutoTile.offsetY = 4;
		expect(store.offsetY).toBe(4);
		AutoTile.imageId = 'img';
		expect(store.imageId).toBe('img');
		AutoTile.changed = true;
		expect(store.changed).toBe(true);
		AutoTile.templates = null;
		AutoTile.template = null;
		AutoTile.nodeIndex = null;
		AutoTile.frameIndex = null;
		AutoTile.offsetX = null;
		AutoTile.offsetY = null;
		AutoTile.imageId = null;
		AutoTile.changed = false;
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getAutoTileStore();
		store.templates = [{ id: 'b', name: 'B', cover: 1, nodes: [] }];
		expect(AutoTile.templates).toEqual([{ id: 'b', name: 'B', cover: 1, nodes: [] }]);
		store.template = { id: 'b', name: 'B', cover: 1, nodes: [] };
		expect(AutoTile.template).toEqual({ id: 'b', name: 'B', cover: 1, nodes: [] });
		store.nodeIndex = 2;
		expect(AutoTile.nodeIndex).toBe(2);
		store.frameIndex = 3;
		expect(AutoTile.frameIndex).toBe(3);
		store.offsetX = 4;
		expect(AutoTile.offsetX).toBe(4);
		store.offsetY = 5;
		expect(AutoTile.offsetY).toBe(5);
		store.imageId = 'img2';
		expect(AutoTile.imageId).toBe('img2');
		store.changed = true;
		expect(AutoTile.changed).toBe(true);
		store.templates = null;
		store.template = null;
		store.nodeIndex = null;
		store.frameIndex = null;
		store.offsetX = null;
		store.offsetY = null;
		store.imageId = null;
		store.changed = false;
	});
});
