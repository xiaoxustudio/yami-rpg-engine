import { describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Layout } from '@app/engine/layout/layout.ts';
import { write } from '@app/utils/element-utils';
import type { PageManagerApi } from '@ui-kit';
import {
	buildLayoutFixture,
	DIRECTORY_SCHEME,
	mountScheme,
	registerLayout,
	type LayoutFixture,
	navValues,
	managerValues,
	selectedOf,
	visibleOf,
	clickNavItem
} from './layout-spec-utils';
import { mountVueGroupTree, type VueLeafHost } from '../layout-vue-tree';
import type { LayoutSchemeData } from '../layout-scheme';

// M3b-1 金标准（docs/layout-vue-plan.md C.5#1）：叶子宿主 Vue 化后命令式兼容零改动。
// 双路对照：命令式 loadLayoutScheme 产出的 group DOM ↔ LayoutTreeView(.vue 叶子宿主)
// + mountVueGroupTree 水合后的 DOM——结构、expando、页签激活与点击切换必须等价。

const SCHEMES: { name: string; scheme: LayoutSchemeData }[] = [
	{ name: 'directory', scheme: DIRECTORY_SCHEME as LayoutSchemeData },
	{
		name: 'scene',
		scheme: {
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['scene', 'project'] },
				{ end: 1, tabs: ['inspector'] }
			]
		}
	},
	{ name: 'single-leaf', scheme: { end: 1, tabs: ['project', 'scene', 'inspector'] } }
];

const structureSignature = (root: Element): string => {
	const isStructural = (el: Element): boolean =>
		el.classList.contains('group') || el.classList.contains('group-border');
	const kind = (el: Element): string => {
		if (el.classList.contains('group-border')) return 'B';
		if (el.classList.contains('horizontal')) return 'H';
		if (el.classList.contains('vertical')) return 'V';
		return 'L';
	};
	const walk = (el: Element): string =>
		kind(el) + Array.from(el.children).filter(isStructural).map(walk).join('');
	return walk(root);
};

const countLeaves = (root: Element): number =>
	Array.from(root.querySelectorAll('.group')).filter((el) =>
		Array.from(el.children).some(
			(child) => child instanceof HTMLElement && child.classList.contains('nav-bar')
		)
	).length;

/** P4b：组的 `end` 是元素数据（原型访问器即将退役），规格改走显式视图 */
const groupEndOf = (el: unknown): number => elementDataOf<{ end: number }>(el).end;

/** 命令式基线：进入 directory 工作区并加载 scheme（palette 被清、页/页签搬进 group）。 */
const commandState = async (scheme: LayoutSchemeData): Promise<LayoutFixture> => {
	const fixture = buildLayoutFixture();
	registerLayout(fixture);
	fixture.workspace.switch('directory');
	await mountScheme('directory', scheme);
	return fixture;
};

/** Vue 路径基线：宿主页挂 LayoutTreeView 树 + 水合，再按水合叶子把 items 搬入并激活首 tab。 */
async function vueState(
	scheme: LayoutSchemeData
): Promise<{ fixture: LayoutFixture; host: HTMLElement; leaves: VueLeafHost[] }> {
	const fixture = buildLayoutFixture();
	const host = document.createElement('div');
	host.className = 'page-frame';
	host.id = 'vue-workspace';
	document.body.append(host);

	const handle = await mountVueGroupTree(host, scheme, {
		navWrite: Layout.navWrite as unknown as (event: Event) => void,
		navPointerdown: Layout.navPointerdown as unknown as (event: Event) => void
	});
	for (const leaf of handle.leaves) {
		for (const tab of leaf.tabs) {
			const item = fixture.items[tab];
			leaf.nav.appendChild(item);
			leaf.manager.appendChild(item.page);
		}
	}
	for (const leaf of handle.leaves) {
		write(leaf.nav, leaf.tabs[0]);
	}
	return { fixture, host, leaves: handle.leaves };
}

