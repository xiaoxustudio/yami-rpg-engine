import { describe, expect, it } from 'vitest';
import {
	activateLayoutTab,
	collapseRedundantSplits,
	findGroup,
	groupActiveTab,
	leavesOf,
	moveLayoutTab,
	moveTabWithin,
	parseLayoutScheme,
	toLayoutScheme,
	type LayoutGroupNode,
	type LayoutSchemeData,
	type LayoutTreeNode
} from '../layout-scheme';

const directoryScheme: LayoutSchemeData = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project', 'inspector'] },
		{ end: 1, tabs: ['scene'] }
	]
};

const singleLeafScheme: LayoutSchemeData = { end: 1, tabs: ['project', 'scene', 'inspector'] };

describe('parseLayoutScheme / toLayoutScheme 往返', () => {
	it('叶子与多分叉 scheme 往返保真', () => {
		expect(toLayoutScheme(parseLayoutScheme(singleLeafScheme))).toEqual(singleLeafScheme);
		expect(toLayoutScheme(parseLayoutScheme(directoryScheme))).toEqual(directoryScheme);
	});

	it('嵌套三层往返保真', () => {
		const nested: LayoutSchemeData = {
			end: 1,
			split: 'vertical',
			children: [
				{
					end: 0.4,
					split: 'horizontal',
					children: [
						{ end: 0.5, tabs: ['project'] },
						{ end: 1, tabs: ['scene', 'inspector'] }
					]
				},
				{ end: 1, tabs: [] }
			]
		};
		expect(toLayoutScheme(parseLayoutScheme(nested))).toEqual(nested);
	});

	it('每个节点获得稳定且互不相同的 id；kind/split/tabs 正确', () => {
		const root = parseLayoutScheme(directoryScheme);
		expect(root.kind).toBe('split');
		if (root.kind !== 'split') return;
		expect(root.id).toBe('layout-1');
		expect(root.split).toBe('horizontal');
		expect(root.children).toHaveLength(2);
		expect(root.children[0].id).toBe('layout-2');
		expect(root.children[0]).toMatchObject({
			kind: 'group',
			tabs: ['project', 'inspector'],
			active: null
		});
		expect(root.children[1].id).toBe('layout-3');
	});

	it('无 tabs 的叶子按 group 解析为空组（现状 createGroups 允许 tabs:[]）', () => {
		const root = parseLayoutScheme({ end: 1, tabs: [] });
		expect(root.kind).toBe('group');
		if (root.kind !== 'group') return;
		expect(root.tabs).toEqual([]);
		expect(root.active).toBeNull();
	});
});

describe('leavesOf / findGroup / groupActiveTab', () => {
	it('文档序收集叶子', () => {
		const leaves = leavesOf(parseLayoutScheme(directoryScheme));
		expect(leaves.map((leaf) => leaf.tabs)).toEqual([['project', 'inspector'], ['scene']]);
	});

	it('findGroup 按 id 命中并排除 split', () => {
		const root = parseLayoutScheme(directoryScheme);
		const leaf = findGroup(root, 'layout-2') as LayoutGroupNode;
		expect(leaf?.tabs).toEqual(['project', 'inspector']);
		expect(findGroup(root, 'layout-1')).toBeNull();
		expect(findGroup(root, 'missing')).toBeNull();
	});

	it('groupActiveTab 解析 active 索引为页签名', () => {
		const root = parseLayoutScheme(directoryScheme);
		expect(groupActiveTab(findGroup(root, 'layout-2') as LayoutGroupNode)).toBeNull();
		const activated = activateLayoutTab(root, 'layout-2', 'inspector');
		expect(groupActiveTab(findGroup(activated, 'layout-2') as LayoutGroupNode)).toBe(
			'inspector'
		);
	});
});

