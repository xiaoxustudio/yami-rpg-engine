import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';
import { treeListStatics } from '../tree-api';

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

interface TreeData {
	id: string;
	name: string;
	class: string;
	expanded?: boolean;
	parent?: TreeData | null;
	element?: HTMLElement;
	children: TreeData[];
}

const makeData = (): TreeData[] => [
	{
		id: 'folder1',
		name: 'Folder',
		class: 'folder',
		expanded: true,
		children: [
			{ id: 'child1', name: 'Child A', class: 'file', children: [] },
			{ id: 'child2', name: 'Child B', class: 'file', children: [] }
		]
	},
	{ id: 'item1', name: 'Item 1', class: 'file', children: [] }
];

interface TreeListElement extends HTMLElement {
	[k: string]: unknown;
	bind: (fn: () => TreeData[]) => void;
	update: () => void;
	read: () => TreeData | null;
	select: (item: TreeData) => void;
	unselect: () => void;
	rename: (item: TreeData) => void;
	deleteNode: (item: TreeData) => void;
	addNodeTo: (node: TreeData, parent: TreeData) => void;
	restore: (mode: string, response: unknown) => void;
	searchNodes: (text: string) => void;
	duplicate: () => void;
	on: (name: string, cb: (e: Event & { value: unknown }) => void) => void;
	keydown: () => void;
	pointerdown: () => void;
	dragstart: () => void;
	drop: () => void;
	expandSelection: () => void;
	getItemByProperties: (props: { id: string }) => TreeData | null;
	elements: { count: number } & { [i: number]: HTMLElement & { textIndent?: number } };
	root: TreeData | null;
	renamable: boolean;
	display: string;
	searchResults: { name: string }[];
}

describe('YMTreeList', () => {
	it('attach exposes full api on root element', () => {
		const wrapper = mount(YMTreeList, { attrs: { id: 'tl1' } });
		const el = wrapper.element as unknown as TreeListElement;
		expect(el.classList.contains('tree-list')).toBe(true);
		for (const name of [
			'bind',
			'read',
			'update',
			'select',
			'unselect',
			'rename',
			'deleteNode',
			'addNodeTo',
			'restore',
			'searchNodes',
			'duplicate',
			'on',
			'keydown',
			'pointerdown',
			'dragstart',
			'drop'
		]) {
			expect(typeof el[name], name).toBe('function');
		}
	});

	it('bind and update render nodes with indentation', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		expect(el.elements.count).toBe(4);
		expect(el.querySelectorAll('.node-item').length).toBe(4);
		const folder = el.elements[0];
		expect(folder.textIndent).toBe(0);
		expect(el.elements[1].textIndent).toBe(12);
		expect(data[0].parent).toBe(el.root);
		expect(data[0].children[0].parent).toBe(data[0]);
	});

	it('select highlights element and read returns item', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		el.select(data[1]);
		expect(el.read()).toBe(data[1]);
		expect(data[1].element!.classList.contains('selected')).toBe(true);
		el.unselect();
		expect(el.read()).toBe(null);
		expect(data[1].element!.classList.contains('selected')).toBe(false);
	});

	it('select dispatches select event when enabled', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		let selected: unknown = null;
		el.on('select', (e: Event & { value: unknown }) => (selected = e.value));
		el.select(data[1]);
		expect(selected).toBe(data[1]);
	});

	it('expandSelection toggles folder expansion', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		el.select(data[0]);
		el.expandSelection();
		expect(data[0].expanded).toBe(false);
		expect(el.elements.count).toBe(2);
		el.expandSelection();
		expect(data[0].expanded).toBe(true);
		expect(el.elements.count).toBe(4);
	});

	it('addNodeTo inserts node and expands ancestors', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		const node = { id: 'new', name: 'New Node', class: 'file', children: [] };
		el.addNodeTo(node, data[0].children[0]);
		expect(data[0].children[0].children).toContain(node);
		expect(el.read()).toBe(node);
	});

	it('deleteNode removes node', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		el.deleteNode(data[1]);
		expect(data).not.toContain(data[1]);
		expect(el.elements.count).toBe(3);
	});

	it('searchNodes filters to matches', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		el.searchNodes('Child');
		expect(el.display).toBe('search');
		expect(el.searchResults.map((i: { name: string }) => i.name)).toEqual([
			'Child A',
			'Child B'
		]);
		el.searchNodes('');
		expect(el.display).toBe('normal');
	});

	it('restore undo create removes node', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		const node = { id: 'new', name: 'New Node', class: 'file', children: [] };
		const response = { type: 'create', sItem: node, dItem: data[0], insertBefore: false };
		el.restore('redo', response);
		expect(data[0].children).toContain(node);
		el.restore('undo', response);
		expect(data[0].children).not.toContain(node);
	});

	it('rename via textBox updates item name', async () => {
		const wrapper = mount(YMTreeList, { attachTo: document.body });
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		el.renamable = true;
		el.focus();
		const item = data[1];
		el.select(item);
		el.rename(item);
		const textBox = treeListStatics.textBox;
		expect(textBox.parentNode).toBe(item.element!);
		textBox.write('Renamed');
		textBox.input.blur();
		await new Promise((r) => setTimeout(r, 10));
		expect(item.name).toBe('Renamed');
		expect(item.element!.querySelector('.text-box')).toBe(null);
	});

	it('getItemByProperties finds nested node', () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		const found = el.getItemByProperties({ id: 'child2' });
		expect(found).toBe(data[0].children[1]);
	});
});

describe('renderNodeExtras', () => {
	it('节点创建时渲染 extras 容器与内容', async () => {
		const wrapper = mount(YMTreeList, {
			props: {
				renderNodeExtras: (item: unknown, container: HTMLElement) => {
					const node = item as { class: string; key?: string };
					const div = document.createElement('div');
					div.className = 'extras-test';
					div.textContent = node.class === 'folder' ? 'star' : 'key=' + (node.key ?? '');
					container.appendChild(div);
				}
			}
		});
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		const folders = el.querySelectorAll('.tree-node-extras');
		expect(folders.length).toBe(4);
		expect(folders[0].querySelector('.extras-test')!.textContent).toBe('star');
		wrapper.unmount();
	});

	it('更新时重新调用 renderNodeExtras', async () => {
		let renderCount = 0;
		const wrapper = mount(YMTreeList, {
			props: {
				renderNodeExtras: () => {
					renderCount++;
				}
			}
		});
		const el = wrapper.element as unknown as TreeListElement;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		renderCount = 0;
		el.update();
		expect(renderCount).toBeGreaterThan(0);
		wrapper.unmount();
	});
});
