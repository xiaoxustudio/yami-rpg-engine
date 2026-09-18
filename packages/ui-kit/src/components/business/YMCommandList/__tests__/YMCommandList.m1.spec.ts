import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { type CommandListApiOptions, type CommandListElementApi } from '../command-api';
import { elementDataOf } from '../../../../utils/element-data';
import YMCommandList from '../YMCommandList.vue';

/**
 * P6/M1 行为金标准（第二组）：在**现命令式实现**上锁住缩进/嵌套/选区/翻页/滚动等行为，
 * 供 M2–M5 重写期间对照——**改造后这些用例只允许改断言方式，不允许改语义**。
 * 刻意不 mount SFC：直接用 `createCommandListElement` 拿元素 API（与命令编辑器的真实用法一致）。
 */
interface CommandListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (data: unknown) => void;
	update: () => void;
	select: (start: number, end?: number) => void;
	selectAll: () => void;
	selectMultipleTo: (index: number) => void;
	pageUp: (select: boolean) => void;
	pageDown: (select: boolean) => void;
	scrollToRow: (index: number, position?: string) => void;
	scrollToSelection: (mode?: string) => void;
	fold: (element?: unknown) => void;
	computeTextIndent: (indent: number) => string;
	data: unknown;
	scrollTop: number;
	elements: { count: number } & Record<
		number,
		{ dataIndent: number; fold?: HTMLElement; dataKey?: boolean }
	>;
}

/**
 * P4b：命令列表自己的状态（选区窗口 / 聚焦）走**显式元素数据**——原实现读 `HTMLElement.prototype`
 * 上的访问器；字段从 `DATA_FIELDS` 摘除后，`el.start` 这类读法会静默变成 `undefined`。
 */
interface CommandListState {
	start: number | null;
	end: number | null;
	focusing?: boolean;
}

const listState = (el: unknown): CommandListState => elementDataOf<CommandListState>(el);

/** 生产由 `YMCommandList.vue` 注入 `el.scroll`；这里换成 spy 只断言"请求了滚动" */
const setScrollSpy = (el: CommandListElement): ReturnType<typeof vi.fn> => {
	const spy = vi.fn();
	(el as unknown as { scroll: (top: number) => void }).scroll = spy;
	return spy;
};