describe('activateLayoutTab', () => {
	it('激活目标页签并保持不可变（原树不受影响）', () => {
		const root = parseLayoutScheme(singleLeafScheme);
		const activated = activateLayoutTab(root, root.id, 'scene');
		expect(groupActiveTab(activated as LayoutGroupNode)).toBe('scene');
		expect(groupActiveTab(root as LayoutGroupNode)).toBeNull();
		expect(leavesOf(activated)[0]?.active).toBe('scene');
	});

	it('重复激活相同页签返回原引用', () => {
		const root = activateLayoutTab(parseLayoutScheme(singleLeafScheme), 'layout-1', 'scene');
		expect(activateLayoutTab(root, 'layout-1', 'scene')).toBe(root);
	});

	it('未知页签/未知组返回原引用', () => {
		const root = parseLayoutScheme(singleLeafScheme);
		expect(activateLayoutTab(root, 'layout-1', 'missing')).toBe(root);
		expect(activateLayoutTab(root, 'missing', 'project')).toBe(root);
	});
});

describe('moveLayoutTab 同组重排', () => {
	it('把页签移到指定索引并夹紧越界索引', () => {
		const root = parseLayoutScheme(singleLeafScheme);
		const moved = moveLayoutTab(root, root.id, root.id, 'project', 2);
		expect(toLayoutScheme(moved as LayoutTreeNode)).toEqual({
			end: 1,
			tabs: ['scene', 'inspector', 'project']
		});
		const toEnd = moveLayoutTab(root, root.id, root.id, 'inspector', 99);
		expect((toEnd as LayoutGroupNode).tabs).toEqual(['project', 'scene', 'inspector']);
	});

	it('移动后原树保持不可变', () => {
		const root = parseLayoutScheme(singleLeafScheme);
		moveLayoutTab(root, root.id, root.id, 'project', 2);
		expect((root as LayoutGroupNode).tabs).toEqual(['project', 'scene', 'inspector']);
	});
});

describe('moveLayoutTab 跨组', () => {
	it('源组缩小、目标组按索引插入、原树不变', () => {
		const root = parseLayoutScheme(directoryScheme);
		const source = findGroup(root, 'layout-2') as LayoutGroupNode;
		const moved = moveLayoutTab(root, 'layout-2', 'layout-3', 'project', 0) as LayoutTreeNode;
		expect((findGroup(moved, 'layout-2') as LayoutGroupNode).tabs).toEqual(['inspector']);
		expect((findGroup(moved, 'layout-3') as LayoutGroupNode).tabs).toEqual([
			'project',
			'scene'
		]);
		expect((findGroup(root, 'layout-2') as LayoutGroupNode).tabs).toEqual([
			'project',
			'inspector'
		]);
		expect(source).toBe(findGroup(root, 'layout-2'));
	});

	it('同组移动非激活页签时 active 值保持不变', () => {
		const activated = activateLayoutTab(
			parseLayoutScheme(singleLeafScheme),
			'layout-1',
			'scene'
		);
		const moved = moveLayoutTab(
			activated,
			'layout-1',
			'layout-1',
			'project',
			2
		) as LayoutGroupNode;
		expect(moved.tabs).toEqual(['scene', 'inspector', 'project']);
		expect(moved.active).toBe('scene');
	});

	it('同组移动当前激活页签后激活仍跟随该页签', () => {
		const activated = activateLayoutTab(
			parseLayoutScheme(singleLeafScheme),
			'layout-1',
			'scene'
		);
		const moved = moveLayoutTab(
			activated,
			'layout-1',
			'layout-1',
			'scene',
			2
		) as LayoutGroupNode;
		expect(moved.tabs).toEqual(['project', 'inspector', 'scene']);
		expect(moved.active).toBe('scene');
	});

	it('源组被清空后整个组移除；父 split 只剩单子时提升该子并继承父 end', () => {
		const scheme: LayoutSchemeData = {
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.3, tabs: ['a'] },
				{ end: 1, tabs: ['c', 'd'] }
			]
		};
		const root = parseLayoutScheme(scheme);
		const targetId = (findGroup(root, 'layout-3') as LayoutGroupNode).id;
		const moved = moveLayoutTab(root, 'layout-2', targetId, 'a', 2);
		expect(moved?.kind).toBe('group');
		expect((moved as LayoutGroupNode).id).toBe('layout-3');
		expect(toLayoutScheme(moved as LayoutTreeNode)).toEqual({ end: 1, tabs: ['c', 'd', 'a'] });
	});

	it('深层折叠：空的内层 split 被删除，兄弟叶子被提升到根下', () => {
		const nested: LayoutSchemeData = {
			end: 1,
			split: 'horizontal',
			children: [
				{
					end: 0.5,
					split: 'vertical',
					children: [
						{ end: 0.5, tabs: ['a', 'b'] },
						{ end: 1, tabs: ['c'] }
					]
				},
				{ end: 1, tabs: ['d'] }
			]
		};
		const root = parseLayoutScheme(nested);
		let current: LayoutTreeNode | null = root;
		current = moveLayoutTab(current, 'layout-3', 'layout-5', 'a', 0);
		current = moveLayoutTab(current as LayoutTreeNode, 'layout-3', 'layout-5', 'b', 0);
		expect(toLayoutScheme(current as LayoutTreeNode)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['c'] },
				{ end: 1, tabs: ['b', 'a', 'd'] }
			]
		});
		expect(findGroup(root, 'layout-3')).not.toBeNull();
	});

	it('整棵树唯一叶子被移空后返回 null', () => {
		const root = parseLayoutScheme({ end: 1, tabs: ['a'] });
		expect(moveLayoutTab(root, root.id, root.id, 'a', 0)).toBeNull();
	});

	it('未知页签/未知组返回原引用', () => {
		const root = parseLayoutScheme(directoryScheme);
		expect(moveLayoutTab(root, 'layout-2', 'layout-3', 'missing', 0)).toBe(root);
		expect(moveLayoutTab(root, 'missing', 'layout-3', 'project', 0)).toBe(root);
	});
});

