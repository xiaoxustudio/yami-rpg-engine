import { describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { parseLayoutScheme, type LayoutSchemeData } from '@app/engine/layout/layout-scheme';
import LayoutTreeView from '../../../components/layout/LayoutTreeView.vue';

// M5-b：组树渲染唯一路径是 LayoutTreeView(.vue)。本 spec 锁定其结构契约
// （叶子数、split 类、叶子宿主三件套），hydrate/装载语义见 layout-vue-teleport-load.spec。

const SCHEMES: { name: string; scheme: LayoutSchemeData; leaves: number }[] = [
	{
		name: 'directory',
		scheme: {
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['project', 'inspector'] },
				{ end: 1, tabs: ['scene'] }
			]
		},
		leaves: 2
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
		},
		leaves: 2
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
		},
		leaves: 3
	},
	{ name: 'single-leaf', scheme: { end: 1, tabs: ['project', 'scene', 'inspector'] }, leaves: 1 }
];

const leafElements = (root: Element): Element[] =>
	[root, ...Array.from(root.querySelectorAll('.group'))].filter((el) =>
		Array.from(el.children).some(
			(child) => child instanceof HTMLElement && child.classList.contains('nav-bar')
		)
	);

const renderVue = (scheme: LayoutSchemeData): { element: Element; wrapper: VueWrapper } => {
	document.body.innerHTML = '';
	const container = document.createElement('div');
	document.body.append(container);
	const wrapper = mount(LayoutTreeView, {
		props: { node: parseLayoutScheme(scheme) },
		attachTo: container
	});
	return { element: wrapper.element as Element, wrapper };
};

describe('LayoutTreeView 组树渲染契约', () => {
	for (const { name, scheme, leaves } of SCHEMES) {
		it(`${name}：叶子数与叶子宿主三件套一致`, () => {
			const { element, wrapper } = renderVue(scheme);
			try {
				expect(element.classList.contains('group')).toBe(true);
				const found = leafElements(element);
				expect(found).toHaveLength(leaves);
				for (const leaf of found) {
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

	it('split 容器带方向类（horizontal/vertical）', () => {
		const horizontal = renderVue(SCHEMES[0].scheme);
		try {
			expect(horizontal.element.classList.contains('horizontal')).toBe(true);
		} finally {
			horizontal.wrapper.unmount();
		}
		const vertical = renderVue(SCHEMES[2].scheme);
		try {
			expect(vertical.element.classList.contains('vertical')).toBe(true);
		} finally {
			vertical.wrapper.unmount();
		}
	});

	it('空树（node=null）渲染为空', () => {
		const wrapper = mount(LayoutTreeView, { props: { node: null } });
		try {
			expect(wrapper.find('.group').exists()).toBe(false);
		} finally {
			wrapper.unmount();
		}
	});
});
