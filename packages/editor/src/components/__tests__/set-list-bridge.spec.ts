import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetList from '@app/components/commands/SetList.vue';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import '@/module/command/setList.ts';

interface SetListFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (): SetListFrame => document.getElementById('setList') as unknown as SetListFrame;

describe('setList 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
	});

	it('窗口根元素暴露 setForm/getForm 桥接，setForm 写入控件 DOM', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({
			operation: 'set-numbers',
			numbers: [1, 2, 3],
			index: 5,
			boolean: true,
			indexSkipCheck: false
		});
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.operation).toBe('set-numbers');
		expect(form.numbers).toEqual([1, 2, 3]);
		expect(form.index).toBe(5);
		expect(form.boolean).toBe(true);
		expect(form.indexSkipCheck).toBe(false);
		const numbers = document.getElementById('setList-numbers') as unknown as HTMLElement & {
			read(): unknown;
		};
		expect(numbers.read()).toEqual([1, 2, 3]);
		const skipCheck = document.getElementById(
			'setList-index-skip-check'
		) as unknown as HTMLElement & { read(): boolean };
		expect(skipCheck.read()).toBe(false);
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（CustomBox/TextAreaVar/CheckBox/SelectBox）', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const variable = document.getElementById('setList-variable') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		variable.input({ type: 'local', key: 'myList' });
		const separator = document.getElementById('setList-separator') as unknown as HTMLElement & {
			write(value: string): void;
		};
		separator.write(',');
		const skipCheck = document.getElementById(
			'setList-index-skip-check'
		) as unknown as HTMLElement & { input(value: boolean): void };
		skipCheck.input(true);
		const operand = document.getElementById('setList-operand') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		operand.input({ type: 'local', key: 'other' });
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.variable).toEqual({ type: 'local', key: 'myList' });
		expect(form.separator).toBe(',');
		expect(form.indexSkipCheck).toBe(true);
		expect(form.operand).toEqual({ type: 'local', key: 'other' });
		wrapper.unmount();
	});

	it('customLoad 经 setForm 填充表单，customSave 经 getForm 保存', async () => {
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
		const form = getFrame().getForm();
		expect(form.variable).toEqual({ type: 'local', key: 'foo' });
		expect(form.operation).toBe('set-boolean');
		expect(form.index).toBe(2);
		expect(form.boolean).toBe(true);
		expect(form.indexSkipCheck).toBe(false);
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.customSave!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-boolean',
			index: 2,
			constant: true,
			skipCheck: false
		});
		wrapper.unmount();
	});

	it('customLoad 列表类（set-numbers/set-strings）与 groupId 映射', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'nums' },
			operation: 'set-numbers',
			list: [4, 5]
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().numbers).toEqual([4, 5]);
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'strs' },
			operation: 'set-strings',
			list: ['a', 'b']
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().strings).toEqual(['a', 'b']);
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'attrs' },
			operation: 'get-attribute-keys',
			groupId: 'g1'
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().attributeGroupId).toBe('g1');
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'enums' },
			operation: 'get-enum-names',
			groupId: 'g2'
		});
		await wrapper.vm.$nextTick();
		expect(getFrame().getForm().enumGroupId).toBe('g2');
		wrapper.unmount();
	});

	it('customSave 校验失败时聚焦对应控件且不保存', async () => {
		const wrapper = mount(SetList, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setList.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set-variable',
			index: 0,
			operand: { type: 'local', key: '' },
			skipCheck: true
		});
		await wrapper.vm.$nextTick();
		Command.cases.setList.customSave!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
