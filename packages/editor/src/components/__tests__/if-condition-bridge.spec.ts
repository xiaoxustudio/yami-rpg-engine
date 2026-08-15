import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfConditionWindow from '@app/components/tools/IfCondition.vue';
import { IfCondition } from '@/command/conditional-condition-window.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { Data } from '@/data/data-object.ts';
import '@/command/conditional-condition-window.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface IfConditionFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (): IfConditionFrame =>
	document.getElementById('if-condition') as unknown as IfConditionFrame;

describe('if-condition 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => []) as never;
		Enum.getDefStringId = vi.fn(() => 'id0') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
	});

	it('窗口根元素暴露 setForm/getForm 桥接，setForm 写入控件 DOM', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({
			commonVariable: { type: 'local', key: 'hp' },
			numberConstantValue: 42,
			stringConstantValue: 'hello',
			actorQuantity: 5,
			booleanConstantValue: true,
			actorShortcutKey: 'id0'
		});
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.commonVariable).toEqual({ type: 'local', key: 'hp' });
		expect(form.numberConstantValue).toBe(42);
		expect(form.stringConstantValue).toBe('hello');
		expect(form.actorQuantity).toBe(5);
		expect(form.booleanConstantValue).toBe(true);
		expect(form.actorShortcutKey).toBe('id0');
		const numberBox = document.getElementById(
			'if-condition-number-constant-value'
		) as unknown as HTMLElement & { read(): number };
		expect(numberBox.read()).toBe(42);
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（SelectBox/CustomBox/NumberBox）', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const typeBox = document.getElementById('if-condition-type') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		typeBox.input('boolean');
		const variableBox = document.getElementById(
			'if-condition-operand-variable'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		variableBox.input({ type: 'local', key: 'flag' });
		const quantityBox = document.getElementById(
			'if-condition-actor-quantity'
		) as unknown as HTMLElement & {
			write(value: number): void;
		};
		quantityBox.write(7);
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.type).toBe('boolean');
		expect(form.operandVariable).toEqual({ type: 'local', key: 'flag' });
		expect(form.actorQuantity).toBe(7);
		wrapper.unmount();
	});

	it('IfCondition.open 经 setForm 填充表单（读回默认值与条件值）', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		IfCondition.open!({
			type: 'number',
			variable: { type: 'local', key: 'hp' },
			operation: 'greater',
			operand: { type: 'constant', value: 100 }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('if-condition');
		const form = getFrame().getForm();
		expect(form.type).toBe('number');
		expect(form.commonVariable).toEqual({ type: 'local', key: 'hp' });
		expect(form.numberOperation).toBe('greater');
		expect(form.numberOperandType).toBe('constant');
		expect(form.numberConstantValue).toBe(100);
		wrapper.unmount();
	});

	it('IfCondition.save 经 getForm 保存（constant/variable/keyboard/gamepad 各类型）', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		IfCondition.open!({
			type: 'number',
			variable: { type: 'local', key: 'hp' },
			operation: 'greater-or-equal',
			operand: { type: 'constant', value: 50 }
		});
		await wrapper.vm.$nextTick();
		const condition = IfCondition.save!();
		expect(condition).toEqual({
			type: 'number',
			variable: { type: 'local', key: 'hp' },
			operation: 'greater-or-equal',
			operand: { type: 'constant', value: 50 }
		});
		expect(Window.close).toHaveBeenCalledWith('if-condition');
		IfCondition.open!({
			type: 'keyboard',
			keycode: 'Enter',
			state: 'just-pressed'
		});
		await wrapper.vm.$nextTick();
		expect(IfCondition.save!()).toEqual({
			type: 'keyboard',
			keycode: 'Enter',
			state: 'just-pressed'
		});
		IfCondition.open!({
			type: 'gamepad',
			button: 1,
			state: 'pressed'
		});
		await wrapper.vm.$nextTick();
		expect(IfCondition.save!()).toEqual({
			type: 'gamepad',
			button: 1,
			state: 'pressed'
		});
		wrapper.unmount();
	});

	it('save 校验失败时返回 undefined 且不关闭窗口', async () => {
		const wrapper = mount(IfConditionWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		IfCondition.open!();
		await wrapper.vm.$nextTick();
		getFrame().setForm({
			type: 'number',
			commonVariable: { type: 'local', key: '' },
			numberOperation: 'equal',
			numberOperandType: 'none'
		});
		await wrapper.vm.$nextTick();
		expect(IfCondition.save!()).toBeUndefined();
		expect(Window.close).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
