import { describe, expect, it, vi } from 'vitest';

vi.mock('@app/scene/scene-window', () => ({
	Scene: {
		state: 'closed',
		showLight: false
	}
}));

vi.mock('@app/engine/webgl/webgl-init', () => ({
	GL: {
		arrays: {
			0: {
				float32: new Float32Array(65536),
				uint32: new Uint32Array(65536)
			}
		},
		matrix: {
			reset: vi.fn().mockReturnThis(),
			translate: vi.fn().mockReturnThis(),
			rotate: vi.fn().mockReturnThis(),
			scale: vi.fn().mockReturnThis(),
			project: vi.fn().mockReturnThis(),
			multiply: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			set6f: vi.fn().mockReturnThis(),
			mirrorh: vi.fn().mockReturnThis()
		},
		alpha: 1,
		blend: 'normal',
		width: 800,
		height: 600,
		flip: false,
		particleProgram: {
			use: vi.fn(() => ({
				vao: {},
				u_Matrix: {},
				u_Mode: {},
				u_Tint: {},
				u_LightMode: {}
			}))
		},
		bindVertexArray: vi.fn(),
		bindTexture: vi.fn(),
		bufferData: vi.fn(),
		drawElements: vi.fn(),
		drawArrays: vi.fn(),
		TEXTURE_2D: 3553,
		TRIANGLES: 4,
		STREAM_DRAW: 35040,
		UNSIGNED_INT: 5125,
		ARRAY_BUFFER: 34962
	}
}));

vi.mock('@app/data/transition-window', () => ({
	Easing: {
		get: vi.fn(() => (t: number) => t)
	}
}));

vi.mock('@app/engine/webgl/image-texture', () => ({
	ImageTexture: class {
		complete = true;
		width = 32;
		height = 32;
		base = { guid: '', glTexture: {} };
		on = vi.fn();
		destroy = vi.fn();
	}
}));

import { ParticleEngine } from '@app/engine/particle/particle-engine.ts';

function createMockLayerData(overrides: Record<string, any> = {}): any {
	return {
		interval: 100,
		delay: 0,
		area: { type: 'point', x: 0, y: 0 },
		count: 0,
		image: '',
		sort: 'youngest-in-front',
		blend: 'normal',
		color: { mode: 'fixed', rgba: [255, 255, 255, 255], easingId: '' },
		light: 'raw',
		sprite: { mode: 'animation', hframes: 1, vframes: 1, interval: 100 },
		...overrides
	};
}

function createMockEmitterData(layers: any[] = []): any {
	return { layers };
}

describe('ParticleElement.getRandomParameter', () => {
	it('deviation 为 0 时返回标准值', () => {
		const result = ParticleEngine.Element!.getRandomParameter([50, 0]);
		expect(result).toBe(50);
	});

	it('返回值在 [standard - deviation, standard + deviation] 范围内', () => {
		for (let i = 0; i < 20; i++) {
			const result = ParticleEngine.Element!.getRandomParameter([100, 50]);
			expect(result).toBeGreaterThanOrEqual(50);
			expect(result).toBeLessThanOrEqual(150);
		}
	});

	it('标准值为 0 时返回 [-deviation, +deviation] 范围', () => {
		const result = ParticleEngine.Element!.getRandomParameter([0, 30]);
		expect(Math.abs(result)).toBeLessThanOrEqual(30);
	});
});

describe('ParticleEmitter.calculateOuterRect', () => {
	it('空 layers 返回零尺寸矩形', () => {
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([]));
		const rect = emitter.calculateOuterRect();
		expect(rect.width).toBe(0);
		expect(rect.height).toBe(0);
		expect(rect.hasArea).toBe(false);
	});

	it('point area 返回最小 32x32 扩展矩形', () => {
		const layer = createMockLayerData({ area: { type: 'point', x: 10, y: 20 } });
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([layer]));
		const rect = emitter.calculateOuterRect();
		expect(rect.width).toBe(32);
		expect(rect.height).toBe(32);
		expect(rect.hasArea).toBe(true);
	});

	it('rectangle area 计算正确边界', () => {
		const layer = createMockLayerData({
			area: { type: 'rectangle', x: 50, y: 50, width: 100, height: 60 }
		});
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([layer]));
		const rect = emitter.calculateOuterRect();
		expect(rect.left).toBe(0);
		expect(rect.top).toBe(20);
		expect(rect.right).toBe(100);
		expect(rect.bottom).toBe(80);
		expect(rect.hasArea).toBe(true);
	});

	it('circle area 计算正确边界', () => {
		const layer = createMockLayerData({
			area: { type: 'circle', x: 0, y: 0, radius: 50 }
		});
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([layer]));
		const rect = emitter.calculateOuterRect();
		expect(rect.left).toBe(-50);
		expect(rect.top).toBe(-50);
		expect(rect.right).toBe(50);
		expect(rect.bottom).toBe(50);
		expect(rect.hasArea).toBe(true);
	});

	it('edge area 不参与边界计算', () => {
		const layer = createMockLayerData({ area: { type: 'edge' } });
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([layer]));
		const rect = emitter.calculateOuterRect();
		expect(rect.width).toBe(0);
		expect(rect.height).toBe(0);
	});
});

describe('ParticleEmitter.isEmpty / clear', () => {
	it('新 emitter 为空', () => {
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([]));
		expect(emitter.isEmpty()).toBe(true);
	});

	it('clear 后为空', () => {
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([]));
		emitter.clear();
		expect(emitter.isEmpty()).toBe(true);
	});
});

describe('ParticleEmitter 构造函数', () => {
	it('设置默认属性', () => {
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([]));
		expect(emitter.visible).toBe(false);
		expect(emitter.scale).toBe(1);
		expect(emitter.speed).toBe(1);
		expect(emitter.opacity).toBe(1);
		expect(emitter.angle).toBe(0);
		expect(emitter.matrix).toBeNull();
	});

	it('含有 edge area 时 alwaysEmit 为 true', () => {
		const layer = createMockLayerData({ area: { type: 'edge' } });
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([layer]));
		expect(emitter.alwaysEmit).toBe(true);
	});

	it('无 edge area 时 alwaysEmit 为 false', () => {
		const layer = createMockLayerData({ area: { type: 'point', x: 0, y: 0 } });
		const emitter = new ParticleEngine.Emitter!(createMockEmitterData([layer]));
		expect(emitter.alwaysEmit).toBe(false);
	});
});
