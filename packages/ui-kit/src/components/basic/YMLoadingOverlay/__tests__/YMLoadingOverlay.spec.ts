import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMLoadingOverlay from '../YMLoadingOverlay.vue';

describe('YMLoadingOverlay', () => {
	it('hidden by default', () => {
		const wrapper = mount(YMLoadingOverlay);
		expect(wrapper.classes()).not.toContain('visible');
	});

	it('shows when visible prop is true', () => {
		const wrapper = mount(YMLoadingOverlay, { props: { visible: true } });
		expect(wrapper.classes()).toContain('visible');
	});

	it('hides when visible prop turns false', async () => {
		const wrapper = mount(YMLoadingOverlay, { props: { visible: true } });
		await wrapper.setProps({ visible: false });
		expect(wrapper.classes()).not.toContain('visible');
	});

	it('renders text', () => {
		const wrapper = mount(YMLoadingOverlay, { props: { visible: true, text: 'Loading...' } });
		expect(wrapper.text()).toContain('Loading...');
	});

	it('exposes show/hide counting api', async () => {
		const wrapper = mount(YMLoadingOverlay);
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.show();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('visible');
		vm.hide();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).not.toContain('visible');
	});
});
