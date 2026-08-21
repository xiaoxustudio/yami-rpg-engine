import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ChangeActorSkill from '@app/components/commands/ChangeActorSkill.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

describe('useChangeActorSkillCommandSchema（changeActorSkill 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('changeActorSkill-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(operation.dataItems).toHaveLength(4);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'changeActorSkill');
		expect(Window.open).toHaveBeenCalledWith('changeActorSkill');
		expect(getControl('changeActorSkill-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('changeActorSkill-operation').read()).toBe('add');
		expect(getControl('changeActorSkill-skillId').read()).toBe('');
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'changeActorSkill',
			params: {
				actor: { type: 'player' },
				operation: 'remove-instance',
				skill: { type: 'skill' }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('changeActorSkill');
		expect(getControl('changeActorSkill-operation').read()).toBe('remove-instance');
		expect(getControl('changeActorSkill-skill').read()).toEqual({ type: 'skill' });
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.changeActorSkill.save 保存', async () => {
		const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorSkill.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			skillId: ''
		});
		getControl('changeActorSkill-operation').input('remove');
		getControl('changeActorSkill-skillId').write('skill1');
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorSkill.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			operation: 'remove',
			skillId: 'skill1'
		});
		wrapper.unmount();
	});

	it('save 路径：add/remove 空 skillId 校验失败不保存', async () => {
		const wrapper = mount(ChangeActorSkill, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.changeActorSkill.customLoad!({
			actor: { type: 'trigger' },
			operation: 'add',
			skillId: ''
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.changeActorSkill.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
