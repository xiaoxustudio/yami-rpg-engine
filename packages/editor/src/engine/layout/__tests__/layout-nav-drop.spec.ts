import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { Layout, awaitVueLayoutLoad } from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';
import {
	buildLayoutFixture,
	collectLeaves,
	DIRECTORY_SCHEME,
	managerValues,
	mountScheme,
	navValues,
	placePaletteIntoLeaves,
	registerLayout,
	switchWorkspace
} from './layout-spec-utils';
import type { LayoutLeaf, SchemeNode } from './layout-spec-utils';

// navDrop 生效动作金标准。
// 锁定 nav 拖拽 drop 的 DOM/数据语义（同组重排/插前、跨组搬入）。
// 几何依赖（region 落点方向/缩放）jsdom 无 clientWidth，另留真机冒烟。

type DragEventLike = {
	dataTransfer: { setDragImage: () => void };
	preventDefault: () => void;
	clientX: number;
	clientY: number;
	[k: string]: unknown;
};

interface DragState {
	target: HTMLElement;
	group: HTMLElement;
	hint: HTMLElement & { [k: string]: unknown };
	navs: HTMLElement[];
	regions: HTMLElement[];
	location: { trigger: HTMLElement; target: HTMLElement; direction: string };
}

beforeEach(() => {
	document.body.innerHTML = '';
});

const createDragEvent = (): DragEventLike => ({
	dataTransfer: { setDragImage: () => {} },
	preventDefault: () => {},
	clientX: 0,
	clientY: 0
});

const mountDirectory = async () => {
	const fixture = buildLayoutFixture();
	registerLayout(fixture);
	Layout.heads = [];
	switchWorkspace(fixture, 'directory');
	await mountScheme('directory', DIRECTORY_SCHEME);
	const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
	return { fixture, leaves };
};

/** 从 leaf.nav 中取指定 value 的 nav-item */
const itemOf = (leaf: LayoutLeaf, value: string): HTMLElement =>
	leaf.nav.querySelector(`.nav-item[value="${value}"]`) as HTMLElement;

/** 发起一次已进入 location 的拖拽：dragstart 后手动赋 target/location，再对 nav 派发 drop */
const dragDrop = (
	leaf: LayoutLeaf,
	opts: { dragItem: string; trigger: HTMLElement; target: HTMLElement; direction: string }
): DragState => {
	const nav = leaf.nav;
	const event = createDragEvent();
	try {
		Layout.navDragstart!.call(nav, event as never);
		const state = getLayoutStore().dragging as unknown as DragState;
		state.target = itemOf(leaf, opts.dragItem);
		state.location = {
			trigger: opts.trigger,
			target: opts.target,
			direction: opts.direction
		};
		nav.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
		return state;
	} finally {
		if (getLayoutStore().dragging) {
			Layout.navDragend!(event as never);
		}
	}
};

describe('navDrop 同组重排', () => {
	it('drop 到组 nav 空白（append 语义）：页签与页移到底部、tabs 同步、往返保真', async () => {
		const { leaves } = await mountDirectory();
		const leaf = leaves[0];
		const group = leaf.nav.parentNode as HTMLElement & { tabs?: string[] };
		expect(navValues(leaf.nav)).toEqual(['project', 'inspector']);
		expect(managerValues(leaf.manager)).toEqual(['project', 'inspector']);

		dragDrop(leaf, {
			dragItem: 'project',
			trigger: leaf.nav,
			target: group,
			direction: 'inside'
		});

		expect(navValues(leaf.nav)).toEqual(['inspector', 'project']);
		expect(managerValues(leaf.manager)).toEqual(['inspector', 'project']);
		expect(group.tabs).toEqual(['inspector', 'project']);
		expect(Layout.saveLayoutScheme!(leaf.nav.parentNode?.parentNode as never)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['inspector', 'project'] },
				{ end: 1, tabs: ['scene'] }
			]
		});
	});

	it('drop 到目标页签前（insert-before 语义）：页签与页移到指定位置', async () => {
		const { leaves } = await mountDirectory();
		const leaf = leaves[0];
		dragDrop(leaf, {
			dragItem: 'inspector',
			trigger: itemOf(leaf, 'project'),
			target: leaf.nav.parentNode as HTMLElement,
			direction: 'inside'
		});

		expect(navValues(leaf.nav)).toEqual(['inspector', 'project']);
		expect(managerValues(leaf.manager)).toEqual(['inspector', 'project']);
	});
});

