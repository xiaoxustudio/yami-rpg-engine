import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import '@app/data/metadata.ts';
import Reference from '@app/components/tools/Reference.vue';
import { Reference as ReferenceLegacy } from '@app/log/related-references.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ syncState: vi.fn() }),
	getLocalStore: () => ({ syncState: vi.fn() })
}));

beforeEach(() => {
	setActivePinia(createPinia());
});

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

describe('相关引用列表 Vue 渲染（引用计数徽标回归保护）', () => {
	it('Reference.update 经 Vue 渲染 common-item 与引用计数徽标', async () => {
		const wrapper = mount(Reference, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const list = document.getElementById('reference-list') as HTMLElement | null;
		expect(list).toBeTruthy();
		if (!list) return;
		mockHeight(list);
		ReferenceLegacy.update?.([
			{ type: 'comment', text: '******************** Event ********************' },
			{ type: 'path', text: 'path : #guid1', count: 3 },
			{ type: 'path', text: 'path2 : #guid2' }
		]);
		await wrapper.vm.$nextTick();
		const items = list.querySelectorAll('.common-item');
		expect(items.length).toBe(3);
		expect(items[0].classList.contains('reference-comment')).toBe(true);
		const badge = items[1].querySelector('.reference-count');
		expect(badge).toBeTruthy();
		expect(badge?.textContent).toBe('3');
		expect(items[1].textContent).toContain('path : #guid1');
		expect(items[2].querySelector('.reference-count')).toBeNull();
		expect((items[1] as HTMLElement & { dataValue?: unknown }).dataValue).toMatchObject({
			type: 'path',
			text: 'path : #guid1',
			count: 3
		});
		wrapper.unmount();
	});

	it('重复 update 重建列表（reload 路径无残留）', async () => {
		const wrapper = mount(Reference, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const list = document.getElementById('reference-list') as HTMLElement | null;
		if (!list) return;
		mockHeight(list);
		ReferenceLegacy.update?.([
			{ type: 'path', text: 'a : #1', count: 1 },
			{ type: 'path', text: 'b : #2', count: 2 }
		]);
		await wrapper.vm.$nextTick();
		ReferenceLegacy.update?.([{ type: 'path', text: 'c : #3', count: 5 }]);
		await wrapper.vm.$nextTick();
		const items = list.querySelectorAll('.common-item');
		expect(items.length).toBe(1);
		expect(items[0].textContent).toContain('c : #3');
		expect(items[0].querySelector('.reference-count')?.textContent).toBe('5');
		wrapper.unmount();
	});
});
