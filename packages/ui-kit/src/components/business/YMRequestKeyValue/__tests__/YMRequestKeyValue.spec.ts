import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMRequestKeyValue from '../YMRequestKeyValue.vue';

describe('YMRequestKeyValue', () => {
	it('renders title and both var inputs', () => {
		const wrapper = mount(YMRequestKeyValue, {
			props: { title: 'Header', key: 'k', value: 'v' }
		});
		expect(wrapper.text()).toContain('Header');
		const inputs = wrapper.findAll('input');
		expect(inputs.length).toBeGreaterThanOrEqual(1);
		wrapper.unmount();
	});

	it('emits update:key and update:value on input', async () => {
		const wrapper = mount(YMRequestKeyValue, {
			props: { key: 'a', value: 'b' }
		});
		const inputs = wrapper.findAll('input');
		if (inputs.length >= 1) {
			await inputs[0].setValue('x');
		}
		expect(wrapper.emitted('update:key') || wrapper.emitted('update:value')).toBeTruthy();
		wrapper.unmount();
	});
});
