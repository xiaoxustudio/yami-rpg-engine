import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneLightPage } from '@app/composables/useSceneLightPage';

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
}

const sceneLight = vi.hoisted(() => ({
	target: null as LightData | null,
	update: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		sceneLight,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneLightPage();
	},
	render: () => null
});

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
	...overrides
});

describe('useSceneLightPage（sceneLight inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneLight.target = null;
		sceneLight.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneLightPage>
		};
	};

	it('sync 从 Inspector.sceneLight.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		sceneLight.target = makeLight();
		page.sync();
		expect(page.form.name).toBe('Light 1');
		expect(page.form.type).toBe('point');
		expect(page.form.blend).toBe('screen');
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.range).toBe(5);
		expect(page.form.intensity).toBe(0.5);
		expect(page.form.anchorX).toBe(0.5);
		expect(page.form.anchorY).toBe(0.5);
		expect(page.form.width).toBe(2);
		expect(page.form.height).toBe(3);
		expect(page.form.angle).toBe(45);
		expect(page.form.red).toBe(255);
		expect(page.form.green).toBe(128);
		expect(page.form.blue).toBe(64);
		expect(page.form.direct).toBe(0.8);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		sceneLight.target = makeLight();
		page.sync();
		sceneLight.target = null;
		page.sync();
		expect(page.form.name).toBe('Light 1');
		expect(page.form.direct).toBe(0.8);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneLight 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneLight.target = makeLight();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneLight.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneLight.update.mockImplementation((light: LightData, key: string, value: unknown) => {
			(light as unknown as Record<string, unknown>)[key] = value;
		});
		sceneLight.target = makeLight();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'sceneLight-name';
		el.read = () => 'Light 3';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneLight.update).toHaveBeenCalledWith(sceneLight.target, 'name', 'Light 3');
		expect(page.form.name).toBe('Light 3');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		sceneLight.target = makeLight();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'sceneLight-x';
		el.read = () => 42;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneLight.update).toHaveBeenCalledWith(sceneLight.target, 'x', 42);
		wrapper.unmount();
	});
});
