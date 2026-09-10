import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import YMTreeList from '../YMTreeList.vue';

interface ListEl extends HTMLElement {
	bind: (fn: () => unknown[] | null) => void;
	update: () => void;
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

describe('YMTreeList data 为空时的 update 健壮性（unpackOpenEvents 时序回归）', () => {
	it('bind 返回 null 时 update 不抛错', async () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as ListEl;
		mockHeight(el);
		el.bind(() => null);
		await nextTick();
		expect(() => el.update()).not.toThrow();
		wrapper.unmount();
	});

	it('data 从 null 切换为数组后 update 正常渲染', async () => {
		const wrapper = mount(YMTreeList);
		const el = wrapper.element as unknown as ListEl;
		mockHeight(el);
		let data: unknown[] | null = null;
		el.bind(() => data);
		await nextTick();
		el.update();
		await nextTick();
		data = [{ id: 'a1', name: 'Event A', children: [] }];
		expect(() => el.update()).not.toThrow();
		await nextTick();
		expect(el.querySelectorAll('.node-item').length).toBe(1);
		wrapper.unmount();
	});
});
