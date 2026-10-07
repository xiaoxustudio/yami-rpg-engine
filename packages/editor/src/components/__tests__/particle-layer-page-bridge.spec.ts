import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerElement } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
vi.setConfig({ testTimeout: 30000 });
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import ParticleLayerPage from '@app/components/inspector/ParticleLayerPage.vue';

interface LayerData {
	name: string;
	area: {
		type: string;
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		radius?: number;
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
		rgba?: number[];
		min?: number[];
		max?: number[];
		easingId?: string;
		startMin?: number[];
		startMax?: number[];
		endMin?: number[];
		endMax?: number[];
		tint?: number[];
	};
}

const particleLayer = vi.hoisted(() => ({
	target: null as LayerData | null,
	update: vi.fn(),
	easingDefaultId: 'ease-linear'
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		particleLayer,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/stores/particle', () => ({
	useParticleStore: () => ({ syncState: vi.fn() }),
	getParticleStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

type SyncEl = HTMLElement & { sync?: () => void };

describe('ParticleLayerPage（particleLayer inspector 响应式双向绑定桥接）', () => {
	beforeAll(() => {
		HTMLCanvasElement.prototype.getContext = function () {
			return { measureText: () => ({ width: 0 }) };
		} as never;
	});

	beforeEach(() => {
		document.body.innerHTML = '';
		particleLayer.target = null;
		particleLayer.update.mockClear();
	});

	const mountPage = async () => {
		const host = document.createElement('div');
		host.id = 'particleLayer-vue-mount';
		document.body.appendChild(host);
		registerElement(inspectorEls, host.id, host);
		const wrapper = mount(ParticleLayerPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	const makeLayer = (overrides: Partial<LayerData> = {}): LayerData => ({
		name: 'Layer 1',
		area: { type: 'rectangle', x: 10, y: 20, width: 64, height: 32 },
		count: 100,
		delay: 0,
		interval: 40,
		lifetime: 1000,
		lifetimeDev: 0,
		fadeout: 200,
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
		image: '',
		blend: 'additive',
		light: 'raw',
		sort: 'youngest-in-front',
		sprite: { mode: 'random', hframes: 1, vframes: 1, interval: 100 },
		color: {
			mode: 'texture',
			tint: [0, 0, 0, 0],
			easingId: 'ease-1'
		},
		...overrides
	});

	const read = (id: string) =>
		(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

	it('onMounted 挂载 sync 桥接到 #particleLayer-vue-mount 容器', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('particleLayer-vue-mount') as SyncEl;
		expect(typeof el.sync).toBe('function');
		wrapper.unmount();
	}, 30000);

	it('sync 桥接把 legacy target 渲染到控件（open 后初始化，含嵌套默认值）', async () => {
		const wrapper = await mountPage();
		particleLayer.target = makeLayer();
		(document.getElementById('particleLayer-vue-mount') as SyncEl).sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('particleLayer-name')).toBe('Layer 1');
		expect(read('particleLayer-area-type')).toBe('rectangle');
		expect(read('particleLayer-area-x')).toBe(10);
		expect(read('particleLayer-area-y')).toBe(20);
		expect(read('particleLayer-area-width')).toBe(64);
		expect(read('particleLayer-area-height')).toBe(32);
		expect(read('particleLayer-area-radius')).toBe(32);
		expect(read('particleLayer-count')).toBe(100);
		expect(read('particleLayer-delay')).toBe(0);
		expect(read('particleLayer-interval')).toBe(40);
		expect(read('particleLayer-lifetime')).toBe(1000);
		expect(read('particleLayer-lifetimeDev')).toBe(0);
		expect(read('particleLayer-fadeout')).toBe(200);
		expect(read('particleLayer-anchor-x-0')).toBe(0);
		expect(read('particleLayer-anchor-x-1')).toBe(0);
		expect(read('particleLayer-movement-angle-0')).toBe(0);
		expect(read('particleLayer-movement-speed-0')).toBe(0);
		expect(read('particleLayer-rotation-angle-0')).toBe(0);
		expect(read('particleLayer-hRotation-radius-0')).toBe(0);
		expect(read('particleLayer-scale-factor-0')).toBe(1);
		expect(read('particleLayer-image')).toBe('');
		expect(read('particleLayer-blend')).toBe('additive');
		expect(read('particleLayer-light')).toBe('raw');
		expect(read('particleLayer-sort')).toBe('youngest-in-front');
		expect(read('particleLayer-sprite-mode')).toBe('random');
		expect(read('particleLayer-sprite-hframes')).toBe(1);
		expect(read('particleLayer-sprite-vframes')).toBe(1);
		expect(read('particleLayer-sprite-interval')).toBe(100);
		expect(read('particleLayer-color-mode')).toBe('texture');
		expect(read('particleLayer-color-rgba-0')).toBe(255);
		expect(read('particleLayer-color-rgba-3')).toBe(255);
		expect(read('particleLayer-color-min-0')).toBe(0);
		expect(read('particleLayer-color-min-3')).toBe(255);
		expect(read('particleLayer-color-max-0')).toBe(255);
		expect(read('particleLayer-color-max-3')).toBe(255);
		expect(read('particleLayer-color-easingId')).toBe('ease-1');
		expect(read('particleLayer-color-startMin-0')).toBe(0);
		expect(read('particleLayer-color-startMax-0')).toBe(255);
		expect(read('particleLayer-color-endMin-0')).toBe(0);
		expect(read('particleLayer-color-endMax-0')).toBe(255);
		expect(read('particleLayer-color-tint-0')).toBe(0);
		expect(read('particleLayer-color-tint-3')).toBe(0);
		wrapper.unmount();
	});

	it('easingId 缺失时使用 legacy easingDefaultId 默认值', async () => {
		const wrapper = await mountPage();
		particleLayer.target = makeLayer({ color: { mode: 'easing' } });
		(document.getElementById('particleLayer-vue-mount') as SyncEl).sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('particleLayer-color-easingId')).toBe('ease-linear');
		wrapper.unmount();
	});

	it('切换 target 后再次 sync 更新控件显示', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('particleLayer-vue-mount') as SyncEl;
		particleLayer.target = makeLayer();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		particleLayer.target = makeLayer({
			name: 'Layer 2',
			area: { type: 'point', x: 99, y: 0 },
			color: { mode: 'texture', tint: [10, 20, 30, 255] }
		});
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('particleLayer-name')).toBe('Layer 2');
		expect(read('particleLayer-area-type')).toBe('point');
		expect(read('particleLayer-area-x')).toBe(99);
		expect(read('particleLayer-color-tint-0')).toBe(10);
		expect(read('particleLayer-color-tint-1')).toBe(20);
		expect(read('particleLayer-color-tint-3')).toBe(255);
		wrapper.unmount();
	});

	it('控件 input 经 composable 调用 update 并保持 form 与 target 同步', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('particleLayer-vue-mount') as SyncEl;
		particleLayer.target = makeLayer();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		particleLayer.update.mockImplementation(() => {
			if (particleLayer.target) {
				particleLayer.target.count = 500;
			}
		});
		const input = document.getElementById('particleLayer-count')?.querySelector('input');
		expect(input).toBeTruthy();
		input!.value = '500';
		input!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(particleLayer.update).toHaveBeenCalledWith(particleLayer.target, 'count', 500);
		await wrapper.vm.$nextTick();
		expect(read('particleLayer-count')).toBe(500);
		wrapper.unmount();
	});
});
