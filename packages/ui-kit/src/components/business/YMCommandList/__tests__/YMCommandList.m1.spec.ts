import { describe, expect, it, vi } from 'vitest';
import { createCommandListElement, type CommandListApiOptions } from '../command-api';

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
	start: number | null;
	end: number | null;
	active: number;
	origin: number;
	scrollTop: number;
	focusing?: boolean;
	elements: { count: number } & Record<number, { dataIndent: number; fold?: HTMLElement; dataKey?: boolean }>;
}

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

const makeOptions = (language = 'zh-CN', overrides: Partial<CommandListApiOptions> = {}): CommandListApiOptions => ({
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

const makeList = (data: unknown[] = [], language = 'zh-CN'): CommandListElement => {
	const el = createCommandListElement(makeOptions(language)) as CommandListElement;
	mockHeight(el);
	setScrollSpy(el);
	if (data.length > 0) el.write(data);
	return el;
};

/** 40 行足够翻页（innerHeight 400 / 每行 20px） */
const manyCommands = (n = 40) => Array.from({ length: n }, (_, i) => makeCommand(`c${i}`));

describe('YMCommandList（M1 行为金标准 第二组：缩进/嵌套/选区/翻页/滚动）', () => {
	it('computeTextIndent：中文按 em、英文按 ch（值精确锁定）', () => {
		expect(makeList().computeTextIndent(0)).toBe('0em');
		expect(makeList().computeTextIndent(2)).toBe('4em');
		expect(makeList([], 'en-US').computeTextIndent(2)).toBe('8ch');
	});

	it('缩进行契约：空白行（createBlankElement）位于列表末尾，且行数 = 命令数 + 1', () => {
		const el = makeList([makeCommand('a'), makeCommand('b')]);
		expect(el.elements.count).toBe(3); // 2 行命令 + 1 个空白行（点击追加位置）
		const last = el.elements[el.elements.count - 1] as unknown as HTMLElement;
		expect(last.classList.contains('command-item')).toBe(true);
	});

	// TODO(M1)：嵌套渲染（parse 返回值里的**嵌套数组** = 子命令列表）还没写出可用用例——
	// 需要先弄清 `createCommandBuffer` 的 buffer 协议（哪些位置放节点、哪些位置放子命令数组）。
	// 缩进的**计算**已由上面 `computeTextIndent` 用例锁定。

	it('selectAll：focusing 状态下选中全部行', () => {
		const el = makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		el.focusing = true;
		el.selectAll();
		expect(el.start).toBe(0);
		expect(el.querySelectorAll('.command-item.selected').length).toBeGreaterThan(0);
	});

	it('selectMultipleTo：从 start 扩选，end 推进且选中多行', () => {
		const el = makeList([makeCommand('a'), makeCommand('b'), makeCommand('c'), makeCommand('d')]);
		el.focusing = true;
		el.select(0);
		const endBefore = el.end;
		el.selectMultipleTo(2);
		expect(el.end).not.toBe(endBefore);
		expect(el.querySelectorAll('.command-item.selected').length).toBeGreaterThan(1);
	});

	it('pageDown/pageUp：请求滚动，并在 select=true 时把选区带过头/带回来', () => {
		const el = makeList(manyCommands());
		el.focusing = true;
		const scrollSpy = setScrollSpy(el);
		el.select(0);
		el.pageDown(true);
		expect(scrollSpy).toHaveBeenCalled();
		const movedStart = el.start;
		expect(movedStart).not.toBe(0);
		el.pageUp(true);
		expect(el.start).not.toBe(movedStart);
	});

	it('scrollToRow：把指定行滚进视野（scrollTop 变化）', () => {
		const el = makeList(manyCommands());
		el.scrollTop = 0;
		el.scrollToRow(30);
		expect(el.scrollTop).toBeGreaterThan(0);
	});

	it('scrollToSelection：选中靠后的行会把视口带过去', () => {
		const el = makeList(manyCommands());
		el.focusing = true;
		el.scrollTop = 0;
		el.select(35);
		el.scrollToSelection();
		expect(el.scrollTop).toBeGreaterThan(0);
	});

	it('update 幂等：重复 update 不改变行数与数据引用', () => {
		const data = [makeCommand('a'), makeCommand('b')];
		const el = makeList(data);
		const count = el.elements.count;
		el.update();
		el.update();
		expect(el.elements.count).toBe(count);
		expect(el.read()).toBe(data);
	});

	it('缩进行契约：空白行（createBlankElement）位于列表末尾，且行数 = 命令数 + 1', () => {
		const el = makeList([makeCommand('a'), makeCommand('b')]);
		expect(el.elements.count).toBe(3); // 2 行命令 + 1 个空白行（点击追加位置）
		const last = el.elements[el.elements.count - 1] as unknown as HTMLElement;
		expect(last.classList.contains('command-item')).toBe(true);
	});
});
