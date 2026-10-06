import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ShowChoicesCommandWindow from '@app/components/commands/ShowChoices.vue';
import ChoiceWindow from '@app/components/tools/Choice.vue';
import { useChoicesSchema } from '@app/composables/useChoicesSchema';

const Choices = useChoicesSchema();
import { useShowChoicesCommandSchema } from '@app/composables/commands/useShowChoicesCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/composables/useCommandColor.ts', () => ({
	setNumberColor: (value: unknown) => `[num:${String(value)}]`
}));

vi.mock('@app/composables/useCommandParse.ts', () => ({
	parseVariableTag: (value: unknown) => `<tag:${String(value)}>`,
	removeTextTags: (value: string) => value
}));

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({ global: { t: (key: string) => key } })
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

const makeChoice = (content: string) => ({ content, commands: [] });

/**
 * 本文件挂载的真实窗口：用例只 unmount 了 commandWrapper，其余会在 beforeEach 里被
 * `document.body.innerHTML = ''` 摘掉但**组件仍处于挂载态**——它们随后任何一次重渲染都会
 * 重新登记自己的元素，把共享注册表覆盖成已脱离文档的旧节点（模块改读 `composableEls`，
 * 这条泄漏会直接表现为"读到旧数据"）。故统一在 afterEach 里卸载。
 */
const mountedWrappers: Array<{ unmount(): void }> = [];

describe('useShowChoicesCommandSchema (showChoices choice rows + insert/edit/save paths)', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Command.setNumberColor = ((value: unknown) => `[num:${String(value)}]`) as never;
		Command.parseVariableTag = ((value: unknown) => `<tag:${String(value)}>`) as never;
		Command.removeTextTags = ((value: string) => value) as never;
		Choices.target = null;
		Choices.commands = null;
		useShowChoicesCommandSchema().form.choices = undefined;
	});

	afterEach(() => {
		while (mountedWrappers.length > 0) mountedWrappers.pop()!.unmount();
	});

	const mountAll = async () => {
		const commandWrapper = mount(ShowChoicesCommandWindow, { attachTo: document.body });
		const choiceWrapper = mount(ChoiceWindow, { attachTo: document.body });
		await commandWrapper.vm.$nextTick();
		await choiceWrapper.vm.$nextTick();
		getList('showChoices-choices').bind(Choices);
		const wrappers = { commandWrapper, choiceWrapper };
		mountedWrappers.push(...Object.values(wrappers));
		return wrappers;
	};

	it('customLoad writes choice rows and parameters, read/remove/swap keep order', async () => {
		const { commandWrapper } = await mountAll();
		Command.cases.showChoices.customLoad!({
			choices: [makeChoice('Yes'), makeChoice('No'), makeChoice('Maybe')],
			parameters: 'p1, p2'
		});
		await commandWrapper.vm.$nextTick();
		const list = getList('showChoices-choices');
		const readBack = (): unknown[] => list.read()!;
		expect(readBack()).toHaveLength(3);
		expect(getControl('showChoices-parameters').read()).toBe('p1, p2');
		list.select(1);
		list.delete();
		expect(readBack()).toHaveLength(2);
		expect(readBack()[0]).toEqual(makeChoice('Yes'));
		expect(readBack()[1]).toEqual(makeChoice('Maybe'));
		const data = readBack() as Array<{ content: string }>;
		data.push(data.shift()!);
		list.update();
		expect(readBack()[0]).toEqual(makeChoice('Maybe'));
		expect(readBack()[1]).toEqual(makeChoice('Yes'));
		commandWrapper.unmount();
	});

	it('insert path: CommandSchema.insert opens showChoices with defaults, new choice saved via choice window', async () => {
		const { commandWrapper } = await mountAll();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		CommandSchema.insert(target, 'showChoices');
		expect(Window.open).toHaveBeenCalledWith('showChoices');
		await commandWrapper.vm.$nextTick();
		const list = getList('showChoices-choices');
		expect(list.read()).toHaveLength(2);
		expect(list.read()).toEqual([makeChoice('showChoices.yes'), makeChoice('showChoices.no')]);
		list.select(0);
		list.insert();
		expect(Window.open).toHaveBeenCalledWith('choice');
		Choices.form.content = 'Surprise';
		Choices.confirm!(new Event('click'));
		const data = list.read() as Array<{ content: string }>;
		expect(data).toHaveLength(3);
		expect(data[0].content).toBe('Surprise');
		expect(Window.close).toHaveBeenCalledWith('choice');
		commandWrapper.unmount();
	});

	it('edit path: CommandSchema.edit opens existing choice, parameters saved with window', async () => {
		const { commandWrapper } = await mountAll();
		const target = {
			scrollAndResize: vi.fn(),
			getSelectionPosition: () => ({ x: 100, y: 100 }),
			save: vi.fn()
		};
		const choices = [makeChoice('Yes'), makeChoice('No')];
		CommandSchema.edit(target, {
			id: 'showChoices',
			params: { choices, parameters: 'p1' }
		});
		expect(Window.open).toHaveBeenCalledWith('showChoices');
		await commandWrapper.vm.$nextTick();
		const list = getList('showChoices-choices');
		list.select(1);
		list.edit();
		expect(Window.open).toHaveBeenCalledWith('choice');
		Choices.form.content = 'Nope';
		Choices.confirm!(new Event('click'));
		await commandWrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.showChoices.save!();
		expect(saved).toHaveBeenCalledWith({
			choices: [makeChoice('Yes'), makeChoice('Nope')],
			parameters: 'p1'
		});
		commandWrapper.unmount();
	});

	it('save validation: empty choice list does not save', async () => {
		const { commandWrapper } = await mountAll();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.showChoices.customLoad!({ choices: [], parameters: '' });
		await commandWrapper.vm.$nextTick();
		Command.cases.showChoices.save!();
		expect(saved).not.toHaveBeenCalled();
		commandWrapper.unmount();
	});

	it('windowClosed runs without breaking the next load/save cycle', async () => {
		const { commandWrapper } = await mountAll();
		const { useShowChoicesCommandSchema } =
			await import('@app/composables/commands/useShowChoicesCommandSchema');
		const { windowClosed } = useShowChoicesCommandSchema();
		Command.cases.showChoices.customLoad!({ choices: [makeChoice('Yes')], parameters: '' });
		await commandWrapper.vm.$nextTick();
		windowClosed(new Event('closed'));
		await commandWrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.showChoices.customLoad!({
			choices: [makeChoice('Yes'), makeChoice('No')],
			parameters: ''
		});
		await commandWrapper.vm.$nextTick();
		Command.cases.showChoices.save!();
		expect(saved).toHaveBeenCalledWith({
			choices: [makeChoice('Yes'), makeChoice('No')],
			parameters: ''
		});
		commandWrapper.unmount();
	});
});