describe('navDrop 跨组搬入', () => {
	it('drop 到另一组：页签/页迁入目标组，源组激活首项，双方 tabs 同步', async () => {
		const { fixture, leaves } = await mountDirectory();
		const sLeaf = leaves[0];
		const dLeaf = leaves[1];
		const dGroup = dLeaf.nav.parentNode as HTMLElement & { tabs?: string[] };
		expect(navValues(sLeaf.nav)).toEqual(['project', 'inspector']);
		expect(navValues(dLeaf.nav)).toEqual(['scene']);

		dragDrop(sLeaf, {
			dragItem: 'inspector',
			trigger: dLeaf.nav,
			target: dGroup,
			direction: 'inside'
		});
		// 跨组 drop 触发重挂载（Vue 树与 DOM 重新一致），再模拟整壳落位
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);
		const root = fixture.directory.firstElementChild as HTMLElement;
		const next = collectLeaves(root);
		expect(next.map((l) => navValues(l.nav))).toEqual([['project'], ['scene', 'inspector']]);
		expect(next.map((l) => managerValues(l.manager))).toEqual([
			['project'],
			['scene', 'inspector']
		]);
		expect(Layout.saveLayoutScheme!(root as never)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['project'] },
				{ end: 1, tabs: ['scene', 'inspector'] }
			]
		});
	});

	it('源组被搬空：页签/页迁入目标组后源组折叠，根收敛为单组', async () => {
		const { fixture, leaves } = await mountDirectory();
		const sLeaf = leaves[1]; // [scene] 单页签组
		const dLeaf = leaves[0]; // [project, inspector]
		const dGroup = dLeaf.nav.parentNode as HTMLElement & { tabs?: string[] };

		dragDrop(sLeaf, {
			dragItem: 'scene',
			trigger: dLeaf.nav,
			target: dGroup,
			direction: 'inside'
		});
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);

		// 源组已折叠，根收敛为单组（根自身即叶子）
		const root = fixture.directory.firstElementChild as HTMLElement;
		expect(root.classList.contains('group')).toBe(true);
		expect((root as HTMLElement & { split?: string }).split).toBeUndefined();
		const host = root as HTMLElement & { nav?: HTMLElement; manager?: LayoutLeaf['manager'] };
		const merged: LayoutLeaf[] =
			host.nav && host.manager
				? [{ nav: host.nav, manager: host.manager }]
				: collectLeaves(root);
		expect(merged).toHaveLength(1);
		expect(navValues(merged[0].nav)).toEqual(['project', 'inspector', 'scene']);
		expect(managerValues(merged[0].manager)).toEqual(['project', 'inspector', 'scene']);
		expect(Layout.saveLayoutScheme!(root as never)).toEqual({
			end: 1,
			tabs: ['project', 'inspector', 'scene']
		});
	});
});

