import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorState from '@app/components/commands/ChangeActorState.vue';
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

describe('useChangeActorStateCommandSchema（changeActorState 命令表单 composable：insert/edit/save 分支/校验路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(ChangeActorState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('changeActorState-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(3);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'changeActorState');
		expect(Window.open).toHaveBeenCalledWith('changeActorState');
		expect(getControl('changeActorState-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorState-operation').read()).toBe('add');
		expect(getControl('changeActorState-stateId').read()).toBe('');
		expect(getControl('changeActorState-state').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'changeActorState',
			params: {
				actor: { type: 'player' },
				operation: 'remove-instance',
				state: { type: 'state' }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorState');
		expect(getControl('changeActorState-operation').read()).toBe('remove-instance');
		expect(getControl('changeActorState-state').read()).toEqual({ type: 'state' });
		wrapper.unmount();
	});

	it('save 路径：add/remove 分支保存 stateId', async () => {
		const wrapper = mount(ChangeActorState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorState.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			stateId: ''
		});
		getControl('changeActorState-operation').input('remove');
		getControl('changeActorState-stateId').write('state1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorState.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'remove',
			stateId: 'state1'
		});
		wrapper.unmount();
	});

	it('save 路径：remove-instance 分支保存 state', async () => {
		const wrapper = mount(ChangeActorState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorState.customLoad!({
			actor: { type: 'trigger' },
			operation: 'remove-instance',
			state: { type: 'trigger' }
		});
		getControl('changeActorState-state').write({ type: 'state' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorState.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'remove-instance',
			state: { type: 'state' }
		});
		wrapper.unmount();
	});

	it('save 路径：add/remove 空 stateId 校验失败不保存', async () => {
		const wrapper = mount(ChangeActorState, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorState.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			stateId: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorState.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
