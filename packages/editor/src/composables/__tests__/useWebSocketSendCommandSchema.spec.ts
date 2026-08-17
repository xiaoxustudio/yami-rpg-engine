import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import WebSocketSend from '@app/components/commands/WebSocketSend.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useWebSocketSendCommandSchema（webSocketSend 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(WebSocketSend, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'webSocketSend');
		expect(Window.open).toHaveBeenCalledWith('webSocketSend');
		expect(getControl('webSocketSend-id').read()).toBe('');
		expect(getControl('webSocketSend-data').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(WebSocketSend, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, { id: 'webSocketSend', params: { id: 'ws1', data: 'hello' } });
		expect(Window.open).toHaveBeenCalledWith('webSocketSend');
		expect(getControl('webSocketSend-id').read()).toBe('ws1');
		expect(getControl('webSocketSend-data').read()).toBe('hello');
		wrapper.unmount();
	});

	it('save 路径：id 为空时校验失败不保存', async () => {
		const wrapper = mount(WebSocketSend, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketSend.customLoad!({ id: '', data: 'hello' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketSend.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：data 为空时校验失败不保存', async () => {
		const wrapper = mount(WebSocketSend, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketSend.customLoad!({ id: 'ws1', data: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketSend.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：id/data 非空时经 Command.cases.webSocketSend.save 保存', async () => {
		const wrapper = mount(WebSocketSend, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketSend.customLoad!({ id: 'ws1', data: 'hello' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketSend.save!();
		expect(saved).toHaveBeenCalledWith({ id: 'ws1', data: 'hello' });
		wrapper.unmount();
	});
});
