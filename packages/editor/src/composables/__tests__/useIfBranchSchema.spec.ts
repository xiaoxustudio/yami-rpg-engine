import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfCommandWindow from '@app/components/commands/If.vue';
import IfBranchWindow from '@app/components/tools/IfBranch.vue';
import IfConditionWindow from '@app/components/tools/IfCondition.vue';
import { IfBranch } from '@app/legacy/command/conditional-branch-window.ts';
import { IfCondition } from '@app/legacy/command/conditional-condition-window.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { VariableGetter } from '@app/legacy/command/variable-accessor-window.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setNumberColor: (value: unknown) => `[num:${value}]`,
	setOperatorColor: (value: unknown) => `[op:${value}]`,
	setBooleanColor: (value: unknown) => `[bool:${value}]`,
	setDelimiterColor: (value: unknown) => `[dl:${value}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (variable: { key: string }, type: string) => `<var:${variable.key}:${type}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	t: () => '',
	createGetter: () => () => '',
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

const words: string[] = [];

const makeCondition = (value: number) => ({
	type: 'number',
	variable: { type: 'local', key: 'hp' },
	operation: 'equal',
	operand: { type: 'constant', value }
});
const makeBranch = (value: number) => ({
	mode: 'all',
	conditions: [makeCondition(value)],
	commands: []
});

describe('useIfBranchSchema（if 分支列表动态行：add/remove/swap + insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Enum.getStringItems = vi.fn(() => []) as never;
		Enum.getDefStringId = vi.fn(() => 'id0') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
		Command.words = {
			push: (value: string) => words.push(value),
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
		words.length = 0;
		IfBranch.target = null;
		IfBranch.commands = null;
	});

	const mountAll = async () => {
		const commandWrapper = mount(IfCommandWindow, { attachTo: document.body });
		const branchWrapper = mount(IfBranchWindow, { attachTo: document.body });
		const conditionWrapper = mount(IfConditionWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await branchWrapper.vm.$nextTick();
		await conditionWrapper.vm.$nextTick();
		getList('if-branches').bind(IfBranch);
		getList('if-branch-conditions').bind(IfCondition);
		return { commandWrapper, branchWrapper, conditionWrapper };
	};

	it('bind 后 write 渲染动态行，add/remove/swap 维护列表顺序', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('if-branches');
		list.write([makeBranch(1), makeBranch(2), makeBranch(3)]);
		const readBack = (): unknown[] => list.read()!;
		expect(readBack()).toHaveLength(3);
		expect(words).toEqual([
			'<var:hp:number> [op:==] [num:1]',
			'<var:hp:number> [op:==] [num:2]',
			'<var:hp:number> [op:==] [num:3]'
		]);
		list.select(1);
		list.delete();
		expect(readBack()).toHaveLength(2);
		expect(readBack()[0]).toEqual(makeBranch(1));
		expect(readBack()[1]).toEqual(makeBranch(3));
		const data = readBack() as Array<{ conditions: { operand: { value: number } }[] }>;
		data.push(data.shift()!);
		list.update();
		expect(readBack()[0]).toEqual(makeBranch(3));
		expect(readBack()[1]).toEqual(makeBranch(1));
		commandWrapper.unmount();
	});

	it('insert 路径：插入新分支经 if-condition 窗口保存（mode 默认 all 单条件）', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('if-branches');
		list.write([makeBranch(1)]);
		list.select(0);
		list.insert();
		expect(Window.open).toHaveBeenCalledWith('if-condition');
		getControl('if-condition-common-variable').input({ type: 'local', key: 'hp' });
		getControl('if-condition-number-constant-value').write(5);
		IfCondition.confirm!(new Event('click'));
		const data = list.read() as Array<{
			mode: string;
			conditions: { operand: { value: number } }[];
		}>;
		expect(data).toHaveLength(2);
		expect(data[0].mode).toBe('all');
		expect(data[0].conditions[0].operand.value).toBe(5);
		commandWrapper.unmount();
	});

	it('edit 路径：打开已有分支修改 mode 与条件后经确认替换行数据', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('if-branches');
		list.write([makeBranch(1), makeBranch(2)]);
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('if-branch');
		getControl('if-branch-mode').input('any');
		getList('if-branch-conditions').write([makeCondition(9)]);
		IfBranch.confirm!(new Event('click'));
		const data = list.read() as Array<{
			mode: string;
			conditions: { operand: { value: number } }[];
		}>;
		expect(data).toHaveLength(2);
		expect(data[0].mode).toBe('all');
		expect(data[1].mode).toBe('any');
		expect(data[1].conditions[0].operand.value).toBe(9);
		expect(Window.close).toHaveBeenCalledWith('if-branch');
		commandWrapper.unmount();
	});

	it('save 校验：条件列表为空时不关闭窗口', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('if-branches');
		list.write([makeBranch(1)]);
		list.select(0);
		list.edit();
		getList('if-branch-conditions').write([]);
		IfBranch.confirm!(new Event('click'));
		expect(Window.close).not.toHaveBeenCalledWith('if-branch');
		commandWrapper.unmount();
	});

	it('parse 组合条件文本（all/any 操作符与 listData 去标签）', () => {
		const branch = {
			mode: 'any',
			conditions: [makeCondition(1), makeCondition(2)],
			commands: []
		};
		const text = IfBranch.parse!(branch as never);
		expect(text).toContain('[op: || ]');
		expect(text).toContain('[num:1]');
		expect(text).toContain('[num:2]');
	});
});
