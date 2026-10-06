import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Rename from '@app/components/tools/Rename.vue';
import { useRenameWindow } from '@app/composables/useRenameWindow';
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

describe('useRenameWindow（重命名窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充 form 并通过 v-model 填充控件', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rename = useRenameWindow();
		const callback = vi.fn();
		rename.open('hello', callback);
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('rename');
		expect(rename.form.name).toBe('hello');
		expect(getInputValue('rename-name')).toBe('hello');
		wrapper.unmount();
	});

	it('confirm 经 form 读回控件值回调并关闭窗口', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rename = useRenameWindow();
		const callback = vi.fn();
		rename.open('hello', callback);
		await wrapper.vm.$nextTick();
		await wrapper.find('input').setValue('world');
		await wrapper.vm.$nextTick();
		rename.confirm();
		expect(callback).toHaveBeenCalledWith('world');
		expect(Window.close).toHaveBeenCalledWith('rename');
		wrapper.unmount();
	});

	it('closed 事件清除回调，后续 confirm 不再触发', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rename = useRenameWindow();
		const callback = vi.fn();
		rename.open('hello', callback);
		getFrame('rename').dispatchEvent(new CustomEvent('closed'));
		rename.confirm();
		expect(callback).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('再次 open 替换回调后 confirm 触发新回调', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rename = useRenameWindow();
		const first = vi.fn();
		const second = vi.fn();
		rename.open('first', first);
		rename.open('second', second);
		rename.confirm();
		expect(first).not.toHaveBeenCalled();
		expect(second).toHaveBeenCalledWith('second');
		wrapper.unmount();
	});
});