describe('navDrop region 边缘（结构性分割，几何用例的 jsdom 侧）', () => {
	it('drop 到目标组右缘：右侧新建叶子承接页签，源组保留其余页签', async () => {
		const { fixture, leaves } = await mountDirectory();
		const leaf = leaves[0]; // [project, inspector]
		expect(navValues(leaf.nav)).toEqual(['project', 'inspector']);

		const event = createDragEvent();
		try {
			Layout.navDragstart!.call(leaf.nav, event as never);
			const state = getLayoutStore().dragging as unknown as DragState;
			state.target = itemOf(leaf, 'inspector');
			state.location = {
				trigger: leaf.nav,
				target: leaf.nav.parentNode as HTMLElement,
				direction: 'right'
			};
			leaf.nav.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
		} finally {
			if (getLayoutStore().dragging) Layout.navDragend!(event as never);
		}

		// 数据先行：drop 的**同步**生效结果是 `layout` 里的新树（DOM 由随后的整树重挂载落地，
		// 因此这一层断言读数据、不读 DOM）——目标叶子 [0, 0.5] 收缩到 0.25，新叶子承接原右边界 0.5。
		expect(Layout.layout!.directory).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.25, tabs: ['project'] },
				{ end: 0.5, tabs: ['inspector'] },
				{ end: 1, tabs: ['scene'] }
			]
		});

		// 随后完成 Vue 组树重挂载，DOM 与数据一致（一致性另由 teleport 端到端 spec 覆盖）。
		// ⚠️ 整树重挂载会**新建**根元素：必须重新取一次，旧引用已脱离文档。
		await awaitVueLayoutLoad();
		await nextTick();
		placePaletteIntoLeaves(fixture);
		const remounted = fixture.directory.firstElementChild as HTMLElement;

		const scheme = Layout.saveLayoutScheme!(remounted as never) as {
			children?: Array<{ tabs?: string[]; end?: number }>;
		};
		expect(
			Array.from(remounted.children)
				.filter((child) => child.classList.contains('group'))
				.map((child) =>
					Array.from(child.querySelectorAll(':scope > .nav-bar > .nav-item')).map(
						(item) => item.getAttribute('value')
					)
				)
		).toEqual([['project'], ['inspector'], ['scene']]);
		expect(scheme.children?.map((child) => child.tabs)).toEqual([
			['project'],
			['inspector'],
			['scene']
		]);
		// 落位分割点 = 目标跨度中点（与拖拽 hint 的「一半」语义一致）；
		// 若两叶 end 都留在 1 会互相重叠 → 边界线不可命中、无法拖拽缩放。
		expect(scheme.children?.map((child) => child.end)).toEqual([0.25, 0.5, 1]);
	});

	it('drop 到目标组左缘：左侧新建叶子承接页签，目标页签保留且 end 对分', async () => {
		const { fixture, leaves } = await mountDirectory();
		const leaf = leaves[0]; // [project, inspector]

		const event = createDragEvent();
		try {
			Layout.navDragstart!.call(leaf.nav, event as never);
			const state = getLayoutStore().dragging as unknown as DragState;
			state.target = itemOf(leaf, 'inspector');
			state.location = {
				trigger: leaf.nav,
				target: leaf.nav.parentNode as HTMLElement,
				direction: 'left'
			};
			leaf.nav.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
		} finally {
			if (getLayoutStore().dragging) Layout.navDragend!(event as never);
		}

		// 数据先行（同上一例）：左缘 ⇒ 新叶子取 [0, 0.25]，目标叶子保持原 end 0.5
		expect(Layout.layout!.directory).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.25, tabs: ['inspector'] },
				{ end: 0.5, tabs: ['project'] },
				{ end: 1, tabs: ['scene'] }
			]
		});

		await awaitVueLayoutLoad();
		await nextTick();
		placePaletteIntoLeaves(fixture);
		// 整树重挂载会新建根元素：重新取一次（旧引用已脱离文档）
		const remounted = fixture.directory.firstElementChild as HTMLElement;

		const scheme = Layout.saveLayoutScheme!(remounted as never) as {
			children?: Array<{ tabs?: string[]; end?: number }>;
		};
		expect(scheme.children?.map((child) => child.tabs)).toEqual([
			['inspector'],
			['project'],
			['scene']
		]);
		expect(scheme.children?.map((child) => child.end)).toEqual([0.25, 0.5, 1]);
	});
});

