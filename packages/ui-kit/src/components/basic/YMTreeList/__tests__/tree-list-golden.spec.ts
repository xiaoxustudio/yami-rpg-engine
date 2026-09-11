import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';
import { treeListStatics } from '../tree-api';

/**
 * docs/tree-list-vfor-plan.md 步骤 1 的金标准测试补充（2026-09-09）。
 * 全部用例在「当前命令式渲染实现」上录制，只断言对外行为/数据/DOM 语义，
 * 供将来 v-for 化（步骤 2+）双路径共用；改动实现时不得改动断言语义。
 */

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

interface TreeData {
	id: string;
	name: string;
	class: string;
	expanded?: boolean;
	parent?: TreeData | null;
	element?: HTMLElement;
	children?: TreeData[];
}

interface TreeListElement extends HTMLElement {
	[k: string]: unknown;
	bind: (fn: () => TreeData[]) => void;
	update: () => void;
	read: () => TreeData | null;
	select: (item: TreeData) => void;
	unselect: (item?: TreeData) => void;
	unselectIn: (item: TreeData) => void;
	deleteNode: (item: TreeData) => void;
	duplicate: (item: TreeData) => void;
	refresh: () => void;
	restore: (operation: string, response: unknown) => void;
	rename: (item: TreeData) => void;
	scrollToSelection: (mode?: string) => void;
	expandSelection: () => void;
	on: (name: string, cb: (e: Event & { value: unknown }) => void) => void;
	removable: boolean;
	lockDirectory: boolean;
	renamable: boolean;
	display: string;
	dragging:
		| null
		| (MouseEvent & { target: HTMLElement; hint: HTMLElement & { [k: string]: unknown } });
	root: TreeData | null;
	elements: { count: number; start: number; end: number } & { [i: number]: HTMLElement };
}

const makeDataTransfer = (): DataTransfer => {
	return {
		dropEffect: 'none',
		effectAllowed: 'all',
		setDragImage: () => {}
	} as unknown as DataTransfer;
};

const fireMouse = (target: HTMLElement, type: string, init: Record<string, unknown>): void => {
	const event = new MouseEvent(type, { bubbles: true, cancelable: true });
	for (const key of Object.keys(init)) {
		Object.defineProperty(event, key, { value: init[key], configurable: true });
	}
	target.dispatchEvent(event);
};

const fireKey = (target: HTMLElement, init: Record<string, unknown>): void => {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
	for (const key of Object.keys(init)) {
		Object.defineProperty(event, key, { value: init[key], configurable: true });
	}
	target.dispatchEvent(event);
};

const mountList = async (
	data: TreeData[]
): Promise<{ wrapper: ReturnType<typeof mount>; el: TreeListElement }> => {
	const wrapper = mount(YMTreeList, { attachTo: document.body });
	const el = wrapper.element as unknown as TreeListElement;
	mockHeight(el);
	el.bind(() => data);
	await nextTick();
	el.update();
	await nextTick();
	return { wrapper, el };
};

/** folder + 2 子项 + 顶层 file，与 tree-list-interactions 基线数据一致 */
const makeData = (): TreeData[] => [
	{
		id: 'folder1',
		name: 'Folder',
		class: 'folder',
		expanded: true,
		children: [
			{ id: 'child1', name: 'Child 1', class: 'file' },
			{ id: 'child2', name: 'Child 2', class: 'file' }
		]
	},
	{ id: 'item1', name: 'Item 1', class: 'file' }
];

const makeFlatData = (count: number): TreeData[] =>
	Array.from({ length: count }, (_v, i) => ({
		id: `n${i}`,
		name: `Node ${i}`,
		class: 'file'
	}));

/** 行 element 上的 textNode 为 tree-api 内部契约字段（NodeElement），经 HTMLElement 读需收窄 */
const textOf = (el: HTMLElement | undefined): string | null =>
	(el as unknown as { textNode?: Text | null }).textNode?.nodeValue ?? null;

