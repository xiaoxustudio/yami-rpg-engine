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
		const sLeaf = leaves[1];
		const dLeaf = leaves[0];
		const dGroup = dLeaf.nav.parentNode as HTMLElement & { tabs?: string[] };

		dragDrop(sLeaf, {
			dragItem: 'scene',
			trigger: dLeaf.nav,
			target: dGroup,
			direction: 'inside'
		});
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);

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

/* ---------------- 组内合并后的「唯一激活」不变量 ----------------
 *
 * 回归（实机：把「动作」拖到时间轴面板上）：
 *  · 两个页签**同时**是选中态（点哪个都亮）；
 *  · 内容永远停在被拖进来的那个面板上。
 * 根因是同一类「只清一个」：页签/页框由整壳 Teleport 在分组间搬运，会把**旧组的** `selected`
 * / `visible` 一起带过来，而旧实现只清「自己记着的那一个」——
 *   · `YMNavBar.unselect()` 用 `querySelector('.selected')` 只清第一个 ⇒ 残留 + 新选中同时亮；
 *   · `YMPageManager` 只 `removeClass(active,'visible')` ⇒ 第二个 `.visible` 页框永远留着，
 *     而页框是 `position:absolute; inset:0`，DOM 序靠后的那个盖在上面 ⇒ 看到的一直是它。
 */

const selectedValues = (nav: HTMLElement): string[] =>
	Array.from(nav.querySelectorAll('.nav-item.selected')).map(
		(item) => item.getAttribute('value') ?? ''
	);

const visibleValues = (manager: HTMLElement): string[] =>
	Array.from(manager.querySelectorAll('.page-frame.visible')).map(
		(frame) => frame.getAttribute('value') ?? ''
	);

describe('组内合并（动作 → 时间轴）：每个叶子只允许一个选中 / 一个可见', () => {
	const mergeMotionIntoTimeline = async () => {
		const fixture = await mountAnimation();
		let leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		const timelineLeaf = leaves[2];
		const motionLeaf = leaves[0];
		dragDrop(motionLeaf, {
			dragItem: 'animation-motion',
			trigger: timelineLeaf.nav,
			target: timelineLeaf.nav.parentNode as HTMLElement,
			direction: 'inside'
		});
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);
		await nextTick();
		leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		const merged = leaves.find((leaf) =>
			(leaf.nav.parentNode as HTMLElement & { tabs?: string[] }).tabs?.includes(
				'animation-motion'
			)
		);
		expect(merged).toBeDefined();
		return { fixture, leaves, merged: merged! };
	};

	it('合并后：nav 与 manager 各只有一个激活，且两者一致', async () => {
		const { merged } = await mergeMotionIntoTimeline();

		expect(navValues(merged.nav)).toEqual(['animation-timeline', 'animation-motion']);
		expect(managerValues(merged.manager)).toEqual(['animation-timeline', 'animation-motion']);
		expect(selectedValues(merged.nav)).toHaveLength(1);
		expect(visibleValues(merged.manager)).toHaveLength(1);
		expect(selectedValues(merged.nav)).toEqual(visibleValues(merged.manager));
	});

	it('合并后点击另一个页签：选中与可见一起迁移，仍各只有一个', async () => {
		const { merged } = await mergeMotionIntoTimeline();
		const before = selectedValues(merged.nav)[0];
		const target = before === 'animation-motion' ? 'animation-timeline' : 'animation-motion';

		itemOf(merged, target).dispatchEvent(
			new MouseEvent('pointerdown', { bubbles: true, button: 0 })
		);
		await nextTick();

		expect(selectedValues(merged.nav)).toEqual([target]);
		expect(visibleValues(merged.manager)).toEqual([target]);
	});
});

describe('navDrop region 边缘（结构性分割，几何用例的 jsdom 侧）', () => {
	it('drop 到目标组右缘：右侧新建叶子承接页签，源组保留其余页签', async () => {
		const { fixture, leaves } = await mountDirectory();
		const leaf = leaves[0];
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

		expect(Layout.layout!.directory).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.25, tabs: ['project'] },
				{ end: 0.5, tabs: ['inspector'] },
				{ end: 1, tabs: ['scene'] }
			]
		});

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
		expect(scheme.children?.map((child) => child.end)).toEqual([0.25, 0.5, 1]);
	});

	it('drop 到目标组左缘：左侧新建叶子承接页签，目标页签保留且 end 对分', async () => {
		const { fixture, leaves } = await mountDirectory();
		const leaf = leaves[0];

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

const ANIMATION_VALUES = [
	'animation-motion',
	'animation',
	'animation-timeline',
	'inspector',
	'animation-easing'
] as const;

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

		const easeLeaf = leaves[3];
		const animationLeaf = leaves[1];
		const leftColumn = animationLeaf.nav.parentNode?.parentNode as HTMLElement;

		regionDrop(easeLeaf, {
			dragItem: 'animation-timeline',
			target: leftColumn,
			direction: 'bottom',
			regionOf: animationLeaf
		});

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
			target: root,
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
		expect(next.map((leaf) => navValues(leaf.nav))).toEqual([
			['animation-motion'],
			['animation'],
			['inspector'],
			['animation-easing'],
			['animation-timeline']
		]);
	});
});
