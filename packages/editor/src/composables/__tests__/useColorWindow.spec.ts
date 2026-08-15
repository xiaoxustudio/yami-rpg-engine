import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Color from '@app/components/tools/Color.vue';
import { useColorWindow } from '@app/composables/useColorWindow';
import { Window } from '@/tools/window-object.ts';
import { radioProxyMap } from '@/components/radio-proxy';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface FormFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

interface ControlEl extends HTMLElement {
	write(value: unknown): void;
	read(): unknown;
}

const getFrame = (id: string): FormFrame => document.getElementById(id) as unknown as FormFrame;

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

describe('useColorWindow（颜色窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		for (const key of Object.keys(radioProxyMap)) {
			delete radioProxyMap[key];
		}
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充简化 hex 与 rgba 到 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, false, callback);
		expect(Window.open).toHaveBeenCalledWith('color');
		expect(color.form.hex).toBe('ff0000');
		expect(color.form.r).toBe(255);
		expect(color.form.g).toBe(0);
		expect(color.form.b).toBe(0);
		expect(color.form.a).toBe(255);
		expect(getFrame('color').getForm().hex).toBe('ff0000');
		expect(getControl('color-hex').read()).toBe('ff0000');
		expect(getControl('color-r').read()).toBe(255);
		expect(getControl('color-a').read()).toBe(255);
		wrapper.unmount();
	});

	it('open 传入 index 时写入索引单选并读回', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', 3, true, callback);
		expect(getControl('color-index').read()).toBe(3);
		expect(getFrame('color').getForm().index).toBe(3);
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件以 rgba 回调 hex 并关闭窗口', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, false, callback);
		getControl('color-r').write(10);
		color.confirm();
		expect(callback).toHaveBeenCalledWith('0a0000ff');
		expect(Window.close).toHaveBeenCalledWith('color');
		wrapper.unmount();
	});

	it('confirm 在 indexEnabled 且选中索引时回调索引值', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, true, callback);
		getControl('color-index').write(5);
		color.confirm();
		expect(callback).toHaveBeenCalledWith(5);
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(Color, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const color = useColorWindow();
		const callback = vi.fn();
		color.open('ff0000ff', null, false, callback);
		getFrame('color').dispatchEvent(new CustomEvent('closed'));
		color.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
