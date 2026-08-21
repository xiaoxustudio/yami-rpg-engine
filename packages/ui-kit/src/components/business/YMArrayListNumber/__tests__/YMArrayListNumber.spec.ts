import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMArrayListNumber from '../YMArrayListNumber.vue';

describe('YMArrayListNumber', () => {
	it('renders title and numeric value', () => {
		const wrapper = mount(YMArrayListNumber, {
			props: { modelValue: 42, title: 'Number' }
		});
		expect(wrapper.text()).toContain('Number');
		expect(wrapper.find('input').exists()).toBe(true);
	});

	it('emits update:modelValue on input', async () => {
		const wrapper = mount(YMArrayListNumber, {
			props: { modelValue: 1 }
		});
		const input = wrapper.find('input');
		await input.setValue('7');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		wrapper.unmount();
	});
});
