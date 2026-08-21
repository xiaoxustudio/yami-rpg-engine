import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';

interface TextBoxData {
	type: string;
	align: string;
	text: string;
	maxLength: number;
	number: number;
	min: string;
	max: string;
	decimals: number;
	padding: number;
	size: number;
	font: string;
	color: string;
	selectionColor: string;
	selectionBgColor: string;
}

const uiTextBox = vi.hoisted(() => ({
	target: null as TextBoxData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiTextBox,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUITextBoxPage();
	},
	render: () => null
});

const makeTextBox = (overrides: Partial<TextBoxData> = {}): TextBoxData => ({
	type: 'text',
	align: 'left',
	text: 'Content',
	maxLength: 16,
	number: 0,
	min: '0',
	max: '0',
	decimals: 0,
	padding: 4,
	size: 16,
	font: '',
	color: 'ffffffff',
	selectionColor: 'ffffffff',
	selectionBgColor: '0090ccff',
	...overrides
});

describe('useUITextBoxPage（uiTextBox inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiTextBox.target = null;
		uiTextBox.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUITextBoxPage>
		};
	};

	it('sync 从 Inspector.uiTextBox.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		uiTextBox.target = makeTextBox();
		page.sync();
		expect(page.form.type).toBe('text');
		expect(page.form.align).toBe('left');
		expect(page.form.text).toBe('Content');
		expect(page.form.maxLength).toBe(16);
		expect(page.form.decimals).toBe(0);
		expect(page.form.padding).toBe(4);
		expect(page.form.size).toBe(16);
		expect(page.form.selectionBgColor).toBe('0090ccff');
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		uiTextBox.target = makeTextBox();
		page.sync();
		uiTextBox.target = null;
		page.sync();
		expect(page.form.text).toBe('Content');
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiTextBox 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiTextBox.target = makeTextBox();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiTextBox.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiTextBox.update.mockImplementation((target: TextBoxData, key: string, value: unknown) => {
			(target as unknown as Record<string, unknown>)[key] = value;
		});
		uiTextBox.target = makeTextBox();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'uiTextBox-maxLength';
		el.read = () => 32;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiTextBox.update).toHaveBeenCalledWith(uiTextBox.target, 'maxLength', 32);
		expect(page.form.maxLength).toBe(32);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		uiTextBox.target = makeTextBox();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiTextBox-text';
		el.read = () => 'Hello';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiTextBox.update).toHaveBeenCalledWith(uiTextBox.target, 'text', 'Hello');
		wrapper.unmount();
	});
});
