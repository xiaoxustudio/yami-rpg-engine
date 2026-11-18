import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { elementDataValueOf, YMCommonList } from '@ui-kit';
import { AutoTile } from '@app/palette/auto-tile.ts';
import type { AutoTileListHandle } from '@app/composables/auto-tile-handles';
import '@app/utils/number';

interface ListFixture {
	/** DOM 断言仍用元素（列表项是组件渲染出来的真实节点） */
	element: HTMLElement;
	/** 列表能力只在实例上（`YMCommonList` 的 `defineExpose`），句柄表里存的就是它 */
	api: AutoTileListHandle;
}

describe('AutoTile 列表项 Vue 渲染（common-item 回归保护）', () => {
	const createList = async (id: string): Promise<ListFixture> => {
		const wrapper = mount(YMCommonList, { props: { id }, attachTo: document.body });
		await wrapper.vm.$nextTick();
		const element = wrapper.element as HTMLElement;
		expect(element.id).toBe(id);
		Object.defineProperty(element, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(element, 'innerHeight', { value: 400, configurable: true });
		Object.defineProperty(element, 'clientWidth', { value: 300, configurable: true });
		return { element, api: wrapper.vm as unknown as AutoTileListHandle };
	};

	it('createNodeItems 经 Vue 渲染 common-item 与 dataValue', async () => {
		const { element, api } = await createList('autoTile-nodes');
		AutoTile.nodeList = api;
		AutoTile.template = { id: 't', name: '', cover: 1, nodes: [] };
		AutoTile.nodes = [
			{ rule: 0, frames: [0] },
			{ rule: 0, frames: [0] },
			{ rule: 0, frames: [0] }
		];
		AutoTile.nodeIndex = 0;
		AutoTile.createNodeItems();
		const items = element.querySelectorAll('.common-item');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toBe('#0');
		expect(items[1].textContent).toBe('#1 !');
		expect(items[2].textContent).toBe('#2');
		expect(elementDataValueOf(items[1])).toBe(1);
	});

	it('createFrameItems 经 Vue 渲染 common-item 与帧坐标', async () => {
		const { element, api } = await createList('autoTile-frames');
		AutoTile.frameList = api;
		AutoTile.frames = [0, 0x0102, 0x0302];
		AutoTile.frameIndex = 0;
		AutoTile.createFrameItems();
		const items = element.querySelectorAll('.common-item');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toBe('#0: 0,0');
		expect(items[1].textContent).toBe('#1: 2,1');
		expect(items[2].textContent).toBe('#2: 2,3');
		expect(elementDataValueOf(items[2])).toBe(2);
	});
});
