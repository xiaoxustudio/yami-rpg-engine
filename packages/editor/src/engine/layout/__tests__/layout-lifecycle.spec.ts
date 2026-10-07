import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Layout, getNavLastValue, awaitVueLayoutLoad } from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';
import '@app/utils/math';
import {
	buildLayoutFixture,
	clickNavItem,
	collectLeaves,
	DIRECTORY_SCHEME,
	managerValues,
	mountScheme,
	NESTED_MERGE_SCHEME,
	registerLayout,
	selectedOf,
	switchWorkspace,
	visibleOf
} from './layout-spec-utils';

type DragEventLike = {
	dataTransfer: { setDragImage: () => void };
	preventDefault: () => void;
	clientX: number;
	clientY: number;
};

beforeEach(() => {
	document.body.innerHTML = '';
});

describe('saveNavStates / lastValue 会话恢复', () => {
	it('离开工作区：selected→nav.lastValue，随后 write(null) 清空 selected 与激活页', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		const root = fixture.directory.firstElementChild as HTMLElement;
		const leaves = collectLeaves(root);

		expect(selectedOf(leaves[0].nav)).toBe('project');
		expect(selectedOf(leaves[1].nav)).toBe('scene');

		Layout.saveNavStates!();

		expect(getNavLastValue(leaves[0].nav)).toBe('project');
		expect(getNavLastValue(leaves[1].nav)).toBe('scene');
		expect(selectedOf(leaves[0].nav)).toBeNull();
		expect(visibleOf(leaves[0].manager)).toEqual([]);
		expect(leaves[0].manager.index).toBeUndefined();
		expect(leaves[1].manager.index).toBeUndefined();
	});

	it('同页二次加载走 else 分支：从 nav.lastValue 恢复上次激活页签', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		const root = fixture.directory.firstElementChild as HTMLElement;
		const leaves = collectLeaves(root);

		clickNavItem(leaves[0].nav, 'inspector');
		Layout.saveNavStates!();

		Layout.loadLayoutScheme!('directory');
		await awaitVueLayoutLoad();

		const restored = collectLeaves(root);
		expect(selectedOf(restored[0].nav)).toBe('inspector');
		expect(visibleOf(restored[0].manager)).toEqual(['inspector']);
		expect(restored[0].manager.index).toBe('inspector');
		expect(selectedOf(restored[1].nav)).toBe('scene');
		expect(restored[1].manager.index).toBe('scene');
	});
});

describe('updateGroupTabs 结构同步', () => {
	it('DOM 重排后读 nav 子序重建 group.tabs，并进入 saveLayoutScheme 往返', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		const root = fixture.directory.firstElementChild as HTMLElement;
		const leaf = collectLeaves(root)[0];
		const group = leaf.manager.parentNode as HTMLElement & { tabs?: string[] };

		expect(group.tabs).toEqual(['project', 'inspector']);
		leaf.nav.appendChild(leaf.nav.querySelector('[value="project"]') as HTMLElement);
		Layout.updateGroupTabs!(group as never);

		expect(group.tabs).toEqual(['inspector', 'project']);
		expect(Layout.saveLayoutScheme!(root as never)).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['inspector', 'project'] },
				{ end: 1, tabs: ['scene'] }
			]
		});
	});
});

describe('mergeGroups 折叠合并', () => {
	it('同向嵌套 split 合并为平铺叶子，并重算 end 比例', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', NESTED_MERGE_SCHEME);
		const root = fixture.directory.firstElementChild as HTMLElement;
		expect(
			Array.from(root.children).filter((child) => child.classList.contains('group'))
		).toHaveLength(2);

		Layout.mergeGroups!();

		const groups = Array.from(root.children).filter((child) =>
			child.classList.contains('group')
		);
		expect(groups).toHaveLength(3);
		expect(root.querySelectorAll('.group')).toHaveLength(3);

		const leaves = collectLeaves(root);
		expect(leaves.map((leaf) => leaf.nav.firstElementChild?.getAttribute('value'))).toEqual([
			'project',
			'scene',
			'inspector'
		]);

		const ends = groups.map((group) => elementDataOf<{ end: number }>(group).end);
		expect(ends[0]).toBeCloseTo(0.3, 6);
		expect(ends[1]).toBeCloseTo(0.6, 6);
		expect(ends[2]).toBeCloseTo(1, 6);
	});
});

describe('navDragstart / navDragend 生命周期', () => {
	const createDragEvent = (): DragEventLike => ({
		dataTransfer: { setDragImage: () => {} },
		preventDefault: () => {},
		clientX: 0,
		clientY: 0
	});

	it('拖拽期：store.dragging 建立、每个 group 插入 region、head 屏蔽指针；结束后全部还原', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		const nav = leaves[0].nav;
		const group = nav.parentNode as HTMLElement;
		const head = document.createElement('div');
		document.body.append(head);
		Layout.heads = [head];
		const event = createDragEvent();

		try {
			Layout.navDragstart!.call(nav, event as never);
			const dragging = getLayoutStore().dragging;
			expect(dragging).not.toBeNull();
			expect(dragging.group).toBe(group);
			expect(dragging.hint).toBeTruthy();
			expect(dragging.hint.classList.contains('for-group')).toBe(true);
			expect(
				leaves[0].nav.parentNode?.querySelector('group-region.group-region')
			).toBeTruthy();
			expect(head.style.pointerEvents).toBe('none');
		} finally {
			if (getLayoutStore().dragging) {
				Layout.navDragend!(event as never);
			}
		}

		expect(getLayoutStore().dragging).toBeNull();
		expect(group.querySelector('group-region')).toBeNull();
		expect(head.style.pointerEvents).toBe('');
		expect(managerValues(leaves[0].manager)).toEqual(['project', 'inspector']);
	});
});
