import { beforeEach, describe, expect, it } from 'vitest';
import { Layout, getPageScheme, setItemPage } from '@app/engine/layout/layout.ts';
import { createPageManagerElement, type PageManagerApi } from '@ui-kit';
import '@app/utils/css';

// layout Vue 化的行为金标准（docs/layout-vue-plan.md M1）
// 锁定：palette 消耗/清理、scheme 首载 group 结构、首 tab 激活、页签点击切换、
// 跨工作区搬移（节点对象不变、parent 迁移）、二次加载 lastValue 恢复、scheme 往返保真。
// 这些是后续 M3（Vue 渲染 group + Teleport）必须保持的"最终 DOM 形态等价"基线。

type SchemeNode = {
	end: number;
	split?: string;
	children?: SchemeNode[];
	tabs?: string[];
};

type LayoutLeafElement = {
	nav: HTMLElement;
	manager: PageManagerApi;
};

type LayoutItemElement = HTMLElement & { page: HTMLElement };

interface LayoutFixture {
	workspace: PageManagerApi;
	directory: HTMLElement;
	scene: HTMLElement;
	items: Record<string, LayoutItemElement> & { list: LayoutItemElement[] };
	paletteNav: HTMLElement;
	paletteManager: HTMLElement;
}

const TAB_VALUES = ['project', 'scene', 'inspector'] as const;

const createPageFrame = (value: string): HTMLElement => {
	const frame = document.createElement('div');
	frame.className = 'page-frame';
	frame.id = value;
	frame.setAttribute('value', value);
	return frame;
};

const buildFixture = (): LayoutFixture => {
	document.body.innerHTML = '';
	const workspace = createPageManagerElement();
	workspace.id = 'workspace-page-manager';
	const directory = createPageFrame('directory');
	const scene = createPageFrame('scene');
	workspace.append(directory, scene);
	document.body.append(workspace);

	const paletteNav = document.createElement('div');
	paletteNav.id = 'layout-nav';
	const paletteManager = document.createElement('div');
	paletteManager.id = 'layout-page-manager';
	paletteManager.className = 'page-manager';
	directory.append(paletteNav, paletteManager);

	const items = {} as Record<string, LayoutItemElement> & { list: LayoutItemElement[] };
	const list: LayoutItemElement[] = [];
	for (const value of TAB_VALUES) {
		const navItem = document.createElement('div') as unknown as LayoutItemElement;
		navItem.className = 'nav-item';
		navItem.draggable = true;
		navItem.setAttribute('value', value);
		paletteNav.append(navItem);
		const page = createPageFrame(value);
		paletteManager.append(page);
		navItem.page = page;
		// M5-a：登记到引擎内部配对（生产路径由 Layout.initialize 完成）
		setItemPage(navItem, page);
		items[value] = navItem;
		list.push(navItem);
	}
	items.list = list;

	return { workspace, directory, scene, items, paletteNav, paletteManager };
};

const registerLayout = (fixture: LayoutFixture): void => {
	Layout.manager = fixture.workspace as unknown as typeof Layout.manager;
	Layout.items = fixture.items as unknown as typeof Layout.items;
	Layout.layout = null;
	Layout.default = null;
};

const loadScheme = (key: string, scheme: SchemeNode): void => {
	Layout.layout = { [key]: scheme } as unknown as typeof Layout.layout;
	Layout.loadLayoutScheme!(key);
};

const schemeOf = (root: HTMLElement): unknown => getPageScheme(root);

const collectLeaves = (group: Element): LayoutLeafElement[] => {
	const leaves: LayoutLeafElement[] = [];
	for (const child of group.children) {
		if (child.classList.contains('group')) {
			if ((child as HTMLElement & { manager?: PageManagerApi }).manager) {
				leaves.push(child as unknown as LayoutLeafElement);
			} else {
				leaves.push(...collectLeaves(child));
			}
		}
	}
	return leaves;
};

const navValues = (nav: HTMLElement): string[] =>
	Array.from(nav.children)
		.filter((child) => child.classList.contains('nav-item'))
		.map((child) => child.getAttribute('value')!);

const managerValues = (manager: HTMLElement): string[] =>
	Array.from(manager.children)
		.filter((child) => child.classList.contains('page-frame'))
		.map((child) => child.getAttribute('value')!);

const selectedOf = (nav: HTMLElement): string | null =>
	nav.querySelector('.nav-item.selected')?.getAttribute('value') ?? null;

const visibleOf = (manager: HTMLElement): string[] =>
	Array.from(manager.children)
		.filter(
			(child) => child.classList.contains('page-frame') && child.classList.contains('visible')
		)
		.map((child) => child.getAttribute('value')!);

const clickNavItem = (nav: HTMLElement, value: string): void => {
	const item = nav.querySelector(`.nav-item[value="${value}"]`) as HTMLElement;
	item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
};

const directoryScheme: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project', 'inspector'] },
		{ end: 1, tabs: ['scene'] }
	]
};

const sceneScheme: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['scene', 'project'] },
		{ end: 1, tabs: ['inspector'] }
	]
};

beforeEach(() => {
	document.body.innerHTML = '';
});

