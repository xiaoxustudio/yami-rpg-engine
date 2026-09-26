import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import {
	attachRowData,
	type CommandListApiOptions,
	type CommandListElementApi
} from '../command-api';
import { elementDataOf } from '../../../../utils/element-data';
import YMCommandList from '../YMCommandList.vue';

/**
 * **钉住命令列表的行生命周期**：行元素由模板 `v-for` 产生，所以"行的清空/缓存回收/选区重置"
 * 这些**跨行的可观察行为**一旦出错，用例会直接指出是哪一类。
 *
 * 断言的语义都按**实现**写（不是按直觉）：例如 `deleteCommandBuffers` 回收的是命令对象上的
 * **渲染缓冲**（`command.buffer`），而不是行元素本身。
 */
interface ListElement extends HTMLElement {
	[k: string]: unknown;
	read: () => unknown;
	write: (data: unknown) => void;
	clear: () => HTMLElement;
	deleteCommandBuffers: (commands: unknown[]) => void;
	select: (start: number, end?: number) => void;
	elements: { count: number } & Record<number, unknown>;
}

/**
 * fold 相关回归用例要额外用到的两个 api 方法，以及与 `elements[]` 同序的**行数据源**
 * （`fold` 是 api 侧元素上是否可折叠、`dataItem` 为空即空白行）。
 */
interface FoldListElement extends ListElement {
	bindRowElement: (element: HTMLElement, index: number) => void;
	updateCommandElementFold: (element: unknown) => void;
	elements: { count: number } & Record<number, { dataItem: unknown; fold?: unknown } | undefined>;
}

/** 空白行 = `createBlankElement` 建的那行（`dataItem` 恒为 null） */
const findBlankRowIndex = (el: FoldListElement): number => {
	for (let i = 0; i < el.elements.count; i++) {
		const source = el.elements[i];
		if (source !== undefined && source.dataItem === null) return i;
	}
	return -1;
};

/**
 * 命令列表自己的状态（选区窗口 / 聚焦）走**显式元素数据**——原实现读 `HTMLElement.prototype`
 * 上的访问器；字段从 `DATA_FIELDS` 摘除后，`el.start` 这类读法会静默变成 `undefined`。
 */
interface CommandListState {
	start: number | null;
	end: number | null;
	active: number | null;
	origin: number | null;
	focusing?: boolean;
}

const listState = (el: unknown): CommandListState => elementDataOf<CommandListState>(el);

interface CommandWithBuffer {
	id: string;
	params: Record<string, unknown>;
	commands: unknown[];
	buffer?: unknown[];
}

const makeCommand = (id: string): CommandWithBuffer => ({ id, params: {}, commands: [] });

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

const items = (n: number) => Array.from({ length: n }, (_, i) => makeCommand(`c${i}`));

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

