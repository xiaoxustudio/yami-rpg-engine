import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import DeleteVariable from '@app/components/commands/DeleteVariable.vue';
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

describe('useDeleteVariableCommandSchema（deleteVariable 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(DeleteVariable, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'deleteVariable');
		expect(Window.open).toHaveBeenCalledWith('deleteVariable');
		expect(getControl('deleteVariable-variable').read()).toEqual({ type: 'local', key: '' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(DeleteVariable, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'deleteVariable',
			params: { variable: { type: 'local', key: 'foo' } }
		});
		expect(Window.open).toHaveBeenCalledWith('deleteVariable');
		expect(getControl('deleteVariable-variable').read()).toEqual({ type: 'local', key: 'foo' });
		wrapper.unmount();
	});

	it('save 路径：variable 为 none 时校验失败不保存', async () => {
		const wrapper = mount(DeleteVariable, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.deleteVariable.customLoad!({ variable: { type: 'local', key: '' } });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteVariable.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：variable 非 none 时经 Command.cases.deleteVariable.save 保存', async () => {
		const wrapper = mount(DeleteVariable, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.deleteVariable.customLoad!({ variable: { type: 'local', key: 'foo' } });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.deleteVariable.save!();
		expect(saved).toHaveBeenCalledWith({ variable: { type: 'local', key: 'foo' } });
		wrapper.unmount();
	});
});