describe('YMTreeList 拖拽取消收尾（金标准）', () => {
	it('dragstart 后直接 dragend：dragging/hint/监听全部复位', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		el.removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(data[1].element!, 'dragstart', { dataTransfer: makeDataTransfer() });
		expect(el.dragging).not.toBe(null);
		const hint = el.dragging!.hint;
		expect(el.classList.contains('dragging')).toBe(true);
		fireMouse(el, 'dragend', {});
		expect(el.dragging).toBe(null);
		expect(el.classList.contains('dragging')).toBe(false);
		expect(hint.parentNode).toBe(null);
		expect(el.classList.contains('dragenter')).toBe(false);
		wrapper.unmount();
	});

	it('dragover 进入目标后 dragend：目标 hint class 与拖拽残留清除', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		el.removable = true;
		el.select(data[1]);
		await nextTick();
		fireMouse(data[1].element!, 'dragstart', { dataTransfer: makeDataTransfer() });
		const folder = data[0].element!;
		fireMouse(folder, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 8 });
		expect(folder.classList.contains('hint')).toBe(true);
		fireMouse(el, 'dragend', {});
		expect(folder.classList.contains('hint')).toBe(false);
		expect(el.dragging).toBe(null);
		expect(el.querySelector('.drag-and-drop-hint')).toBe(null);
		wrapper.unmount();
	});
});

describe('YMTreeList 键盘 F2 重命名全链路（金标准）', () => {
	it('F2 进入重命名、提交改名并派发 rename record', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		el.renamable = true;
		el.focus();
		const records: unknown[] = [];
		el.on('record', (e: Event & { value: unknown }) => records.push(e.value));
		el.select(data[1]);
		await nextTick();
		fireKey(el, { code: 'F2' });
		const textBox = treeListStatics.textBox;
		expect(textBox.parentNode).toBe(data[1].element);
		textBox.write('Renamed F2');
		textBox.input.blur();
		await new Promise((r) => setTimeout(r, 10));
		expect(data[1].name).toBe('Renamed F2');
		expect(textOf(data[1].element)).toBe('Renamed F2');
		expect(records).toHaveLength(1);
		expect(records[0]).toMatchObject({
			type: 'rename',
			item: data[1],
			oldValue: 'Item 1',
			newValue: 'Renamed F2'
		});
		expect(textBox.parentNode).toBe(null);
		wrapper.unmount();
	});

	it('F2 需列表聚焦且 renamable：未聚焦不进入重命名', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		el.renamable = true;
		el.select(data[1]);
		await nextTick();
		fireKey(el, { code: 'F2' });
		expect(treeListStatics.textBox.parentNode).toBe(null);
		expect(data[1].name).toBe('Item 1');
		wrapper.unmount();
	});
});

describe('YMTreeList 删除级联取消选中（金标准）', () => {
	it('删除含选中子孙的 folder：选中清除且 unselect 携带被移除项', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const folder = data[0];
		const item1 = data[1];
		const selected = data[0].children![1];
		const removed: unknown[] = [];
		el.on('unselect', (e: Event & { value: unknown }) => removed.push(e.value));
		el.select(selected);
		await nextTick();
		expect(el.read()).toBe(selected);
		el.deleteNode(folder);
		await nextTick();
		expect(data).toEqual([item1]);
		expect(el.read()).toBe(null);
		expect(removed).toEqual([[selected]]);
		wrapper.unmount();
	});

	it('删除未选中子树不影响其它选中项', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const item = data[1];
		el.select(item);
		await nextTick();
		el.deleteNode(data[0]);
		await nextTick();
		expect(el.read()).toBe(item);
		expect(data).toEqual([item]);
		wrapper.unmount();
	});
});

