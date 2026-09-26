import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { attachRowData, type CommandListApiOptions } from '../command-api';
import YMCommandList from '../YMCommandList.vue';
import { elementDataOf } from '../../../../utils/element-data';

/**
 * `attachRowData` 是**回写桥**在挂行时用的数据挂载入口。
 * 它必须与 `createCommandBuffer` 里那套闭包**语义一致**——本用例逐项核对：
 * 挂上去之后，元素上的 `dataItem`/`dataList`/`dataIndex`/`dataIndent`/`dataKey`/`dataParent`/`contents`
 * 与"api 自己建出来的行元素"读出来的一样。
 *
 * 换源后行元素归模板渲染，因此"api 自己建出来的行"必须通过**挂载组件**取得（api 侧行元素已不进 DOM）。
 */
const makeApi = async (): Promise<HTMLElement & { [k: string]: unknown }> => {
	const options = {
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
	} as unknown as CommandListApiOptions;
	const wrapper = mount(YMCommandList, { props: { options } });
	const el = wrapper.element as unknown as HTMLElement & { [k: string]: unknown };
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	(el as unknown as { scroll: unknown }).scroll = (): void => {};
	await nextTick();
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

describe('command-api（attachRowData 与建行闭包语义一致）', () => {
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

	it('与 api 自己建出来的行一致：同一份数据两边读出来的值相同', async () => {
		const api = await makeApi();
		const data = [
			{ id: 'a', params: {}, commands: [] },
			{ id: 'b', params: {}, commands: [] }
		];
		(api as unknown as { write: (d: unknown[]) => void }).write(data);
		await nextTick();
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

	/**
	 * 回归：`bindRowElement` 必须**先写行下标**再谈其它。
	 *
	 * 行下标（元素数据 `dataValue`）是 `rowOf()`（选区、双击编辑）和 editor 的
	 * `getSelectionPosition()`（指令窗口定位）的唯一依据。旧写法在行数据暂时缺失时
	 * 直接 `return`，整行没有下标 ⇒ `getSelectionPosition()` 返回 null ⇒
	 * `CommandSchema` 的 `if (point)` 把"双击编辑"整条链路静默吞掉（双击没反应）。
	 */
	it('行数据缺失时也写 dataValue（双击编辑的定位依赖它）', async () => {
		const api = await makeApi();
		const el = api as unknown as {
			bindRowElement: (element: HTMLElement, index: number) => void;
			write: (d: unknown[]) => void;
			elements: { count: number };
		};
		el.write([{ id: 'a', params: {}, commands: [] }]);
		await nextTick();
		const row = api.querySelector<RowElement>('.command-item')!;
		// 越界下标：模型里没有这一行（源元素/行数据都取不到）
		el.bindRowElement(row, 99);
		expect(elementDataOf<{ dataValue?: number }>(row).dataValue).toBe(99);
	});
});
