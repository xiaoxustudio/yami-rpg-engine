import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createCommandListElement, type CommandListApiOptions, type CommandRowModel } from '../command-api';
import YMCommandList from '../YMCommandList.vue';
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

const makeList = async (data: unknown[] = []): Promise<unknown> => {
	const el = await mountCommandList<ListElement>(makeOptions());
	mockHeight(el);
	el.scroll = vi.fn();
	if (data.length > 0) el.write(data);
	return el;
};

/** `parse` 可以用 `break` 把**一条命令拆成多行**——换源时最容易被忽略的一类行 */
const makeListWithBreaks = async (data: unknown[]): Promise<unknown> => {
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
const makeListWithScript = async (data: unknown[]): Promise<unknown> => {
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

/**
 * 换源前置：**每一行都要有稳定 key**（`v-for` 的 `:key`）。空白行由 `createBlankElement` 生成，
 * 现在按"父命令 + 层级 + 所属列表下标"派生 key（见 `command-api.ts`），因此本 spec 不再排除它——
 * 下面对比的是**包括空白行在内**的完整 key 序列。
 */
const commandKeys = (keys: (string | undefined)[]): string[] =>
	keys.filter((k): k is string => k !== undefined);


/** 挂载组件并在下一拍读取行元素（换源后行由模板渲染） */
const mountCommandList = async <T extends HTMLElement>(options: CommandListApiOptions): Promise<T> => {
	const wrapper = mount(YMCommandList, { props: { options } });
	const el = wrapper.element as unknown as T & { scroll: unknown; clientHeight: number };
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true, writable: true });
	el.scroll = (): void => {};
	await nextTick();
	return el;
};

describe('YMCommandList（M3：行模型 ↔ DOM 等价）', () => {
	it('模型 key 序列与 DOM 行元素顺序逐项一致（含空白行）', async () => {
		const el = await makeList([makeCommand('a'), makeCommand('b'), makeCommand('c')]);
		const model = el.getRowModel();
		expect(model.keys.length).toBeGreaterThan(0);
		expect(commandKeys(domKeys(el))).toEqual(commandKeys(model.keys));
		// 每一行都有 key（换源后 `:key` 不会出现 undefined）
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
			if (text === '') continue; // 空白行没有内容片段
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
		// 1 条命令被拆成 2 行 + 1 条空白行 = 3 行（一行 ≠ 一条命令）
		expect(model.rows.length).toBeGreaterThanOrEqual(3);
		// 换源硬要求：每一行都要有非空 key，且互不相同（break 行此前漏了 key）
		expect(model.keys.every((k) => k.length > 0)).toBe(true);
		expect(new Set(model.keys).size).toBe(model.keys.length);
		// break 行与主行同属一条命令，key 以主行 key 为前缀
		expect(model.keys.some((k) => k.includes('-b'))).toBe(true);
	});

	/**
	 * 换源的**硬要求**：`v-for` 的每一行都要有稳定且唯一的 key。
	 * 这条刻意把**多种行种类**放在一起（普通行 / 子列表续行 / 空白行 / 嵌套），因为按种类分散写用例时，
	 * 未被覆盖的那一种就会悄悄漏掉 key —— break 行与子列表续行都曾如此（本轮两处修复）。
	 */
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

	it('多行脚本（parse 返回 script）：脚本占的每一行也都有 key', async () => {
		const el = await makeListWithScript([makeCommand('withScript')]);
		const model = el.getRowModel();
		// 脚本 3 行 + 该命令的主行 + 空白行 ⇒ 行数明显多于命令数
		expect(model.rows.length).toBeGreaterThanOrEqual(4);
		expect(model.keys.filter((k) => k.length === 0)).toEqual([]);
		expect(new Set(model.keys).size).toBe(model.keys.length);
	});
});