/* ---------------- region 落点是**容器**（回归：hint 出现但松手没效果） ----------------
 *
 * 复现路径（动画工作区）：把底部时间轴页签拖到别处，再拖回原来的底部位置。
 * 指针压到「底部一条」时 `regionDragover` 会把 target 指到**容器**（父容器 / root / 外层容器），
 * hint 画的正是「该容器的一半」；此前结构性 drop 只认叶子落点 → `applyStructuralDrop` 返回 null，
 * 占位框照旧出现、松手毫无效果（页签既没回去也没报错）。 */

const ANIMATION_VALUES = [
	'animation-motion',
	'animation',
	'animation-timeline',
	'inspector',
	'animation-easing'
] as const;

/** 与 Project/default.json 的 animation 页同形：左列 = motion|animation + 底部时间轴，右列 = inspector + easing */
const ANIMATION_SCHEME: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{
			end: 0.82,
			split: 'vertical',
			children: [
				{
					end: 0.74,
					split: 'horizontal',
					children: [
						{ end: 0.18, tabs: ['animation-motion'] },
						{ end: 1, tabs: ['animation'] }
					]
				},
				{ end: 1, tabs: ['animation-timeline'] }
			]
		},
		{
			end: 1,
			split: 'vertical',
			children: [
				{ end: 0.74, tabs: ['inspector'] },
				{ end: 1, tabs: ['animation-easing'] }
			]
		}
	]
};

const mountAnimation = async () => {
	const fixture = buildLayoutFixture(ANIMATION_VALUES);
	registerLayout(fixture);
	Layout.heads = [];
	switchWorkspace(fixture, 'directory');
	await mountScheme('directory', ANIMATION_SCHEME);
	return fixture;
};

/** 「拖到其他位置」那一步：时间轴页签落进右下角 easing 组（跨组 inside）；返回重挂载后的叶子表 */
const moveTimelineIntoEasing = async (
	fixture: Awaited<ReturnType<typeof mountAnimation>>
): Promise<LayoutLeaf[]> => {
	const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
	dragDrop(leaves[2], {
		dragItem: 'animation-timeline',
		trigger: leaves[4].nav,
		target: leaves[4].nav.parentNode as HTMLElement,
		direction: 'inside'
	});
	await awaitVueLayoutLoad();
	placePaletteIntoLeaves(fixture);
	return collectLeaves(fixture.directory.firstElementChild as HTMLElement);
};

/** 对 region 元素派发一次已进入 location 的结构性 drop（落点/方向由调用方给定，模拟几何命中结果） */
const regionDrop = (
	srcLeaf: LayoutLeaf,
	opts: {
		dragItem: string;
		target: HTMLElement;
		direction: string;
		/** 指针所在叶子（其 region 元素派发事件）；缺省用源叶子 */
		regionOf?: LayoutLeaf;
	}
): void => {
	const event = createDragEvent();
	try {
		Layout.navDragstart!.call(srcLeaf.nav, event as never);
		const state = getLayoutStore().dragging as unknown as DragState;
		state.target = itemOf(srcLeaf, opts.dragItem);
		const host = opts.regionOf ?? srcLeaf;
		const region = state.regions.find((r) => r.parentNode === host.nav.parentNode);
		expect(region).toBeDefined();
		state.location = { trigger: region!, target: opts.target, direction: opts.direction };
		region!.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
	} finally {
		if (getLayoutStore().dragging) Layout.navDragend!(event as never);
	}
};

/** 把时间轴搬进 easing 组后的树：左列塌成单个横向容器，时间轴挂在右下角 */
const MOVED_AWAY_SCHEME = {
	end: 1,
	split: 'horizontal',
	children: [
		{
			end: 0.82,
			split: 'horizontal',
			children: [
				{ end: 0.18, tabs: ['animation-motion'] },
				{ end: 1, tabs: ['animation'] }
			]
		},
		{
			end: 1,
			split: 'vertical',
			children: [
				{ end: 0.74, tabs: ['inspector'] },
				{ end: 1, tabs: ['animation-easing', 'animation-timeline'] }
			]
		}
	]
};

