import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUIImagePage } from '@app/composables/useUIImagePage';

interface ElementData {
	name: string;
	pointerEvents: string;
	transform: Record<string, number>;
}

const uiElement = vi.hoisted(() => ({
	target: null as ElementData | null,
	update: vi.fn()
}));

const uiImage = vi.hoisted(() => ({
	target: null as Record<string, unknown> | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiElement,
		uiImage,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUIImagePage();
	},
	render: () => null
});

const makeElement = (overrides: Partial<ElementData> = {}): ElementData => ({
	name: 'Image 1',
	pointerEvents: 'enabled',
	transform: {
		anchorX: 0.5,
		anchorY: 0.5,
		x: 10,
		x2: 0,
		y: 20,
		y2: 0,
		width: 100,
		width2: 0,
		height: 50,
		height2: 0,
		rotation: 45,
		scaleX: 1,
		scaleY: 1,
		skewX: 0,
		skewY: 0,
		opacity: 1
	},
	...overrides
});

describe('useUIImagePage（uiElement inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiElement.target = null;
		uiImage.target = null;
		uiElement.update.mockClear();
		uiImage.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUIImagePage>
		};
	};

	it('sync 从 Inspector.uiElement.target 填充 form（node + transform）', () => {
		const { wrapper, page } = mountPage();
		uiElement.target = makeElement();
		page.sync();
		expect(page.form.name).toBe('Image 1');
		expect(page.form.pointerEvents).toBe('enabled');
		expect(page.form.anchorX).toBe(0.5);
		expect(page.form.x).toBe(10);
		expect(page.form.y).toBe(20);
		expect(page.form.width).toBe(100);
		expect(page.form.height).toBe(50);
		expect(page.form.rotation).toBe(45);
		expect(page.form.scaleX).toBe(1);
		expect(page.form.opacity).toBe(1);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		uiElement.target = makeElement();
		page.sync();
		uiElement.target = null;
		page.sync();
		expect(page.form.name).toBe('Image 1');
		expect(page.form.rotation).toBe(45);
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiElement/uiImage 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiElement.target = makeElement();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 uiElement.update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiElement.update.mockImplementation((target: ElementData, key: string, value: unknown) => {
			if (key === 'name') {
				target.name = value as string;
			}
		});
		uiElement.target = makeElement();
		page.form.name = 'Image 3';
		const el = document.createElement('div') as HTMLElement;
		el.id = 'uiElement-name';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.update).toHaveBeenCalledWith(uiElement.target, 'name', 'Image 3');
		expect(page.form.name).toBe('Image 3');
		wrapper.unmount();
	});

	it('onParamInput 落在 uiImage 控件时调用 uiImage.update', () => {
		const { wrapper, page } = mountPage();
		uiElement.target = makeElement();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiImage-image';
		el.read = () => 'img.png';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.update).not.toHaveBeenCalled();
		expect(uiImage.update).toHaveBeenCalledWith(uiImage.target, 'image', 'img.png');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上（transform 字段）', () => {
		const { wrapper, page } = mountPage();
		uiElement.update.mockImplementation((target: ElementData, key: string, value: unknown) => {
			if (key.startsWith('transform-')) {
				target.transform[key.slice('transform-'.length)] = value as number;
			}
		});
		uiElement.target = makeElement();
		page.form.x = 42;
		const el = document.createElement('div') as HTMLElement;
		el.id = 'uiElement-transform-x';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiElement.update).toHaveBeenCalledWith(uiElement.target, 'transform-x', 42);
		expect(page.form.x).toBe(42);
		wrapper.unmount();
	});
});
