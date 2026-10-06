import { beforeAll, describe, expect, it, vi } from 'vitest';
import { registerElement } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
vi.setConfig({ testTimeout: 30000 });
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import ParticleLayerPage from '@app/components/inspector/ParticleLayerPage.vue';
import { Inspector } from '@app/inspector/inspector.ts';

const layerInstance = vi.hoisted(() => ({
	updateElementMethods: vi.fn(),
	updateCount: vi.fn(),
	clear: vi.fn(),
	updateEasing: vi.fn(),
	loadTexture: vi.fn(),
	calculateElementSize: vi.fn(),
	resizeElementIndices: vi.fn(),
	elapsed: 0
}));

const layer = vi.hoisted(() => ({
	name: 'L',
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
		rgba: undefined as number[] | undefined,
		min: undefined as number[] | undefined,
		max: undefined as number[] | undefined,
		easingId: undefined as string | undefined,
		startMin: undefined as number[] | undefined,
		startMax: undefined as number[] | undefined,
		endMin: undefined as number[] | undefined,
		endMax: undefined as number[] | undefined
	}
}));

vi.mock('@app/particle/particle-window.ts', () => ({
	Particle: {
		emitter: { getLayer: () => layerInstance },
		planToSave: vi.fn(),
		updateParticleInfo: vi.fn(),
		list: { updateItemName: vi.fn(), update: vi.fn(), unselect: vi.fn() },
		computeOuterRect: vi.fn(),
		requestRendering: vi.fn(),
		updateTarget: vi.fn()
	}
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: { createEasingItems: () => [], easings: [{ id: 'e1' }] }
}));

vi.mock('@app/stores/particle', () => ({
	useParticleStore: () => ({ syncState: vi.fn() }),
	getParticleStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({}),
	getLocalStore: () => ({})
}));

vi.unmock('@app/inspector/particle-layer-page.ts');
import '@app/inspector/particle-layer-page.ts';

const mountPage = async () => {
	document.body.innerHTML = '';
	const host = document.createElement('div');
	host.id = 'particleLayer-vue-mount';
	document.body.appendChild(host);
	// 页面模块改从 inspectorEls 取 vue-mount（不再查 DOM），故测试需登记
	registerElement(inspectorEls, 'particleLayer-vue-mount', host);
	const wrapper = mount(ParticleLayerPage, {
		attachTo: document.body,
		global: { plugins: [initYamiI18n()] }
	});
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	(Inspector.particleLayer as unknown as { open: (l: unknown) => void }).open(layer);
	await wrapper.vm.$nextTick();
	await wrapper.vm.$nextTick();
	return wrapper;
};

describe('particle layer page form rebuild', () => {
	beforeAll(() => {
		HTMLCanvasElement.prototype.getContext = function () {
			return { measureText: () => ({ width: 0 }) };
		} as never;
	});

	it('typing in count NumberBox propagates final value to layer', async () => {
		const wrapper = await mountPage();
		const input = document
			.getElementById('particleLayer-count')
			?.querySelector('input') as HTMLInputElement;
		expect(input).toBeTruthy();
		input.focus();
		input.value = '777';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await wrapper.vm.$nextTick();
		input.dispatchEvent(new Event('change', { bubbles: true }));
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(layer.count).toBe(777);
		wrapper.unmount();
	});

	it('area-type switch rebuilds area from form values', async () => {
		const wrapper = await mountPage();
		Inspector.particleLayer!.update!(layer as never, 'area-type', 'circle');
		expect(layer.area).toEqual({ type: 'circle', x: 10, y: 20, radius: 32 });
		Inspector.particleLayer!.update!(layer as never, 'area-type', 'rectangle');
		expect(layer.area).toEqual({
			type: 'rectangle',
			x: 10,
			y: 20,
			width: 64,
			height: 32
		});
		wrapper.unmount();
	});

	it('color-mode switch rebuilds color from form values', async () => {
		const wrapper = await mountPage();
		Inspector.particleLayer!.update!(layer as never, 'color-mode', 'easing');
		expect(layer.color.mode).toBe('easing');
		expect(layer.color.easingId).toBe('e1');
		expect(layer.color.startMin).toEqual([0, 0, 0, 255]);
		expect(layer.color.startMax).toEqual([255, 255, 255, 255]);
		expect(layer.color.endMin).toEqual([0, 0, 0, 255]);
		expect(layer.color.endMax).toEqual([255, 255, 255, 255]);
		Inspector.particleLayer!.update!(layer as never, 'color-mode', 'fixed');
		expect(layer.color.rgba).toEqual([255, 255, 255, 255]);
		wrapper.unmount();
	});
});