describe('Layout scheme 行为金标准（layout Vue 化基线）', () => {
	it('首次加载：clear 摧毁 palette 挂载，页面/页签被搬进 group（现状语义锁定）', () => {
		const fixture = buildFixture();
		registerLayout(fixture);
		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);

		expect(fixture.paletteNav.parentNode).toBeNull();
		expect(fixture.paletteManager.parentNode).toBeNull();
		expect(fixture.directory.querySelector('#layout-nav')).toBeNull();
		expect(fixture.directory.querySelector('#layout-page-manager')).toBeNull();

		const root = fixture.directory.firstElementChild as HTMLElement;
		expect(root.classList.contains('group')).toBe(true);
		expect(root.classList.contains('horizontal')).toBe(true);

		const leaves = collectLeaves(root);
		expect(leaves).toHaveLength(2);
		expect(navValues(leaves[0].nav)).toEqual(['project', 'inspector']);
		expect(managerValues(leaves[0].manager)).toEqual(['project', 'inspector']);
		expect(navValues(leaves[1].nav)).toEqual(['scene']);
		expect(managerValues(leaves[1].manager)).toEqual(['scene']);

		expect(fixture.items.project.parentNode).toBe(leaves[0].nav);
		expect(fixture.items.project.page.parentNode).toBe(leaves[0].manager);
		expect(schemeOf(fixture.directory)).toBe(
			getPageScheme(fixture.workspace.active as HTMLElement)
		);
	});

	it('首次加载：每个 group 激活首 tab（nav selected + page visible）', () => {
		const fixture = buildFixture();
		registerLayout(fixture);
		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);

		const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		expect(selectedOf(leaves[0].nav)).toBe('project');
		expect(visibleOf(leaves[0].manager)).toEqual(['project']);
		expect(leaves[0].manager.active).toBe(fixture.items.project.page);
		expect(leaves[0].manager.index).toBe('project');

		expect(selectedOf(leaves[1].nav)).toBe('scene');
		expect(visibleOf(leaves[1].manager)).toEqual(['scene']);
		expect(leaves[1].manager.index).toBe('scene');
	});

	it('点击页签：nav write → manager.switch，selected/visible 迁移到目标页', () => {
		const fixture = buildFixture();
		registerLayout(fixture);
		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);

		const leaf = collectLeaves(fixture.directory.firstElementChild as HTMLElement)[0];
		clickNavItem(leaf.nav, 'inspector');

		expect(selectedOf(leaf.nav)).toBe('inspector');
		expect(visibleOf(leaf.manager)).toEqual(['inspector']);
		expect(leaf.manager.active).toBe(fixture.items.inspector.page);
		expect(leaf.manager.index).toBe('inspector');
	});

	it('跨工作区：同一批节点搬到新 group，旧 group 清空但保留', () => {
		const fixture = buildFixture();
		registerLayout(fixture);
		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);
		const directoryRoot = fixture.directory.firstElementChild as HTMLElement;
		const directoryLeaves = collectLeaves(directoryRoot);

		fixture.workspace.switch('scene');
		loadScheme('scene', sceneScheme);
		const sceneRoot = fixture.scene.firstElementChild as HTMLElement;
		const sceneLeaves = collectLeaves(sceneRoot);

		expect(sceneRoot.classList.contains('group')).toBe(true);
		expect(navValues(sceneLeaves[0].nav)).toEqual(['scene', 'project']);
		expect(managerValues(sceneLeaves[0].manager)).toEqual(['scene', 'project']);
		expect(navValues(sceneLeaves[1].nav)).toEqual(['inspector']);

		expect(fixture.items.scene.page.parentNode).toBe(sceneLeaves[0].manager);
		expect(fixture.items.project.page.parentNode).toBe(sceneLeaves[0].manager);
		expect(fixture.items.inspector.page.parentNode).toBe(sceneLeaves[1].manager);

		expect(managerValues(directoryLeaves[0].manager)).toEqual([]);
		expect(managerValues(directoryLeaves[1].manager)).toEqual([]);
		expect(navValues(directoryLeaves[0].nav)).toEqual([]);
		expect(directoryRoot.isConnected).toBe(true);
	});

	it('返回工作区：二次加载幂等恢复并把 lastValue 选回上次页签', () => {
		const fixture = buildFixture();
		registerLayout(fixture);
		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);
		const directoryRoot = fixture.directory.firstElementChild as HTMLElement;
		const directoryLeaves = collectLeaves(directoryRoot);

		clickNavItem(directoryLeaves[0].nav, 'inspector');
		Layout.saveNavStates!();

		fixture.workspace.switch('scene');
		loadScheme('scene', sceneScheme);

		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);

		const leaves = collectLeaves(directoryRoot);
		expect(managerValues(leaves[0].manager)).toEqual(['project', 'inspector']);
		expect(managerValues(leaves[1].manager)).toEqual(['scene']);

		expect(selectedOf(leaves[0].nav)).toBe('inspector');
		expect(visibleOf(leaves[0].manager)).toEqual(['inspector']);
		expect(leaves[0].manager.index).toBe('inspector');

		expect(selectedOf(leaves[1].nav)).toBe('scene');
		expect(visibleOf(leaves[1].manager)).toEqual(['scene']);
	});

	it('saveLayoutScheme 往返：结构保真（end/split/tabs 顺序不变）', () => {
		const fixture = buildFixture();
		registerLayout(fixture);
		fixture.workspace.switch('directory');
		loadScheme('directory', directoryScheme);
		const root = fixture.directory.firstElementChild as HTMLElement;

		clickNavItem(collectLeaves(root)[0].nav, 'inspector');

		const saved = Layout.saveLayoutScheme!(root as never);
		expect(saved).toEqual(directoryScheme);
	});
});
