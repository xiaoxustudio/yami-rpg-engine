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
	element?: HTMLElement;
	children: ItemLike[];
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	container.parentElement?.classList.add('plain');
	return [h('div', { class: 'variable-init-text text' }, ' = ' + (item as ItemLike).id)];
};

describe('Easing 列表经 tree-api 渲染（updateNodeElement 覆写清理后回归保护）', () => {
	it('默认路径创建 extras 容器 → nodeExtras 执行 + 回退图标', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'easing-test', nodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data: ItemLike[] = [{ id: 'p1', name: 'Plugin A', children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const itemEl = data[0].element as HTMLElement | undefined;
		expect(itemEl?.querySelector('.tree-node-extras')).toBeTruthy();
		expect(itemEl?.querySelector('.tree-node-extras .variable-init-text')?.textContent).toBe(
			' = p1'
		);
		expect(itemEl?.querySelector('.node-icon.icon-file')).toBeTruthy();
		wrapper.unmount();
	});
});
