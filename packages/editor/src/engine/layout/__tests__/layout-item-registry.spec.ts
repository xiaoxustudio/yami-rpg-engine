import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	Layout,
	getPageScheme,
	registerLayoutItems,
	resetRegisteredLayoutItems
} from '@app/engine/layout/layout.ts';
import { engineEls } from '@app/engine/element-registry';
import { registerElement } from '@app/utils/element-registry';
import { registerLayout } from './layout-spec-utils';

// M5-c：palette 显式登记（LayoutPanel 拥有 palette 节点）后，
// 引擎装载不再依赖「palette 容器子节点 / 全文档扫描」的形态猜测：
// 登记项优先，DOM 发现仅补登记缺失项。

const DIRECTORY = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project', 'inspector'] },
		{ end: 1, tabs: ['scene'] }
	]
};

const VALUES = ['project', 'scene', 'inspector'] as const;

const makeFixture = () => {
	document.body.innerHTML = '';
	const workspace = document.createElement('div');
	workspace.className = 'page-manager';
	workspace.id = 'workspace-page-manager';
	const directory = document.createElement('div');
	directory.className = 'page-frame';
	directory.setAttribute('value', 'directory');
	workspace.append(directory);
	document.body.append(workspace);

	const paletteNav = document.createElement('div');
	paletteNav.id = 'layout-nav';
	const paletteManager = document.createElement('div');
	paletteManager.id = 'layout-page-manager';
	paletteManager.className = 'page-manager';
	directory.append(paletteNav, paletteManager);
	// P1b：palette 容器按生产路径登记（LayoutPanel 就是这么做的）——「登记缺失项」的兜底
	// 现在只在**容器子树内**查找，故容器本身必须在注册表里。
	registerElement(engineEls, 'layout-nav', paletteNav);
	registerElement(engineEls, 'layout-page-manager', paletteManager);

	const items = {} as Record<string, HTMLElement> & {
		list: HTMLElement[];
	};
	items.list = [];
	for (const value of VALUES) {
		const navItem = document.createElement('div');
		navItem.className = 'nav-item';
		navItem.setAttribute('value', value);
		paletteNav.append(navItem);
		items[value] = navItem;
		items.list.push(navItem);
	}
	return { workspace, directory, paletteNav, paletteManager, items };
};

beforeEach(() => {
	document.body.innerHTML = '';
	Layout.heads = [];
});

afterEach(() => {
	resetRegisteredLayoutItems();
	document.body.innerHTML = '';
});

describe('palette 显式登记（M5-c）', () => {
	it('登记优先：palette 容器被搬空后装载仍解析出全部 items', () => {
		const fixture = makeFixture();
		// 模拟整壳 Teleport：palette 容器内节点全部搬走（真机形态）
		const navItems = Array.from(fixture.paletteNav.children) as HTMLElement[];
		registerLayoutItems(navItems.map((nav) => ({ value: nav.getAttribute('value')!, nav })));
		fixture.paletteNav.innerHTML = '';
		Layout.manager = fixture.workspace as never;
		Layout.layout = { directory: DIRECTORY } as never;

		Layout.initialize!();

		const values = Object.keys(Layout.items ?? {});
		expect(values.sort()).toEqual([...VALUES].sort());
		expect(Layout.items!.project).toBe(navItems[0]);
		expect(getPageScheme(fixture.directory)).toBeUndefined();
	});

	it('兜底合并：登记缺失的 DOM 页签仍被发现（不因登记不完整而丢项）', () => {
		const fixture = makeFixture();
		const navItems = Array.from(fixture.paletteNav.children) as HTMLElement[];
		// 只登记第一项，其余留给 DOM 发现
		registerLayoutItems([{ value: 'project', nav: navItems[0] }]);
		Layout.manager = fixture.workspace as never;
		Layout.layout = null;

		Layout.initialize!();

		const values = Object.keys(Layout.items ?? {});
		expect(values.sort()).toEqual([...VALUES].sort());
	});

	it('pairPage：登记页与 DOM 页签合并后仍完成页签↔页配对', () => {
		const fixture = makeFixture();
		const navItems = Array.from(fixture.paletteNav.children) as HTMLElement[];
		const pages = VALUES.map((value) => {
			const page = document.createElement('div');
			page.className = 'page-frame';
			page.setAttribute('value', value);
			fixture.paletteManager.append(page);
			return page;
		});
		registerLayoutItems([
			...navItems.map((nav) => ({ value: nav.getAttribute('value')!, nav })),
			...pages.map((page) => ({ value: page.getAttribute('value')!, page }))
		]);
		Layout.manager = fixture.workspace as never;
		Layout.layout = { directory: DIRECTORY } as never;
		registerLayout(fixture as never);

		Layout.initialize!();

		expect(Layout.items!.scene).toBe(navItems[1]);
		expect(getPageScheme(fixture.directory)).toBeUndefined();
	});
});
