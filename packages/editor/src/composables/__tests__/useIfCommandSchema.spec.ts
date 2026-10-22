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
import { useIfCommandSchema } from '@app/composables/commands/useIfCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
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

/** 有高度才走 `resize()` 把行真正挂进 DOM（同真实窗口）。 */
const mockListBox = (list: HTMLElement): void => {
	Object.defineProperty(list, 'clientHeight', { value: 102, configurable: true });
	Object.defineProperty(list, 'clientWidth', { value: 300, configurable: true });
};

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

const mountedWrappers: Array<{ unmount(): void }> = [];

describe('useIfCommandSchema (if command window dynamic rows + insert/edit/save paths)', () => {
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
		useIfCommandSchema().form.branches = undefined;
	});

	afterEach(() => {
		while (mountedWrappers.length > 0) mountedWrappers.pop()!.unmount();
	});

	const mountAll = async () => {
		const commandWrapper = mount(IfCommandWindow, { attachTo: document.body });
		const branchWrapper = mount(IfBranchWindow, { attachTo: document.body });
		const conditionWrapper = mount(IfConditionWindow, { attachTo: document.body });
		mountedWrappers.push(commandWrapper, branchWrapper, conditionWrapper);
		await commandWrapper.vm.$nextTick();
		await branchWrapper.vm.$nextTick();
		await conditionWrapper.vm.$nextTick();
		getList('if-branches').bind(IfBranch);
		getList('if-branch-conditions').bind(IfCondition);
		return { commandWrapper, branchWrapper, conditionWrapper };
	};

	it('customLoad writes branch rows (else checked), read/remove/swap keep order', async () => {
		const { commandWrapper } = await mountAll();
		Command.cases.if.customLoad!({
			branches: [makeBranch(1), makeBranch(2), makeBranch(3)],
			elseCommands: [{ id: 'comment' }]
		});
		await commandWrapper.vm.$nextTick();
		const list = getList('if-branches');
		const readBack = (): unknown[] => list.read()!;
		expect(readBack()).toHaveLength(3);
		expect(getControl('if-else').read()).toBe(true);
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

	it('第二次 customLoad 只有 branches 变化（else 不变）时列表也立刻刷新', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('if-branches');
		mockListBox(list);

		Command.cases.if.customLoad!({
			branches: [makeBranch(1)],
			elseCommands: [{ id: 'comment' }]
		});
		await commandWrapper.vm.$nextTick();
		expect(list.read()).toHaveLength(1);

		Command.cases.if.customLoad!({
			branches: [makeBranch(2), makeBranch(3)],
			elseCommands: [{ id: 'comment' }]
		});
		await commandWrapper.vm.$nextTick();
		expect(list.read()).toHaveLength(2);
		expect(list.querySelectorAll('.param-item')).toHaveLength(3);
	});

	it('insert path: CommandSchema.insert opens if window, new branch saved via if-condition', async () => {
		const { commandWrapper } = await mountAll();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'if');
		expect(Window.open).toHaveBeenCalledWith('if');
		const list = getList('if-branches');
		list.write([makeBranch(1)]);
		list.select(0);
		list.insert();
		expect(Window.open).toHaveBeenCalledWith('if-condition');
		getControl('if-condition-common-variable').input({ type: 'local', key: 'hp' });
		getControl('if-condition-number-constant-value').write(5);
		IfCondition.confirm!(new Event('click'));
		const data = list.read() as Array<{
			conditions: { operand: { value: number } }[];
		}>;
		expect(data).toHaveLength(2);
		expect(data[0].conditions[0].operand.value).toBe(5);
		commandWrapper.unmount();
	});

	it('edit path: CommandSchema.edit opens branch, elseCommands saved with window', async () => {
		const { commandWrapper } = await mountAll();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		const branches = [makeBranch(1), makeBranch(2)];
		CommandSchema.edit(target, {
			id: 'if',
			params: { branches, elseCommands: [{ id: 'comment' }] }
		});
		expect(Window.open).toHaveBeenCalledWith('if');
		await commandWrapper.vm.$nextTick();
		const list = getList('if-branches');
		expect(list.read()).toHaveLength(2);
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('if-branch');
		getControl('if-branch-mode').input('any');
		getList('if-branch-conditions').write([makeCondition(9)]);
		IfBranch.confirm!(new Event('click'));
		await commandWrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.if.save!();
		expect(saved).toHaveBeenCalledWith({
			branches: [
				makeBranch(1),
				{ mode: 'any', conditions: [makeCondition(9)], commands: [] }
			],
			elseCommands: [{ id: 'comment' }]
		});
		commandWrapper.unmount();
	});

	it('save validation: empty branches do not save', async () => {
		const { commandWrapper } = await mountAll();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.if.customLoad!({ branches: [], elseCommands: null });
		await commandWrapper.vm.$nextTick();
		Command.cases.if.save!();
		expect(saved).not.toHaveBeenCalled();
		commandWrapper.unmount();
	});

	it('windowClosed clears elseCommands state', async () => {
		const { commandWrapper } = await mountAll();
		const { useIfCommandSchema } = await import('@app/composables/commands/useIfCommandSchema');
		const { windowClosed } = useIfCommandSchema();
		Command.cases.if.customLoad!({
			branches: [makeBranch(1)],
			elseCommands: [{ id: 'comment' }]
		});
		await commandWrapper.vm.$nextTick();
		windowClosed(new Event('closed'));
		await commandWrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.if.save!();
		expect(saved).toHaveBeenCalledWith({
			branches: [makeBranch(1)],
			elseCommands: []
		});
		commandWrapper.unmount();
	});
});
