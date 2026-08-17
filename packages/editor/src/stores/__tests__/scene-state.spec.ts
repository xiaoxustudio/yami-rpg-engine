import { describe, expect, it } from 'vitest';
import { getSceneStore, sceneStateKeys } from '@app/stores/scene';
import { Scene } from '@app/legacy/scene/scene-window.ts';

describe('useSceneStore（Scene 状态反转：store 为源）', () => {
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
		store.state = 'open';
		expect(store.state).toBe('open');
		store.target = { width: 16 };
		expect(store.target).toEqual({ width: 16 });
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
		store.state = 'closed';
		store.target = null;
		store.mode = null;
		store.tilemap = null;
		store.layer = null;
		store.showGrid = false;
		store.zoom = null;
		store.scaleX = null;
		store.scaleY = null;
	});

	it('legacy 写入经 store 生效（store 为源）', () => {
		const store = getSceneStore();
		Scene.state = 'open';
		expect(store.state).toBe('open');
		Scene.state = 'closed';
		expect(store.state).toBe('closed');
		Scene.target = { width: 16 };
		expect(store.target).toEqual({ width: 16 });
		Scene.target = null;
		expect(store.target).toBe(null);
		Scene.mode = 'object';
		expect(store.mode).toBe('object');
		Scene.tilemap = { width: 16 };
		expect(store.tilemap).toEqual({ width: 16 });
		Scene.layer = 'tile';
		expect(store.layer).toBe('tile');
		Scene.showGrid = true;
		expect(store.showGrid).toBe(true);
		Scene.zoom = 2;
		expect(store.zoom).toBe(2);
		Scene.scaleX = 1.5;
		expect(store.scaleX).toBe(1.5);
		Scene.scaleY = 1.5;
		expect(store.scaleY).toBe(1.5);
	});

	it('store 写入经桥反向可读（外部 legacy 读取兼容）', () => {
		const store = getSceneStore();
		store.state = 'loading';
		expect(Scene.state).toBe('loading');
		store.mode = 'object';
		expect(Scene.mode).toBe('object');
		store.zoom = 3;
		expect(Scene.zoom).toBe(3);
		store.state = 'closed';
		store.mode = null;
		store.zoom = null;
	});
});
