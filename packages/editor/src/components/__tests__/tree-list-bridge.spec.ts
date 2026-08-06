import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';

describe('TreeList 事件转发（列表事件 Vue 化回归保护）', () => {
	it('select 事件转发（el.on 启用开关 + emit）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'test-list' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as any;
		expect(el.selectEventEnabled).toBe(true);
		const item = { name: 'ItemA', children: [] };
		el.select(item);
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('select');
		expect(emitted).toBeTruthy();
		expect((emitted![0][0] as any).value.name).toBe('ItemA');
		wrapper.unmount();
	});

	it('change 事件转发（addEventListener）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'test-list2' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as any;
		el.dispatchEvent(new Event('change'));
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('change')).toBeTruthy();
		wrapper.unmount();
	});

	it('select 派发开关由 el.on 注册启用（TabBar 同款陷阱回归）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'test-list3' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as any;
		expect(el.selectEventEnabled).toBe(true);
		expect(el.recordEventEnabled).toBe(true);
		expect(el.popupEventEnabled).toBe(true);
		expect(el.openEventEnabled).toBe(true);
		wrapper.unmount();
	});

	it('record 事件转发（rename 响应值）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'test-list4' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as any;
		const item = { name: 'A', children: [] };
		el.bind(() => [item]);
		el.initialize();
		const record = new Event('record');
		(record as any).value = { type: 'rename', item, oldValue: 'A', newValue: 'B' };
		el.dispatchEvent(record);
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('record');
		expect(emitted).toBeTruthy();
		expect((emitted![0][0] as any).value.type).toBe('rename');
		wrapper.unmount();
	});

	it('open 事件转发（open(item) 路径）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'test-list5' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as any;
		const item = { name: 'B', children: [] };
		el.bind(() => [item]);
		el.initialize();
		el.open(item);
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('open');
		expect(emitted).toBeTruthy();
		expect((emitted![0][0] as any).value.name).toBe('B');
		wrapper.unmount();
	});

	it('popup 事件转发（popup 事件值）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'test-list6' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as any;
		const popup = new Event('popup');
		(popup as any).value = { name: 'C', children: [] };
		el.dispatchEvent(popup);
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('popup');
		expect(emitted).toBeTruthy();
		expect((emitted![0][0] as any).value.name).toBe('C');
		wrapper.unmount();
	});
});