describe('moveTabWithin 同组顺序（M4 navDrop 数据层）', () => {
	const tabs = ['project', 'inspector', 'scene'];

	it('insert-before：拖末位页签到首页签前', () => {
		expect(moveTabWithin(tabs, 'scene', 'project')).toEqual(['scene', 'project', 'inspector']);
	});

	it('insert-before：拖中间页签到前一页签前（anchor 在移除后定位）', () => {
		expect(moveTabWithin(tabs, 'inspector', 'project')).toEqual([
			'inspector',
			'project',
			'scene'
		]);
		// anchor 位于被拖页签之后：先移除再按 anchor 现索引插入
		expect(moveTabWithin(tabs, 'project', 'scene')).toEqual(['inspector', 'project', 'scene']);
	});

	it('anchor=null 视为 append 到末尾', () => {
		expect(moveTabWithin(tabs, 'project', null)).toEqual(['inspector', 'scene', 'project']);
		expect(moveTabWithin(tabs, 'scene', null)).toEqual(['project', 'inspector', 'scene']);
	});

	it('anchor 不存在回退 append；未知页签返回原数组', () => {
		expect(moveTabWithin(tabs, 'project', 'missing')).toEqual([
			'inspector',
			'scene',
			'project'
		]);
		expect(moveTabWithin(tabs, 'missing', null)).toEqual(tabs);
		expect(moveTabWithin(tabs, 'missing', 'project')).toEqual(tabs);
	});
});

describe('collapseRedundantSplits 冗余容器规整（M4-2 Teleport 折叠）', () => {
	it('单子组 split 递归提升并继承父 end', () => {
		const root = parseLayoutScheme({
			end: 1,
			split: 'horizontal',
			children: [
				{
					end: 0.5,
					split: 'vertical',
					children: [{ end: 1, tabs: ['project', 'inspector', 'scene'] }]
				}
			]
		});
		const out = collapseRedundantSplits(root);
		expect(out).toMatchObject({
			kind: 'group',
			end: 1,
			tabs: ['project', 'inspector', 'scene']
		});
		expect(toLayoutScheme(out)).toEqual({
			end: 1,
			tabs: ['project', 'inspector', 'scene']
		});
	});

	it('多子组 split 与叶子原样保留结构', () => {
		const root = parseLayoutScheme({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['a'] },
				{ end: 1, tabs: ['b'] }
			]
		});
		const out = collapseRedundantSplits(root);
		expect(toLayoutScheme(out)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['a'] },
				{ end: 1, tabs: ['b'] }
			]
		});
		const leaf = parseLayoutScheme({ end: 1, tabs: ['only'] });
		expect(collapseRedundantSplits(leaf)).toBe(leaf);
	});
});
