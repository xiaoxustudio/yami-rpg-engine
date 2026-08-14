import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { YMCommonList } from '@ui-kit';
import { AutoTile } from '@/palette/auto-tile.ts';
import '@/util/number.ts';

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
		const items = list.querySelectorAll('common-item');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toBe('#0');
		expect(items[1].textContent).toBe('#1 !');
		expect(items[2].textContent).toBe('#2');
		expect((items[1] as HTMLElement & { dataValue?: unknown }).dataValue).toBe(1);
	});

	it('createFrameItems 经 Vue 渲染 common-item 与帧坐标', async () => {
		const list = await createList('autoTile-frames');
		AutoTile.frameList = list;
		AutoTile.frames = [0, 0x0102, 0x0302];
		AutoTile.frameIndex = 0;
		AutoTile.createFrameItems();
		const items = list.querySelectorAll('common-item');
		expect(items.length).toBe(3);
		expect(items[0].textContent).toBe('#0: 0,0');
		expect(items[1].textContent).toBe('#1: 2,1');
		expect(items[2].textContent).toBe('#2: 2,3');
		expect((items[2] as HTMLElement & { dataValue?: unknown }).dataValue).toBe(2);
	});
});
