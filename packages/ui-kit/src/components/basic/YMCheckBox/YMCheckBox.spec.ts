import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMCheckBox from './YMCheckBox.vue';

const pointerdown = (el: Element, button: number) =>
	el.dispatchEvent(new PointerEvent('pointerdown', { button, bubbles: true }));

describe('YMCheckBox', () => {
	it('renders slot content', () => {
		const wrapper = mount(YMCheckBox, { slots: { default: 'Label' } });
		expect(wrapper.text()).toBe('Label');
	});

	it('toggles value on pointerdown', async () => {
		const wrapper = mount(YMCheckBox, { props: { modelValue: false } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toHaveLength(1);
		expect(emitted![0]).toEqual([true]);
		expect(wrapper.emitted('change')![0]).toEqual([true]);
	});

	it('renders selected class when checked', () => {
		const wrapper = mount(YMCheckBox, { props: { modelValue: true } });
		expect(wrapper.classes()).toContain('selected');
	});

	it('does not toggle when disabled', async () => {
		const wrapper = mount(YMCheckBox, { props: { disabled: true, modelValue: false } });
		pointerdown(wrapper.element, 0);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('update:modelValue')).toBeUndefined();
	});

	it('ignores non-primary buttons', async () => {
		const wrapper = mount(YMCheckBox, { props: { modelValue: false } });
		pointerdown(wrapper.element, 2);
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('update:modelValue')).toBeUndefined();
	});

	it('renders check-mark only in standard mode', () => {
		const standard = mount(YMCheckBox, { props: { standard: true } });
		expect(standard.find('.check-mark').exists()).toBe(true);
		const plain = mount(YMCheckBox);
		expect(plain.find('.check-mark').exists()).toBe(false);
	});

	it('renders slot content next to the check-mark', () => {
		const wrapper = mount(YMCheckBox, {
			props: { standard: true },
			slots: { default: 'Label' }
		});
		const html = wrapper.element.innerHTML;
		expect(html.indexOf('check-mark')).toBeGreaterThanOrEqual(0);
		expect(html.indexOf('Label')).toBeGreaterThan(html.indexOf('check-mark'));
	});

	it('toggles via Enter key', async () => {
		const wrapper = mount(YMCheckBox, { props: { standard: true, modelValue: false } });
		await wrapper.trigger('keydown', { code: 'Enter' });
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([true]);
	});

	it('syncs with external modelValue changes', async () => {
		const wrapper = mount(YMCheckBox, { props: { modelValue: false } });
		await wrapper.setProps({ modelValue: true });
		expect(wrapper.classes()).toContain('selected');
	});
});
