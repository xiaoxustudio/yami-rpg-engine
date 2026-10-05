import { describe, expect, it } from 'vitest';
import {
	activateLayoutTab,
	clampEnds,
	collapseRedundantSplits,
	findGroup,
	groupActiveTab,
	leavesOf,
	moveLayoutTab,
	moveTabWithin,
	nodesOf,
	parseLayoutScheme,
	splitGroupWithTab,
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

describe('moveTabWithin 同组顺序（navDrop 数据层）', () => {
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

describe('collapseRedundantSplits 冗余容器规整（Teleport 折叠）', () => {
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

describe('splitGroupWithTab region 边缘 drop（navDrop 数据层）', () => {
	// 目标 = 第一个叶子 [project, inspector]（end 0.5），后面还有 [scene]（end 1）
	const directory = (): LayoutTreeNode => parseLayoutScheme(directoryScheme);
	const ids = (root: LayoutTreeNode): string[] => leavesOf(root).map((leaf) => leaf.id);

	it('右缘：新叶子接在目标之后，目标收缩到跨度中点', () => {
		const root = directory();
		// 与金标准同一形态：往**自己所在组**的右缘丢（源 = 目标 = 第一个叶子）
		const target = ids(root)[0];
		const out = splitGroupWithTab(root, target, target, 'inspector', 'right');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.25, tabs: ['project'] },
				{ end: 0.5, tabs: ['inspector'] },
				{ end: 1, tabs: ['scene'] }
			]
		});
	});

	it('左缘：新叶子插在目标之前并取中点，目标 end 不变', () => {
		const root = directory();
		const target = ids(root)[0];
		const out = splitGroupWithTab(root, target, target, 'inspector', 'left');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.25, tabs: ['inspector'] },
				{ end: 0.5, tabs: ['project'] },
				{ end: 1, tabs: ['scene'] }
			]
		});
	});

	it('轴不同：先把目标包进同轴容器（容器继承目标 end、目标 end 置 1），新叶子放进容器', () => {
		const root = directory();
		const target = ids(root)[0];
		const out = splitGroupWithTab(root, target, target, 'inspector', 'top');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{
					end: 0.5,
					split: 'vertical',
					children: [
						{ end: 0.5, tabs: ['inspector'] },
						{ end: 1, tabs: ['project'] }
					]
				},
				{ end: 1, tabs: ['scene'] }
			]
		});
	});

	it('目标是根叶子：同样先包一层同轴容器', () => {
		const root = parseLayoutScheme(singleLeafScheme);
		const source = leavesOf(root)[0].id;
		const out = splitGroupWithTab(root, source, source, 'scene', 'right');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['project', 'inspector'] },
				{ end: 1, tabs: ['scene'] }
			]
		});
	});

	it('源组被搬空且它是最后一个子组：前一个兄弟的 end 补到 1（不留尾部缺口）', () => {
		const root = parseLayoutScheme({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.3, tabs: ['a'] },
				{ end: 0.6, tabs: ['b'] },
				{ end: 1, tabs: ['c'] }
			]
		});
		const [first, , last] = ids(root);
		const out = splitGroupWithTab(root, first, last, 'c', 'right');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.15, tabs: ['a'] },
				{ end: 0.3, tabs: ['c'] },
				{ end: 1, tabs: ['b'] }
			]
		});
	});

	it('找不到目标叶子时原样返回；源页签不存在时也不改结构', () => {
		const root = directory();
		const [source, target] = ids(root);
		expect(splitGroupWithTab(root, 'missing', source, 'inspector', 'right')).toBe(root);
		expect(splitGroupWithTab(root, target, source, 'missing', 'right')).toBe(root);
	});
});

