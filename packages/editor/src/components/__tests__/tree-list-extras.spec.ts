import { describe, expect, it } from 'vitest';
import { h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';

interface ExtrasListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface ExtrasData {
	id: string;
	name: string;
	class: string;
	key?: string;
	expanded?: boolean;
	children: ExtrasData[];
	element?: { extras?: HTMLElement };
}

const makeData = (): ExtrasData[] => [
	{
		id: 'f1',
		name: 'Folder',
		class: 'folder',
		expanded: true,
		children: [{ id: 'c1', name: 'Child', class: 'file', key: 'hp', children: [] }]
	},
	{ id: 'i1', name: 'Item', class: 'file', children: [] }
];

const nodeExtras = (item: unknown): VNode[] => {
	const node = item as { class: string; key?: string };
	if (node.class === 'folder') {
		return [h('div', { class: 'extras-group' }, ' ★')];
	}
	return node.key ? [h('div', { class: 'extras-init' }, ` = ${node.key}`)] : [];
};

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

describe('TreeList nodeExtras（节点装饰 Vue 渲染回归保护）', () => {
	it('节点创建时经 Vue render 渲染装饰内容', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'extras-list', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		expect(el.querySelectorAll('.tree-node-extras').length).toBe(3);
		const group = el.querySelector('.extras-group');
		expect(group).toBeTruthy();
		expect(group!.textContent).toBe(' ★');
		const init = el.querySelector('.extras-init');
		expect(init).toBeTruthy();
		expect(init!.textContent).toBe(' = hp');
		wrapper.unmount();
	});

	it('更新数据后装饰内容刷新（Vue patch 路径）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'extras-list2', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		(data[1] as ExtrasData & { key?: string }).key = 'mp';
		el.update();
		const init = el.querySelector('.extras-init');
		expect(init).toBeTruthy();
		expect(init!.textContent).toBe(' = hp');
		const item1 = data[1];
		const item1El = item1.element as unknown as { extras: HTMLElement } | undefined;
		expect(item1El?.extras?.textContent).toBe(' = mp');
		wrapper.unmount();
	});
});
