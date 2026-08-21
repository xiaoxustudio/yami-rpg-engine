import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetNumber from '@app/components/commands/SetNumber.vue';
import SetNumberOperand from '@app/components/tools/SetNumberOperand.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { useSetNumberCommandSchema } from '@app/composables/commands/useSetNumberCommandSchema';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setNumberColor: (value: unknown) => `[num:${value}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (value: unknown) => `[var:${JSON.stringify(value)}]`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ParamListElement extends HTMLElement {
	read(): unknown[] | null;
	write(data: unknown[]): void;
}

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getList = (id: string): ParamListElement =>
	document.getElementById(id) as unknown as ParamListElement;
const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('useSetNumberCommandSchema（setNumber 命令表单 composable：insert/edit/save/校验路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = vi.fn((variable: unknown) => {
			return !variable || (variable as { key?: string })?.key === '';
		}) as never;
		Window.open = vi.fn();
		Window.close = vi.fn();
		Data.teams = { list: [{ id: 'team0' }] } as never;
		Data.createTeamItems = vi.fn(() => [{ name: 'Team 0', value: 'team0' }]) as never;
	});

	const mountAll = async () => {
		const commandWrapper = mount(SetNumber, { attachTo: document.body });
		const operandWrapper = mount(SetNumberOperand, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await operandWrapper.vm.$nextTick();
		return { commandWrapper, operandWrapper };
	};

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const { commandWrapper, operandWrapper } = await mountAll();
		const { form } = useSetNumberCommandSchema();
		CommandSchema.insert(target, 'setNumber');
		await commandWrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setNumber');
		expect(form.variable).toEqual({ type: 'local', key: '' });
		expect(form.operands).toEqual([{ operation: 'add', type: 'constant', value: 0 }]);
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('edit 路径：customLoad 解构 params 到 form', async () => {
		const { commandWrapper, operandWrapper } = await mountAll();
		const { form } = useSetNumberCommandSchema();
		const operands = [
			{ operation: 'add', type: 'constant', value: 5 },
			{ operation: 'add', type: 'variable', variable: { type: 'local', key: 'v' } }
		];
		CommandSchema.edit(target, {
			id: 'setNumber',
			params: { variable: { type: 'local', key: 'foo' }, operation: 'set', operands }
		});
		await commandWrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('setNumber');
		expect(form.variable).toEqual({ type: 'local', key: 'foo' });
		expect(form.operands).toEqual(operands);
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('save 路径：用户改控件后经 Command.cases.setNumber.save 保存', async () => {
		const { commandWrapper, operandWrapper } = await mountAll();
		const { form } = useSetNumberCommandSchema();
		Command.cases.setNumber.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'add',
			operands: [{ operation: 'add', type: 'constant', value: 1 }]
		});
		getControl('setNumber-variable').write({ type: 'global', key: 'bar' });
		form.operands = [{ operation: 'add', type: 'constant', value: 2 }];
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setNumber.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'global', key: 'bar' },
			operation: 'add',
			operands: [{ operation: 'add', type: 'constant', value: 2 }]
		});
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('save 路径：variable 无效校验失败不保存', async () => {
		const { commandWrapper, operandWrapper } = await mountAll();
		Command.cases.setNumber.customLoad!({
			variable: { type: 'local', key: '' },
			operation: 'set',
			operands: [{ operation: 'add', type: 'constant', value: 0 }]
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setNumber.save!();
		expect(saved).not.toHaveBeenCalled();
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('save 路径：空 operands 校验失败不保存', async () => {
		const { commandWrapper, operandWrapper } = await mountAll();
		const { form } = useSetNumberCommandSchema();
		Command.cases.setNumber.customLoad!({
			variable: { type: 'local', key: 'foo' },
			operation: 'set',
			operands: [{ operation: 'add', type: 'constant', value: 0 }]
		});
		form.operands = [];
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.setNumber.save!();
		expect(saved).not.toHaveBeenCalled();
		commandWrapper.unmount();
		operandWrapper.unmount();
	});
});