describe('splitGroupWithTab 容器落点（region 给的 root/父容器/外层容器）', () => {
	// region 的落点不只有叶子：`regionDragover` 会把 target 指到 root / 父容器 / 外层容器，
	// hint 画的正是「该盒子的一半」。容器落点若只认叶子，就会出现「占位框出现、松手没效果」。
	const nested = (): LayoutTreeNode =>
		parseLayoutScheme({
			end: 1,
			split: 'horizontal',
			children: [
				{
					end: 0.6,
					split: 'horizontal',
					children: [
						{ end: 0.5, tabs: ['project'] },
						{ end: 1, tabs: ['scene'] }
					]
				},
				{ end: 1, tabs: ['inspector'] }
			]
		});

	it('落点是容器（轴不同）：容器整块被包进同轴容器，新叶子取容器跨度的一半', () => {
		const root = nested();
		const container = nodesOf(root)[1]; // 先序第 2 个节点 = 左侧容器
		expect(container.kind).toBe('split');
		const source = leavesOf(root).find((leaf) => leaf.tabs.includes('inspector'))!.id;

		const out = splitGroupWithTab(root, container.id, source, 'inspector', 'bottom');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'vertical',
			children: [
				{
					end: 0.5,
					split: 'horizontal',
					children: [
						{ end: 0.5, tabs: ['project'] },
						{ end: 1, tabs: ['scene'] }
					]
				},
				{ end: 1, tabs: ['inspector'] }
			]
		});
	});

	it('落点是根容器：整棵树被包进同轴容器，页签落进新叶子', () => {
		const root = nested();
		const container = nodesOf(root)[0]; // 根
		const source = leavesOf(root).find((leaf) => leaf.tabs.includes('inspector'))!.id;

		const out = splitGroupWithTab(root, container.id, source, 'inspector', 'top');
		expect(toLayoutScheme(out!)).toEqual({
			end: 1,
			split: 'vertical',
			children: [
				{ end: 0.5, tabs: ['inspector'] },
				{
					end: 1,
					split: 'horizontal',
					children: [
						{ end: 0.5, tabs: ['project'] },
						{ end: 1, tabs: ['scene'] }
					]
				}
			]
		});
	});

	it('nodesOf 先序含容器与叶子，与 parseLayoutScheme 的 id 分配同序', () => {
		const root = nested();
		expect(nodesOf(root).map((node) => node.kind)).toEqual([
			'split',
			'split',
			'group',
			'group',
			'group'
		]);
		expect(nodesOf(root).map((node) => node.id)).toEqual([
			'layout-1',
			'layout-2',
			'layout-3',
			'layout-4',
			'layout-5'
		]);
	});
});

describe('clampEnds 跨度收口（写像素前的单调/有限性保证）', () => {
	it('已单调且不超 1 时原样返回', () => {
		expect(clampEnds([0.2, 0.5, 1], 1000)).toEqual([0.2, 0.5, 1]);
	});

	it('非单调（后一个更小）会被抬到「前一个 + 1px」，不再写出负宽', () => {
		// 这是实机压盖的直接来源：end 倒退 ⇒ width = pw*(end - prev) < 0 ⇒ 浏览器拒收
		expect(clampEnds([0.5, 0.3], 1000)).toEqual([0.5, 0.501]);
		expect(clampEnds([0.28, 0.07, 0.5], 100)).toEqual([0.28, 0.29, 0.5]);
	});

	it('超过 1 会被截到 1（窄容器里 min 间距硬撑出来的越界）', () => {
		expect(clampEnds([0.9, 1.4, 1.8], 1000)).toEqual([0.9, 1, 1]);
	});

	it('非有限值（NaN/undefined，`undefined / undefined` 那条旧路径）按「贴住前一个」处理', () => {
		expect(clampEnds([Number.NaN, 0.5], 1000)).toEqual([0, 0.5]);
		expect(clampEnds([0.4, Number.NaN, 0.9], 1000)).toEqual([0.4, 0.401, 0.9]);
		expect(
			clampEnds([undefined as unknown as number, 1], 1000).every((end) =>
				Number.isFinite(end)
			)
		).toBe(true);
	});

	it('空间极度不足（1px 间隔都塞不下）时全部贴到 1，仍然单调、仍然有限', () => {
		const ends = clampEnds([0.5, 0.6, 0.7, 0.8], 2);
		expect(ends).toEqual([0.5, 1, 1, 1]);
		for (let index = 1; index < ends.length; index++) {
			expect(ends[index]).toBeGreaterThanOrEqual(ends[index - 1]);
		}
	});

	it('空数组与单元素是自己的边界', () => {
		expect(clampEnds([], 1000)).toEqual([]);
		expect(clampEnds([2], 1000)).toEqual([1]);
	});
});
