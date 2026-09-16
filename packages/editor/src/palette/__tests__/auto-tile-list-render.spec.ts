import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { elementDataValueOf, YMCommonList } from '@ui-kit';
import { AutoTile } from '@app/palette/auto-tile.ts';
import '@app/utils/number';

describe('AutoTile 列表项 Vue 渲染（common-item 回归保护）', () => {
	const createList = async (id: string): Promise<HTMLElement> => {
		const wrapper = mount(YMCommonList, { props: { id }, attachTo: document.body });
		await wrapper.vm.$nextTick();
		const list = document.getElementById(id) as HTMLElement | null;
		expect(list).toBeTruthy();
		if (!list) return document.createElement('div');
		Object.defineProperty(list, 'clientHeight', { value: 400, configurable: true });
		Object.defineProperty(list, 'innerHeight', { value: 400, configurable: true });
		Object.defineProperty(list, 'clientWidth', { value: 300, configurable: true });
		return list;
	};

	it('createNodeItems 经 Vue 渲染 common-item 与 dataValue', async () => {
		const list = await createList('autoTile-nodes');
		AutoTile.nodeList = list;
		AutoTile.template = { cover: 1 };
		AutoTile.nodes = [
			{ rule: 0, frames: [0] },
			{ rule: 0, frames: [0] },
			{ rule: 0, frames: [0] }
		];
		AutoTile.nodeIndex = 0;
		AutoTile.createNodeItems();
		const items = list.querySelectorAll('.common-item');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toBe('#0');
		expect(items[1].textContent).toBe('#1 !');
		expect(items[2].textContent).toBe('#2');
		// P4b 收口：行元素上的 `.dataValue` 由 Vue 的 `patchDOMProp` 写成**元素自己的属性**
		// （消费方 `common-list-core` 经 `elementDataValueOf` 读取，own 优先、否则元素数据）。
		// 断言一律走同一个门，而不是假定它具体存在哪一侧存储。
		expect(elementDataValueOf(items[1])).toBe(1);
	});

	it('createFrameItems 经 Vue 渲染 common-item 与帧坐标', async () => {
		const list = await createList('autoTile-frames');
		AutoTile.frameList = list;
		AutoTile.frames = [0, 0x0102, 0x0302];
		AutoTile.frameIndex = 0;
		AutoTile.createFrameItems();
		const items = list.querySelectorAll('.common-item');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toBe('#0: 0,0');
		expect(items[1].textContent).toBe('#1: 2,1');
		expect(items[2].textContent).toBe('#2: 2,3');
		expect(elementDataValueOf(items[2])).toBe(2);
	});
});
