import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';

interface ParallaxData {
	name: string;
	image: string;
	layer: string;
	order: number;
	light: string;
	blend: string;
	opacity: number;
	x: number;
	y: number;
	scaleX: number;
	scaleY: number;
	repeatX: number;
	repeatY: number;
	anchorX: number;
	anchorY: number;
	offsetX: number;
	offsetY: number;
	parallaxFactorX: number;
	parallaxFactorY: number;
	shiftSpeedX: number;
	shiftSpeedY: number;
	tint: number[];
}

const sceneParallax = vi.hoisted(() => ({
	target: null as ParallaxData | null,
	update: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		sceneParallax,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useSceneParallaxPage();
	},
	render: () => null
});

const makeParallax = (overrides: Partial<ParallaxData> = {}): ParallaxData => ({
	name: 'Parallax 1',
	image: 'image-1',
	layer: 'foreground',
	order: 0,
	light: 'raw',
	blend: 'normal',
	opacity: 1,
	x: 10,
	y: 20,
	scaleX: 1,
	scaleY: 1,
	repeatX: 1,
	repeatY: 1,
	anchorX: 0,
	anchorY: 0,
	offsetX: 0,
	offsetY: 0,
	parallaxFactorX: 1,
	parallaxFactorY: 1,
	shiftSpeedX: 0,
	shiftSpeedY: 0,
	tint: [10, 20, 30, 40],
	...overrides
});

describe('useSceneParallaxPage（sceneParallax inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		sceneParallax.target = null;
		sceneParallax.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useSceneParallaxPage>
		};
	};

	it('sync 从 Inspector.sceneParallax.target 填充 form（含 tint 数组副本）', () => {
		const { wrapper, page } = mountPage();
		sceneParallax.target = makeParallax();
		page.sync();
		expect(page.form.name).toBe('Parallax 1');
		expect(page.form.image).toBe('image-1');
		expect(page.form.layer).toBe('foreground');
		expect(page.form.light).toBe('raw');
		expect(page.form.blend).toBe('normal');
		expect(page.form.opacity).toBe(1);
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.scaleX).toBe(1);
		expect(page.form.scaleY).toBe(1);
		expect(page.form.shiftSpeedX).toBe(0);
		expect(page.form.shiftSpeedY).toBe(0);
		expect(page.form.tint).toEqual([10, 20, 30, 40]);
		expect(page.form.tint).not.toBe(sceneParallax.target.tint);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		sceneParallax.target = makeParallax();
		page.sync();
		sceneParallax.target = null;
		page.sync();
		expect(page.form.name).toBe('Parallax 1');
		expect(page.form.tint).toEqual([10, 20, 30, 40]);
		wrapper.unmount();
	});

	it('onParamInput 找不到 sceneParallax 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		sceneParallax.target = makeParallax();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneParallax.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		sceneParallax.update.mockImplementation(
			(parallax: ParallaxData, key: string, value: unknown) => {
				(parallax as unknown as Record<string, unknown>)[key] = value;
			}
		);
		sceneParallax.target = makeParallax();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'sceneParallax-name';
		el.read = () => 'Parallax 3';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneParallax.update).toHaveBeenCalledWith(
			sceneParallax.target,
			'name',
			'Parallax 3'
		);
		expect(page.form.name).toBe('Parallax 3');
		wrapper.unmount();
	});

	it('onParamInput 处理 tint 索引键并重新 sync tint', () => {
		const { wrapper, page } = mountPage();
		sceneParallax.update.mockImplementation(
			(parallax: ParallaxData, key: string, value: unknown) => {
				const index = key.indexOf('-') + 1;
				parallax.tint[Number(key.slice(index))] = value as number;
			}
		);
		sceneParallax.target = makeParallax();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'sceneParallax-tint-1';
		el.read = () => 66;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(sceneParallax.update).toHaveBeenCalledWith(sceneParallax.target, 'tint-1', 66);
		expect(page.form.tint).toEqual([10, 66, 30, 40]);
		wrapper.unmount();
	});
});
