import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetKey from '@app/components/tools/SetKey.vue';
import { useSetKeyWindow } from '@app/composables/useSetKeyWindow';
import { Window } from '@app/tools/window-object.ts';

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

describe('useSetKeyWindow（按键窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const setKey = useSetKeyWindow();
		const callback = vi.fn();
		setKey.open('w', callback);
		expect(Window.open).toHaveBeenCalledWith('setKey');
		expect(setKey.form.key).toBe('w');
		expect(getFrame('setKey').getForm().key).toBe('w');
		expect(getControl('setKey-key').read()).toBe('w');
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const setKey = useSetKeyWindow();
		const callback = vi.fn();
		setKey.open('w', callback);
		getControl('setKey-key').write('a');
		setKey.confirm();
		expect(callback).toHaveBeenCalledWith('a');
		expect(Window.close).toHaveBeenCalledWith('setKey');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const setKey = useSetKeyWindow();
		const callback = vi.fn();
		setKey.open('w', callback);
		getFrame('setKey').dispatchEvent(new CustomEvent('closed'));
		setKey.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
