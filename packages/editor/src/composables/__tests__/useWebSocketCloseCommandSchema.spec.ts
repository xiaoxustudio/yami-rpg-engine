import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import WebSocketClose from '@app/components/commands/WebSocketClose.vue';
import { useWebSocketCloseCommandSchema } from '@app/composables/commands/useWebSocketCloseCommandSchema';
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

describe('useWebSocketCloseCommandSchema（webSocketClose 命令表单 composable：insert/edit/save/validate/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(WebSocketClose, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWebSocketCloseCommandSchema();
		CommandSchema.insert(target, 'webSocketClose');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('webSocketClose');
		expect(form.id).toBe('');
		expect(form.code).toBe('');
		expect(form.reason).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(WebSocketClose, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useWebSocketCloseCommandSchema();
		CommandSchema.edit(target, {
			id: 'webSocketClose',
			params: { id: 'ws1', code: 1000, reason: 'bye' }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('webSocketClose');
		expect(form.id).toBe('ws1');
		expect(form.code).toBe(1000);
		expect(form.reason).toBe('bye');
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.webSocketClose.save 保存', async () => {
		const wrapper = mount(WebSocketClose, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketClose.customLoad!({
			id: 'ws1',
			code: 1000,
			reason: 'bye'
		});
		getControl('webSocketClose-code').write(4000);
		getControl('webSocketClose-reason').write('closing');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketClose.save!();
		expect(saved).toHaveBeenCalledWith({ id: 'ws1', code: 4000, reason: 'closing' });
		wrapper.unmount();
	});

	it('save 路径：id 为空校验失败不保存', async () => {
		const wrapper = mount(WebSocketClose, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.webSocketClose.customLoad!({ id: '', code: '', reason: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.webSocketClose.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 id/code/reason 文本', () => {
		const contents = Command.cases.webSocketClose.parse!({
			id: 'ws1',
			code: 1000,
			reason: 'bye'
		});
		expect(contents).toContainEqual({ text: 'ws1' });
		expect(contents).toContainEqual({ text: '1000' });
		expect(contents).toContainEqual({ text: 'bye' });
	});
});