describe('YMTreeList restore undo/redo 全类型（金标准）', () => {
	it('rename：undo 回旧名、redo 复新名并保持选中', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const item = data[1];
		const record = { type: 'rename', item, oldValue: 'Item 1', newValue: 'Renamed' };
		el.restore('redo', record);
		await nextTick();
		expect(item.name).toBe('Renamed');
		expect(textOf(item.element)).toBe('Renamed');
		el.restore('undo', record);
		await nextTick();
		expect(item.name).toBe('Item 1');
		expect(textOf(item.element)).toBe('Item 1');
		expect(el.read()).toBe(item);
		el.restore('redo', record);
		await nextTick();
		expect(item.name).toBe('Renamed');
		wrapper.unmount();
	});

	it('create：redo 补建、undo 移除、再 redo 可重建同一节点', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const node = { id: 'new', name: 'New Node', class: 'file' };
		const record = { type: 'create', sItem: node, dItem: data[0], insertBefore: false };
		el.restore('redo', record);
		await nextTick();
		expect(data[0].children).toContain(node);
		el.restore('undo', record);
		await nextTick();
		expect(data[0].children).not.toContain(node);
		el.restore('redo', record);
		await nextTick();
		expect(data[0].children).toContain(node);
		expect(data[0].children!.length).toBe(3);
		wrapper.unmount();
	});

	it('delete：undo 还原节点并选中、redo 再删除并清选中', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const folder = data[0];
		const item1 = data[1];
		const captured: unknown[] = [];
		el.on('record', (e: Event & { value: unknown }) => captured.push(e.value));
		el.select(folder);
		await nextTick();
		el.deleteNode(folder);
		await nextTick();
		expect(data).toEqual([item1]);
		const record = captured.find((r) => (r as { type: string }).type === 'delete');
		expect(record).toBeDefined();
		el.restore('undo', record);
		await nextTick();
		expect(data).toEqual([folder, item1]);
		expect(el.read()).toBe(folder);
		el.restore('redo', record);
		await nextTick();
		expect(data).toEqual([item1]);
		expect(el.read()).toBe(null);
		wrapper.unmount();
	});

	it('remove：undo 撤回源位置、redo 重放目标位置', async () => {
		const data: TreeData[] = [
			{
				id: 'folderA',
				name: 'Folder A',
				class: 'folder',
				expanded: true,
				children: [
					{ id: 'a1', name: 'A1', class: 'file' },
					{ id: 'a2', name: 'A2', class: 'file' }
				]
			},
			{ id: 'folderB', name: 'Folder B', class: 'folder', expanded: false, children: [] }
		];
		const { wrapper, el } = await mountList(data);
		const source = data[0].children![1];
		const captured: unknown[] = [];
		el.on('record', (e: Event & { value: unknown }) => captured.push(e.value));
		el.removable = true;
		el.select(source);
		await nextTick();
		fireMouse(source.element!, 'dragstart', { dataTransfer: makeDataTransfer() });
		fireMouse(data[1].element!, 'dragover', { dataTransfer: makeDataTransfer(), offsetY: 8 });
		fireMouse(el, 'drop', { dataTransfer: makeDataTransfer() });
		expect(data[0].children!.map((c) => c.id)).toEqual(['a1']);
		expect(data[1].children!.map((c) => c.id)).toEqual(['a2']);
		const record = captured.find((r) => (r as { type: string }).type === 'remove');
		expect(record).toBeDefined();
		el.restore('undo', record);
		await nextTick();
		expect(data[0].children!.map((c) => c.id)).toEqual(['a1', 'a2']);
		expect(data[1].children).toEqual([]);
		expect(el.read()).toBe(source);
		el.restore('redo', record);
		await nextTick();
		expect(data[0].children!.map((c) => c.id)).toEqual(['a1']);
		expect(data[1].children!.map((c) => c.id)).toEqual(['a2']);
		expect(el.read()).toBe(source);
		wrapper.unmount();
	});
});

describe('YMTreeList element 契约（金标准）', () => {
	it('update 后渲染窗口内行 element 均已连接', async () => {
		const data = makeData();
		const { wrapper } = await mountList(data);
		expect(data[0].element!.isConnected).toBe(true);
		expect(data[0].children![0].element!.isConnected).toBe(true);
		expect(data[1].element!.isConnected).toBe(true);
		wrapper.unmount();
	});

	it('refresh（deleteNodeElements + update）后缓存清空并按 key 复用行元素', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const folder = data[0].element;
		const child = data[0].children![0].element;
		el.refresh();
		await nextTick();
		// 步骤 2 语义：deleteNodeElements 清掉 item.element 缓存，update 后按 key 复用同一行元素回填
		expect(folder!.isConnected).toBe(true);
		expect(child!.isConnected).toBe(true);
		expect(data[0].element).toBeDefined();
		expect(data[0].element).toBe(folder);
		expect(data[0].children![0].element).toBe(child);
		wrapper.unmount();
	});

	it('折叠→展开：窗口外行元素被回收，展开后回填新行元素（窗口内才有 element）', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const childEl = data[0].children![0].element;
		el.select(data[0]);
		await nextTick();
		el.expandSelection();
		await nextTick();
		expect(el.elements.count).toBe(2);
		// 行被卸载（fold 折叠）→ element 缓存回收；消费方须按「窗口内行才有 element」适配
		expect(childEl!.isConnected).toBe(false);
		expect(data[0].children![0].element).toBeUndefined();
		el.expandSelection();
		await nextTick();
		expect(el.elements.count).toBe(4);
		expect(data[0].children![0].element).toBeDefined();
		expect(data[0].children![0].element!.isConnected).toBe(true);
		wrapper.unmount();
	});
});

