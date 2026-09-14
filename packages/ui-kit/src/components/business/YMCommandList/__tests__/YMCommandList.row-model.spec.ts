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
 * 换源前置：**每一行都要有稳定 key**（`v-for` 的 `:key`）。空白行由 `createBlankElement` 生成，
 * 现在按"父命令 + 层级 + 所属列表下标"派生 key（见 `command-api.ts`），因此本 spec 不再排除它——
 * 下面对比的是**包括空白行在内**的完整 key 序列。
 */
const commandKeys = (keys: (string | undefined)[]): string[] =>
	keys.filter((k): k is string => k !== undefined);

describe('YMCommandList（M3：行模型 ↔ DOM 等价）', () => {
	it('模型 key 序列与 DOM 行元素顺序逐项一致（含空白行）', () => {
		const el = makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		const model = el.getRowModel();
		expect(model.keys.length).toBeGreaterThan(0);
		expect(commandKeys(domKeys(el))).toEqual(commandKeys(model.keys));
		// 每一行都有 key（换源后 `:key` 不会出现 undefined）
		expect(domKeys(el).every((k) => typeof k === 'string' && k.length > 0)).toBe(true);
	});

	it('所有行 key 在列表内唯一（`v-for` 的硬要求）', () => {
		const el = makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		const keys = el.getRowModel().keys;
		expect(new Set(keys).size).toBe(keys.length);
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

	it('模型带出行内容片段（contents）：拼起来与行内文本一致', () => {
		const el = makeList([makeCommand('showText'), makeCommand('moveActor')]);
		const model = el.getRowModel();
		const rows = Array.from(el.querySelectorAll<HTMLElement>('.command-item'));
		for (let i = 0; i < model.rows.length; i++) {
			const contents = model.rows[i].contents;
			const text = contents
				.map((c) => c.text ?? '')
				.join('')
				.replace(/\s+/g, '');
			if (text === '') continue; // 空白行没有内容片段
			const domText = (rows[i]?.textContent ?? '').replace(/\s+/g, '');
			expect(domText).toContain(text);
		}
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
