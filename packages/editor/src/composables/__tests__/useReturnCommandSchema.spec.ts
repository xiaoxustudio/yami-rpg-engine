import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import Return from '@app/components/commands/Return.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/legacy/module/command/schema.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
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

describe('useReturnCommandSchema（return 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Command.returnType = 'number';
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(Return, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'return');
		expect(Window.open).toHaveBeenCalledWith('return');
		expect(getControl('return-type').read()).toBe('number');
		expect(getControl('return-number').read()).toBe(0);
		expect(getControl('return-actor').read()).toEqual({ type: 'trigger' });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 按 type 解构 value 到对应控件 DOM', async () => {
		const wrapper = mount(Return, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'return',
			params: { type: 'actor', value: { type: 'player' } }
		});
		expect(Window.open).toHaveBeenCalledWith('return');
		expect(getControl('return-type').read()).toBe('actor');
		expect(getControl('return-actor').read()).toEqual({ type: 'player' });
		expect(getControl('return-number').read()).toBe(0);
		wrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.return.save 保存', async () => {
		const wrapper = mount(Return, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.return.customLoad!({
			type: 'number',
			value: 0
		});
		getControl('return-number').write(5);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.return.save!();
		expect(saved).toHaveBeenCalledWith({ type: 'number', value: 5 });
		wrapper.unmount();
	});

	it('save 路径：object 为 none 校验失败不保存', async () => {
		const wrapper = mount(Return, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.return.customLoad!({
			type: 'object',
			value: null
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.return.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