describe('YMTreeList duplicate 唯一名序列（金标准）', () => {
	it('连续 duplicate 生成递增唯一名（Actor N 序列）且插位相邻', async () => {
		const data: TreeData[] = [
			{
				id: 'folder',
				name: 'Folder',
				class: 'folder',
				expanded: true,
				children: [
					{ id: 'actor1', name: 'Actor 1', class: 'file' },
					{ id: 'actor2', name: 'Actor 2', class: 'file' }
				]
			}
		];
		const { wrapper, el } = await mountList(data);
		const first = data[0].children![0];
		el.select(first);
		await nextTick();
		el.duplicate(first);
		await nextTick();
		const copy1 = data[0].children![1];
		expect(copy1.name).toBe('Actor 3');
		expect(data[0].children!.map((c) => c.name)).toEqual(['Actor 1', 'Actor 3', 'Actor 2']);
		el.select(copy1);
		await nextTick();
		el.duplicate(copy1);
		await nextTick();
		const copy2 = data[0].children![2];
		expect(copy2.name).toBe('Actor 4');
		expect(data[0].children!.map((c) => c.name)).toEqual([
			'Actor 1',
			'Actor 3',
			'Actor 4',
			'Actor 2'
		]);
		expect(copy2.element).toBeDefined();
		expect(copy2.element).not.toBe(copy1.element);
		expect(el.read()).toBe(copy2);
		wrapper.unmount();
	});

	it('duplicate 保留展开态、副本可被展开收集（folder 复制语义）', async () => {
		const data: TreeData[] = [
			{
				id: 'folder',
				name: 'Folder',
				class: 'folder',
				expanded: true,
				children: [
					{ id: 'c1', name: 'C1', class: 'file' },
					{ id: 'c2', name: 'C2', class: 'file' }
				]
			}
		];
		const { wrapper, el } = await mountList(data);
		el.duplicate(data[0]);
		await nextTick();
		const copy = data[1];
		expect(copy.name).toBe('Folder 1');
		expect(copy.children).toHaveLength(2);
		expect(el.elements.count).toBe(6);
		wrapper.unmount();
	});
});

describe('YMTreeList 虚拟滚动窗口（金标准）', () => {
	const spacerHeights = (el: HTMLElement): { top: string; bottom: string } => ({
		top: (el.querySelector('.scroll-spacer.top') as HTMLElement).style.height,
		bottom: (el.querySelector('.scroll-spacer.bottom') as HTMLElement).style.height
	});

	it('200 行初始窗口 [0,21)：仅窗口行挂载，上下 spacer 占位正确', async () => {
		const data = makeFlatData(200);
		const { wrapper, el } = await mountList(data);
		const elements = el.elements as unknown as {
			count: number;
			start: number;
			end: number;
			[i: number]: HTMLElement;
		};
		expect(elements.count).toBe(200);
		expect(elements.start).toBe(0);
		expect(elements.end).toBe(21);
		expect(el.querySelectorAll('.node-item').length).toBe(21);
		expect(elements[0].parentNode).toBe(el);
		expect(elements[20].parentNode).toBe(el);
		// 步骤 2：窗口外行不物化（element 为空），占位由 spacer 承担（语义：累计偏移保持）
		expect(elements[21]).toBeUndefined();
		expect(spacerHeights(el)).toEqual({ top: '0px', bottom: `${(200 - 21) * 20}px` });
		wrapper.unmount();
	});

	it('滚动到 row 150：窗口迁移且仅新窗口行挂载（scroll 事件驱动 resize）', async () => {
		const data = makeFlatData(200);
		const { wrapper, el } = await mountList(data);
		const elements = el.elements as unknown as {
			count: number;
			start: number;
			end: number;
			[i: number]: HTMLElement;
		};
		el.scrollTop = 3000;
		el.dispatchEvent(new Event('scroll'));
		await nextTick();
		expect(elements.start).toBe(150);
		expect(elements.end).toBe(171);
		expect(el.querySelectorAll('.node-item').length).toBe(21);
		expect(elements[149]).toBeUndefined();
		expect(elements[150].parentNode).toBe(el);
		expect(elements[170].parentNode).toBe(el);
		expect(elements[171]).toBeUndefined();
		expect(spacerHeights(el)).toEqual({ top: '3000px', bottom: `${(200 - 171) * 20}px` });
		wrapper.unmount();
	});
});

