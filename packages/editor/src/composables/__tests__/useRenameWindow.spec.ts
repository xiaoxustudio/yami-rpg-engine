import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Rename from '@app/components/tools/Rename.vue';
import { useRenameWindow } from '@app/composables/useRenameWindow';
import { Window } from '@app/legacy/tools/window-object.ts';

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

describe('useRenameWindow（重命名窗口 composable：form 状态 + open/confirm/closed）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('open 打开窗口、填充 form 与控件 DOM 并写入回调', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rename = useRenameWindow();
		const callback = vi.fn();
		rename.open('hello', callback);
		expect(Window.open).toHaveBeenCalledWith('rename');
		expect(rename.form.name).toBe('hello');
		expect(getFrame('rename').getForm().name).toBe('hello');
		expect(getControl('rename-name').read()).toBe('hello');
		wrapper.unmount();
	});

	it('confirm 经 getForm 读回控件值回调并关闭窗口', async () => {
		const wrapper = mount(Rename, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const rename = useRenameWindow();
		const callback = vi.fn();
		rename.open('hello', callback);
		getControl('rename-name').write('world');
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
