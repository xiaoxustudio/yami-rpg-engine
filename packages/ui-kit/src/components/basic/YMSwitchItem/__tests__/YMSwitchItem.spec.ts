import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSwitchItem from '../YMSwitchItem.vue';

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

	it('对外暴露 spinbutton 语义（多态循环，不是开/关开关）', () => {
		const wrapper = mount(YMSwitchItem, { props: { modelValue: 2, length: 3 } });
		expect(wrapper.attributes('role')).toBe('spinbutton');
		expect(wrapper.attributes('aria-valuenow')).toBe('2');
		expect(wrapper.attributes('aria-valuemin')).toBe('0');
		expect(wrapper.attributes('aria-valuemax')).toBe('2');
	});

	it('空格向前循环、方向键双向循环', async () => {
		const forward = mount(YMSwitchItem, { props: { modelValue: 0, length: 3 } });
		const event = new KeyboardEvent('keydown', {
			code: 'Space',
			bubbles: true,
			cancelable: true
		});
		forward.element.dispatchEvent(event);
		await forward.vm.$nextTick();
		expect(forward.emitted('update:modelValue')![0]).toEqual([1]);
		expect(event.defaultPrevented).toBe(true);

		// 从 0 后退要回绕到 2（不能传负数进 write 的取模）
		const backward = mount(YMSwitchItem, { props: { modelValue: 0, length: 3 } });
		await backward.trigger('keydown', { code: 'ArrowDown' });
		expect(backward.emitted('update:modelValue')![0]).toEqual([2]);

		const right = mount(YMSwitchItem, { props: { modelValue: 1, length: 3 } });
		await right.trigger('keydown', { code: 'ArrowRight' });
		expect(right.emitted('update:modelValue')![0]).toEqual([2]);
	});
});
