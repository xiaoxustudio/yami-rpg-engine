import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerElement } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import SceneLightPage from '@app/components/inspector/SceneLightPage.vue';

interface LightData {
	name: string;
	type: string;
	blend: string;
	x: number;
	y: number;
	range: number;
	intensity: number;
	mask: string;
	anchorX: number;
	anchorY: number;
	width: number;
	height: number;
	angle: number;
	red: number;
	green: number;
	blue: number;
	direct: number;
	conditions: unknown[];
	events: unknown[];
	scripts: unknown[];
}

const sceneLight = vi.hoisted(() => ({
	target: null as LightData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		sceneLight,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

vi.mock('@app/stores/scene', () => ({
	useSceneStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
}));

type SyncEl = HTMLElement & { sync?: () => void };

describe('SceneLightPage（sceneLight inspector 响应式双向绑定桥接）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneLight.target = null;
		sceneLight.update.mockClear();
	});

	const mountPage = async () => {
		const host = document.createElement('div');
		host.id = 'sceneLight-vue-mount';
		document.body.appendChild(host);
		// 页面 SFC 改从 inspectorEls 取宿主容器 → 用例自建的宿主也要登记
		registerElement(inspectorEls, host.id, host);
		const wrapper = mount(SceneLightPage, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		return wrapper;
	};

	const makeLight = (overrides: Partial<LightData> = {}): LightData => ({
		name: 'Light 1',
		type: 'point',
		blend: 'screen',
		x: 10,
		y: 20,
		range: 5,
		intensity: 0.5,
		mask: '',
		anchorX: 0.5,
		anchorY: 0.5,
		width: 2,
		height: 3,
		angle: 45,
		red: 255,
		green: 128,
		blue: 64,
		direct: 0.8,
		conditions: [],
		events: [],
		scripts: [],
		...overrides
	});

	const read = (id: string) =>
		(document.getElementById(id) as (HTMLElement & { read?: () => unknown }) | null)?.read?.();

	it('onMounted 挂载 sync 桥接到 #sceneLight-vue-mount 容器', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('sceneLight-vue-mount') as SyncEl;
		expect(typeof el.sync).toBe('function');
		wrapper.unmount();
	});

	it('sync 桥接把 legacy target 渲染到控件（open 后初始化）', async () => {
		const wrapper = await mountPage();
		sceneLight.target = makeLight();
		(document.getElementById('sceneLight-vue-mount') as SyncEl).sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('sceneLight-name')).toBe('Light 1');
		expect(read('sceneLight-type')).toBe('point');
		expect(read('sceneLight-blend')).toBe('screen');
		expect(read('sceneLight-x')).toBe(10);
		expect(read('sceneLight-y')).toBe(20);
		expect(read('sceneLight-range')).toBe(5);
		expect(read('sceneLight-intensity')).toBe(0.5);
		expect(read('sceneLight-anchorX')).toBe(0.5);
		expect(read('sceneLight-width')).toBe(2);
		expect(read('sceneLight-height')).toBe(3);
		expect(read('sceneLight-angle')).toBe(45);
		expect(read('sceneLight-red')).toBe(255);
		expect(read('sceneLight-green')).toBe(128);
		expect(read('sceneLight-blue')).toBe(64);
		expect(read('sceneLight-direct')).toBe(0.8);
		wrapper.unmount();
	});

	it('切换 target 后再次 sync 更新控件显示', async () => {
		const wrapper = await mountPage();
		const el = document.getElementById('sceneLight-vue-mount') as SyncEl;
		sceneLight.target = makeLight();
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		sceneLight.target = makeLight({ name: 'Light 2', x: 99, direct: 0.2 });
		el.sync?.();
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(read('sceneLight-name')).toBe('Light 2');
		expect(read('sceneLight-x')).toBe(99);
		expect(read('sceneLight-direct')).toBe(0.2);
		wrapper.unmount();
	});

	it('控件 input 经 composable paramInput 调用 update 并保持 form 与 target 同步', async () => {
		const wrapper = await mountPage();
		const light = makeLight();
		sceneLight.update.mockImplementation((target: LightData, key: string, value: unknown) => {
			(target as unknown as Record<string, unknown>)[key] = value;
		});
		sceneLight.target = light;
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		const input = document.getElementById('sceneLight-name')?.querySelector('input');
		expect(input).toBeTruthy();
		input!.value = 'Light 3';
		input!.focus();
		input!.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneLight.update).toHaveBeenCalledWith(light, 'name', 'Light 3');
		await wrapper.vm.$nextTick();
		expect(read('sceneLight-name')).toBe('Light 3');
		wrapper.unmount();
	});
});
