import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetKey from '@app/components/tools/SetKey.vue';
import { useSetKeyWindow } from '@app/composables/useSetKeyWindow';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

const getFrame = (id: string): HTMLElement => document.getElementById(id) as HTMLElement;

const getInputValue = (id: string): string => {
	const el = document.getElementById(id) as HTMLElement & { input?: HTMLInputElement };
	return el?.input?.value ?? '';
};

describe('useSetKeyWindow（按键窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充 form 并通过 v-model 填充控件', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const setKey = useSetKeyWindow();
		const callback = vi.fn();
		setKey.open('w', callback);
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setKey');
		expect(setKey.form.key).toBe('w');
		expect(getInputValue('setKey-key')).toBe('w');
		wrapper.unmount();
	});

	it('confirm 经 form 读回控件值回调并关闭窗口', async () => {
		const wrapper = mount(SetKey, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const setKey = useSetKeyWindow();
		const callback = vi.fn();
		setKey.open('w', callback);
		await wrapper.vm.$nextTick();
		await wrapper.find('input').setValue('a');
		await wrapper.vm.$nextTick();
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
