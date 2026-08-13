import { describe, expect, it } from 'vitest';
import { h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';

interface ExtrasListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface ItemLike {
	id: string;
	name: string;
	enabled?: boolean;
	element?: HTMLElement;
	children: ItemLike[];
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as ItemLike;
	container.parentElement?.classList.add('plugin-item');
	if (node.enabled === false) {
		container.parentElement?.classList.add('weak');
	}
	return [
		h(
			'div',
			{
				class: 'box script-edit-button plugin-item-button',
				onPointerdown: (event: PointerEvent) => {
					if (event.button !== 0 || !node.id) return;
				}
			},
			'\uf044'
		)
	];
};

describe('plugin/custom-command 编辑按钮渲染（createEditIcon Vue 化回归）', () => {
	it('节点渲染 script-edit-button 且 plugin-item/weak class 生效', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'edit-icon-test', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data: ItemLike[] = [{ id: 'p1', name: 'Plugin A', enabled: false, children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const itemEl = data[0].element as HTMLElement | undefined;
		expect(itemEl?.classList.contains('plugin-item')).toBe(true);
		expect(itemEl?.classList.contains('weak')).toBe(true);
		const btn = itemEl?.querySelector('.script-edit-button');
		expect(btn).toBeTruthy();
		expect(btn?.classList.contains('box')).toBe(true);
		expect(btn?.classList.contains('plugin-item-button')).toBe(true);
		wrapper.unmount();
	});
});
