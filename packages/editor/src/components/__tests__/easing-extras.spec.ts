import { describe, expect, it } from 'vitest';
import { type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';

interface ExtrasListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
	updateNodeElement: (element: HTMLElement) => void;
	creators: Array<(item: unknown) => void>;
	updaters: Array<(item: unknown) => void>;
	renderNodeExtras?: (item: unknown, container: HTMLElement) => void;
}

interface ItemLike {
	id: string;
	name: string;
	element?: HTMLElement & { textNode?: Text | null; extras?: HTMLElement | null };
	children: ItemLike[];
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

// 修复后的 Easing.list_updateNodeElement 覆写（含 extras 创建 + renderNodeExtras）
const easingUpdateNodeElement = function (
	this: ExtrasListEl,
	element: HTMLElement & { textNode?: Text | null; extras?: HTMLElement | null }
): void {
	const item = (element as HTMLElement & { item?: ItemLike }).item as ItemLike;
	if (!element.textNode) {
		const textNode = document.createTextNode('');
		element.appendChild(textNode);
		element.draggable = true;
		element.textNode = textNode;
		for (const creator of this.creators) {
			creator(item);
		}
		if (typeof this.renderNodeExtras === 'function') {
			const extras = document.createElement('div');
			extras.classList.add('tree-node-extras');
			element.appendChild(extras);
			element.extras = extras;
		}
	}
	for (const updater of this.updaters) {
		updater(item);
	}
	if (element.extras && typeof this.renderNodeExtras === 'function') {
		this.renderNodeExtras(item, element.extras);
	}
};

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	container.parentElement?.classList.add('plugin-item');
	return [];
};

describe('Easing updateNodeElement 覆写（extras 渲染回归保护）', () => {
	it('覆写创建 extras 容器 → nodeExtras 执行（plugin-item class 生效）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'easing-test', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		el.creators = [];
		el.updaters = [];
		el.updateNodeElement = easingUpdateNodeElement;
		const data: ItemLike[] = [{ id: 'p1', name: 'Plugin A', children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const itemEl = data[0].element as HTMLElement | undefined;
		expect(itemEl?.querySelector('.tree-node-extras')).toBeTruthy();
		expect(itemEl?.classList.contains('plugin-item')).toBe(true);
		expect(itemEl?.style.textIndent).toBe('');
		wrapper.unmount();
	});
});
