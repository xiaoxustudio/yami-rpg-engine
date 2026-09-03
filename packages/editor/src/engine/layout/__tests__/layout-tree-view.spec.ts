import { describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { Layout } from '@app/engine/layout/layout.ts';
import { parseLayoutScheme, type LayoutSchemeData } from '@app/engine/layout/layout-scheme';
import LayoutTreeView from '../../../components/layout/LayoutTreeView.vue';

// M3a 金标准：数据树递归组件 LayoutTreeView 与命令式 createGroups 的结构等价。
// 若未来把 createGroups 换到 Vue 渲染，这份断言即双路径回归基线。

const SCHEMES: { name: string; scheme: LayoutSchemeData }[] = [
	{
		name: 'directory',
		scheme: {
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['project', 'inspector'] },
				{ end: 1, tabs: ['scene'] }
			]
		}
	},
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
	{
		name: 'nested',
		scheme: {
			end: 1,
			split: 'vertical',
			children: [
				{
					end: 0.4,
					split: 'horizontal',
					children: [
						{ end: 0.5, tabs: ['a', 'b'] },
						{ end: 1, tabs: ['c'] }
					]
				},
				{ end: 1, tabs: ['d'] }
			]
		}
	},
	{ name: 'single-leaf', scheme: { end: 1, tabs: ['project', 'scene', 'inspector'] } }
];

type SchemeNode = LayoutSchemeData;

const tabsOf = (scheme: SchemeNode): string[] => {
	if (scheme.children !== undefined) {
		return scheme.children.flatMap(tabsOf);
	}
	return scheme.tabs ?? [];
};

const isStructural = (el: Element): boolean =>
	el.classList.contains('group') || el.classList.contains('group-border');

const structureSignature = (root: Element): string => {
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

const renderCommand = (scheme: SchemeNode): Element => {
	document.body.innerHTML = '';
	const tabs = tabsOf(scheme);
	const items = {} as Record<string, HTMLElement & { page: HTMLElement }> & {
		list: (HTMLElement & { page: HTMLElement })[];
	};
	const list: (HTMLElement & { page: HTMLElement })[] = [];
	for (const value of tabs) {
		const navItem = document.createElement('div') as unknown as HTMLElement & {
			page: HTMLElement;
		};
		navItem.className = 'nav-item';
		navItem.setAttribute('value', value);
		navItem.page = document.createElement('div');
		items[value] = navItem;
		list.push(navItem);
	}
	items.list = list;
	Layout.items = items as unknown as typeof Layout.items;

	const container = document.createElement('div');
	document.body.append(container);
	Layout.createGroups!(scheme as never, container);
	return container.firstElementChild as Element;
};

const renderVue = (scheme: SchemeNode): { element: Element; wrapper: VueWrapper } => {
	document.body.innerHTML = '';
	const container = document.createElement('div');
	document.body.append(container);
	const wrapper = mount(LayoutTreeView, {
		props: { node: parseLayoutScheme(scheme) },
		attachTo: container
	});
	return { element: wrapper.element as Element, wrapper };
};

describe('LayoutTreeView 与 createGroups 结构等价（M3a 双路径金标准）', () => {
	for (const { name, scheme } of SCHEMES) {
		it(`${name}：结构签名、叶子数、叶子宿主一致`, () => {
			const command = renderCommand(scheme);
			const { element: vue, wrapper } = renderVue(scheme);
			try {
				expect(structureSignature(vue)).toBe(structureSignature(command));
				expect(countLeaves(vue)).toBe(countLeaves(command));
				for (const leaf of Array.from(vue.querySelectorAll('.group'))) {
					if (
						!Array.from(leaf.children).some(
							(child) =>
								child instanceof HTMLElement && child.classList.contains('nav-bar')
						)
					) {
						continue;
					}
					expect(leaf.querySelector(':scope > .nav-bar')).not.toBeNull();
					expect(
						leaf.querySelector(':scope > .page-manager.group-manager')
					).not.toBeNull();
					expect(leaf.querySelector(':scope > .group-border')).not.toBeNull();
				}
			} finally {
				wrapper.unmount();
			}
		});
	}

	it('空树（node=null）渲染为空', () => {
		const wrapper = mount(LayoutTreeView, { props: { node: null } });
		try {
			expect(wrapper.find('.group').exists()).toBe(false);
		} finally {
			wrapper.unmount();
		}
	});
});
