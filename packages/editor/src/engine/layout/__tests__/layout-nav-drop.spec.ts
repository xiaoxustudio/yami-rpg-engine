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
import type { LayoutLeaf } from './layout-spec-utils';

// M4 前置（docs/layout-vue-plan.md M1/M4）：navDrop 生效动作金标准。
// 在当前命令式实现上锁定 nav 拖拽 drop 的 DOM/数据语义（同组重排/插前、跨组搬入），
// 供 M4「生效动作数据化（moveLayoutTab/updateGroupTabs 读数据）」改造对照与回滚。
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
		// 跨组 drop 触发 M4-2 重挂载（Vue 树与 DOM 重新一致），再模拟整壳落位
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

describe('navDrop region 边缘（结构性分割，M4 几何用例的 jsdom 侧）', () => {
	it('drop 到目标组右缘：右侧新建叶子承接页签，源组保留其余页签', async () => {
		const { fixture, leaves } = await mountDirectory();
		const leaf = leaves[0]; // [project, inspector]
		const root = fixture.directory.firstElementChild as HTMLElement;
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

		// region drop 的生效动作是同步的：先锁定结构语义（右侧新叶子承接页签，源组保留其余）
		const scheme = Layout.saveLayoutScheme!(root as never) as {
			children?: Array<{ tabs?: string[] }>;
		};
		expect(
			Array.from(root.children)
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

		// M4-2：随后完成 Vue 组树重挂载（一致性由 teleport 端到端 spec 覆盖）
		await awaitVueLayoutLoad();
		await nextTick();
		placePaletteIntoLeaves(fixture);
	});
});
