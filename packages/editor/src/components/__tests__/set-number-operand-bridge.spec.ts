import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetNumberOperandWindow from '@app/components/tools/SetNumberOperand.vue';
import { NumberOperand, type NumberOperandData } from '@/command/set-value-operand-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Data } from '@/data/data-object.ts';
import '@/command/set-value-operand-window.ts';

interface SetNumberOperandFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (): SetNumberOperandFrame =>
	document.getElementById('setNumber-operand') as unknown as SetNumberOperandFrame;

describe('setNumber-operand 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => []) as never;
		Enum.getDefStringId = vi.fn(() => 'id0') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
		NumberOperand.target = { start: 0, save: vi.fn() } as never;
	});

	it('窗口根元素暴露 setForm/getForm 桥接，setForm 写入控件 DOM', async () => {
		const wrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({
			operation: 'add',
			operandType: 'math',
			mathMethod: 'round',
			mathMin: 3,
			mathMax: 9,
			stringSearch: 'abc',
			cooldownKey: 'id0'
		});
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.operation).toBe('add');
		expect(form.operandType).toBe('math');
		expect(form.mathMethod).toBe('round');
		expect(form.mathMin).toBe(3);
		expect(form.mathMax).toBe(9);
		expect(form.stringSearch).toBe('abc');
		expect(form.cooldownKey).toBe('id0');
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（SelectBox/CustomBox/NumberVar/TextBox）', async () => {
		const wrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const typeBox = document.getElementById(
			'setNumber-operand-type'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		typeBox.input('variable');
		const variableBox = document.getElementById(
			'setNumber-operand-common-variable'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		variableBox.input({ type: 'local', key: 'score' });
		const indexBox = document.getElementById(
			'setNumber-operand-list-index'
		) as unknown as HTMLElement & {
			write(value: number): void;
		};
		indexBox.write(4);
		const scriptBox = document.getElementById(
			'setNumber-operand-script'
		) as unknown as HTMLElement & {
			write(value: string): void;
		};
		scriptBox.write('run()');
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.operandType).toBe('variable');
		expect(form.commonVariable).toEqual({ type: 'local', key: 'score' });
		expect(form.listIndex).toBe(4);
		expect(form.script).toBe('run()');
		wrapper.unmount();
	});

	it('NumberOperand.open 经 setForm 填充表单（含 index 0 的 operation 暂存分支）', async () => {
		const wrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		NumberOperand.open!({
			operation: 'add',
			type: 'constant',
			value: 7
		} as unknown as NumberOperandData);
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setNumber-operand');
		const form = getFrame().getForm();
		expect(form.operation).toBe('add');
		expect(form.operandType).toBe('constant');
		expect(form.constantValue).toBe(7);
		wrapper.unmount();
	});

	it('NumberOperand.save 经 getForm 保存（constant/math/other 各类型）', async () => {
		const wrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		NumberOperand.open!({
			operation: 'add',
			type: 'constant',
			value: 7
		} as unknown as NumberOperandData);
		await wrapper.vm.$nextTick();
		expect(NumberOperand.save!()).toEqual({
			operation: 'add',
			type: 'constant',
			value: 7
		});
		expect(Window.close).toHaveBeenCalledWith('setNumber-operand');
		NumberOperand.open!({
			operation: 'add',
			type: 'math',
			method: 'round',
			variable: { type: 'local', key: 'x' },
			decimals: 2
		} as unknown as NumberOperandData);
		await wrapper.vm.$nextTick();
		expect(NumberOperand.save!()).toEqual({
			operation: 'add',
			type: 'math',
			method: 'round',
			variable: { type: 'local', key: 'x' },
			decimals: 2
		});
		NumberOperand.open!({
			operation: 'add',
			type: 'other',
			data: 'actor-count',
			teamId: 'team0'
		} as unknown as NumberOperandData);
		await wrapper.vm.$nextTick();
		expect(NumberOperand.save!()).toEqual({
			operation: 'add',
			type: 'other',
			data: 'actor-count',
			teamId: 'team0'
		});
		wrapper.unmount();
	});

	it('save 校验失败时返回 undefined 且不关闭窗口', async () => {
		const wrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		NumberOperand.open!({
			operation: 'add',
			type: 'variable',
			variable: { type: 'local', key: '' }
		} as unknown as NumberOperandData);
		await wrapper.vm.$nextTick();
		expect(NumberOperand.save!()).toBeUndefined();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
