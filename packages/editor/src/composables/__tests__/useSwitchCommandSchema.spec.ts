import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import SwitchCommandWindow from '@app/components/commands/Switch.vue';
import SwitchBranchWindow from '@app/components/tools/SwitchBranch.vue';
import SwitchConditionWindow from '@app/components/tools/SwitchCondition.vue';
import { SwitchBranch } from '@/command/match-branch-window.ts';
import { SwitchCondition } from '@/command/match-condition-window.ts';
import { Command } from '@/command/command-object.ts';
import { CommandSchema } from '@/module/command/schema.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Window } from '@/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

vi.mock('@/tools/localization.ts', () => ({
	Local: { get: () => '' }
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

describe('useSwitchCommandSchema (switch command window dynamic rows + insert/edit/save paths)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Window.open = vi.fn();
		Window.close = vi.fn();
		Command.setNumberColor = ((value: unknown) => `[num:${value}]`) as never;
		Command.setStringColor = ((value: unknown) => `[str:${value}]`) as never;
		Command.setBooleanColor = ((value: unknown) => `[bool:${value}]`) as never;
		Command.setOperatorColor = ((value: unknown) => `[op:${value}]`) as never;
		Command.setDelimiterColor = ((value: unknown) => `[dl:${value}]`) as never;
		Command.removeTextTags = ((value: string) => value) as never;
		Command.parseVariable = ((variable: { key: string }, type: string) =>
			`<var:${variable.key}:${type}>`) as never;
		Command.words = {
			push: (value: string) => words.push(value),
			join: (separator?: string) => words.join(separator ?? '')
		} as never;
		words.length = 0;
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
		getControl('switch-condition-number-value').write(5);
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
		const list = getList('switch-branches');
		expect(list.read()).toHaveLength(2);
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('switch-branch');
		getList('switch-branch-conditions').write([makeCondition(8)]);
		SwitchBranch.confirm!(new Event('click'));
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
