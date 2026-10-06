import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import IfCommandWindow from '@app/components/commands/If.vue';
import IfBranchWindow from '@app/components/tools/IfBranch.vue';
import IfConditionWindow from '@app/components/tools/IfCondition.vue';
import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';
import { useIfConditionSchema } from '@app/composables/useIfConditionSchema';

const IfBranch = useIfBranchSchema();
const IfCondition = useIfConditionSchema();
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setNumberColor: (value: unknown) => `[num:${String(value)}]`,
	setOperatorColor: (value: unknown) => `[op:${String(value)}]`,
	setBooleanColor: (value: unknown) => `[bool:${String(value)}]`,
	setDelimiterColor: (value: unknown) => `[dl:${String(value)}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (variable: { key: string }, type: string) => `<var:${variable.key}:${type}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: () => '' } })
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

/**
 * 本文件挂载的真实窗口：用例只 unmount 了 commandWrapper，其余会在 beforeEach 里被
 * `document.body.innerHTML = ''` 摘掉但**组件仍处于挂载态**——它们随后任何一次重渲染都会
 * 重新登记自己的元素，把共享注册表覆盖成已脱离文档的旧节点（模块改读 `composableEls`，
 * 这条泄漏会直接表现为"读到旧数据"）。故统一在 afterEach 里卸载。
 */
const mountedWrappers: Array<{ unmount(): void }> = [];

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

	afterEach(() => {
		while (mountedWrappers.length > 0) mountedWrappers.pop()!.unmount();
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
		const wrappers = { commandWrapper, branchWrapper, conditionWrapper };
		mountedWrappers.push(...Object.values(wrappers));
		return wrappers;
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
