import { describe, expect, it, vi } from 'vitest';
import { attachRowData, createCommandListElement, type CommandListApiOptions } from '../command-api';

/**
 * M3-5b′（为命令列表换源准备）：`attachRowData` 是**回写桥**在挂行时用的数据挂载入口。
 * 它必须与 `createCommandBuffer` 里那套闭包**语义一致**——本用例逐项核对：
 * 挂上去之后，元素上的 `dataItem`/`dataList`/`dataIndex`/`dataIndent`/`dataKey`/`dataParent`/`contents`
 * 与"api 自己建出来的行元素"读出来的一样。
 */
const makeApi = (): HTMLElement & { [k: string]: unknown } => {
	const el = createCommandListElement({
		command: {
			parse: () => [{ color: 'normal' }, { text: 'x' }],
			fetchVariables: () => [],
			insert: vi.fn(),
			edit: vi.fn(),
			parseUnlinkedId: (id: string) => id,
			colorizeCodeLines: vi.fn()
		},
		clipboard: { write: vi.fn(), read: () => [], has: () => false },
		commandHistory: class {
			save(): void {}
			restore(): void {}
			canUndo(): boolean {
				return false;
			}
			canRedo(): boolean {
				return false;
			}
		},
		localize: { language: 'zh-CN', get: (k: string) => k, createGetter: () => (k: string) => k }
	} as unknown as CommandListApiOptions) as unknown as HTMLElement & { [k: string]: unknown };
	return el;
};

interface RowElement extends HTMLElement {
	[k: string]: unknown;
	rowKey?: string;
	contents?: unknown;
	dataKey?: boolean;
	dataParent?: unknown;
	dataList?: unknown;
	dataItem?: unknown;
	dataIndex?: number;
	dataIndent?: number;
}

describe('command-api（M3-5b′：attachRowData 与建行闭包语义一致）', () => {
	const host = (): RowElement => document.createElement('div') as unknown as RowElement;

	it('挂上之后：rowKey / dataKey / dataIndex / dataIndent / dataList 都能读回', () => {
		const el = host();
		const command = { id: 'a', params: {}, commands: [] };
		const list = [command];
		attachRowData(el, {
			rowKey: 'k1',
			command,
			list,
			index: 2,
			indent: 3,
			dataKey: true,
			contents: [{ text: 'hello' }]
		});
		expect(el.rowKey).toBe('k1');
		expect(el.dataItem).toBe(command);
		expect(el.dataList).toBe(list);
		expect(el.dataIndex).toBe(2);
		expect(el.dataIndent).toBe(3);
		expect(el.dataKey).toBe(true);
		expect(el.contents).toEqual([{ text: 'hello' }]);
	});

	it('contents 是可读写的闭包（与 api 里 defineProperty 的 get/set 行为一致）', () => {
		const el = host();
		attachRowData(el, {
			rowKey: 'k',
			command: null,
			list: [],
			index: 0,
			indent: 0,
			dataKey: false
		});
		expect(el.contents).toEqual([]);
		el.contents = [{ text: 'replaced' }];
		expect(el.contents).toEqual([{ text: 'replaced' }]);
		el.contents = null;
		expect(el.contents).toBeNull();
	});

	it('给了 parent 才定义 dataParent（与建行代码的分支一致）', () => {
		const withParent = host();
		const parent = { id: 'p', params: {}, commands: [] };
		attachRowData(withParent, {
			rowKey: 'k',
			command: null,
			list: [],
			index: 0,
			indent: 1,
			dataKey: false,
			parent
		});
		expect(withParent.dataParent).toBe(parent);

		const withoutParent = host();
		attachRowData(withoutParent, {
			rowKey: 'k',
			command: null,
			list: [],
			index: 0,
			indent: 0,
			dataKey: false
		});
		expect('dataParent' in withoutParent).toBe(false);
	});

	it('与 api 自己建出来的行一致：同一份数据两边读出来的值相同', () => {
		const api = makeApi();
		Object.defineProperty(api, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(api, 'innerHeight', { value: 400, configurable: true });
		(api as unknown as { scroll: unknown }).scroll = vi.fn();
		const data = [
			{ id: 'a', params: {}, commands: [] },
			{ id: 'b', params: {}, commands: [] }
		];
		(api as unknown as { write: (d: unknown[]) => void }).write(data);
		const built = api.querySelectorAll<RowElement>('.command-item');
		expect(built.length).toBeGreaterThan(0);

		// 用 api 建出的第一行的数据，挂到一个新元素上，逐项比对
		const source = built[0];
		const copy = host();
		attachRowData(copy, {
			rowKey: source.rowKey ?? '',
			command: source.dataItem as never,
			list: source.dataList as never,
			index: source.dataIndex ?? 0,
			indent: source.dataIndent ?? 0,
			dataKey: source.dataKey === true,
			contents: source.contents as never,
			parent: null
		});
		expect(copy.rowKey).toBe(source.rowKey);
		expect(copy.dataItem).toBe(source.dataItem);
		expect(copy.dataList).toBe(source.dataList);
		expect(copy.dataIndex).toBe(source.dataIndex);
		expect(copy.dataIndent).toBe(source.dataIndent);
		expect(copy.dataKey).toBe(source.dataKey);
		expect(copy.contents).toEqual(source.contents);
	});
});
