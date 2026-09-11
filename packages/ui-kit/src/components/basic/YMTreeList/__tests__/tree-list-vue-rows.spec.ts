import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';
import { treeRowCount, setTreeItemClass, setTreeItemText } from '../tree-api';

// 数据派生行渲染（docs/tree-list-vfor-plan.md 步骤 2；步骤 5 后为唯一渲染路径）：
// 派生行/虚拟窗口/元素回写桥/受控 class/折叠与搜索。

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
	unselect: () => void;
	expandSelection: () => void;
	searchNodes: (keyword: string) => void;
	scrollToSelection: (mode?: string) => void;
	renderState: {
		rows: { value: unknown[] };
		start: { value: number };
		end: { value: number };
	};
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
};

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

const makeFlat = (count: number): TreeData[] =>
	Array.from({ length: count }, (_v, i) => ({ id: `n${i}`, name: `Node ${i}`, class: 'file' }));

const mountList = async (
	data: TreeData[]
): Promise<{ wrapper: ReturnType<typeof mount>; el: TreeListElement }> => {
	const wrapper = mount(YMTreeList, { attachTo: document.body });
	const el = wrapper.element as unknown as TreeListElement;
	mockHeight(el);
	el.bind(() => data);
	el.update();
	await nextTick();
	return { wrapper, el };
};

beforeEach(() => {
	document.body.innerHTML = '';
});

afterEach(() => {
	document.body.innerHTML = '';
});

describe('YMTreeList v-for 行渲染（步骤 2）', () => {
	it('派生行：结构/文本/折叠标记与元素桥齐备', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const rows = el.querySelectorAll('.node-item');
		expect(rows).toHaveLength(4);
		expect(Array.from(rows).map((row) => row.textContent?.trim())).toEqual([
			'Folder',
			'Child 1',
			'Child 2',
			'Item 1'
		]);
		// 折叠标记：folder 有、file 无
		expect(rows[0].querySelector('.folder-mark')).not.toBeNull();
		expect(rows[1].querySelector('.folder-mark')).toBeNull();
		// 元素桥：item.element 指向渲染出的行，且内部字段挂载
		expect(data[0].element).toBe(rows[0]);
		expect((data[0].element as HTMLElement & { textNode?: Text }).textNode?.nodeValue).toBe(
			'Folder'
		);
		expect(
			(data[0].element as HTMLElement & { nodeIcon?: HTMLElement }).nodeIcon
		).not.toBeNull();
		expect(treeRowCount(el)).toBe(4);
		wrapper.unmount();
	});

	it('选中/折叠：row class 与行数随数据刷新（item.element 引用稳定）', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const folderElement = data[0].element;
		el.select(data[0]);
		await nextTick();
		expect(el.querySelectorAll('.node-item.selected')).toHaveLength(1);
		expect(el.read()).toBe(data[0]);

		el.expandSelection();
		await nextTick();
		expect(el.querySelectorAll('.node-item')).toHaveLength(2);
		el.expandSelection();
		await nextTick();
		expect(el.querySelectorAll('.node-item')).toHaveLength(4);
		// 折叠→展开后行元素复用（item.element 引用不变）
		expect(data[0].element).toBe(folderElement);
		wrapper.unmount();
	});

	it('虚拟窗口：窗口行渲染 + 上下 spacer 占位；滚动后窗口迁移', async () => {
		const data = makeFlat(200);
		const { wrapper, el } = await mountList(data);
		expect(treeRowCount(el)).toBe(200);
		expect(el.renderState.start.value).toBe(0);
		expect(el.renderState.end.value).toBe(21);
		expect(el.querySelectorAll('.node-item')).toHaveLength(21);
		const top = el.querySelector('.scroll-spacer.top') as HTMLElement;
		const bottom = el.querySelector('.scroll-spacer.bottom') as HTMLElement;
		expect(top.style.height).toBe('0px');
		expect(bottom.style.height).toBe(`${(200 - 21) * 20}px`);

		el.scrollTop = 3000;
		el.dispatchEvent(new Event('scroll'));
		await nextTick();
		expect(el.renderState.start.value).toBe(150);
		expect(el.renderState.end.value).toBe(171);
		expect(el.querySelectorAll('.node-item')).toHaveLength(21);
		expect((el.querySelector('.scroll-spacer.top') as HTMLElement).style.height).toBe('3000px');
		expect((el.querySelector('.scroll-spacer.bottom') as HTMLElement).style.height).toBe(
			`${(200 - 171) * 20}px`
		);
		wrapper.unmount();
	});

	it('搜索模式：平铺派生行（indent=0）', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		el.searchNodes('Child');
		await nextTick();
		const rows = el.querySelectorAll('.node-item');
		expect(rows).toHaveLength(2);
		expect(Array.from(rows).map((row) => row.textContent?.trim())).toEqual([
			'Child 1',
			'Child 2'
		]);
		expect((el.renderState.rows.value.length as number) ?? 0).toBeGreaterThan(0);
		wrapper.unmount();
	});

	it('消费方实例级 updateNodeElement 覆写仍是受支持扩展点（步骤 5 删除默认实现后）', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		// 模拟 text-tip 一类窗口：把富行内容渲染挂到列表实例上
		(el as unknown as { updateNodeElement: (row: HTMLElement) => void }).updateNodeElement = (
			row: HTMLElement
		): void => {
			row.dataset.decorated = 'yes';
		};
		el.update();
		await nextTick();
		expect(el.querySelectorAll('.node-item[data-decorated="yes"]')).toHaveLength(4);
		wrapper.unmount();
	});

	it('重命名后派生行文本立即刷新（updateItemName 触发重派生，非直写 textNode）', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		expect(el.querySelectorAll('.node-item')[1].textContent?.trim()).toBe('Child 1');
		(el as unknown as { renameNode: (item: unknown, name: string) => void }).renameNode(
			data[0].children![0],
			'Child 1 renamed'
		);
		await nextTick();
		expect(el.querySelectorAll('.node-item')[1].textContent?.trim()).toBe('Child 1 renamed');
		wrapper.unmount();
	});

	it('setTreeItemText/setTreeItemClass 只 bump 版本也即时反映到已渲染行', async () => {
		const data = makeData();
		const { wrapper, el } = await mountList(data);
		const child = data[0].children![0];
		setTreeItemText(child, '0:Child 1');
		setTreeItemClass(child, 'weak', true);
		await nextTick();
		const row = el.querySelectorAll('.node-item')[1];
		expect(row.textContent?.trim()).toBe('0:Child 1');
		expect(row.classList.contains('weak')).toBe(true);
		// 取消注册后 class 消失
		setTreeItemClass(child, 'weak', false);
		await nextTick();
		expect(el.querySelectorAll('.node-item')[1].classList.contains('weak')).toBe(false);
		wrapper.unmount();
	});
});
