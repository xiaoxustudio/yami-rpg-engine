import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFontSize from '../YMFontSize.vue';

describe('YMFontSize', () => {
	it('renders label, title and input value', () => {
		const wrapper = mount(YMFontSize, {
			props: { modelValue: 16, label: '字号', title: '字号设置' }
		});
		expect(wrapper.text()).toContain('字号设置');
		expect(wrapper.text()).toContain('字号');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('16');
	});

	it('emits update:modelValue on change', async () => {
		const wrapper = mount(YMFontSize, {
			props: { modelValue: 12 }
		});
		const input = wrapper.find('input');
		await input.setValue('24');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([24]);
	});
});
