import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useParticleLayerPage } from '@app/composables/useParticleLayerPage';

interface ParticleData {
	name: string;
	area: {
		type: string;
		x: number;
		y: number;
		width: number;
		height: number;
		radius: number;
	};
	count: number;
	delay: number;
	interval: number;
	lifetime: number;
	lifetimeDev: number;
	fadeout: number;
	anchor: {
		x: number[];
		y: number[];
		speedX: number[];
		speedY: number[];
	};
	movement: {
		angle: number[];
		speed: number[];
		accelAngle: number[];
		accel: number[];
	};
	rotation: {
		angle: number[];
		speed: number[];
		accel: number[];
	};
	hRotation: {
		radius: number[];
		expansionSpeed: number[];
		expansionAccel: number[];
		angle: number[];
		angularSpeed: number[];
		angularAccel: number[];
	};
	scale: {
		factor: number[];
		speed: number[];
		accel: number[];
	};
	image: string;
	blend: string;
	light: string;
	sort: string;
	sprite: {
		mode: string;
		hframes: number;
		vframes: number;
		interval: number;
	};
	color: {
		mode: string;
		rgba: number[];
		min: number[];
		max: number[];
		easingId: string;
		startMin: number[];
		startMax: number[];
		endMin: number[];
		endMax: number[];
		tint: number[];
	};
}

const particleLayer = vi.hoisted(() => ({
	target: null as Partial<ParticleData> | null,
	easingDefaultId: 'easing-1',
	paramInput: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		particleLayer
	}
}));

const Host = defineComponent({
	setup() {
		return useParticleLayerPage();
	},
	render: () => null
});

const makeParticle = (overrides: Partial<ParticleData> = {}): ParticleData => ({
	name: 'Layer 1',
	area: { type: 'circle', x: 10, y: 20, width: 64, height: 64, radius: 32 },
	count: 100,
	delay: 50,
	interval: 40,
	lifetime: 2000,
	lifetimeDev: 100,
	fadeout: 300,
	anchor: { x: [0, 0], y: [0, 0], speedX: [0, 0], speedY: [0, 0] },
	movement: { angle: [0, 0], speed: [0, 0], accelAngle: [0, 0], accel: [0, 0] },
	rotation: { angle: [0, 0], speed: [0, 0], accel: [0, 0] },
	hRotation: {
		radius: [0, 0],
		expansionSpeed: [0, 0],
		expansionAccel: [0, 0],
		angle: [0, 0],
		angularSpeed: [0, 0],
		angularAccel: [0, 0]
	},
	scale: { factor: [1, 1], speed: [0, 0], accel: [0, 0] },
	image: 'particle.png',
	blend: 'additive',
	light: 'raw',
	sort: 'youngest-in-front',
	sprite: { mode: 'animation', hframes: 4, vframes: 4, interval: 100 },
	color: {
		mode: 'easing',
		rgba: [255, 255, 255, 255],
		min: [0, 0, 0, 255],
		max: [255, 255, 255, 255],
		easingId: 'easing-2',
		startMin: [0, 0, 0, 255],
		startMax: [255, 255, 255, 255],
		endMin: [0, 0, 0, 255],
		endMax: [255, 255, 255, 255],
		tint: [0, 0, 0, 0]
	},
	...overrides
});

describe('useParticleLayerPage（particleLayer inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		particleLayer.target = null;
		particleLayer.paramInput.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useParticleLayerPage>
		};
	};

	it('sync 从 Inspector.particleLayer.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		particleLayer.target = makeParticle();
		page.sync();
		expect(page.form.name).toBe('Layer 1');
		expect(page.form.area.type).toBe('circle');
		expect(page.form.area.x).toBe(10);
		expect(page.form.area.y).toBe(20);
		expect(page.form.count).toBe(100);
		expect(page.form.delay).toBe(50);
		expect(page.form.lifetime).toBe(2000);
		expect(page.form.image).toBe('particle.png');
		expect(page.form.blend).toBe('additive');
		expect(page.form.sprite.mode).toBe('animation');
		expect(page.form.sprite.hframes).toBe(4);
		expect(page.form.color.mode).toBe('easing');
		expect(page.form.color.easingId).toBe('easing-2');
		expect(page.form.color.tint).toEqual([0, 0, 0, 0]);
		wrapper.unmount();
	});

	it('sync 对缺失的嵌套字段使用默认值', () => {
		const { wrapper, page } = mountPage();
		particleLayer.target = { name: 'Layer 2' };
		page.sync();
		expect(page.form.name).toBe('Layer 2');
		expect(page.form.area.type).toBe('point');
		expect(page.form.sprite.mode).toBe('random');
		expect(page.form.scale.factor).toEqual([1, 1]);
		expect(page.form.color.easingId).toBe('easing-1');
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		particleLayer.target = makeParticle();
		page.sync();
		particleLayer.target = null;
		page.sync();
		expect(page.form.name).toBe('Layer 1');
		expect(page.form.count).toBe(100);
		wrapper.unmount();
	});

	it('onParamInput 找不到 particleLayer 控件时跳过 paramInput', () => {
		const { wrapper, page } = mountPage();
		particleLayer.target = makeParticle();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(particleLayer.paramInput).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并委托 paramInput + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		particleLayer.target = makeParticle({ name: 'Old Name' });
		page.sync();
		particleLayer.target = makeParticle({ name: 'New Name' });
		const el = document.createElement('div');
		el.id = 'particleLayer-name';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(particleLayer.paramInput).toHaveBeenCalled();
		expect(page.form.name).toBe('New Name');
		wrapper.unmount();
	});
});
