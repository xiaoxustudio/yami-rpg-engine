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
	start: number | null;
	end: number | null;
	elements: { count: number };
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
 * 让列表像在真实窗口里那样有可视高度 —— 没有高度时 `resize()` 早退，行只进 `elements`
 * 不进 DOM，`isInContent()` 也恒为 false（双击合成会因此直接不触发）。
 */
const mockListBox = (list: HTMLElement, height = 102): void => {
	Object.defineProperty(list, 'clientHeight', { value: height, configurable: true });
	Object.defineProperty(list, 'clientWidth', { value: 300, configurable: true });
};

const pointer = (type: string, init: PointerEventInit): PointerEvent =>
	new PointerEvent(type, { bubbles: true, pointerId: 1, ...init });

const mountedWrappers: Array<{ unmount(): void }> = [];
const isOpen = (id: string): boolean =>
	(Window.open as unknown as { mock: { calls: unknown[][] } }).mock.calls.some(
		(call) => call[0] === id
	);

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

	/**
	 * 回归（2026-10-22 实报）：**打开"显示选项"窗口，选项列表是空的 / 双击没反应**。
	 *
	 * `customLoad` 走的是 `Object.assign(form, { choices, … })`。`form` 若没有 `choices`
	 * 访问器，`Object.assign` 只会往这个普通对象上加一个**非响应式**的自有属性 ——
	 * 值确实写进去了，但窗口模板上的 `v-model="form.choices"` 永远收不到变更，
	 * 列表一次都不会被 `write()`，于是打开窗口看到的是空列表。
	 *
	 * 断言"一次 `nextTick` 之后行就在 DOM 里"，不允许靠别的原因（比如改参数触发重渲染）
	 * 蒙混过去。
	 */
	it('customLoad 后选项列表立刻有行（v-model 必须真的到达 ParamList）', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('showChoices-choices');
		mockListBox(list);

		Command.cases.showChoices.customLoad!({
			choices: [makeChoice('Yes'), makeChoice('No')],
			parameters: ''
		});
		await commandWrapper.vm.$nextTick();

		expect(list.read()).toEqual([makeChoice('Yes'), makeChoice('No')]);
		// 两行数据 + 末尾"N items"占位行
		expect(list.querySelectorAll('.param-item')).toHaveLength(3);
	});

	it('空选项列表被聚焦后右键不崩（不留下 -1 的选中）', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('showChoices-choices');
		mockListBox(list);
		list.focus();
		await commandWrapper.vm.$nextTick();

		expect(list.start).toBe(null);
		expect(() =>
			list.dispatchEvent(
				pointer('pointerup', { button: 2, clientX: 10, clientY: 10, bubbles: true })
			)
		).not.toThrow();
	});

	it('双击选项行打开选项编辑窗口（2026-10-22 实报：双击没反应）', async () => {
		const { commandWrapper } = await mountAll();
		const list = getList('showChoices-choices');
		mockListBox(list);

		Command.cases.showChoices.customLoad!({
			choices: [makeChoice('Yes'), makeChoice('No')],
			parameters: ''
		});
		await commandWrapper.vm.$nextTick();

		const row = list.querySelectorAll('.param-item')[0] as HTMLElement;
		const coords = { clientX: 20, clientY: 10 };
		row.dispatchEvent(pointer('pointerdown', { button: 0, ...coords }));
		// window 上的 pointerup 收尾监听由 useEventListener 在 flush: 'post' 挂载
		await commandWrapper.vm.$nextTick();
		window.dispatchEvent(pointer('pointerup', { button: 0, ...coords }));
		await commandWrapper.vm.$nextTick();
		row.dispatchEvent(pointer('pointerdown', { button: 0, ...coords }));
		await commandWrapper.vm.$nextTick();

		expect(isOpen('choice')).toBe(true);
		expect(Choices.form.content).toBe('Yes');
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
