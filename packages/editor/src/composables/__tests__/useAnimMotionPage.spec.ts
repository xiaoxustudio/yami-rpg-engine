import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useAnimMotionPage } from '@app/composables/useAnimMotionPage';

interface MotionData {
	mode: string;
	skip: boolean;
	loop: boolean;
	loopStart: number;
}

const animMotion = vi.hoisted(() => ({
	target: null as MotionData | null,
	update: vi.fn()
}));

vi.mock('@app/inspector/inspector.ts', () => ({
	Inspector: {
		animMotion,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useAnimMotionPage();
	},
	render: () => null
});

const makeMotion = (overrides: Partial<MotionData> = {}): MotionData => ({
	mode: '1-dir',
	skip: false,
	loop: true,
	loopStart: 2,
	...overrides
});

describe('useAnimMotionPage（animMotion inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		animMotion.target = null;
		animMotion.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useAnimMotionPage>
		};
	};

	it('sync 从 Inspector.animMotion.target 填充 form', () => {
		const { wrapper, page } = mountPage();
		animMotion.target = makeMotion();
		page.sync();
		expect(page.form.mode).toBe('1-dir');
		expect(page.form.skip).toBe(false);
		expect(page.form.loop).toBe(true);
		expect(page.form.loopStart).toBe(2);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		animMotion.target = makeMotion();
		page.sync();
		animMotion.target = null;
		page.sync();
		expect(page.form.mode).toBe('1-dir');
		wrapper.unmount();
	});

	it('onParamInput 找不到 animMotion 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		animMotion.target = makeMotion();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animMotion.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		animMotion.update.mockImplementation((target: MotionData, key: string, value: unknown) => {
			(target as unknown as Record<string, unknown>)[key] = value;
		});
		animMotion.target = makeMotion();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'animMotion-loopStart';
		el.read = () => 5;
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animMotion.update).toHaveBeenCalledWith(animMotion.target, 'loopStart', 5);
		expect(page.form.loopStart).toBe(5);
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上（checkbox）', () => {
		const { wrapper, page } = mountPage();
		animMotion.target = makeMotion();
		const el = document.createElement('div') as HTMLElement & { read: () => boolean };
		el.id = 'animMotion-loop';
		el.read = () => false;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(animMotion.update).toHaveBeenCalledWith(animMotion.target, 'loop', false);
		wrapper.unmount();
	});
});
