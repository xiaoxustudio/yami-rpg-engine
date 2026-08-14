import { beforeEach, describe, expect, it } from 'vitest';
import { h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TreeList from '@app/components/common/TreeList.vue';

interface ExtrasListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface ItemLike {
	id: string;
	name: string;
	element?: HTMLElement;
	children: ItemLike[];
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

describe('script-edit-button 点击事件链（nodeExtras → Vue 事件绑定）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('按钮 pointerdown 触发 handler', async () => {
		let clicked: string | null = null;
		const nodeExtras = (item: unknown): VNode[] => {
			const node = item as ItemLike;
			return [
				h(
					'div',
					{
						class: 'box script-edit-button plugin-item-button',
						onPointerdown: (event: PointerEvent) => {
							if (event.button !== 0) return;
							clicked = node.id;
						}
					},
					'\uf044'
				)
			];
		};
		const wrapper = mount(TreeList, {
			props: { id: 'edit-btn-list', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data: ItemLike[] = [{ id: 'p1', name: 'Plugin A', children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const button = el.querySelector('.script-edit-button') as HTMLElement | null;
		expect(button).toBeTruthy();
		button!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(clicked).toBe('p1');
		button!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }));
		expect(clicked).toBe('p1');
		wrapper.unmount();
	});
});
