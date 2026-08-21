import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSetKey from '../YMSetKey.vue';

describe('YMSetKey', () => {
	it('renders label, title and input value', () => {
		const wrapper = mount(YMSetKey, {
			props: { modelValue: 'secret', label: '键', title: '设置按键' }
		});
		expect(wrapper.text()).toContain('设置按键');
		expect(wrapper.text()).toContain('键');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('secret');
	});

	it('emits update:modelValue on input', async () => {
		const wrapper = mount(YMSetKey, {
			props: { modelValue: 'a' }
		});
		const input = wrapper.find('input');
		await input.setValue('new-key');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new-key']);
	});
});
