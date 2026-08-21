import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSetQuantity from '../YMSetQuantity.vue';

describe('YMSetQuantity', () => {
	it('renders label, title and number input value', () => {
		const wrapper = mount(YMSetQuantity, {
			props: { modelValue: 7, max: 99, label: '数量', title: '设置数量' }
		});
		expect(wrapper.text()).toContain('设置数量');
		expect(wrapper.text()).toContain('数量');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('7');
		expect((input.element as HTMLInputElement).max).toBe('99');
	});

	it('emits update:modelValue on change', async () => {
		const wrapper = mount(YMSetQuantity, {
			props: { modelValue: 1, max: 10 }
		});
		const input = wrapper.find('input');
		await input.setValue('5');
		await input.trigger('change');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(5);
	});

	it('forwards confirm event from root frame', async () => {
		const wrapper = mount(YMSetQuantity, {
			props: { modelValue: 1, max: 10 }
		});
		const root = wrapper.find('.window-frame').element;
		root.dispatchEvent(new Event('confirm'));
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('confirm')).toBeTruthy();
	});
});
