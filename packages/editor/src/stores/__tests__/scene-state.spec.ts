import { describe, expect, it } from 'vitest';
import { getSceneStore, sceneStateKeys } from '@app/stores/scene';

describe('useSceneStore（Scene 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getSceneStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.mode).toBe(null);
		expect(store.tilemap).toBe(null);
		expect(store.layer).toBe(null);
		expect(store.showGrid).toBe(false);
		expect(store.zoom).toBe(null);
		expect(store.scaleX).toBe(null);
		expect(store.scaleY).toBe(null);
	});

	it('状态键完整（9 项）', () => {
		const store = getSceneStore();
		expect(sceneStateKeys).toHaveLength(9);
		for (const key of sceneStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getSceneStore();
		store.mode = 'object';
		expect(store.mode).toBe('object');
		store.tilemap = { width: 16 };
		expect(store.tilemap).toEqual({ width: 16 });
		store.layer = 'tile';
		expect(store.layer).toBe('tile');
		store.showGrid = true;
		expect(store.showGrid).toBe(true);
		store.zoom = 2;
		expect(store.zoom).toBe(2);
		store.scaleX = 1.5;
		expect(store.scaleX).toBe(1.5);
		store.scaleY = 1.5;
		expect(store.scaleY).toBe(1.5);
		store.mode = null;
		store.tilemap = null;
		store.layer = null;
		store.showGrid = false;
		store.zoom = null;
		store.scaleX = null;
		store.scaleY = null;
	});

	it('无 Scene 时 syncState 兜底默认值', () => {
		const store = getSceneStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.mode).toBe(null);
		expect(store.tilemap).toBe(null);
		expect(store.layer).toBe(null);
		expect(store.showGrid).toBe(false);
		expect(store.zoom).toBe(null);
		expect(store.scaleX).toBe(null);
		expect(store.scaleY).toBe(null);
	});
});
