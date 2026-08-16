import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetEvent from '@app/components/commands/SetEvent.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
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

describe('useSetEventCommandSchema（setEvent 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口后 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setEvent');
		expect(Window.open).toHaveBeenCalledWith('setEvent');
		expect(getControl('setEvent-operation').read()).toBe('stop-propagation');
		expect(getControl('setEvent-variable').read()).toEqual({ type: 'global', key: '' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(SetEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setEvent',
			params: { operation: 'pause', variable: { type: 'global', key: 'foo' } }
		});
		expect(Window.open).toHaveBeenCalledWith('setEvent');
		expect(getControl('setEvent-operation').read()).toBe('pause');
		expect(getControl('setEvent-variable').read()).toEqual({ type: 'global', key: 'foo' });
		wrapper.unmount();
	});

	it('edit 路径：旧版 operation 值归一化为 stop-propagation', async () => {
		const wrapper = mount(SetEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setEvent',
			params: { operation: 'prevent-scene-input-events' }
		});
		expect(getControl('setEvent-operation').read()).toBe('stop-propagation');
		wrapper.unmount();
	});

	it('save 路径：pause 且 variable 为 none 时校验失败不保存', async () => {
		const wrapper = mount(SetEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setEvent.customLoad!({
			operation: 'pause',
			variable: { type: 'local', key: '' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setEvent.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：enable 且 eventId 为空时校验失败不保存', async () => {
		const wrapper = mount(SetEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setEvent.customLoad!({ operation: 'enable', eventId: '' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setEvent.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：goto-choice-branch 经 Command.cases.setEvent.save 保存', async () => {
		const wrapper = mount(SetEvent, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setEvent.customLoad!({ operation: 'goto-choice-branch', choiceIndex: 3 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setEvent.save!();
		expect(saved).toHaveBeenCalledWith({ operation: 'goto-choice-branch', choiceIndex: 3 });
		wrapper.unmount();
	});
});
