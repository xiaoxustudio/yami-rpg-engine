import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
	type CommandListApiOptions,
	type CommandRowModel,
	type CommandListElementApi
} from '../command-api';
import YMCommandList from '../YMCommandList.vue';
import { rowKeyOf } from '../command-render';

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
			parse: (item: Record<string, unknown>) => [
				{ color: 'normal' },
				{ text: String(item.id) }
			],
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

const makeList = async (data: unknown[] = []): Promise<ListElement> => {
	const el = await mountCommandList<ListElement>(makeOptions());
	mockHeight(el);
	el.scroll = vi.fn();
	if (data.length > 0) el.write(data);
	return el;
};

/** `parse` 可以用 `break` 把一条命令拆成多行。 */
const makeListWithBreaks = async (data: unknown[]): Promise<ListElement> => {
	const options = makeOptions() as unknown as { command: Record<string, unknown> };
	options.command.parse = () => [
		{ color: 'normal' },
		{ text: 'first' },
		{ break: true },
		{ color: 'normal' },
		{ text: 'second' }
	];
	const el = await mountCommandList<ListElement>(options as unknown as CommandListApiOptions);
	mockHeight(el);
	el.scroll = vi.fn();
	el.write(data);
	await nextTick();
	return el;
};

/** `parse` 可以返回 `script`：多行脚本会占**多行**（每行一个行元素），同样要有 key */
const makeListWithScript = async (data: unknown[]): Promise<ListElement> => {
	const options = makeOptions() as unknown as { command: Record<string, unknown> };
	options.command.parse = () => [{ color: 'normal' }, { script: 'line1 \n line2 \n line3' }];
	const el = await mountCommandList<ListElement>(options as unknown as CommandListApiOptions);
	mockHeight(el);
	el.scroll = vi.fn();
	el.write(data);
	await nextTick();
	return el;
};

const domKeys = (el: ListElement): (string | undefined)[] =>
	Array.from(el.querySelectorAll<HTMLElement & { rowKey?: string }>('.command-item')).map(
		(row) => row.rowKey
	);

/** 每一行都要有稳定 key，空白行按「所属列表 + 层级 + 列表下标」派生。 */
const commandKeys = (keys: (string | undefined)[]): string[] =>
	keys.filter((k): k is string => k !== undefined);

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

describe('YMCommandList（行模型 ↔ DOM 等价）', () => {
	it('模型 key 序列与 DOM 行元素顺序逐项一致（含空白行）', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		const model = el.getRowModel();
		expect(model.keys.length).toBeGreaterThan(0);
		expect(commandKeys(domKeys(el))).toEqual(commandKeys(model.keys));
		expect(domKeys(el).every((k) => typeof k === 'string' && k.length > 0)).toBe(true);
	});

	it('所有行 key 在列表内唯一（`v-for` 的硬要求）', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		const keys = el.getRowModel().keys;
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('模型 key 等于派生层给该命令发的 key', async () => {
		const data = [makeCommand('a'), makeCommand('b')];
		const el = await makeList(data);
		const model = el.getRowModel();
		expect(model.keys[0]).toBe(rowKeyOf(data[0]));
		expect(model.keys[1]).toBe(rowKeyOf(data[1]));
	});

	it('模型带出缩进与 dataKey（行契约的另外两列）', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b')]);
		const model = el.getRowModel();
		expect(model.rows.every((row) => row.indent === 0)).toBe(true);
		expect(model.rows.filter((row) => row.dataKey).length).toBeGreaterThan(0);
	});

	it('模型带出行内容片段（contents）：拼起来与行内文本一致', async () => {
		const el = await makeList([makeCommand('showText'), makeCommand('moveActor')]);
		const model = el.getRowModel();
		const rows = Array.from(el.querySelectorAll<HTMLElement>('.command-item'));
		for (let i = 0; i < model.rows.length; i++) {
			const contents = model.rows[i].contents;
			const text = contents
				.map((c) => c.text ?? '')
				.join('')
				.replace(/\s+/g, '');
			if (text === '') continue;
			const domText = (rows[i]?.textContent ?? '').replace(/\s+/g, '');
			expect(domText).toContain(text);
		}
	});

	it('重复 update 后模型与 DOM 仍然一致（key 稳定）', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b')]);
		const before = el.getRowModel().keys;
		el.update();
		await nextTick();
		expect(el.getRowModel().keys).toEqual(before);
		expect(commandKeys(domKeys(el))).toEqual(commandKeys(before));
	});

	it('getRowModel 返回副本：改它不影响内部状态', async () => {
		const el = await makeList([makeCommand('a')]);
		const first = el.getRowModel();
		first.keys.push('injected');
		first.rows[0].indent = 99;
		const second = el.getRowModel();
		expect(second.keys).not.toContain('injected');
		expect(second.rows[0].indent).not.toBe(99);
	});

	it('parse 用 break 把一条命令拆成多行时：行数多于命令数，且**每行都有 key**（含 break 行）', async () => {
		const el = await makeListWithBreaks([makeCommand('split')]);
		const model = el.getRowModel();
		expect(model.rows.length).toBeGreaterThanOrEqual(3);
		expect(model.keys.every((k) => k.length > 0)).toBe(true);
		expect(new Set(model.keys).size).toBe(model.keys.length);
		expect(model.keys.some((k) => k.includes('-b'))).toBe(true);
	});

	it('多种行种类混在一起时：每一行都有非空且唯一的 key', async () => {
		const child = makeCommand('child');
		(child as unknown as { commands: unknown[] }).commands = [makeCommand('grandchild')];
		const parent = makeCommand('nested');
		(parent as unknown as { commands: unknown[] }).commands = [child];
		const el = await makeList([makeCommand('plain'), parent, makeCommand('last')]);
		const model = el.getRowModel();
		expect(model.rows.length).toBeGreaterThan(3);
		expect(model.keys.filter((k) => k.length === 0)).toEqual([]);
		expect(new Set(model.keys).size).toBe(model.keys.length);
		expect(domKeys(el).every((k) => typeof k === 'string' && k.length > 0)).toBe(true);
	});

	it('同一命令的多个子列表（if 多分支）：空白行的 key 互不相同', async () => {
		const options = makeOptions() as unknown as { command: Record<string, unknown> };
		options.command.parse = (item: Record<string, unknown>) =>
			item.id === 'if'
				? [
						{ fold: true },
						{ color: 'flow' },
						{ children: [makeCommand('branchA')] },
						{ color: 'flow' },
						{ children: [makeCommand('branchB')] }
					]
				: [{ color: 'normal' }, { text: String(item.id) }];
		const el = await mountCommandList<ListElement>(options as unknown as CommandListApiOptions);
		mockHeight(el);
		el.scroll = vi.fn();
		el.write([makeCommand('if')]);
		await nextTick();
		const model = el.getRowModel();
		expect(model.rows.length).toBeGreaterThanOrEqual(5);
		expect(model.keys.filter((k) => k.length === 0)).toEqual([]);
		expect(new Set(model.keys).size).toBe(model.keys.length);
	});

	it('多行脚本（parse 返回 script）：脚本占的每一行也都有 key', async () => {
		const el = await makeListWithScript([makeCommand('withScript')]);
		const model = el.getRowModel();
		expect(model.rows.length).toBeGreaterThanOrEqual(4);
		expect(model.keys.filter((k) => k.length === 0)).toEqual([]);
		expect(new Set(model.keys).size).toBe(model.keys.length);
	});
});
