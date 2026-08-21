import { beforeEach, describe, expect, it, vi } from 'vitest';
import { h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import TreeList from '@app/components/common/TreeList.vue';
import { File } from '@app/file/file-system-core.ts';
import { getBrowserStore } from '@app/stores/browser.ts';

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

const makeHandler = (item: unknown): VNode[] => {
	const node = item as ItemLike;
	return [
		h(
			'div',
			{
				class: 'box script-edit-button plugin-item-button',
				onPointerdown: (event: PointerEvent) => {
					if (event.button !== 0 || !node.id) return;
					const path = File.getPath?.(node.id);
					if (path) getBrowserStore().openScript?.(path);
				}
			},
			'\uf044'
		)
	];
};

describe('script-edit-button 完整点击链（handler → getPath → openScript）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('pointerdown 触发 getPath + openScript（含右键不触发）', async () => {
		const openScript = vi
			.spyOn(getBrowserStore(), 'openScript')
			.mockImplementation(() => undefined);
		const originalGetPath = File.getPath;
		File.getPath = () => 'Script/plugin/test.js';
		const wrapper = mount(TreeList, {
			props: { id: 'edit-btn-chain', nodeExtras: makeHandler },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data: ItemLike[] = [{ id: 'guid-1', name: 'Plugin A', children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const button = el.querySelector('.script-edit-button') as HTMLElement;
		button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(openScript).toHaveBeenCalledWith('Script/plugin/test.js');
		button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }));
		expect(openScript).toHaveBeenCalledTimes(1);
		openScript.mockRestore();
		File.getPath = originalGetPath;
		wrapper.unmount();
	});

	it('getPath 返回空时不调用 openScript', async () => {
		const openScript = vi
			.spyOn(getBrowserStore(), 'openScript')
			.mockImplementation(() => undefined);
		const originalGetPath = File.getPath;
		File.getPath = () => '';
		const wrapper = mount(TreeList, {
			props: { id: 'edit-btn-chain2', nodeExtras: makeHandler },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data: ItemLike[] = [{ id: 'guid-x', name: 'Plugin B', children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const button = el.querySelector('.script-edit-button') as HTMLElement;
		button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		expect(openScript).not.toHaveBeenCalled();
		openScript.mockRestore();
		File.getPath = originalGetPath;
		wrapper.unmount();
	});
});
