import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import WebSocketConnect from '@app/components/commands/WebSocketConnect.vue';
import { useWebSocketConnectCommandSchema } from '@app/composables/commands/useWebSocketConnectCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

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

describe('useWebSocketConnectCommandSchema（webSocketConnect 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(WebSocketConnect, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWebSocketConnectCommandSchema();
		CommandSchema.insert(target, 'webSocketConnect');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('webSocketConnect');
		expect(form.url).toBe('');
		expect(form.id).toBe('');
		expect(form.protocols).toBe('');
		expect(form.onOpen).toBe('');
		expect(form.onMessage).toBe('');
		expect(form.onError).toBe('');
		expect(form.onClose).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(WebSocketConnect, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWebSocketConnectCommandSchema();
		CommandSchema.edit(target, {
			id: 'webSocketConnect',
			params: { url: 'wss://host/socket', id: 'ws1', protocols: 'graphql-ws' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('webSocketConnect');
		expect(form.url).toBe('wss://host/socket');
		expect(form.id).toBe('ws1');
		expect(form.protocols).toBe('graphql-ws');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.webSocketConnect.save 保存', async () => {
		const wrapper = mount(WebSocketConnect, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketConnect.customLoad!({
			url: 'wss://host/socket',
			id: 'ws1',
			protocols: '',
			onOpen: '',
			onMessage: '',
			onError: '',
			onClose: ''
		});
		getControl('webSocketConnect-protocols').write('graphql-ws');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketConnect.save!();
		expect(saved).toHaveBeenCalledWith({
			url: 'wss://host/socket',
			id: 'ws1',
			protocols: 'graphql-ws',
			onOpen: '',
			onMessage: '',
			onError: '',
			onClose: ''
		});
		wrapper.unmount();
	});

	it('save 路径：url 为空校验失败不保存', async () => {
		const wrapper = mount(WebSocketConnect, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketConnect.customLoad!({
			url: '',
			id: 'ws1',
			protocols: '',
			onOpen: '',
			onMessage: '',
			onError: '',
			onClose: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketConnect.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：id 为空校验失败不保存', async () => {
		const wrapper = mount(WebSocketConnect, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketConnect.customLoad!({
			url: 'wss://host/socket',
			id: '',
			protocols: '',
			onOpen: '',
			onMessage: '',
			onError: '',
			onClose: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketConnect.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染截断 URL + id 文本', () => {
		const contents = Command.cases.webSocketConnect.parse!({
			url: 'wss://example.com/very-long-path-123456',
			id: 'ws1',
			protocols: '',
			onOpen: '',
			onMessage: '',
			onError: '',
			onClose: ''
		});
		expect(contents).toContainEqual({ text: 'wss://example.com/ve...' });
		expect(contents).toContainEqual({ text: 'ws1' });
	});
});
