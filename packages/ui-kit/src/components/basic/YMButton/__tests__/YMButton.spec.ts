import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMButton from '../YMButton.vue';

describe('YMButton', () => {
	it('renders slot content', () => {
		const wrapper = mount(YMButton, { slots: { default: 'Confirm' } });
		expect(wrapper.text()).toBe('Confirm');
	});

	it('applies variant classes', () => {
		const wrapper = mount(YMButton, { props: { variant: 'primary' } });
		expect(wrapper.classes()).toContain('ym-button');
		expect(wrapper.classes()).toContain('ym-button-primary');
	});

	it('applies size classes', () => {
		const wrapper = mount(YMButton, { props: { size: 'lg' } });
		expect(wrapper.classes()).toContain('ym-button-lg');
	});

	it('emits click when enabled', async () => {
		const wrapper = mount(YMButton);
		await wrapper.trigger('click');
		expect(wrapper.emitted('click')).toHaveLength(1);
	});

	it('does not emit click when disabled', async () => {
		const wrapper = mount(YMButton, { props: { disabled: true } });
		await wrapper.trigger('click');
		expect(wrapper.emitted('click')).toBeUndefined();
	});

	it('binds native type attribute', () => {
		const wrapper = mount(YMButton, { props: { type: 'submit' } });
		expect(wrapper.attributes('type')).toBe('submit');
	});
});
