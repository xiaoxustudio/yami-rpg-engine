import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';

interface TilemapData {
	name: string;
	layer: string;
	order: number;
	light: string;
	blend: string;
	x: number;
	y: number;
	width: number;
	height: number;
	anchorX: number;
	anchorY: number;
	offsetX: number;
	offsetY: number;
	parallaxFactorX: number;
	parallaxFactorY: number;
	opacity: number;
}

const sceneTilemap = vi.hoisted(() => ({
	target: null as TilemapData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		sceneTilemap,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneTilemapPage();
	},
	render: () => null
});

const makeTilemap = (overrides: Partial<TilemapData> = {}): TilemapData => ({
	name: 'Tilemap 1',
	layer: 'background',
	order: 0,
	light: 'global',
	blend: 'normal',
	x: 10,
	y: 20,
	width: 4,
	height: 3,
	anchorX: 0,
	anchorY: 0,
	offsetX: 0,
	offsetY: 0,
	parallaxFactorX: 1,
	parallaxFactorY: 1,
	opacity: 1,
	...overrides
});

describe('useSceneTilemapPage（sceneTilemap inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneTilemap.target = null;
		sceneTilemap.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneTilemapPage>
		};
	};

	it('sync 从 Inspector.sceneTilemap.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		sceneTilemap.target = makeTilemap();
		page.sync();
		expect(page.form.name).toBe('Tilemap 1');
		expect(page.form.layer).toBe('background');
		expect(page.form.order).toBe(0);
		expect(page.form.light).toBe('global');
		expect(page.form.blend).toBe('normal');
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.width).toBe(4);
		expect(page.form.height).toBe(3);
		expect(page.form.anchorX).toBe(0);
		expect(page.form.anchorY).toBe(0);
		expect(page.form.offsetX).toBe(0);
		expect(page.form.offsetY).toBe(0);
		expect(page.form.parallaxFactorX).toBe(1);
		expect(page.form.parallaxFactorY).toBe(1);
		expect(page.form.opacity).toBe(1);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		sceneTilemap.target = makeTilemap();
		page.sync();
		sceneTilemap.target = null;
		page.sync();
		expect(page.form.name).toBe('Tilemap 1');
		expect(page.form.opacity).toBe(1);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneTilemap 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneTilemap.target = makeTilemap();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneTilemap.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneTilemap.update.mockImplementation(
			(tilemap: TilemapData, key: string, value: unknown) => {
				(tilemap as unknown as Record<string, unknown>)[key] = value;
			}
		);
		sceneTilemap.target = makeTilemap();
		page.form.name = 'Tilemap 3';
		const el = document.createElement('div') as HTMLElement;
		el.id = 'sceneTilemap-name';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneTilemap.update).toHaveBeenCalledWith(sceneTilemap.target, 'name', 'Tilemap 3');
		expect(page.form.name).toBe('Tilemap 3');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		sceneTilemap.target = makeTilemap();
		page.form.width = 8;
		const el = document.createElement('div') as HTMLElement;
		el.id = 'sceneTilemap-width';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneTilemap.update).toHaveBeenCalledWith(sceneTilemap.target, 'width', 8);
		wrapper.unmount();
	});

	it('onParamInput 无事件时回退 document.activeElement 解析控件', () => {
		const { wrapper, page } = mountPage();
		sceneTilemap.update.mockImplementation(
			(tilemap: TilemapData, key: string, value: unknown) => {
				(tilemap as unknown as Record<string, unknown>)[key] = value;
			}
		);
		sceneTilemap.target = makeTilemap();
		page.form.height = 6;
		const el = document.createElement('div') as HTMLElement;
		el.id = 'sceneTilemap-height';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		input.focus();
		page.onParamInput();
		expect(sceneTilemap.update).toHaveBeenCalledWith(sceneTilemap.target, 'height', 6);
		wrapper.unmount();
	});
});
