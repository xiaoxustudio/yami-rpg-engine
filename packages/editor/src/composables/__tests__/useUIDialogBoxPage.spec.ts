import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUIDialogBoxPage } from '@app/composables/useUIDialogBoxPage';

interface DialogBoxData {
	content: string;
	interval: number;
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
	blend: string;
}

const uiDialogBox = vi.hoisted(() => ({
	target: null as DialogBoxData | null,
	update: vi.fn()
}));

vi.mock('@app/legacy/inspector/inspector.ts', () => ({
	Inspector: {
		uiDialogBox,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUIDialogBoxPage();
	},
	render: () => null
});

const makeDialogBox = (overrides: Partial<DialogBoxData> = {}): DialogBoxData => ({
	content: 'Content',
	interval: 16.6666,
	size: 16,
	lineSpacing: 0,
	letterSpacing: 0,
	color: 'ffffffff',
	font: '',
	typeface: 'regular',
	effect: { type: 'none' },
	blend: 'normal',
	...overrides
});

describe('useUIDialogBoxPage（uiDialogBox inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiDialogBox.target = null;
		uiDialogBox.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUIDialogBoxPage>
		};
	};

	it('sync 从 Inspector.uiDialogBox.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		uiDialogBox.target = makeDialogBox();
		page.sync();
		expect(page.form.content).toBe('Content');
		expect(page.form.interval).toBe(16.6666);
		expect(page.form.size).toBe(16);
		expect(page.form.typeface).toBe('regular');
		expect(page.form.blend).toBe('normal');
		wrapper.unmount();
	});

	it('sync 用默认值兜底 effect', () => {
		const { wrapper, page } = mountPage();
		uiDialogBox.target = makeDialogBox({ effect: { type: 'none' } });
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
		uiDialogBox.target = makeDialogBox();
		page.sync();
		uiDialogBox.target = null;
		page.sync();
		expect(page.form.content).toBe('Content');
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiDialogBox 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiDialogBox.target = makeDialogBox();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiDialogBox.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiDialogBox.update.mockImplementation(
			(target: DialogBoxData, key: string, value: unknown) => {
				(target as unknown as Record<string, unknown>)[key] = value;
			}
		);
		uiDialogBox.target = makeDialogBox();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'uiDialogBox-size';
		el.read = () => 24;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiDialogBox.update).toHaveBeenCalledWith(uiDialogBox.target, 'size', 24);
		expect(page.form.size).toBe(24);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上（effect 字段）', () => {
		const { wrapper, page } = mountPage();
		uiDialogBox.target = makeDialogBox();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'uiDialogBox-effect-color';
		el.read = () => 'ff0000ff';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiDialogBox.update).toHaveBeenCalledWith(
			uiDialogBox.target,
			'effect-color',
			'ff0000ff'
		);
		wrapper.unmount();
	});
});
