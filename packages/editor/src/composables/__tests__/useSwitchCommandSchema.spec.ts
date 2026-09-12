import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SwitchCommandWindow from '@app/components/commands/Switch.vue';
import SwitchBranchWindow from '@app/components/tools/SwitchBranch.vue';
import SwitchConditionWindow from '@app/components/tools/SwitchCondition.vue';
import { useSwitchBranchSchema } from '@app/composables/useSwitchBranchSchema';
import {
	form as switchConditionForm,
	useSwitchConditionSchema
} from '@app/composables/useSwitchConditionSchema';

const SwitchBranch = useSwitchBranchSchema();
const SwitchCondition = useSwitchConditionSchema();
import { useSwitchCommandSchema } from '@app/composables/commands/useSwitchCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	// oxlint-disable-next-line no-base-to-string
	setNumberColor: (value: unknown) => `[num:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setStringColor: (value: unknown) => `[str:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setBooleanColor: (value: unknown) => `[bool:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setOperatorColor: (value: unknown) => `[op:${String(value)}]`,
	// oxlint-disable-next-line no-base-to-string
	setDelimiterColor: (value: unknown) => `[dl:${String(value)}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariable: (variable: { key: string }, type: string) => `<var:${variable.key}:${type}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() })
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

/** 本文件挂载的真实窗口：用例只 unmount 了 commandWrapper，其余会在 beforeEach 里被
 *  `document.body.innerHTML = ''` 摘掉但**组件仍处于挂载态**——它们随后任何一次重渲染都会
 *  重新登记自己的元素，把共享注册表覆盖成已脱离文档的旧节点（P1b 起模块改读 `composableEls`，
 *  这条泄漏会直接表现为"读到旧数据"）。故统一在 afterEach 里卸载。 */
const mountedWrappers: Array<{ unmount(): void }> = [];

const makeCondition = (value: number) => ({ type: 'number', value });
const makeBranch = (value: number) => ({ conditions: [makeCondition(value)], commands: [] });

describe('useSwitchCommandSchema (switch command window dynamic rows + insert/edit/save paths)', () => {
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
		useSwitchCommandSchema().form.branches = undefined;
	});

	afterEach(() => {
		while (mountedWrappers.length > 0) mountedWrappers.pop()!.unmount();
	});

	const mountAll = async () => {
		const commandWrapper = mount(SwitchCommandWindow, { attachTo: document.body });
		const branchWrapper = mount(SwitchBranchWindow, { attachTo: document.body });
		const conditionWrapper = mount(SwitchConditionWindow, { attachTo: document.body });
		mountedWrappers.push(commandWrapper, branchWrapper, conditionWrapper);
		await commandWrapper.vm.$nextTick();
		await branchWrapper.vm.$nextTick();
		await conditionWrapper.vm.$nextTick();
		getList('switch-branches').bind(SwitchBranch);
		getList('switch-branch-conditions').bind(SwitchCondition);
		return { commandWrapper, branchWrapper, conditionWrapper };
	};

	it('customLoad writes branch rows (variable/default synced), read/remove/swap keep order', async () => {
		const { commandWrapper } = await mountAll();
		Command.cases.switch.customLoad!({
			variable: { type: 'local', key: 'mode' },
			branches: [makeBranch(1), makeBranch(2), makeBranch(3)],
			defaultCommands: [{ id: 'comment' }]
		});
		await commandWrapper.vm.$nextTick();
		const list = getList('switch-branches');
		const readBack = (): unknown[] => list.read()!;
		expect(readBack()).toHaveLength(3);
		expect(getControl('switch-variable').read()).toEqual({ type: 'local', key: 'mode' });
		expect(getControl('switch-default').read()).toBe(true);
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

	it('insert path: CommandSchema.insert opens switch window, new branch saved via switch-condition', async () => {
		const { commandWrapper } = await mountAll();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'switch');
		expect(Window.open).toHaveBeenCalledWith('switch');
		const list = getList('switch-branches');
		list.write([makeBranch(1)]);
		list.select(0);
		list.insert();
		expect(Window.open).toHaveBeenCalledWith('switch-condition');
		switchConditionForm.numberValue = 5;
		SwitchCondition.confirm!(new Event('click'));
		const data = list.read() as Array<{ conditions: { value: number }[] }>;
		expect(data).toHaveLength(2);
		expect(data[0].conditions[0].value).toBe(5);
		commandWrapper.unmount();
	});

	it('edit path: CommandSchema.edit opens branch, defaultCommands saved with window', async () => {
		const { commandWrapper } = await mountAll();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		const branches = [makeBranch(1), makeBranch(2)];
		CommandSchema.edit(target, {
			id: 'switch',
			params: {
				variable: { type: 'local', key: 'mode' },
				branches,
				defaultCommands: [{ id: 'comment' }]
			}
		});
		expect(Window.open).toHaveBeenCalledWith('switch');
		await commandWrapper.vm.$nextTick();
		const list = getList('switch-branches');
		expect(list.read()).toHaveLength(2);
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('switch-branch');
		getList('switch-branch-conditions').write([makeCondition(8)]);
		SwitchBranch.confirm!(new Event('click'));
		await commandWrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.switch.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'mode' },
			branches: [makeBranch(1), { conditions: [makeCondition(8)], commands: [] }],
			defaultCommands: [{ id: 'comment' }]
		});
		commandWrapper.unmount();
	});

	it('save validation: empty variable or empty branches do not save', async () => {
		const { commandWrapper } = await mountAll();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.switch.customLoad!({
			variable: { type: 'local', key: '' },
			branches: [makeBranch(1)],
			defaultCommands: null
		});
		await commandWrapper.vm.$nextTick();
		Command.cases.switch.save!();
		expect(saved).not.toHaveBeenCalled();
		Command.cases.switch.customLoad!({
			variable: { type: 'local', key: 'mode' },
			branches: [],
			defaultCommands: null
		});
		await commandWrapper.vm.$nextTick();
		Command.cases.switch.save!();
		expect(saved).not.toHaveBeenCalled();
		commandWrapper.unmount();
	});

	it('windowClosed clears defaultCommands state', async () => {
		const { commandWrapper } = await mountAll();
		const { useSwitchCommandSchema } =
			await import('@app/composables/commands/useSwitchCommandSchema');
		const { windowClosed } = useSwitchCommandSchema();
		Command.cases.switch.customLoad!({
			variable: { type: 'local', key: 'mode' },
			branches: [makeBranch(1)],
			defaultCommands: [{ id: 'comment' }]
		});
		await commandWrapper.vm.$nextTick();
		windowClosed(new Event('closed'));
		await commandWrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.switch.save!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'mode' },
			branches: [makeBranch(1)],
			defaultCommands: []
		});
		commandWrapper.unmount();
	});
});