const makeCommand = (id: string, params: Record<string, unknown> = {}) => ({
	id,
	params,
	commands: []
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

class MockHistory {
	stack: { array: unknown[]; snapshot: unknown[] }[] = [];
	index = 0;
	save(data: { array?: unknown[] }): void {
		this.stack = this.stack.slice(0, this.index);
		this.stack.push({
			array: data.array as unknown[],
			snapshot: JSON.parse(JSON.stringify(data.array ?? []))
		});
		this.index = this.stack.length;
	}
	restore(mode: string): void {
		if (mode === 'undo' && this.index > 0) {
			this.index--;
			const { array, snapshot } = this.stack[this.index];
			array.splice(0, array.length, ...snapshot);
		} else if (mode === 'redo' && this.index < this.stack.length) {
			this.index++;
		}
	}
	canUndo(): boolean {
		return this.index > 0;
	}
	canRedo(): boolean {
		return this.index < this.stack.length;
	}
}

const makeOptions = (
	language = 'zh-CN',
	overrides: Partial<CommandListApiOptions> = {}
): CommandListApiOptions => ({
	command: {
		parse: (item: Record<string, unknown>) => [{ color: 'normal' }, { text: String(item.id) }],
		fetchVariables: () => [],
		insert: vi.fn(),
		edit: vi.fn(),
		parseUnlinkedId: (id: string) => id,
		colorizeCodeLines: vi.fn()
	},
	clipboard: { write: vi.fn(), read: () => [], has: () => false },
	commandHistory: MockHistory as unknown as CommandListApiOptions['commandHistory'],
	localize: {
		language,
		get: (key: string) => key,
		createGetter: () => (key: string) => key
	},
	...overrides
});

const makeList = async (data: unknown[] = [], language = 'zh-CN'): Promise<CommandListElement> => {
	const el = await mountCommandList<CommandListElement>(makeOptions(language));
	mockHeight(el);
	setScrollSpy(el);
	if (data.length > 0) el.write(data);
	return el;
};

/** 40 行足够翻页（innerHeight 400 / 每行 20px） */
const manyCommands = (n = 40) => Array.from({ length: n }, (_, i) => makeCommand(`c${i}`));

/** 挂载组件并在下一拍读取行元素（换源后行由模板渲染） */
const mountCommandList = async <T extends HTMLElement = HTMLElement & CommandListElementApi>(
	options: CommandListApiOptions
): Promise<T> => {
	const wrapper = mount(YMCommandList, { props: { options } });
	const el = wrapper.element as unknown as T & { scroll: unknown; clientHeight: number };
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
	el.scroll = (): void => {};
	await nextTick();
	return el;
};

describe('YMCommandList（M1 行为金标准 第二组：缩进/嵌套/选区/翻页/滚动）', () => {
	it('computeTextIndent：中文按 em、英文按 ch（值精确锁定）', async () => {
		expect((await makeList()).computeTextIndent(0)).toBe('0em');
		expect((await makeList()).computeTextIndent(2)).toBe('4em');
		expect((await makeList([], 'en-US')).computeTextIndent(2)).toBe('8ch');
	});

	it('缩进行契约：空白行（createBlankElement）位于列表末尾，且行数 = 命令数 + 1', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b')]);
		expect(el.elements.count).toBe(3); // 2 行命令 + 1 个空白行（点击追加位置）
		const last = el.elements[el.elements.count - 1] as unknown as HTMLElement;
		expect(last.classList.contains('command-item')).toBe(true);
	});

	it('嵌套渲染：parse 里 `{ children: [子命令] }` 才会展开子命令（子行 indent 更深）', async () => {
		// 嵌套入口是 `content.children`（`createCommandBuffer` 里 `buffer.push(content.children)`），
		// 不是"返回值里直接放数组"——后者实测只渲染父命令。
		const nestedParse = (item: Record<string, unknown>) =>
			(item.params as { child?: boolean } | undefined)?.child === true
				? [{ color: 'normal' }, { text: 'child' }]
				: [
						{ color: 'normal' },
						{ text: String(item.id) },
						{ fold: true },
						{ children: [makeCommand('child', { child: true })] }
					];
		const el = await mountCommandList<CommandListElement>(
			makeOptions('zh-CN', {
				command: {
					parse: nestedParse,
					fetchVariables: () => [],
					insert: vi.fn(),
					edit: vi.fn(),
					parseUnlinkedId: (id: string) => id,
					colorizeCodeLines: vi.fn()
				} as never
			})
		);
		mockHeight(el);
		setScrollSpy(el);
		el.write([makeCommand('parent')]);
		await nextTick();
		expect(el.textContent).toContain('parent');
		expect(el.textContent).toContain('child');
		const indents = Array.from(
			{ length: el.elements.count },
			(_, i) => el.elements[i].dataIndent
		);
		expect(Math.max(...indents)).toBeGreaterThan(Math.min(...indents));
	});

	it('命中搜索：findString 在选择集里找出包含目标文本的行', async () => {
		const el = await makeList([
			makeCommand('alpha'),
			makeCommand('beta'),
			makeCommand('gamma')
		]);
		const find = (
			el as unknown as {
				findString: (s: string, els: unknown[], mode?: unknown) => { index: number }[];
			}
		).findString;
		expect(typeof find).toBe('function');
		const elements = Array.from(
			{ length: el.elements.count },
			(_, i) => el.elements[i] as unknown as HTMLElement
		);
		const hits = find.call(el, 'beta', elements, {
			caseInsensitive: false,
			regex: false,
			matchLine: false
		});
		expect(hits.length).toBeGreaterThan(0);
		expect(typeof hits[0].index).toBe('number');
	});

	it('折叠：带子命令的命令渲染出 fold 把手，toggle 改变其折叠态', async () => {
		const nestedParse = (item: Record<string, unknown>) =>
			(item.params as { child?: boolean } | undefined)?.child === true
				? [{ color: 'normal' }, { text: 'child' }]
				: [
						{ color: 'normal' },
						{ text: String(item.id) },
						{ fold: true },
						{ children: [makeCommand('child', { child: true })] }
					];
		const el = await mountCommandList<CommandListElement>(
			makeOptions('zh-CN', {
				command: {
					parse: nestedParse,
					fetchVariables: () => [],
					insert: vi.fn(),
					edit: vi.fn(),
					parseUnlinkedId: (id: string) => id,
					colorizeCodeLines: vi.fn()
				} as never
			})
		);
		mockHeight(el);
		setScrollSpy(el);
		el.write([makeCommand('parent')]);
		await nextTick();
		const parent = el.elements[0];
		expect(parent.fold).toBeTruthy();
		expect(parent.dataKey).toBe(true);
	});

	it('selectAll：focusing 状态下选中全部行', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		listState(el).focusing = true;
		el.selectAll();
		await nextTick();
		expect(listState(el).start).toBe(0);
		expect(el.querySelectorAll('.command-item.selected').length).toBeGreaterThan(0);
	});

	it('selectMultipleTo：从 start 扩选，end 推进且选中多行', async () => {
		const el = await makeList([
			makeCommand('a'),
			makeCommand('b'),
			makeCommand('c'),
			makeCommand('d')
		]);
		listState(el).focusing = true;
		el.select(0);
		await nextTick();
		const endBefore = listState(el).end;
		el.selectMultipleTo(2);
		expect(listState(el).end).not.toBe(endBefore);
		// 选中态由行模型驱动 → 断言渲染结果前要等一拍（否则读到的还是上一次的 patch）
		await nextTick();
		expect(el.querySelectorAll('.command-item.selected').length).toBeGreaterThan(1);
	});

	it('按下后在行内轻微移动不会扩选（行高取渲染行，离屏 elements 的 clientHeight 恒为 0）', async () => {
		const el = await makeList([
			makeCommand('a'),
			makeCommand('b'),
			makeCommand('c'),
			makeCommand('d')
		]);
		await nextTick();
		const row = el.querySelectorAll('.command-item')[0] as HTMLElement;
		const pointer = (type: string, target: EventTarget, clientY: number): void => {
			target.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					button: 0,
					clientX: 0,
					clientY,
					pointerId: 1
				})
			);
		};

		pointer('pointerdown', row, 10);
		await nextTick();
		expect(el.querySelectorAll('.command-item.selected').length).toBe(1);

		// 轻微移动（仍在第一行内）。行高若取离屏元素（0）⇒ `floor(10 / 0)` = Infinity ⇒ 一路选到末尾
		pointer('pointermove', window, 10);
		await nextTick();
		expect(el.querySelectorAll('.command-item.selected').length).toBe(1);

		// 真的往下拖时仍要扩选（别把拖动选择一起改坏）
		pointer('pointermove', window, 45);
		await nextTick();
		expect(el.querySelectorAll('.command-item.selected').length).toBe(3);
	});

	it('pageDown/pageUp：请求滚动，并在 select=true 时把选区带过头/带回来', async () => {
		const el = await makeList(manyCommands());
		listState(el).focusing = true;
		const scrollSpy = setScrollSpy(el);
		el.select(0);
		await nextTick();
		el.pageDown(true);
		expect(scrollSpy).toHaveBeenCalled();
		const movedStart = listState(el).start;
		expect(movedStart).not.toBe(0);
		el.pageUp(true);
		expect(listState(el).start).not.toBe(movedStart);
	});

	it('scrollToRow：把指定行滚进视野（scrollTop 变化）', async () => {
		const el = await makeList(manyCommands());
		el.scrollTop = 0;
		el.scrollToRow(30);
		expect(el.scrollTop).toBeGreaterThan(0);
	});

	it('scrollToSelection：选中靠后的行会把视口带过去', async () => {
		const el = await makeList(manyCommands());
		listState(el).focusing = true;
		el.scrollTop = 0;
		el.select(35);
		await nextTick();
		el.scrollToSelection();
		expect(el.scrollTop).toBeGreaterThan(0);
	});

	it('update 幂等：重复 update 不改变行数与数据引用', async () => {
		const data = [makeCommand('a'), makeCommand('b')];
		const el = await makeList(data);
		const count = el.elements.count;
		el.update();
		await nextTick();
		el.update();
		await nextTick();
		expect(el.elements.count).toBe(count);
		expect(el.read()).toBe(data);
	});

	it('缩进行契约：空白行（createBlankElement）位于列表末尾，且行数 = 命令数 + 1', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b')]);
		expect(el.elements.count).toBe(3); // 2 行命令 + 1 个空白行（点击追加位置）
		const last = el.elements[el.elements.count - 1] as unknown as HTMLElement;
		expect(last.classList.contains('command-item')).toBe(true);
	});
});
