import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetList from '@app/components/commands/SetList.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';
import { dataItemsOf } from '@app/__tests__/element-data-read';

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

describe('useSetListCommandSchema（setList 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('onMounted loadItems 填充 operation 选项', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const operation = document.getElementById('setList-operation') as unknown as {
			dataItems?: Array<{ name: string; value: string }>;
		};
		expect(dataItemsOf(operation)).toHaveLength(15);
		wrapper.unmount();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'setList');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setList');
		expect(getControl('setList-variable').read()).toEqual({ type: 'local', key: '' });
		expect(getControl('setList-operation').read()).toBe('set-empty');
		expect(getControl('setList-numbers').read()).toEqual([]);
		expect(getControl('setList-strings').read()).toEqual([]);
		expect(getControl('setList-index-skip-check').read()).toBe(true);
		wrapper.unmount();
	});

	it('edit 路径：customLoad 双列表与 groupId 映射到表单', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'setList',
			params: {
				variable: { type: 'local', key: 'nums' },
				operation: 'set-numbers',
				list: [4, 5]
			}
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setList');
		expect(getControl('setList-numbers').read()).toEqual([4, 5]);
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'strs' },
			operation: 'set-strings',
			list: ['a', 'b']
		});
		await wrapper.vm.$nextTick();
		expect(getControl('setList-strings').read()).toEqual(['a', 'b']);
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'attrs' },
			operation: 'get-attribute-keys',
			groupId: 'g1'
		});
		await wrapper.vm.$nextTick();
		expect(getControl('setList-attribute-groupId').read()).toBe('g1');
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'enums' },
			operation: 'get-enum-names',
			groupId: 'g2'
		});
		await wrapper.vm.$nextTick();
		expect(getControl('setList-enum-groupId').read()).toBe('g2');
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'flag' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: false
		});
		await wrapper.vm.$nextTick();
		expect(getControl('setList-index').read()).toBe(2);
		expect(getControl('setList-boolean').read()).toBe(true);
		expect(getControl('setList-index-skip-check').read()).toBe(false);
		wrapper.unmount();
	});

	it('save 路径：set-boolean 分支经 customSave 保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: false
		});
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: false
		});
		wrapper.unmount();
	});

	it('save 路径：set-numbers/split-string 分支保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'nums' },
			operation: 'set-numbers',
			list: [1, 2, 3]
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.save!();
		expect(saved).toHaveBeenLastCalledWith({
			variable: { type: 'local', key: 'nums' },
			operation: 'set-numbers',
			list: [1, 2, 3]
		});
		getControl('setList-operand').input({ type: 'local', key: 'other' });
		getControl('setList-separator').write(',');
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'strs' },
			operation: 'split-string',
			operand: { type: 'local', key: 'src' },
			separator: ','
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.save!();
		expect(saved).toHaveBeenLastCalledWith({
			variable: { type: 'local', key: 'strs' },
			operation: 'split-string',
			operand: { type: 'local', key: 'src' },
			separator: ','
		});
		wrapper.unmount();
	});

	it('save 校验失败：variable 为 none / 列表为空 / operand 为空 / groupId 为空均不保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: '' },
			operation: 'set-empty'
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'nums' },
			operation: 'set-numbers',
			list: []
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-variable',
			index: 0,
			operand: { type: 'local', key: '' },
			skipCheck: true
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'attrs' },
			operation: 'get-attribute-keys',
			groupId: ''
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
