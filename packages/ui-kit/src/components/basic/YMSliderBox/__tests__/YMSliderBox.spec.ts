import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSliderBox from '../YMSliderBox.vue';

describe('YMSliderBox', () => {
	it('renders bar, filler and range input', () => {
		const wrapper = mount(YMSliderBox, { props: { min: 0, max: 10 } });
		expect(wrapper.find('.slider-bar').exists()).toBe(true);
		expect(wrapper.find('.slider-filler').exists()).toBe(true);
		const input = wrapper.find('input');
		expect(input.attributes('type')).toBe('range');
		expect(input.attributes('min')).toBe('0');
		expect(input.attributes('max')).toBe('10');
	});

	it('emits input and update:modelValue on range input', async () => {
		const wrapper = mount(YMSliderBox, { props: { min: 0, max: 10 } });
		const input = wrapper.find('input');
		await input.setValue('5');
		expect(wrapper.emitted('input')![0]).toEqual([5]);
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([5]);
	});

	it('updates filler width proportionally', async () => {
		const wrapper = mount(YMSliderBox, { props: { min: 0, max: 10, modelValue: 5 } });
		const filler = wrapper.find('.slider-filler');
		expect(filler.attributes('style')).toContain('50%');
	});

	it('does not emit when disabled', async () => {
		const wrapper = mount(YMSliderBox, { props: { disabled: true, min: 0, max: 10 } });
		await wrapper.find('input').setValue('3');
		expect(wrapper.emitted('update:modelValue')).toBeUndefined();
	});

	it('syncs with external modelValue changes', async () => {
		const wrapper = mount(YMSliderBox, { props: { min: 0, max: 10, modelValue: 2 } });
		await wrapper.setProps({ modelValue: 8 });
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('8');
	});

	it('applies disabled class', () => {
		const wrapper = mount(YMSliderBox, { props: { disabled: true } });
		expect(wrapper.classes()).toContain('disabled');
	});
});
