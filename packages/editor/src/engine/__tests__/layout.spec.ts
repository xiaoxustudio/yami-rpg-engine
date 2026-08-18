import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { Layout } from '@app/engine/layout/layout.ts';
import '@/util/css.ts';

function createLeafGroup(tabs: string[] = []): HTMLElement {
	const root = document.createElement('div');
	Layout.items = {} as any;
	Layout.items.list = [];
	for (const tab of tabs) {
		const el = document.createElement('div');
		el.setAttribute('value', tab);
		const page = document.createElement('div');
		(el as any).page = page;
		Layout.items[tab] = el;
		Layout.items.list.push(el);
	}
	Layout.createGroups({ end: 1, tabs }, root);
	return root.firstElementChild as HTMLElement;
}

describe('Layout.createGroups', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('创建叶子 group 包含 nav-manager-border 子元素', () => {
		const group = createLeafGroup();
		expect(group.tagName).toBe('GROUP');
		expect(group.classList.contains('group')).toBe(true);
		const nav = group.children[0];
		expect(nav).toBeTruthy();
		const manager = group.children[1];
		expect(manager).toBeTruthy();
		expect(manager.classList.contains('group-manager')).toBe(true);
		const border = group.querySelector('group-border');
		expect(border).toBeTruthy();
		expect(border!.classList.contains('group-border')).toBe(true);
	});

	it('创建嵌套 group 设置 split 类', () => {
		const root = document.createElement('div');
		Layout.items = {} as any;
		Layout.items.list = [];
		Layout.createGroups(
			{
				end: 1,
				split: 'horizontal',
				children: [{ end: 1, tabs: [] }]
			},
			root
		);
		const outer = root.firstElementChild as HTMLElement;
		expect(outer.classList.contains('horizontal')).toBe(true);
		const inner = outer.querySelector('group');
		expect(inner).toBeTruthy();
	});

	it('叶子 group 的 end 属性正确赋值', () => {
		const root = document.createElement('div');
		Layout.items = {} as any;
		Layout.items.list = [];
		Layout.createGroups({ end: 0.7, tabs: [] }, root);
		const group = root.firstElementChild as any;
		expect(group.end).toBe(0.7);
	});
});

describe('Layout.updateGroupTabs', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('从 nav 子节点读取 tabs', () => {
		const group = createLeafGroup(['scene', 'ui']);
		const tabs = (group as any).tabs;
		expect(tabs).toEqual(['scene', 'ui']);
	});

	it('空 nav 产生空 tabs', () => {
		const group = createLeafGroup([]);
		const tabs = (group as any).tabs;
		expect(tabs).toEqual([]);
	});
});

describe('Layout.getGroupOfElement', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('向上查找最近的 group 父元素', () => {
		const group = createLeafGroup();
		const nav = group.children[0] as HTMLElement;
		const result = Layout.getGroupOfElement(nav);
		expect(result).toBe(group);
	});

	it('非 group 后代返回 null', () => {
		const div = document.createElement('div');
		const result = Layout.getGroupOfElement(div);
		expect(result).toBeNull();
	});

	it('嵌套 group 返回最近的 group', () => {
		const root = document.createElement('div');
		Layout.items = {} as any;
		Layout.items.list = [];
		Layout.createGroups(
			{
				end: 1,
				split: 'vertical',
				children: [
					{ end: 0.5, tabs: [] },
					{ end: 1, tabs: [] }
				]
			},
			root
		);
		const outer = root.firstElementChild as HTMLElement;
		const inner = outer.querySelector('group') as HTMLElement;
		const border = inner.querySelector('group-border') as HTMLElement;
		const result = Layout.getGroupOfElement(border);
		expect(result).toBe(inner);
	});
});

describe('Layout.saveLayoutScheme', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('序列化叶子 group 为 scheme 对象', () => {
		const group = createLeafGroup(['scene', 'ui']);
		const scheme = Layout.saveLayoutScheme(group as any);
		expect(scheme.end).toBe(1);
		expect(scheme.tabs).toEqual(['scene', 'ui']);
		expect(scheme.children).toBeUndefined();
		expect(scheme.split).toBeUndefined();
	});

	it('序列化嵌套 group 为带 children 的 scheme', () => {
		const root = document.createElement('div');
		Layout.items = {} as any;
		Layout.items.list = [];
		Layout.createGroups(
			{
				end: 1,
				split: 'horizontal',
				children: [
					{ end: 0.6, tabs: ['scene'] },
					{ end: 1, tabs: ['ui'] }
				]
			},
			root
		);
		const outer = root.firstElementChild as any;
		const scheme = Layout.saveLayoutScheme(outer);
		expect(scheme.split).toBe('horizontal');
		expect(scheme.children).toHaveLength(2);
		expect(scheme.children![0].end).toBe(0.6);
		expect(scheme.children![0].tabs).toEqual(['scene']);
		expect(scheme.children![1].tabs).toEqual(['ui']);
	});
});
