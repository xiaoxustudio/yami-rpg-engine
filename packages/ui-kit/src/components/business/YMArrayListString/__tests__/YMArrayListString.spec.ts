import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMArrayListString from '../YMArrayListString.vue';

describe('YMArrayListString', () => {
	it('renders title and string value', () => {
		const wrapper = mount(YMArrayListString, {
			props: { modelValue: 'hello', title: 'String' }
		});
		expect(wrapper.text()).toContain('String');
		const input = wrapper.find('textarea, input');
		expect((input.element as HTMLInputElement).value).toBe('hello');
	});

	it('emits update:modelValue on input', async () => {
		const wrapper = mount(YMArrayListString, {
			props: { modelValue: 'a' }
		});
		const input = wrapper.find('textarea, input');
		await input.setValue('new');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		wrapper.unmount();
	});
});