describe('M3b-1 双路等价：Vue 叶子宿主 vs 命令式 group', () => {
	for (const { name, scheme } of SCHEMES) {
		it(`${name}：组树结构/叶子宿主类/叶子数一致`, async () => {
			const cmd = await commandState(scheme);
			const cmdRoot = cmd.directory.firstElementChild as HTMLElement;

			const vueFixture = buildLayoutFixture();
			const host = document.createElement('div');
			document.body.append(host);
			const handle = await mountVueGroupTree(host, scheme, {});
			try {
				expect(structureSignature(handle.root)).toBe(structureSignature(cmdRoot));
				expect(countLeaves(handle.root)).toBe(countLeaves(cmdRoot));
				expect(handle.root.parentNode).toBe(host);
				for (const leaf of handle.leaves) {
					expect(leaf.nav.classList.contains('nav-bar')).toBe(true);
					expect(leaf.manager.classList.contains('page-manager')).toBe(true);
					expect(leaf.manager.classList.contains('group-manager')).toBe(true);
					expect(leaf.border.classList.contains('group-border')).toBe(true);
				}
				expect(vueFixture.paletteNav.parentNode).not.toBeNull();
				expect(vueFixture.paletteManager.parentNode).not.toBeNull();
			} finally {
				handle.unmount();
			}
		});
	}

	it('水合后叶子宿主带命令式 API 且 expando 与数据树一致', async () => {
		const fixture = buildLayoutFixture();
		const host = document.createElement('div');
		document.body.append(host);
		const handle = await mountVueGroupTree(host, DIRECTORY_SCHEME as LayoutSchemeData, {
			navWrite: Layout.navWrite as unknown as (event: Event) => void
		});
		try {
			const root = handle.root as HTMLElement & { split?: string };
			expect(groupEndOf(root)).toBe(1);
			expect(root.split).toBe('horizontal');

			expect(handle.leaves).toHaveLength(2);
			const [left, right] = handle.leaves;
			expect(groupEndOf(left.element)).toBe(0.5);
			expect(left.tabs).toEqual(['project', 'inspector']);
			expect(right.tabs).toEqual(['scene']);

			expect(typeof (left.nav as HTMLElement & { write?: unknown }).write).toBe('function');
			expect(typeof (left.nav as HTMLElement & { read?: unknown }).read).toBe('function');
			expect(typeof (left.manager as PageManagerApi).switch).toBe('function');
			expect(left.manager.index).toBeNull();

			// 页/页签搬入后首 tab 激活（nav selected + page visible + manager 状态）
			for (const tab of left.tabs) {
				left.nav.appendChild(fixture.items[tab]);
				left.manager.appendChild(fixture.items[tab].page);
			}
			write(left.nav, 'project');
			expect(selectedOf(left.nav)).toBe('project');
			expect(visibleOf(left.manager)).toEqual(['project']);
			expect(left.manager.active).toBe(fixture.items.project.page);
			expect(left.manager.index).toBe('project');
		} finally {
			handle.unmount();
		}
	});

	it('双路行为等价：首载激活与页签点击切换（目录 scheme）', async () => {
		// 命令式 oracle
		const cmd = await commandState(DIRECTORY_SCHEME as LayoutSchemeData);
		const cmdRoot = cmd.directory.firstElementChild as HTMLElement;
		const cmdLeaves = [] as { nav: HTMLElement; manager: PageManagerApi }[];
		const collect = (group: Element): void => {
			for (const child of Array.from(group.children)) {
				if (!child.classList.contains('group')) continue;
				const leaf = child as HTMLElement & { nav: HTMLElement; manager: PageManagerApi };
				if (leaf.manager) {
					cmdLeaves.push({ nav: leaf.nav, manager: leaf.manager });
				} else {
					collect(child);
				}
			}
		};
		collect(cmdRoot);

		const { fixture: vueFixture, leaves: vueLeaves } = await vueState(
			DIRECTORY_SCHEME as LayoutSchemeData
		);
		try {
			for (let i = 0; i < cmdLeaves.length; i++) {
				expect(navValues(vueLeaves[i].nav)).toEqual(navValues(cmdLeaves[i].nav));
				expect(managerValues(vueLeaves[i].manager)).toEqual(
					managerValues(cmdLeaves[i].manager)
				);
				expect(selectedOf(vueLeaves[i].nav)).toBe(selectedOf(cmdLeaves[i].nav));
				expect(visibleOf(vueLeaves[i].manager)).toEqual(visibleOf(cmdLeaves[i].manager));
				expect(vueLeaves[i].manager.index).toBe(cmdLeaves[i].manager.index);
			}

			// 点击页签：nav pointerdown → YMNavBar write → Layout.navWrite → manager.switch
			clickNavItem(vueLeaves[0].nav, 'inspector');
			expect(selectedOf(vueLeaves[0].nav)).toBe('inspector');
			expect(visibleOf(vueLeaves[0].manager)).toEqual(['inspector']);
			expect(vueLeaves[0].manager.active).toBe(vueFixture.items.inspector.page);
			expect(vueLeaves[0].manager.index).toBe('inspector');

			// 命令式同点击对照
			clickNavItem(cmdLeaves[0].nav, 'inspector');
			expect(selectedOf(cmdLeaves[0].nav)).toBe('inspector');
			expect(visibleOf(cmdLeaves[0].manager)).toEqual(['inspector']);
		} finally {
			// vueState 无 unmount 引用暴露时，宿主编排由各用例管理；此处只需保证下例干净
			document.body.innerHTML = '';
		}
	});

	it('unmount 只移除组树；宿主可再次挂载新树', async () => {
		const fixture = buildLayoutFixture();
		const host = document.createElement('div');
		document.body.append(host);

		const first = await mountVueGroupTree(host, DIRECTORY_SCHEME as LayoutSchemeData, {});
		expect(host.firstElementChild).toBe(first.root);
		first.unmount();
		expect(host.firstElementChild).toBeNull();
		// palette 归属宿主不受影响
		expect(fixture.paletteManager.parentNode).not.toBeNull();
		first.unmount(); // 幂等

		const second = await mountVueGroupTree(host, DIRECTORY_SCHEME as LayoutSchemeData, {});
		try {
			expect(host.firstElementChild).toBe(second.root);
			expect(second.leaves).toHaveLength(2);
			expect(second.leaves[0].nav.isConnected).toBe(true);
		} finally {
			second.unmount();
		}
	});
});
