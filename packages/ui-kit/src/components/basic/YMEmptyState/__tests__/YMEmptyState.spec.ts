import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMEmptyState from '../YMEmptyState.vue';

describe('YMEmptyState', () => {
	it('renders message text', () => {
		const wrapper = mount(YMEmptyState, { props: { message: 'No data' } });
		expect(wrapper.text()).toContain('No data');
	});

	it('renders default icon when icon prop is empty', () => {
		const wrapper = mount(YMEmptyState, { props: { message: '' } });
		expect(wrapper.find('.empty-icon svg').exists()).toBe(true);
	});

	it('renders custom icon as escaped text', () => {
		const icon = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
		const wrapper = mount(YMEmptyState, { props: { message: '', icon } });
		expect(wrapper.find('.empty-icon svg').exists()).toBe(false);
		expect(wrapper.find('.empty-icon').text()).toBe(icon);
	});

	it('escapes html in custom icon to prevent injection', () => {
		const wrapper = mount(YMEmptyState, {
			props: { message: '', icon: '<img src=x onerror="window.__hacked = true">' }
		});
		expect(wrapper.find('.empty-icon img').exists()).toBe(false);
	});
});
