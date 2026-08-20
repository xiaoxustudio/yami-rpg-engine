import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SwitchCommandWindow from '@app/components/commands/Switch.vue';
import SwitchBranchWindow from '@app/components/tools/SwitchBranch.vue';
import SwitchConditionWindow from '@app/components/tools/SwitchCondition.vue';
import { SwitchBranch } from '@app/legacy/command/match-branch-window.ts';
import { SwitchCondition } from '@app/legacy/command/match-condition-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setNumberColor: (value: unknown) => `[num:${value}]`,
	setStringColor: (value: unknown) => `[str:${value}]`,
	setBooleanColor: (value: unknown) => `[bool:${value}]`,
	setOperatorColor: (value: unknown) => `[op:${value}]`,
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

const makeCondition = (value: number) => ({ type: 'number', value });
const makeBranch = (value: number) => ({ conditions: [makeCondition(value)], commands: [] });

describe('useSwitchBranchSchema（switch 分支列表动态行：add/remove/swap + insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Command.words = {
			push: (value: string) => words.push(value),
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
		words.length = 0;
		SwitchBranch.target = null;
		SwitchBranch.commands = null;
	});

	const mountAll = async () => {
		const commandWrapper = mount(SwitchCommandWindow, { attachTo: document.body });
		const branchWrapper = mount(SwitchBranchWindow, { attachTo: document.body });
		const conditionWrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await branchWrapper.vm.$nextTick();
		await conditionWrapper.vm.$nextTick();
		getList('switch-branches').bind(SwitchBranch);
		getList('switch-branch-conditions').bind(SwitchCondition);
		return { commandWrapper, branchWrapper, conditionWrapper };
	};

	it('bind 后 write 渲染动态行，add/remove/swap 维护列表顺序', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('switch-branches');
		list.write([makeBranch(1), makeBranch(2), makeBranch(3)]);
		const readBack = (): unknown[] => list.read()!;
		expect(readBack()).toHaveLength(3);
		expect(words).toEqual(['[num:1]', '[num:2]', '[num:3]']);
		list.select(1);
		list.delete();
		expect(readBack()).toHaveLength(2);
		expect(readBack()[0]).toEqual(makeBranch(1));
		expect(readBack()[1]).toEqual(makeBranch(3));
		const data = readBack() as Array<{ conditions: { value: number }[] }>;
		data.push(data.shift()!);
		list.update();
		expect(readBack()[0]).toEqual(makeBranch(3));
		expect(readBack()[1]).toEqual(makeBranch(1));
		commandWrapper.unmount();
	});

	it('insert 路径：插入新行经 switch-condition 窗口保存后加入列表', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('switch-branches');
		list.write([makeBranch(1)]);
		list.select(0);
		list.insert();
		expect(Window.open).toHaveBeenCalledWith('switch-condition');
		getControl('switch-condition-number-value').write(5);
		SwitchCondition.confirm!(new Event('click'));
		const data = list.read() as Array<{ conditions: { value: number }[] }>;
		expect(data).toHaveLength(2);
		expect(data[0].conditions[0].value).toBe(5);
		commandWrapper.unmount();
	});

	it('edit 路径：打开已有分支修改后经确认替换行数据', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('switch-branches');
		list.write([makeBranch(1), makeBranch(2)]);
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('switch-branch');
		getList('switch-branch-conditions').write([makeCondition(8)]);
		SwitchBranch.confirm!(new Event('click'));
		const data = list.read() as Array<{ conditions: { value: number }[] }>;
		expect(data).toHaveLength(2);
		expect(data[0].conditions[0].value).toBe(1);
		expect(data[1].conditions[0].value).toBe(8);
		expect(Window.close).toHaveBeenCalledWith('switch-branch');
		commandWrapper.unmount();
	});

	it('save 校验：条件列表为空时不关闭窗口', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('switch-branches');
		list.write([makeBranch(1)]);
		list.select(0);
		list.edit();
		getList('switch-branch-conditions').write([]);
		SwitchBranch.confirm!(new Event('click'));
		expect(Window.close).not.toHaveBeenCalledWith('switch-branch');
		commandWrapper.unmount();
	});

	it('parse 组合条件文本（listData 去掉文本标签）', () => {
		const branch = { conditions: [makeCondition(1), makeCondition(2)], commands: [] };
		expect(SwitchBranch.parse!(branch as never)).toBe('[num:1][num:2]');
	});
});
