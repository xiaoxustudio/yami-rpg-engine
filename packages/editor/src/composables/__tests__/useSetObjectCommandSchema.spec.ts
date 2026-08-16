import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetObject from '@app/components/commands/SetObject.vue';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
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

describe('useSetObjectCommandSchema（setObject 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operand-type 选项', async () => {
		const wrapper = mount(SetObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const type = document.getElementById('setObject-operand-type') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(type.dataItems).toHaveLength(12);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setObject');
		expect(Window.open).toHaveBeenCalledWith('setObject');
		expect(getControl('setObject-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('setObject-operand-type').read()).toBe('none');
		expect(getControl('setObject-operand-actor').read()).toEqual({ type: 'trigger' });
		expect(getControl('setObject-operand-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('setObject-operand-list-index').read()).toBe(0);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 operand 到控件 DOM', async () => {
		const wrapper = mount(SetObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setObject',
			params: {
				variable: { type: 'local', key: 'obj' },
				operand: { type: 'list', variable: { type: 'local', key: 'list1' }, index: 3 }
			}
		});
		expect(Window.open).toHaveBeenCalledWith('setObject');
		expect(getControl('setObject-variable').read()).toEqual({ type: 'local', key: 'obj' });
		expect(getControl('setObject-operand-type').read()).toBe('list');
		expect(getControl('setObject-operand-variable').read()).toEqual({
			type: 'local',
			key: 'list1'
		});
		expect(getControl('setObject-operand-list-index').read()).toBe(3);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setObject.save 保存', async () => {
		const wrapper = mount(SetObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setObject.customLoad!({
			variable: { type: 'local', key: 'obj' },
			operand: { type: 'none' }
		});
		getControl('setObject-operand-type').input('actor');
		getControl('setObject-operand-actor').input({ type: 'player' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setObject.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'obj' },
			operand: { type: 'actor', actor: { type: 'player' } }
		});
		wrapper.unmount();
	});

	it('save 路径：variable 为 none 校验失败不保存', async () => {
		const wrapper = mount(SetObject, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setObject.customLoad!({
			variable: { type: 'none', key: '' },
			operand: { type: 'none' }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setObject.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
