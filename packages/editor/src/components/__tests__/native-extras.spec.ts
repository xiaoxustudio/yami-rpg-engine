import { describe, expect, it } from 'vitest';
import { type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';
import { getListConfig, treeRowElement } from '@ui-kit';

interface ExtrasListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface ItemLike {
	id: string;
	name: string;
	element?: HTMLElement & { style: CSSStyleDeclaration };
	children: ItemLike[];
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

const nodeExtras = (_item: unknown, container: HTMLElement): VNode[] => {
	container.parentElement?.classList.add('plugin-item');
	return [];
};

describe('tree-api 原生 updateNodeElement（默认路径）', () => {
	it('foldable=false → textIndent 0 + extras 渲染 + plugin-item class', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'native-test', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		getListConfig(el).foldable = false;
		const data: ItemLike[] = [{ id: 'p1', name: 'Plugin A', children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const itemEl = treeRowElement(data[0]) as HTMLElement | undefined;
		expect(itemEl?.querySelector('.tree-node-extras')).toBeTruthy();
		expect(itemEl?.classList.contains('plugin-item')).toBe(true);
		expect(['', '0px']).toContain(itemEl?.style.textIndent);
		wrapper.unmount();
	});
});