describe('YMTreeList scrollToSelection（金标准）', () => {
	const mockScrollable = (el: HTMLElement): void => {
		Object.defineProperty(el, 'scrollHeight', { value: 4000, configurable: true });
		Object.defineProperty(el, 'scrollWidth', { value: 300, configurable: true });
		Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	};

	it('active 模式把选中行滚到可视下缘（clamp 语义）', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		mockScrollable(el);
		el.select(data[80]);
		await nextTick();
		el.scrollToSelection('active');
		const min = 80 * 20 + 20 - 400;
		const max = 80 * 20;
		expect(el.scrollTop).toBe(Math.min(Math.max(0, min), max));
		expect(el.scrollTop).toBe(80 * 20 + 20 - 400);
		wrapper.unmount();
	});

	it('middle 模式把选中行滚到中部（取整到 20px 行）', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		mockScrollable(el);
		el.select(data[80]);
		await nextTick();
		el.scrollToSelection('middle');
		expect(el.scrollTop).toBe(Math.round((80 * 20 + 10 - 200) / 20) * 20);
		wrapper.unmount();
	});

	it('无滚动条或滚动位置未变化时不改写 scrollTop', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		mockScrollable(el);
		el.select(data[80]);
		await nextTick();
		el.scrollToSelection('middle');
		const settled = el.scrollTop;
		el.scrollToSelection('middle');
		expect(el.scrollTop).toBe(settled);
		// 无滚动条（scrollHeight 未放大 → hasScrollBar false）：不改变
		const wrapper2 = mount(YMTreeList, { attachTo: document.body });
		const el2 = wrapper2.element as unknown as TreeListElement;
		mockHeight(el2);
		el2.bind(() => data);
		el2.update();
		el2.select(data[5]);
		el2.scrollTop = 1200;
		el2.scrollToSelection('active');
		expect(el2.scrollTop).toBe(1200);
		el2.scrollToSelection('middle');
		expect(el2.scrollTop).toBe(1200);
		wrapper2.unmount();
		wrapper.unmount();
	});
});

describe('YMTreeList Ctrl+Arrow 纯滚动（金标准）', () => {
	it('Ctrl+ArrowDown/Up 只滚动 20px 行距、不改变选中', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		el.select(data[5]);
		await nextTick();
		el.scrollTop = 100;
		fireKey(el, { cmdOrCtrlKey: true, code: 'ArrowDown' });
		expect(el.scrollTop).toBe(120);
		expect(el.read()).toBe(data[5]);
		fireKey(el, { cmdOrCtrlKey: true, code: 'ArrowUp' });
		fireKey(el, { cmdOrCtrlKey: true, code: 'ArrowUp' });
		expect(el.scrollTop).toBe(80);
		expect(el.read()).toBe(data[5]);
		wrapper.unmount();
	});

	it('Ctrl+ 非方向键不滚动也不改选中', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		el.select(data[5]);
		await nextTick();
		el.scrollTop = 100;
		fireKey(el, { cmdOrCtrlKey: true, code: 'KeyA' });
		expect(el.scrollTop).toBe(100);
		expect(el.read()).toBe(data[5]);
		wrapper.unmount();
	});
});

