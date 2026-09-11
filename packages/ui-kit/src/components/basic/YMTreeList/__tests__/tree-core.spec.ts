import { describe, expect, it } from 'vitest';
import { createTreeCore, type TreeItem } from '../tree-core';

const core = createTreeCore();

const makeTree = (): TreeItem[] => [
	{
		name: 'Folder',
		class: 'folder',
		id: 'folder1',
		children: [
			{ name: 'Child A', class: 'file', id: 'child-a', children: [] },
			{ name: 'Other', class: 'file', id: 'child-b', presetId: 'preset-x', children: [] }
		]
	},
	{ name: 'Item 1', class: 'file', id: 'item-1', children: [] }
];

const makeFamily = (names: string[]): { parent: TreeItem; items: TreeItem[] } => {
	const parent: TreeItem = { name: 'root' };
	const items = names.map((name) => ({ name, parent }));
	parent.children = items;
	return { parent, items };
};

describe('tree-core', () => {
	describe('createParents', () => {
		it('递归设置顶层与嵌套节点的 parent', () => {
			const data = makeTree();
			const root: TreeItem = { name: 'root' };
			core.createParents(data, root);
			expect(data[0].parent).toBe(root);
			expect(data[1].parent).toBe(root);
			expect(data[0].children![0].parent).toBe(data[0]);
			expect(data[0].children![1].parent).toBe(data[0]);
		});

		it('parent 属性保持 configurable，可被 delete 删除', () => {
			const data = makeTree();
			core.createParents(data, null);
			expect(delete data[0].parent).toBe(true);
			expect(data[0].parent).toBeUndefined();
			expect(delete data[0].children![0].parent).toBe(true);
			expect(data[0].children![0].parent).toBeUndefined();
		});
	});

	describe('deleteCaches', () => {
		it('递归删除 parent 缓存', () => {
			const data = makeTree();
			core.createParents(data, null);
			core.deleteCaches(data);
			expect(data[0].parent).toBeUndefined();
			expect(data[0].children![0].parent).toBeUndefined();
		});

		it('删除 initialized 标记', () => {
			const data = makeTree() as TreeItem[] & { initialized?: unknown };
			data.initialized = true;
			core.deleteCaches(data);
			expect(data.initialized).toBeUndefined();
		});
	});

	describe('cloneNode', () => {
		it('深拷贝 children 数组', () => {
			const data = makeTree();
			const copy = core.cloneNode(data[0]);
			expect(copy).not.toBe(data[0]);
			expect(copy.name).toBe('Folder');
			expect(copy.id).toBe('folder1');
			expect(copy.children).not.toBe(data[0].children);
			expect(copy.children![0]).not.toBe(data[0].children![0]);
			expect(copy.children![0].name).toBe('Child A');
			expect(copy.children![1].presetId).toBe('preset-x');
		});

		it('不复制 parent 引用（行元素不再挂在 item 上）', () => {
			const data = makeTree();
			core.createParents(data, null);
			const copy = core.cloneNode(data[0]);
			expect('parent' in copy).toBe(false);
			expect(copy.children![0].parent).toBeUndefined();
		});
	});

	describe('searchNodesAlgorithm', () => {
		it('按名称递归匹配嵌套子节点', () => {
			const data = makeTree();
			const list: TreeItem[] = [];
			core.searchNodesAlgorithm(data, /Child/, list);
			expect(list.map((item) => item.name)).toEqual(['Child A']);
		});

		it('名称不匹配时按 id 与 presetId 匹配', () => {
			const data = makeTree();
			const list: TreeItem[] = [];
			core.searchNodesAlgorithm(data, /child-b/, list);
			expect(list.map((item) => item.name)).toEqual(['Other']);
			list.length = 0;
			core.searchNodesAlgorithm(data, /preset-x/, list);
			expect(list.map((item) => item.name)).toEqual(['Other']);
			list.length = 0;
			core.searchNodesAlgorithm(data, /zzz/, list);
			expect(list).toEqual([]);
		});
	});

	describe('generateUniqueName', () => {
		it('无冲突时返回 "名称 1"', () => {
			const { items } = makeFamily(['Node']);
			expect(core.generateUniqueName(items[0])).toBe('Node 1');
		});

		it('剥离尾部序号并跳过已占用名称', () => {
			const { items } = makeFamily(['Alpha', 'Alpha 1', 'Alpha 2']);
			expect(core.generateUniqueName(items[2])).toBe('Alpha 3');
			const family = makeFamily(['Data']);
			const item: TreeItem = { name: 'Data 7', parent: family.parent };
			family.parent.children!.push(item);
			expect(core.generateUniqueName(item)).toBe('Data 1');
		});
	});

	describe('findItemByProperties', () => {
		it('按属性查找嵌套节点', () => {
			const data = makeTree();
			expect(core.findItemByProperties(data, { id: 'child-b' })).toBe(data[0].children![1]);
			expect(core.findItemByProperties(data, { name: 'Item 1' })).toBe(data[1]);
		});

		it('无匹配或多属性不一致时返回 undefined', () => {
			const data = makeTree();
			expect(core.findItemByProperties(data, { id: 'nope' })).toBeUndefined();
			expect(
				core.findItemByProperties(data, { id: 'child-b', name: 'wrong' })
			).toBeUndefined();
			expect(core.findItemByProperties(null, { id: 'child-b' })).toBeUndefined();
		});
	});

	describe('containsItem', () => {
		it('沿 parent 链判断祖先包含关系', () => {
			const data = makeTree();
			core.createParents(data, null);
			expect(core.containsItem(data[0], data[0].children![0])).toBe(true);
			expect(core.containsItem(data[0], data[0])).toBe(true);
		});

		it('非祖先或空目标返回 false', () => {
			const data = makeTree();
			core.createParents(data, null);
			expect(core.containsItem(data[0].children![0], data[0])).toBe(false);
			expect(core.containsItem(data[0], null)).toBe(false);
			expect(core.containsItem(data[0], undefined)).toBe(false);
		});
	});
});
