import { describe, expect, it, vi } from 'vitest';
import { createCommandListElement, type CommandListApiOptions, type CommandRowModel } from '../command-api';
import { rowKeyOf } from '../command-render';

/**
 * P6/M3（命令列表）：**行模型 ↔ DOM 等价**。
 *
 * 与文件 body 的 `row-model.spec.ts` 同形、同一个目的：换源（模板 `v-for`）之前，
 * 先证明"行序列"这件事有可对照的真值——顺序、key、缩进、折叠、选中态逐项一致。
 */
interface ListElement extends HTMLElement {
	[k: string]: unknown;
	write: (data: unknown[]) => void;
	update: () => void;
	select: (start: number, end?: number) => void;
	focusing?: boolean;
	elements: { count: number } & Record<number, { rowKey?: string; fold?: unknown }>;
	getRowModel: () => CommandRowModel;
}

interface CommandData {
	id: string;
	params: Record<string, unknown>;
	commands: CommandData[];
	folded?: boolean;
}

const makeCommand = (id: string, extra: Partial<CommandData> = {}): CommandData => ({
	id,
	params: {},
	commands: [],
	...extra
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

class MockHistory {
	save(): void {}
	restore(): void {}
	canUndo(): boolean {
		return false;
	}
	canRedo(): boolean {
		return false;
	}
}

const makeOptions = (): CommandListApiOptions =>
	({
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
		localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
	}) as unknown as CommandListApiOptions;

const makeList = (data: unknown[] = []): ListElement => {
	const el = createCommandListElement(makeOptions()) as ListElement;
	mockHeight(el);
	el.scroll = vi.fn();
	if (data.length > 0) el.write(data);
	return el;
};

const domKeys = (el: ListElement): (string | undefined)[] =>
	Array.from(el.querySelectorAll<HTMLElement & { rowKey?: string }>('.command-item')).map(
		(row) => row.rowKey
	);

/**
 * 只比较**命令行**的 key：每层列表末尾还有一个由 `createBlankElement` 生成的空白行，
 * 它目前**没有 `rowKey`**（`createBlankElement` 不写 key）——这正是换源前必须补上的一项，
 * 已记入 `docs/monolith-render-plan.md` 的 TODO（`v-for` 的每一行都需要稳定 key）。
 */
const commandKeys = (keys: (string | undefined)[]): string[] =>
	keys.filter((k): k is string => k !== undefined && k !== '');

describe('YMCommandList（M3：行模型 ↔ DOM 等价）', () => {
	it('模型 key 序列与 DOM 行元素顺序逐项一致（空白行除外，见上方 TODO）', () => {
		const el = makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		const model = el.getRowModel();
		expect(model.keys.length).toBeGreaterThan(0);
		expect(commandKeys(domKeys(el))).toEqual(commandKeys(model.keys));
	});

	it('模型 key 等于派生层给该命令发的 key', () => {
		const data = [makeCommand('a'), makeCommand('b')];
		const el = makeList(data);
		const model = el.getRowModel();
		expect(model.keys[0]).toBe(rowKeyOf(data[0]));
		expect(model.keys[1]).toBe(rowKeyOf(data[1]));
	});

	it('模型带出缩进与 dataKey（行契约的另外两列）', () => {
		const el = makeList([makeCommand('a'), makeCommand('b')]);
		const model = el.getRowModel();
		expect(model.rows.every((row) => row.indent === 0)).toBe(true);
		expect(model.rows.filter((row) => row.dataKey).length).toBeGreaterThan(0);
	});

	it('重复 update 后模型与 DOM 仍然一致（key 稳定）', () => {
		const el = makeList([makeCommand('a'), makeCommand('b')]);
		const before = el.getRowModel().keys;
		el.update();
		expect(el.getRowModel().keys).toEqual(before);
		expect(commandKeys(domKeys(el))).toEqual(commandKeys(before));
	});

	it('getRowModel 返回副本：改它不影响内部状态', () => {
		const el = makeList([makeCommand('a')]);
		const first = el.getRowModel();
		first.keys.push('injected');
		first.rows[0].indent = 99;
		const second = el.getRowModel();
		expect(second.keys).not.toContain('injected');
		expect(second.rows[0].indent).not.toBe(99);
	});
});