describe('YMTreeList PageUp/PageDown 分页（金标准）', () => {
	// clientHeight 400 → 每页 19 行（floor(400 / 20) - 1）
	it('PageDown：选中下移一页并滚动联动', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		el.select(data[0]);
		await nextTick();
		el.scrollTop = 0;
		fireKey(el, { code: 'PageDown' });
		await nextTick();
		expect(el.read()).toBe(data[19]);
		expect(el.scrollTop).toBe(380);
		wrapper.unmount();
	});

	it('PageUp：选中上移一页并滚动联动', async () => {
		const data = makeFlatData(100);
		const { wrapper, el } = await mountList(data);
		el.select(data[50]);
		await nextTick();
		el.scrollTop = 800;
		fireKey(el, { code: 'PageUp' });
		await nextTick();
		expect(el.read()).toBe(data[31]);
		expect(el.scrollTop).toBe(420);
		wrapper.unmount();
	});

	it('边界：PageDown 停在最后一行、PageUp 停在首行', async () => {
		const data = makeFlatData(30);
		const { wrapper, el } = await mountList(data);
		el.select(data[20]);
		await nextTick();
		el.scrollTop = 400;
		fireKey(el, { code: 'PageDown' });
		await nextTick();
		expect(el.read()).toBe(data[29]);
		el.select(data[5]);
		await nextTick();
		el.scrollTop = 400;
		fireKey(el, { code: 'PageUp' });
		await nextTick();
		expect(el.read()).toBe(data[0]);
		wrapper.unmount();
	});

	it('分页键被列表消费（阻止浏览器默认滚动）且不改动数据', async () => {
		const data = makeFlatData(50);
		const { wrapper, el } = await mountList(data);
		el.select(data[3]);
		await nextTick();
		// 注意：列表自身在 keydown 末尾会 stopImmediatePropagation，故不能用"后加的监听器"探测，
		// 直接看事件对象上的 defaultPrevented（cancelable 事件被 preventDefault 后即为 true）。
		const event = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			code: 'PageDown'
		});
		el.dispatchEvent(event);
		await nextTick();
		expect(event.defaultPrevented).toBe(true);
		expect(data).toHaveLength(50);
		expect(el.read()).toBe(data[22]);
		wrapper.unmount();
	});
});

describe('YMTreeList 快/慢双击语义（金标准）', () => {
	const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

	it('慢双击（500ms Timer）进入重命名并提交改名', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		el.renamable = true;
		el.focus();
		el.select(data[1]);
		await nextTick();
		const row = data[1].element!;
		fireMouse(row, 'pointerdown', { button: 0, clientX: 300, clientY: 10 });
		fireMouse(row, 'pointerup', { button: 0, clientX: 300, clientY: 10 });
		expect(treeListStatics.textBox.parentNode).toBe(null);
		await sleep(560);
		expect(treeListStatics.textBox.parentNode).toBe(row);
		treeListStatics.textBox.write('Slow Renamed');
		treeListStatics.textBox.input.blur();
		await sleep(10);
		expect(data[1].name).toBe('Slow Renamed');
		expect(textOf(data[1].element)).toBe('Slow Renamed');
		wrapper.unmount();
	});

	it('快双击文件：连续 pointerdown 触发 doubleclick → open 事件（不进入重命名）', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		let opened: unknown = null;
		el.on('open', (e: Event & { value: unknown }) => (opened = e.value));
		el.focus();
		el.select(data[1]);
		await nextTick();
		const row = data[1].element!;
		fireMouse(row, 'pointerdown', { button: 0, clientX: 200, clientY: 10 });
		fireMouse(row, 'pointerup', { button: 0, clientX: 200, clientY: 10 });
		fireMouse(row, 'pointerdown', { button: 0, clientX: 200, clientY: 10 });
		fireMouse(row, 'pointerup', { button: 0, clientX: 200, clientY: 10 });
		expect(opened).toBe(data[1]);
		expect(treeListStatics.textBox.parentNode).toBe(null);
		wrapper.unmount();
	});

	it('快双击 folder：切换展开态而非 open', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		let opened: unknown = null;
		el.on('open', (e: Event & { value: unknown }) => (opened = e.value));
		el.focus();
		el.select(data[0]);
		await nextTick();
		const row = data[0].element!;
		fireMouse(row, 'pointerdown', { button: 0, clientX: 200, clientY: 10 });
		fireMouse(row, 'pointerup', { button: 0, clientX: 200, clientY: 10 });
		fireMouse(row, 'pointerdown', { button: 0, clientX: 200, clientY: 10 });
		fireMouse(row, 'pointerup', { button: 0, clientX: 200, clientY: 10 });
		expect(opened).toBe(null);
		expect(data[0].expanded).toBe(false);
		expect(el.elements.count).toBe(2);
		wrapper.unmount();
	});
});
