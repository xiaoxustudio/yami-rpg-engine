import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFormButtons from '../YMFormButtons/YMFormButtons.vue';

describe('YMFormButtons', () => {
	it('renders confirm/cancel buttons with id prefix', () => {
		const wrapper = mount(YMFormButtons, { props: { idPrefix: 'testWin' } });
		const buttons = wrapper.findAll('button');
		expect(buttons.length).toBe(2);
		expect(buttons[0].attributes('id')).toBe('testWin-confirm');
		expect(buttons[0].attributes('name')).toBe('confirm');
		expect(buttons[0].text()).toBe('Confirm');
		expect(buttons[1].attributes('id')).toBe('testWin-cancel');
		expect(buttons[1].attributes('name')).toBe('cancel');
	});

	it('renders apply button when showApply', () => {
		const wrapper = mount(YMFormButtons, { props: { idPrefix: 'w', showApply: true } });
		expect(wrapper.findAll('button').length).toBe(3);
		expect(wrapper.find('button[name="apply"]').attributes('id')).toBe('w-apply');
	});

	it('supports custom labels', () => {
		const wrapper = mount(YMFormButtons, {
			props: { idPrefix: 'w', confirmLabel: 'Yes', cancelLabel: 'No' }
		});
		expect(wrapper.find('button[name="confirm"]').text()).toBe('Yes');
		expect(wrapper.find('button[name="cancel"]').text()).toBe('No');
	});
});
