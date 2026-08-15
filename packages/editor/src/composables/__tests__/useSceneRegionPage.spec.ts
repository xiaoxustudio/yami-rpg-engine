import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneRegionPage } from '@app/composables/useSceneRegionPage';

interface RegionData {
	name: string;
	color: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

const sceneRegion = vi.hoisted(() => ({
	target: null as RegionData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		sceneRegion,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneRegionPage();
	},
	render: () => null
});

const makeRegion = (overrides: Partial<RegionData> = {}): RegionData => ({
	name: 'Region 1',
	color: '00000080',
	x: 10,
	y: 20,
	width: 4,
	height: 3,
	...overrides
});

describe('useSceneRegionPage（sceneRegion inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneRegion.target = null;
		sceneRegion.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneRegionPage>
		};
	};

	it('sync 从 Inspector.sceneRegion.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		sceneRegion.target = makeRegion();
		page.sync();
		expect(page.form.name).toBe('Region 1');
		expect(page.form.color).toBe('00000080');
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.width).toBe(4);
		expect(page.form.height).toBe(3);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		sceneRegion.target = makeRegion();
		page.sync();
		sceneRegion.target = null;
		page.sync();
		expect(page.form.name).toBe('Region 1');
		expect(page.form.height).toBe(3);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneRegion 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneRegion.target = makeRegion();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneRegion.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneRegion.update.mockImplementation((region: RegionData, key: string, value: unknown) => {
			(region as unknown as Record<string, unknown>)[key] = value;
		});
		sceneRegion.target = makeRegion();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'sceneRegion-name';
		el.read = () => 'Region 3';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneRegion.update).toHaveBeenCalledWith(sceneRegion.target, 'name', 'Region 3');
		expect(page.form.name).toBe('Region 3');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		sceneRegion.target = makeRegion();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'sceneRegion-width';
		el.read = () => 8;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneRegion.update).toHaveBeenCalledWith(sceneRegion.target, 'width', 8);
		wrapper.unmount();
	});
});
