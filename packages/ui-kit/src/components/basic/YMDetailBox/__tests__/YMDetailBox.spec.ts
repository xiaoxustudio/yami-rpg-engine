import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMDetailBox from '../YMDetailBox.vue';

describe('YMDetailBox', () => {
	it('renders slot content', () => {
		const wrapper = mount(YMDetailBox, {
			props: { open: true },
			slots: { default: '<div class="content">Body</div>' }
		});
		expect(wrapper.find('.content').exists()).toBe(true);
	});

	it('sets open attribute when open', () => {
		const wrapper = mount(YMDetailBox, { props: { open: true } });
		expect(wrapper.attributes('open')).toBeDefined();
	});

	it('omits open attribute when closed', async () => {
		const wrapper = mount(YMDetailBox, { props: { open: false } });
		expect(wrapper.attributes('open')).toBeUndefined();
		await wrapper.setProps({ open: true });
		expect(wrapper.attributes('open')).toBeDefined();
	});

	it('hides non-summary children when closed', async () => {
		const wrapper = mount(YMDetailBox, {
			props: { open: true },
			slots: {
				default: '<div class="detail-summary">Title</div><div class="content">Body</div>'
			}
		});
		expect(wrapper.find('.content').classes()).not.toContain('hidden');
		await wrapper.setProps({ open: false });
		expect(wrapper.find('.content').classes()).toContain('hidden');
		expect(wrapper.find('.detail-summary').classes()).not.toContain('hidden');
	});

	it('emits toggle on open/close via exposed methods', async () => {
		const wrapper = mount(YMDetailBox, { props: { open: false } });
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.open();
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('toggle')![0]).toEqual(['open']);
		vm.close();
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('toggle')![1]).toEqual(['closed']);
	});

	it('does not re-emit toggle when already open', async () => {
		const wrapper = mount(YMDetailBox, { props: { open: true } });
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.open();
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('toggle')).toBeUndefined();
	});
});