describe('YMCommandList（行生命周期与选区重置）', () => {
	it('clear：清空后行数归零、选区状态复位，且可重新写入', async () => {
		const el = await makeList(items(5));
		listState(el).focusing = true;
		el.select(1);
		await nextTick();
		expect(el.elements.count).toBeGreaterThan(1);

		el.clear();
		expect(el.elements.count).toBe(0);
		expect(listState(el).start).toBeNull();
		expect(listState(el).end).toBeNull();
		expect(listState(el).active).toBeNull();
		expect(listState(el).origin).toBeNull();

		el.write(items(2));
		await nextTick();
		expect(el.elements.count).toBeGreaterThanOrEqual(2);
	});

	it('write 会为每条命令建立渲染缓冲（command.buffer）', async () => {
		const data = items(3);
		await makeList(data);
		for (const command of data) {
			expect(Array.isArray(command.buffer)).toBe(true);
		}
	});

	it('deleteCommandBuffers：回收命令对象上的渲染缓冲（而不是行元素）', async () => {
		const data = items(3);
		const el = await makeList(data);
		const rowsBefore = el.elements.count;

		el.deleteCommandBuffers([data[1]]);

		expect(data[1].buffer).toBeUndefined(); // 缓冲被删
		expect(data[0].buffer).toBeDefined(); // 其它命令不受影响
		expect(el.elements.count).toBe(rowsBefore); // 行数不变：这是缓冲回收，不是行删除
	});

	it('重新 write 后行数与缓冲都会重建（清空→写入的往返）', async () => {
		const data = items(4);
		const el = await makeList(data);
		el.clear();
		el.write(data);
		await nextTick();
		expect(el.elements.count).toBeGreaterThanOrEqual(4);
		expect(Array.isArray(data[0].buffer)).toBe(true);
	});

	/**
	 * 回归：**空白行（列表末尾那行"插入指令"）没有 command，却可能带着 fold 把手**。
	 *
	 * 崩溃现场（2026-09-18，事件编辑器里插入指令必现）：
	 *
	 * ```
	 * TypeError: Cannot read properties of null (reading 'folded')
	 *     at updateCommandElementFold (command-api.ts)
	 *     at updateCommandElement     (command-api.ts)
	 *     at bindRowElement           (command-api.ts)
	 * ```
	 *
	 * 异常发生在 Vue 的 `:ref` 回写桥（`setRef`）里，会打断整棵子树的 patch，
	 * 紧接着连锁爆出 `Cannot set properties of null (setting '__vnode')`。
	 *
	 * 两个独立成因，各一条用例：
	 *  ① `rowOf(element).command` 的类型就是 `CommandData | null` —— **null 是合法值**
	 *     （`createBlankElement` 给空白行挂的 `dataItem` 就是 `get: () => null`），
	 *     旧代码用 `!!command!.folded` 把这个合法分支抹掉了；
	 *  ② `bindRowElement` 只添加 `fold` 把手、从不清理，而行内重建还刻意保留了
	 *     `.command-fold` 子节点 ⇒ 行元素被 Vue 复用到不可折叠的行时仍带着 `fold`。
	 */
	it('command 为 null 但带 fold 把手时，折叠更新器不得抛异常', async () => {
		const el = (await makeList(items(1))) as FoldListElement;
		const row = document.createElement('div') as HTMLElement & { fold?: HTMLElement };
		// command: null —— 与 `createBlankElement` 的 `dataItem: get: () => null` 同形
		attachRowData(row, {
			rowKey: 'blank',
			command: null,
			list: [],
			index: 0,
			indent: 0,
			dataKey: false
		});
		// 越界下标 ⇒ `rowOf` 走「rowData 取不到」的兜底分支，直接用 element.dataItem（null）
		elementDataOf<{ dataValue?: number }>(row).dataValue = 999;
		row.fold = document.createElement('span');

		expect(() => el.updateCommandElementFold(row)).not.toThrow();
	});

	it('行元素被复用到不可折叠的行（空白行）时，残留的 fold 把手必须被清掉', async () => {
		const el = (await makeList(items(1))) as FoldListElement;
		const blankIndex = findBlankRowIndex(el);
		expect(blankIndex, '应存在空白行（dataItem 为 null）').toBeGreaterThanOrEqual(0);
		expect(el.elements[blankIndex]?.fold, '空白行本身不可折叠').toBeUndefined();

		const rows = Array.from(
			el.querySelectorAll<HTMLElement & { fold?: HTMLElement }>('.command-item')
		);
		const node = rows[rows.length - 1];
		expect(node, '应至少渲染出一行').toBeTruthy();

		// 模拟「这个行元素上一轮承载的是可折叠行」：fold 把手是挂在元素上的 expando
		const stale = document.createElement('span');
		stale.className = 'command-fold';
		node.appendChild(stale);
		node.fold = stale;

		// 按空白行（`source.fold === undefined`）重绑 ⇒ 把手必须被清掉。
		// 只加不减时这里会留下 fold，后续 `updateCommandElementFold` 便去取
		// 空白行根本不存在的 command —— 正是那次崩溃。
		expect(() => el.bindRowElement(node, blankIndex)).not.toThrow();
		expect(node.fold, '复用到不可折叠的行后，fold 把手应被清除').toBeUndefined();
		expect(node.querySelector('.command-fold'), '把手对应的 DOM 也应移除').toBeNull();
	});
});
