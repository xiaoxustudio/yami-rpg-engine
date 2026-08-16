import { describe, expect, it } from 'vitest';
import { Layout } from '@app/engine/layout/layout.ts';
import '@/util/css.ts';

type FakeDragEvent = {
	dataTransfer: { setDragImage: () => void };
	preventDefault: () => void;
	clientX: number;
	clientY: number;
};

describe('Layout group 元素 Vue 渲染（createElement 迁移回归保护）', () => {
	const createGroup = (): HTMLElement => {
		const root = document.createElement('div');
		Layout.createGroups({ end: 1, tabs: [] }, root);
		return root.firstElementChild as HTMLElement;
	};

	it('createGroups 渲染叶子 group 元素与 group 类', () => {
		const group = createGroup();
		expect(group.tagName).toBe('GROUP');
		expect(group.classList.contains('group')).toBe(true);
		const border = group.querySelector('group-border') as HTMLElement;
		expect(border).toBeTruthy();
		expect(border.classList.contains('group-border')).toBe(true);
	});

	it('createGroups 递归渲染子 group 并附加 split 类', () => {
		const root = document.createElement('div');
		Layout.createGroups(
			{
				end: 1,
				split: 'horizontal',
				children: [{ end: 1, tabs: [] }]
			},
			root
		);
		const outer = root.firstElementChild as HTMLElement;
		expect(outer.classList.contains('group')).toBe(true);
		expect(outer.classList.contains('horizontal')).toBe(true);
		const inner = outer.querySelector('group') as HTMLElement;
		expect(inner.classList.contains('group')).toBe(true);
	});

	it('navDragstart 渲染 group-region 元素与 group-region 类', () => {
		const group = createGroup();
		const nav = group.children[0] as HTMLElement;
		Layout.heads = [];
		Layout.manager = { active: { childNodes: [group] } } as any;
		const event = {
			dataTransfer: { setDragImage: () => {} },
			preventDefault: () => {},
			clientX: 0,
			clientY: 0
		} as FakeDragEvent as any;
		Layout.navDragstart.call(nav, event);
		const region = group.querySelector('group-region') as HTMLElement;
		expect(region).toBeTruthy();
		expect(region.classList.contains('group-region')).toBe(true);
		Layout.navDragend(event);
	});

	it('borderPointerdown 渲染 group-info 元素与 group-info 类', () => {
		const group = createGroup();
		const border = group.querySelector('group-border') as HTMLElement;
		Layout.manager = { active: { childNodes: [group] } } as any;
		Layout.resizing = null;
		const event = { button: 0 } as any;
		Layout.borderPointerdown.call(border, event);
		const info = group.querySelector('group-info') as HTMLElement;
		expect(info).toBeTruthy();
		expect(info.classList.contains('group-info')).toBe(true);
		expect((info as HTMLElement & { manager: unknown }).manager).toBe(
			(group as HTMLElement & { manager: unknown }).manager
		);
		Layout.resizing = null;
	});
});
