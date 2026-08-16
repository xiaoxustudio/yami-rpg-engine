import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import CallEvent from '@app/components/commands/CallEvent.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { Data } from '@/data/data-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { EventEditor } from '@/command/event-editor.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';

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

describe('useCallEventCommandSchema（callEvent 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getMergedItems = vi.fn(() => [{ name: 'On Start', value: 'onStart' }]) as never;
		EventEditor.types = { all: [{ name: 'On Start', value: 'onStart' }] };
	});

	it('onMounted loadItems 填充 type 选项', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('callEvent-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(type.dataItems).toHaveLength(10);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'callEvent');
		expect(Window.open).toHaveBeenCalledWith('callEvent');
		expect(getControl('callEvent-type').read()).toBe('global');
		expect(getControl('callEvent-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('callEvent-eventId').read()).toBe('');
		expect(getControl('callEvent-eventType').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径 scene：load eventType 到控件 DOM，save 保存 scene 参数', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.callEvent.customLoad!({ type: 'scene', eventType: 'onStart' });
		expect(getControl('callEvent-type').read()).toBe('scene');
		expect(getControl('callEvent-eventType').read()).toBe('onStart');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.callEvent.save!();
		expect(saved).toHaveBeenCalledWith({ type: 'scene', eventType: 'onStart' });
		wrapper.unmount();
	});

	it('edit 路径 global：eventId 写入创建参数控件并回填 eventArgs，save 保存参数与返回值', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Data.events = {
			evt1: {
				parameters: [
					{ type: 'string', key: 'msg', note: 'Message' },
					{ type: 'object', key: 'obj' }
				],
				returnType: 'string',
				description: ''
			}
		} as never;
		Command.cases.callEvent.customLoad!({
			type: 'global',
			eventId: 'evt1',
			eventArgs: [
				{ type: 'string', key: 'msg', value: 'hello' },
				{ type: 'object', key: 'obj', value: { type: 'local', key: 'myObj' } }
			],
			eventResult: { type: 'string', variable: { type: 'local', key: 'result' } }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.callEvent.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'global',
			eventId: 'evt1',
			eventArgs: [
				{ type: 'string', key: 'msg', value: 'hello' },
				{ type: 'object', key: 'obj', value: { type: 'local', key: 'myObj' } }
			],
			eventResult: { type: 'string', variable: { type: 'local', key: 'result' } }
		});
		wrapper.unmount();
	});

	it('save 路径：global eventId 为空校验失败不保存', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		document.getElementById('callEvent')?.dispatchEvent(new Event('closed'));
		Command.cases.callEvent.customLoad!({ type: 'global', eventId: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.callEvent.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：inherited 类型直接保存', async () => {
		const wrapper = mount(CallEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.callEvent.customLoad!({ type: 'inherited' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.callEvent.save!();
		expect(saved).toHaveBeenCalledWith({ type: 'inherited' });
		wrapper.unmount();
	});
});
