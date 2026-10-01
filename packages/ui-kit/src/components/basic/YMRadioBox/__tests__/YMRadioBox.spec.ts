import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMRadioBox from '../YMRadioBox.vue';

const pointerdown = (el: Element, button: number) =>
	el.dispatchEvent(new PointerEvent('pointerdown', { button, bubbles: true }));

const mountGroup = () => ({
	first: mount(YMRadioBox, { props: { name: 'g', value: 1 } }),
	second: mount(YMRadioBox, { props: { name: 'g', value: 2 } })
});

describe('YMRadioBox', () => {
	it('renders slot content and radio-mark in standard mode', () => {
		const wrapper = mount(YMRadioBox, {
			props: { name: 'g', value: 'a', standard: true },
			slots: { default: 'Option A' }
		});
		expect(wrapper.text()).toBe('Option A');
		expect(wrapper.find('.radio-mark').exists()).toBe(true);
	});

	it('emits select with value on pointerdown', async () => {
		const wrapper = mount(YMRadioBox, { props: { name: 'g', value: 'a' } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('select')![0]).toEqual(['a']);
	});

	it('selects itself and unselects siblings in same group', async () => {
		const { first, second } = mountGroup();
		pointerdown(first.element, 0);
		await first.vm.$nextTick();
		await second.vm.$nextTick();
		expect(first.classes()).toContain('selected');
		expect(second.classes()).not.toContain('selected');

		pointerdown(second.element, 0);
		await first.vm.$nextTick();
		await second.vm.$nextTick();
		expect(second.classes()).toContain('selected');
		expect(first.classes()).not.toContain('selected');
	});

	it('does not affect radios in other groups', async () => {
		const other = mount(YMRadioBox, { props: { name: 'h', value: 1 } });
		const { first } = mountGroup();
		pointerdown(first.element, 0);
		await first.vm.$nextTick();
		await other.vm.$nextTick();
		expect(other.classes()).not.toContain('selected');
	});

	it('does not select when disabled', async () => {
		const wrapper = mount(YMRadioBox, { props: { name: 'g', value: 'a', disabled: true } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('select')).toBeUndefined();
		expect(wrapper.classes()).not.toContain('selected');
	});

	it('honors external selected prop', async () => {
		const wrapper = mount(YMRadioBox, { props: { name: 'g', value: 'a', selected: false } });
		await wrapper.setProps({ selected: true });
		expect(wrapper.classes()).toContain('selected');
		await wrapper.setProps({ selected: false });
		expect(wrapper.classes()).not.toContain('selected');
	});

	it('unregisters from group on unmount', async () => {
		const { first, second } = mountGroup();
		first.unmount();
		pointerdown(second.element, 0);
		await second.vm.$nextTick();
		expect(second.classes()).toContain('selected');
	});

	it('对外暴露 radio 语义（role + aria-checked / aria-disabled）', async () => {
		const wrapper = mount(YMRadioBox, {
			props: { name: 'g', value: 'a', standard: true, selected: false }
		});
		expect(wrapper.attributes('role')).toBe('radio');
		expect(wrapper.attributes('aria-checked')).toBe('false');
		await wrapper.setProps({ selected: true });
		expect(wrapper.attributes('aria-checked')).toBe('true');

		const disabled = mount(YMRadioBox, { props: { name: 'g', value: 'a', disabled: true } });
		expect(disabled.attributes('aria-disabled')).toBe('true');
	});

	it('空格选中并拦掉默认滚动', async () => {
		const wrapper = mount(YMRadioBox, { props: { name: 'g', value: 'a' } });
		const event = new KeyboardEvent('keydown', {
			code: 'Space',
			bubbles: true,
			cancelable: true
		});
		wrapper.element.dispatchEvent(event);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('select')![0]).toEqual(['a']);
		expect(event.defaultPrevented).toBe(true);
	});
});
