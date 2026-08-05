import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSelectVar from '../YMSelectVar.vue';

const items = [
	{ value: 'a', name: 'Alpha' },
	{ value: 'b', name: 'Beta' }
];

describe('YMSelectVar', () => {
	it('write value stays constant and stores value', () => {
		const wrapper = mount(YMSelectVar, { props: { items, modelValue: 'b' } });
		const vm = wrapper.vm as any;
		expect(vm.read()).toBe('b');
		expect(wrapper.classes()).toContain('constant');
		expect(wrapper.find('.select-box').exists()).toBe(true);
	});

	it('write object switches to variable mode', async () => {
		const wrapper = mount(YMSelectVar, { props: { items } });
		const vm = wrapper.vm as any;
		vm.write({ type: 'local', key: 'sel' });
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		expect(wrapper.find('.select-box').isVisible()).toBe(false);
		expect(vm.read()).toEqual({ type: 'local', key: 'sel' });
	});

	it('switch toggles modes', async () => {
		const wrapper = mount(YMSelectVar, { props: { items, modelValue: 'a' } });
		const vm = wrapper.vm as any;
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('constant');
	});

	it('loadItems through select box', () => {
		const wrapper = mount(YMSelectVar, { props: { items } });
		const select = wrapper.findComponent({ name: 'YMSelectBox' });
		expect(select.exists()).toBe(true);
	});

	it('slash key switches mode', async () => {
		const wrapper = mount(YMSelectVar, { props: { items, modelValue: 'a' } });
		await wrapper.trigger('keydown', { code: 'Slash' });
		expect(wrapper.classes()).toContain('variable');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMSelectVar, { props: { items, modelValue: 'a' } });
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.switch).toBe('function');
	});
});
