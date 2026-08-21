import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUIButtonPage } from '@app/composables/useUIButtonPage';

interface ButtonData {
	display: string;
	normalImage: string;
	normalClip: number[];
	hoverImage: string;
	hoverClip: number[];
	activeImage: string;
	activeClip: number[];
	flip: string;
	border: number;
	imagePadding: number;
	imageOpacity: number;
	imageEffect: string;
	normalTint: number[];
	hoverTint: number[];
	activeTint: number[];
	direction: string;
	horizontalAlign: string;
	verticalAlign: string;
	content: string;
	size: number;
	letterSpacing: number;
	textPadding: number;
	font: string;
	typeface: string;
	textEffect: {
		type: string;
		shadowOffsetX?: number;
		shadowOffsetY?: number;
		strokeWidth?: number;
		color?: string;
	};
	normalColor: string;
	hoverColor: string;
	activeColor: string;
	hoverSound: string;
	clickSound: string;
}

const uiButton = vi.hoisted(() => ({
	target: null as ButtonData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiButton,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUIButtonPage();
	},
	render: () => null
});

const makeButton = (overrides: Partial<ButtonData> = {}): ButtonData => ({
	display: 'stretch',
	normalImage: '',
	normalClip: [0, 0, 32, 32],
	hoverImage: '',
	hoverClip: [0, 0, 32, 32],
	activeImage: '',
	activeClip: [0, 0, 32, 32],
	flip: 'none',
	border: 1,
	imagePadding: 0,
	imageOpacity: 1,
	imageEffect: 'none',
	normalTint: [0, 0, 0, 0],
	hoverTint: [0, 0, 0, 0],
	activeTint: [0, 0, 0, 0],
	direction: 'horizontal-tb',
	horizontalAlign: 'center',
	verticalAlign: 'middle',
	content: 'New Button',
	size: 16,
	letterSpacing: 0,
	textPadding: 0,
	font: '',
	typeface: 'regular',
	textEffect: { type: 'none' },
	normalColor: 'ffffffff',
	hoverColor: 'ffffffff',
	activeColor: 'ffffffff',
	hoverSound: '',
	clickSound: '',
	...overrides
});

describe('useUIButtonPage（uiButton inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiButton.target = null;
		uiButton.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUIButtonPage>
		};
	};

	it('sync 从 Inspector.uiButton.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		uiButton.target = makeButton();
		page.sync();
		expect(page.form.display).toBe('stretch');
		expect(page.form.flip).toBe('none');
		expect(page.form.border).toBe(1);
		expect(page.form.content).toBe('New Button');
		expect(page.form.size).toBe(16);
		expect(page.form.typeface).toBe('regular');
		expect(page.form.normalColor).toBe('ffffffff');
		wrapper.unmount();
	});

	it('sync 用默认值兜底 tint 数组与 textEffect', () => {
		const { wrapper, page } = mountPage();
		uiButton.target = makeButton({ textEffect: { type: 'none' } });
		page.sync();
		expect(page.form.normalTint).toEqual([0, 0, 0, 0]);
		expect(page.form.textEffect).toEqual({
			type: 'none',
			shadowOffsetX: 1,
			shadowOffsetY: 1,
			strokeWidth: 1,
			color: '000000ff'
		});
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		uiButton.target = makeButton();
		page.sync();
		uiButton.target = null;
		page.sync();
		expect(page.form.content).toBe('New Button');
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiButton 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiButton.target = makeButton();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiButton.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiButton.update.mockImplementation((target: ButtonData, key: string, value: unknown) => {
			(target as unknown as Record<string, unknown>)[key] = value;
		});
		uiButton.target = makeButton();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'uiButton-size';
		el.read = () => 24;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiButton.update).toHaveBeenCalledWith(uiButton.target, 'size', 24);
		expect(page.form.size).toBe(24);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		uiButton.target = makeButton();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiButton-content';
		el.read = () => 'Click Me';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiButton.update).toHaveBeenCalledWith(uiButton.target, 'content', 'Click Me');
		wrapper.unmount();
	});
});
