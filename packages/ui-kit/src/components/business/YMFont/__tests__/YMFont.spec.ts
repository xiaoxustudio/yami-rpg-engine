import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFont from '../YMFont.vue';

describe('YMFont', () => {
	it('renders label, title and input value', () => {
		const wrapper = mount(YMFont, {
			props: { modelValue: 'Arial', label: '字体', title: '字体设置' }
		});
		expect(wrapper.text()).toContain('字体设置');
		expect(wrapper.text()).toContain('字体');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('Arial');
	});

	it('emits update:modelValue on input', async () => {
		const wrapper = mount(YMFont, {
			props: { modelValue: 'a' }
		});
		const input = wrapper.find('input');
		await input.setValue('SimHei');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['SimHei']);
	});
});
