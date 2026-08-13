import { describe, expect, it } from 'vitest';
import { getParticleStore, particleStateKeys } from '@app/stores/particle';

describe('useParticleStore（Particle 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getParticleStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.paused).toBe(false);
		expect(store.showWireframe).toBe(false);
		expect(store.showAnchor).toBe(false);
		expect(store.speed).toBe(null);
		expect(store.zoom).toBe(null);
		expect(store.scaleX).toBe(null);
		expect(store.scaleY).toBe(null);
	});

	it('状态键完整（9 项）', () => {
		const store = getParticleStore();
		expect(particleStateKeys).toHaveLength(9);
		for (const key of particleStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getParticleStore();
		store.target = {
			area: { type: 'rectangle', x: 0, y: 0, width: 16, height: 16, radius: 0 }
		};
		expect(store.target).toEqual({
			area: { type: 'rectangle', x: 0, y: 0, width: 16, height: 16, radius: 0 }
		});
		store.paused = true;
		expect(store.paused).toBe(true);
		store.showWireframe = true;
		expect(store.showWireframe).toBe(true);
		store.showAnchor = true;
		expect(store.showAnchor).toBe(true);
		store.speed = 1.5;
		expect(store.speed).toBe(1.5);
		store.zoom = 2;
		expect(store.zoom).toBe(2);
		store.scaleX = 1;
		expect(store.scaleX).toBe(1);
		store.scaleY = 1;
		expect(store.scaleY).toBe(1);
		store.target = null;
		store.paused = false;
		store.showWireframe = false;
		store.showAnchor = false;
		store.speed = null;
		store.zoom = null;
		store.scaleX = null;
		store.scaleY = null;
	});

	it('无 Particle 时 syncState 兜底默认值', () => {
		const store = getParticleStore();
		store.syncState();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.paused).toBe(false);
		expect(store.showWireframe).toBe(false);
		expect(store.showAnchor).toBe(false);
		expect(store.speed).toBe(null);
		expect(store.zoom).toBe(null);
		expect(store.scaleX).toBe(null);
		expect(store.scaleY).toBe(null);
	});
});