describe('navDrop region 容器落点（页签拖回原底部位置）', () => {
	it('搬到右下角后拖回左侧栏底部（落点=父容器）：容器下半开新叶子，页签回到底部', async () => {
		const fixture = await mountAnimation();
		const leaves = await moveTimelineIntoEasing(fixture);
		expect(Layout.layout!.directory).toEqual(MOVED_AWAY_SCHEME);

		const easeLeaf = leaves[3]; // [animation-easing, animation-timeline]
		const animationLeaf = leaves[1];
		const leftColumn = animationLeaf.nav.parentNode?.parentNode as HTMLElement;

		regionDrop(easeLeaf, {
			dragItem: 'animation-timeline',
			target: leftColumn, // ← region 的容器落点（原来这里是叶子落点）
			direction: 'bottom',
			regionOf: animationLeaf
		});

		// 数据先行：drop 同步生效 —— 左侧栏被包进竖向容器，容器上半留给 motion|animation，下半承接时间轴
		expect(Layout.layout!.directory).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{
					end: 0.82,
					split: 'vertical',
					children: [
						{
							end: 0.5,
							split: 'horizontal',
							children: [
								{ end: 0.18, tabs: ['animation-motion'] },
								{ end: 1, tabs: ['animation'] }
							]
						},
						{ end: 1, tabs: ['animation-timeline'] }
					]
				},
				{
					end: 1,
					split: 'vertical',
					children: [
						{ end: 0.74, tabs: ['inspector'] },
						{ end: 1, tabs: ['animation-easing'] }
					]
				}
			]
		});

		// 重挂载后 DOM 与数据一致：时间轴回到左列底部，且是独立一组
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);
		const next = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		expect(next.map((leaf) => navValues(leaf.nav))).toEqual([
			['animation-motion'],
			['animation'],
			['animation-timeline'],
			['inspector'],
			['animation-easing']
		]);
		expect(next.map((leaf) => managerValues(leaf.manager))).toEqual([
			['animation-motion'],
			['animation'],
			['animation-timeline'],
			['inspector'],
			['animation-easing']
		]);
	});

	it('落点=根容器（窗口最下缘）：整棵树包进同轴容器，时间轴独占底部一行', async () => {
		const fixture = await mountAnimation();
		const leaves = await moveTimelineIntoEasing(fixture);

		const easeLeaf = leaves[3];
		const root = fixture.directory.firstElementChild as HTMLElement;

		regionDrop(easeLeaf, {
			dragItem: 'animation-timeline',
			target: root, // ← region 的 root 落点（y > 高度 - 8）
			direction: 'bottom',
			regionOf: leaves[1]
		});

		expect(Layout.layout!.directory).toEqual({
			end: 1,
			split: 'vertical',
			children: [
				{
					end: 0.5,
					split: 'horizontal',
					children: [
						{
							end: 0.82,
							split: 'horizontal',
							children: [
								{ end: 0.18, tabs: ['animation-motion'] },
								{ end: 1, tabs: ['animation'] }
							]
						},
						{
							end: 1,
							split: 'vertical',
							children: [
								{ end: 0.74, tabs: ['inspector'] },
								{ end: 1, tabs: ['animation-easing'] }
							]
						}
					]
				},
				{ end: 1, tabs: ['animation-timeline'] }
			]
		});
	});

	it('右侧落点（轴不同的容器）：源组剩余页签原样保留，时间轴独占右侧一列', async () => {
		const fixture = await mountAnimation();
		const leaves = await moveTimelineIntoEasing(fixture);
		const easeLeaf = leaves[3];
		const root = fixture.directory.firstElementChild as HTMLElement;

		regionDrop(easeLeaf, {
			dragItem: 'animation-timeline',
			target: root,
			direction: 'right',
			regionOf: leaves[1]
		});

		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);
		const next = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		// 源组（easing）还剩 animation-easing —— 既没被搬空折叠，也没丢页签
		expect(next.map((leaf) => navValues(leaf.nav))).toEqual([
			['animation-motion'],
			['animation'],
			['inspector'],
			['animation-easing'],
			['animation-timeline']
		]);
	});
});
