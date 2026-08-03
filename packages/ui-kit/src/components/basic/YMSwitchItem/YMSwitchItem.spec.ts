import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSwitchItem from './YMSwitchItem.vue';

const pointerdown = (el: Element, button: number) =>
	el.dispatchEvent(new PointerEvent('pointerdown', { button, bubbles: true }));

describe('YMSwitchItem', () => {
	it('cycles value on pointerdown', async () => {
		const wrapper = mount(YMSwitchItem, { props: { modelValue: 0, length: 3 } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([1]);
	});

	it('wraps around length boundary', async () => {
		const wrapper = mount(YMSwitchItem, { props: { modelValue: 2, length: 3 } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([0]);
	});

	it('clamps length to 1..4', async () => {
		const wrapper = mount(YMSwitchItem, { props: { modelValue: 0, length: 8 } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([1]);
	});

	it('applies state class from value', () => {
		const wrapper = mount(YMSwitchItem, { props: { modelValue: 2, length: 3 } });
		expect(wrapper.classes()).toContain('two');
	});

	it('does not cycle when disabled', async () => {
		const wrapper = mount(YMSwitchItem, {
			props: { disabled: true, modelValue: 0, length: 3 }
		});
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('update:modelValue')).toBeUndefined();
	});

	it('cycles via Enter key', async () => {
		const wrapper = mount(YMSwitchItem, { props: { modelValue: 0, length: 3 } });
		await wrapper.trigger('keydown', { code: 'Enter' });
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([1]);
	});
});
