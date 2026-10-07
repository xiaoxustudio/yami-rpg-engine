import { describe, expect, it } from 'vitest';
import { getSceneStore, sceneStateKeys } from '@app/stores/scene';
import { Scene } from '@app/scene/scene-window.ts';

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

	it('状态键完整（14 项）且每个键真经单例读写 store', async () => {
		const store = getSceneStore();
		expect(sceneStateKeys).toHaveLength(14);
		for (const key of sceneStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
		const { Scene } = await import('@app/scene/scene-window.ts');
		const probes: Record<string, unknown> = {
			state: 'open',
			target: { width: 16 },
			mode: 'tile',
			tilemap: { id: 't' },
			layer: 'l1',
			showGrid: true,
			zoom: 2,
			scaleX: 1,
			scaleY: 1,
			brush: 'eraser',
			symbol: { id: 's' },
			showLight: true,
			showAnimation: true,
			activeTilemapId: 3
		};
		for (const key of sceneStateKeys) {
			(Scene as unknown as Record<string, unknown>)[key] = probes[key];
			expect((store as unknown as Record<string, unknown>)[key], String(key)).toStrictEqual(
				probes[key]
			);
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
