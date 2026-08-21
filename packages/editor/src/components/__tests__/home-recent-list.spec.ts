import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HomeRecentList from '@app/components/layout/HomeRecentList.vue';
import type { HomeRecentCard } from '@app/title/home-page.ts';

const homeMock = vi.hoisted(() => ({
	Home: {
		recentCards: [] as HomeRecentCard[],
		recentClick: vi.fn(),
		recentPointerup: vi.fn()
	}
}));

vi.mock('@app/title/home-page.ts', () => homeMock);

import { Home } from '@app/title/home-page.ts';

const cards: HomeRecentCard[] = [
	{
		title: 'My Game',
		dateText: '2026/8/13 10:30',
		pathText: 'C:/games/my-game',
		stats: ['data: 5', 'script: 2', 'image: 10', 'media: 1', 'other: 0', 'total: 18'],
		disabled: false,
		hidden: false
	},
	{
		title: 'Failed Project',
		dateText: '2026/8/12 9:00',
		pathText: 'C:/games/failed',
		stats: [],
		disabled: true,
		hidden: false
	},
	{
		title: '',
		dateText: '',
		pathText: '',
		stats: [],
		disabled: false,
		hidden: true
	}
];

describe('HomeRecentList 最近项目卡片渲染', () => {
	beforeEach(() => {
		Home.recentCards = [...cards];
	});

	it('渲染卡片结构（bar/标题/日期/路径/统计文本）', async () => {
		const wrapper = mount(HomeRecentList);
		await wrapper.vm.$nextTick();
		const items = wrapper.findAll('.home-recent-item');
		expect(items).toHaveLength(3);
		const first = items[0];
		expect(first.find('.home-recent-bar').exists()).toBe(true);
		expect(first.find('.home-recent-title').text()).toBe('My Game');
		expect(first.find('.home-recent-date').text()).toBe('2026/8/13 10:30');
		expect(first.find('.home-recent-path').text()).toBe('C:/games/my-game');
		expect(
			first
				.find('.home-recent-stat')
				.findAll('.home-recent-data')
				.map((n) => n.text())
		).toEqual(['data: 5', 'script: 2', 'image: 10', 'media: 1', 'other: 0', 'total: 18']);
		expect(first.attributes('value')).toBe('0');
		expect(first.classes()).toContain('home-recent-item');
		wrapper.unmount();
	});

	it('disabled 卡片应用 disabled class，缺失项目隐藏', async () => {
		const wrapper = mount(HomeRecentList);
		await wrapper.vm.$nextTick();
		const items = wrapper.findAll('.home-recent-item');
		expect(items[1].classes()).toContain('disabled');
		expect(items[1].find('.home-recent-title').text()).toBe('Failed Project');
		expect(items[2].isVisible()).toBe(false);
		wrapper.unmount();
	});

	it('home-recent-update 事件后刷新卡片数据', async () => {
		const wrapper = mount(HomeRecentList);
		Home.recentCards = [
			{
				title: 'Updated Game',
				dateText: '2026/8/13 11:00',
				pathText: 'C:/games/updated',
				stats: ['total: 1'],
				disabled: false,
				hidden: false
			}
		];
		window.dispatchEvent(new CustomEvent('home-recent-update'));
		await wrapper.vm.$nextTick();
		const items = wrapper.findAll('.home-recent-item');
		expect(items).toHaveLength(1);
		expect(items[0].find('.home-recent-title').text()).toBe('Updated Game');
		expect(items[0].find('.home-recent-date').text()).toBe('2026/8/13 11:00');
		expect(items[0].find('.home-recent-path').text()).toBe('C:/games/updated');
		expect(items[0].find('.home-recent-data').text()).toBe('total: 1');
		wrapper.unmount();
	});

	it('click/pointerup 转发到 Home 事件处理', async () => {
		const wrapper = mount(HomeRecentList);
		await wrapper.vm.$nextTick();
		await wrapper.find('.home-recent-item').trigger('click');
		expect(Home.recentClick).toHaveBeenCalled();
		await wrapper.find('.home-recent-item').trigger('pointerup');
		expect(Home.recentPointerup).toHaveBeenCalled();
		wrapper.unmount();
	});
});
