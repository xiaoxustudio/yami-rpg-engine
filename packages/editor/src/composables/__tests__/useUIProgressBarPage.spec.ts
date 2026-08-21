import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useUIProgressBarPage } from '@app/composables/useUIProgressBarPage';

interface ProgressBarData {
	image: string;
	display: string;
	clip: number[];
	type: string;
	centerX: number;
	centerY: number;
	startAngle: number;
	centralAngle: number;
	step: number;
	progress: number;
	blend: string;
	colorMode: string;
	color: number[];
}

const uiProgressBar = vi.hoisted(() => ({
	target: null as ProgressBarData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		uiProgressBar,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useUIProgressBarPage();
	},
	render: () => null
});

const makeProgressBar = (overrides: Partial<ProgressBarData> = {}): ProgressBarData => ({
	image: '',
	display: 'stretch',
	clip: [0, 0, 32, 32],
	type: 'horizontal',
	centerX: 0.5,
	centerY: 0.5,
	startAngle: -90,
	centralAngle: 360,
	step: 0,
	progress: 1,
	blend: 'normal',
	colorMode: 'texture',
	color: [0, 0, 0, 0],
	...overrides
});

describe('useUIProgressBarPage（uiProgressBar inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		uiProgressBar.target = null;
		uiProgressBar.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useUIProgressBarPage>
		};
	};

	it('sync 从 Inspector.uiProgressBar.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		uiProgressBar.target = makeProgressBar();
		page.sync();
		expect(page.form.image).toBe('');
		expect(page.form.display).toBe('stretch');
		expect(page.form.type).toBe('horizontal');
		expect(page.form.centerX).toBe(0.5);
		expect(page.form.startAngle).toBe(-90);
		expect(page.form.centralAngle).toBe(360);
		expect(page.form.progress).toBe(1);
		expect(page.form.blend).toBe('normal');
		expect(page.form.colorMode).toBe('texture');
		wrapper.unmount();
	});

	it('sync 用默认值兜底 color 数组', () => {
		const { wrapper, page } = mountPage();
		uiProgressBar.target = makeProgressBar({ color: [10, 20, 30, 255] });
		page.sync();
		expect(page.form.color).toEqual([10, 20, 30, 255]);
		uiProgressBar.target = makeProgressBar({ color: undefined as unknown as number[] });
		page.sync();
		expect(page.form.color).toEqual([0, 0, 0, 0]);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		uiProgressBar.target = makeProgressBar();
		page.sync();
		uiProgressBar.target = null;
		page.sync();
		expect(page.form.display).toBe('stretch');
		wrapper.unmount();
	});

	it('onParamInput 找不到 uiProgressBar 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		uiProgressBar.target = makeProgressBar();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiProgressBar.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		uiProgressBar.update.mockImplementation(
			(target: ProgressBarData, key: string, value: unknown) => {
				if (key === 'progress') {
					target.progress = value as number;
				}
			}
		);
		uiProgressBar.target = makeProgressBar();
		page.form.progress = 0.5;
		const el = document.createElement('div') as HTMLElement;
		el.id = 'uiProgressBar-progress';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiProgressBar.update).toHaveBeenCalledWith(uiProgressBar.target, 'progress', 0.5);
		expect(page.form.progress).toBe(0.5);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上（color 字段）', () => {
		const { wrapper, page } = mountPage();
		uiProgressBar.target = makeProgressBar();
		page.form.color[1] = 128;
		const el = document.createElement('div') as HTMLElement;
		el.id = 'uiProgressBar-color-1';
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(uiProgressBar.update).toHaveBeenCalledWith(uiProgressBar.target, 'color-1', 128);
		wrapper.unmount();
	});
});
