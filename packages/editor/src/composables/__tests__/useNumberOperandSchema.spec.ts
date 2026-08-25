import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SetNumberCommandWindow from '@app/components/commands/SetNumber.vue';
import SetNumberOperandWindow from '@app/components/tools/SetNumberOperand.vue';
import { useNumberOperandSchema } from '@app/composables/useNumberOperandSchema';
import type { NumberOperandData } from '@app/composables/useNumberOperandSchema';

const NumberOperand = useNumberOperandSchema();
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	// oxlint-disable-next-line no-base-to-string
	setNumberColor: (value: unknown) => `[num:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setStringColor: (value: unknown) => `[str:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setScriptColor: (value: unknown) => `[script:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setOperatorColor: (value: unknown) => `[op:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setDelimiterColor: (value: unknown) => `[dl:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setBooleanColor: (value: unknown) => `[bool:${String(value)}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (variable: { key: string }, type: string) => `<var:${variable.key}:${type}>`,
	parseVariableNumber: (value: unknown) =>
		// oxlint-disable-next-line no-base-to-string
		`[vnum:${String(typeof value === 'object' ? (value as { key: string }).key : value)}]`,
	// oxlint-disable-next-line no-base-to-string
	parseVariableString: (value: unknown) => `[vstr:${String(value)}]`,
	parseVariableFile: (id: string) => `<vfile:${id}>`,
	parseVariableEnum: (group: string, key: string) => `<venum:${group}:${key}>`,
	parsePosition: (position: { type: string }) => `<pos:${position.type}>`,
	parseActor: (actor: { type: string }) => `<actor:${actor.type}>`,
	parseSkill: (skill: { type: string }) => `<skill:${skill.type}>`,
	parseState: (state: { type: string }) => `<state:${state.type}>`,
	parseEquipment: (equipment: { type: string }) => `<equipment:${equipment.type}>`,
	parseItem: (item: { type: string }) => `<item:${item.type}>`,
	parseTrigger: (trigger: { type: string }) => `<trigger:${trigger.type}>`,
	parseTilemap: (tilemap: { type: string }) => `<tilemap:${tilemap.type}>`,
	parseElement: (element: { type: string }) => `<element:${element.type}>`,
	parseListItem: (variable: { key: string }, index: number) => `<list:${variable.key}:${index}>`,
	parseParameter: (key: string) => `<param:${key}>`,
	parseTeam: (teamId: string) => `<team:${teamId}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	t: (key: string) => key,
	createGetter: () => (key: string) => key,
	getLabel: () => '',
	getTip: () => '',
	getContent: () => ''
}));

interface ParamListElement extends HTMLElement {
	bind(object: unknown): HTMLElement;
	read(): unknown[] | null;
	write(data: unknown[]): void;
	update(): void;
	select(start: number, end?: number): void;
	insert(): void;
	edit(): void;
	delete(): void;
	save(): void;
	clear(): HTMLElement;
}

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getList = (id: string): ParamListElement =>
	document.getElementById(id) as unknown as ParamListElement;
const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const makeOperand = (value: number) => ({
	operation: 'add',
	type: 'constant',
	value
});

describe('useNumberOperandSchema（数值操作数窗口 composable：parse 树形渲染/动态行 insert/edit/save）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => []) as never;
		Enum.getDefStringId = vi.fn(() => 'id0') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
		// oxlint-disable-next-line no-base-to-string
		Command.setOperatorColor = ((value: unknown) => `[op:${String(value)}]`) as never;
		// oxlint-disable-next-line no-base-to-string
		Command.setDelimiterColor = ((value: unknown) => `[dl:${String(value)}]`) as never;
		// oxlint-disable-next-line no-base-to-string
		Command.setBooleanColor = ((value: unknown) => `[bool:${String(value)}]`) as never;
		NumberOperand.target = null;
	});

	it('parse 树形渲染：math/string/object/element/other 各类型', () => {
		expect(
			NumberOperand.parseMathMethod!({
				operation: 'add',
				type: 'math',
				method: 'round',
				variable: { type: 'local', key: 'x' },
				decimals: 2
			} as unknown as NumberOperandData)
		).toBe('command.setNumber.math.round[dl:(]<var:x:number>[dl:, ][num:2][dl:)]');
		expect(
			NumberOperand.parseMathMethod!({
				operation: 'add',
				type: 'math',
				method: 'random'
			} as unknown as NumberOperandData)
		).toBe('command.setNumber.math.random[dl:[][num:0][dl:, ][num:1][dl:)]');
		expect(
			NumberOperand.parseMathMethod!({
				operation: 'add',
				type: 'math',
				method: 'random-int',
				min: 1,
				max: 9
			} as unknown as NumberOperandData)
		).toBe('command.setNumber.math.random-int[dl:[][vnum:1][dl:, ][vnum:9][dl:]]');
		expect(
			NumberOperand.parseMathMethod!({
				operation: 'add',
				type: 'math',
				method: 'distance',
				start: { type: 'actor', actor: { type: 'trigger' } },
				end: { type: 'actor', actor: { type: 'trigger' } }
			} as unknown as NumberOperandData)
		).toBe('command.setNumber.math.distance[dl:(]<pos:actor>[dl:, ]<pos:actor>[dl:)]');
		expect(
			NumberOperand.parseStringMethod!({
				operation: 'add',
				type: 'string',
				method: 'length',
				variable: { type: 'local', key: 's' }
			} as unknown as NumberOperandData)
		).toBe('command.setNumber.string.length[dl:(]<var:s:string>[dl:)]');
		expect(
			NumberOperand.parseObjectProperty!({
				operation: 'add',
				type: 'object',
				property: 'actor-x',
				actor: { type: 'trigger' }
			} as unknown as NumberOperandData)
		).toBe('<actor:trigger>[dl: -> ]command[dl:.]setNumber.object.actor-x');
		expect(
			NumberOperand.parseElementProperty!({
				operation: 'add',
				type: 'element',
				property: 'element-x',
				element: { type: 'trigger' }
			} as unknown as NumberOperandData)
		).toBe('<element:trigger>[dl: -> ]command[dl:.]setNumber.element.element-x');
		expect(
			NumberOperand.parseOther!({
				operation: 'add',
				type: 'other',
				data: 'touch-screen-x',
				touchId: 0
			} as unknown as NumberOperandData)
		).toContain('[vnum:0]');
		expect(
			NumberOperand.parseOther!({
				operation: 'add',
				type: 'other',
				data: 'actor-count',
				teamId: 'team0'
			} as unknown as NumberOperandData)
		).toBe('command.setNumber.other.actor-count[dl:(]<team:team0>[dl:)]');
	});

	it('parseOperand 与 parse 组合（operator/priority 括号）', () => {
		expect(
			NumberOperand.parseOperand!({
				operation: 'add',
				type: 'constant',
				value: 5
			} as unknown as NumberOperandData)
		).toBe('[num:5]');
		expect(
			NumberOperand.parseOperand!({
				operation: 'add',
				type: 'script',
				script: 'run()'
			} as unknown as NumberOperandData)
		).toBe('[script:run()]');
		const data = [
			makeOperand(1),
			{ operation: 'add', type: 'constant', value: 2 },
			{ operation: 'add()', type: 'constant', value: 3 }
		] as unknown as NumberOperandData[];
		expect(NumberOperand.parse!(data[1], data, 1)).toBe('+ ([num:2]');
		expect(NumberOperand.parse!(data[2], data, 2)).toBe('+ [num:3])');
	});

	it('bind 后 write 渲染动态行，add/remove/swap 维护列表顺序', async () => {
		const commandWrapper = mount(SetNumberCommandWindow, { attachTo: document.body });
		const operandWrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await operandWrapper.vm.$nextTick();
		const list = getList('setNumber-operands');
		list.bind(NumberOperand);
		getControl('setNumber-operation').input('add');
		list.write([makeOperand(1), makeOperand(2), makeOperand(3)]);
		const readBack = (): unknown[] => list.read()!;
		expect(readBack()).toHaveLength(3);
		list.select(1);
		list.delete();
		expect(readBack()).toHaveLength(2);
		expect(readBack()[0]).toEqual(makeOperand(1));
		expect(readBack()[1]).toEqual(makeOperand(3));
		const data = readBack() as Array<{ value: number }>;
		data.push(data.shift()!);
		list.update();
		expect(readBack()[0]).toEqual(makeOperand(3));
		expect(readBack()[1]).toEqual(makeOperand(1));
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('insert 路径：插入新操作数经 setNumber-operand 窗口保存（index 0 显示命令操作符）', async () => {
		const commandWrapper = mount(SetNumberCommandWindow, { attachTo: document.body });
		const operandWrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await operandWrapper.vm.$nextTick();
		const list = getList('setNumber-operands');
		list.bind(NumberOperand);
		getControl('setNumber-operation').input('add');
		list.write([makeOperand(1)]);
		list.select(0);
		list.insert();
		expect(Window.open).toHaveBeenCalledWith('setNumber-operand');
		getControl('setNumber-operand-constant-value').write(7);
		NumberOperand.confirm!(new Event('click'));
		const data = list.read() as Array<{ value: number }>;
		expect(data).toHaveLength(2);
		expect(data[0].value).toBe(7);
		expect(Window.close).toHaveBeenCalledWith('setNumber-operand');
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('edit 路径：打开已有操作数修改后经确认替换行数据', async () => {
		const commandWrapper = mount(SetNumberCommandWindow, { attachTo: document.body });
		const operandWrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await operandWrapper.vm.$nextTick();
		const list = getList('setNumber-operands');
		list.bind(NumberOperand);
		getControl('setNumber-operation').input('add');
		list.write([makeOperand(1), makeOperand(2)]);
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('setNumber-operand');
		getControl('setNumber-operand-constant-value').write(8);
		NumberOperand.confirm!(new Event('click'));
		const data = list.read() as Array<{ value: number }>;
		expect(data).toHaveLength(2);
		expect(data[0].value).toBe(1);
		expect(data[1].value).toBe(8);
		commandWrapper.unmount();
		operandWrapper.unmount();
	});

	it('save 校验：variable 操作数未选择时返回 undefined 且不关闭窗口', async () => {
		const commandWrapper = mount(SetNumberCommandWindow, { attachTo: document.body });
		const operandWrapper = mount(SetNumberOperandWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await operandWrapper.vm.$nextTick();
		NumberOperand.target = { start: 0, save: vi.fn() } as never;
		NumberOperand.open!({
			operation: 'add',
			type: 'variable',
			variable: { type: 'local', key: '' }
		} as unknown as NumberOperandData);
		await operandWrapper.vm.$nextTick();
		expect(NumberOperand.save!()).toBeUndefined();
		expect(Window.close).not.toHaveBeenCalledWith('setNumber-operand');
		commandWrapper.unmount();
		operandWrapper.unmount();
	});
});
