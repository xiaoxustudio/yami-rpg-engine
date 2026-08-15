import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUITextPage } from '@app/composables/useUITextPage';

interface TextData {
	direction: string;
	horizontalAlign: string;
	verticalAlign: string;
	content: string;
	size: number;
	lineSpacing: number;
	letterSpacing: number;
	color: string;
	font: string;
	typeface: string;
	effect: {
		type: string;
		shadowOffsetX?: number;
		shadowOffsetY?: number;
		strokeWidth?: number;
		color?: string;
	};
	overflow: string;
	blend: string;
}

const uiText = vi.hoisted(() => ({
	target: null as TextData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		uiText,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUITextPage();
	},
	render: () => null
});

const makeText = (overrides: Partial<TextData> = {}): TextData => ({
	direction: 'horizontal-tb',
	horizontalAlign: 'left',
	verticalAlign: 'middle',
	content: 'New Text',
	size: 16,
	lineSpacing: 0,
	letterSpacing: 0,
	color: 'ffffffff',
	font: '',
	typeface: 'regular',
	effect: { type: 'none' },
	overflow: 'visible',
	blend: 'normal',
	...overrides
});

describe('useUITextPage（uiText inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiText.target = null;
		uiText.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUITextPage>
		};
	};

	it('sync 从 Inspector.uiText.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		uiText.target = makeText();
		page.sync();
		expect(page.form.direction).toBe('horizontal-tb');
		expect(page.form.horizontalAlign).toBe('left');
		expect(page.form.content).toBe('New Text');
		expect(page.form.size).toBe(16);
		expect(page.form.typeface).toBe('regular');
		expect(page.form.overflow).toBe('visible');
		expect(page.form.blend).toBe('normal');
		wrapper.unmount();
	});

	it('sync 用默认值兜底 effect', () => {
		const { wrapper, page } = mountPage();
		uiText.target = makeText({ effect: { type: 'none' } });
		page.sync();
		expect(page.form.effect).toEqual({
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
		uiText.target = makeText();
		page.sync();
		uiText.target = null;
		page.sync();
		expect(page.form.content).toBe('New Text');
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiText 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiText.target = makeText();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiText.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiText.update.mockImplementation((target: TextData, key: string, value: unknown) => {
			(target as unknown as Record<string, unknown>)[key] = value;
		});
		uiText.target = makeText();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'uiText-size';
		el.read = () => 24;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiText.update).toHaveBeenCalledWith(uiText.target, 'size', 24);
		expect(page.form.size).toBe(24);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上（effect 字段）', () => {
		const { wrapper, page } = mountPage();
		uiText.target = makeText();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiText-effect-color';
		el.read = () => 'ff0000ff';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiText.update).toHaveBeenCalledWith(uiText.target, 'effect-color', 'ff0000ff');
		wrapper.unmount();
	});
});
