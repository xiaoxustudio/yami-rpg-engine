import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMNumberBox from '../YMNumberBox.vue';
import type { NumberBoxApi } from '../number-box-api';

describe('YMNumberBox', () => {
	it('read/write roundtrip with clamp', () => {
		const wrapper = mount(YMNumberBox, { props: { min: 0, max: 10, modelValue: 3 } });
		const vm = wrapper.vm as unknown as NumberBoxApi;
		expect(vm.read()).toBe(3);
		vm.write(8);
		expect(vm.read()).toBe(8);
		vm.write(99);
		expect(vm.read()).toBe(10);
	});

	it('emits change on change event', async () => {
		const wrapper = mount(YMNumberBox, { props: { min: 0, max: 100 } });
		const input = wrapper.find('input');
		await input.setValue('42');
		await input.trigger('change');
		expect(wrapper.emitted('change')![0]).toEqual([42]);
		expect(wrapper.emitted('update:modelValue')![0]).toEqual([42]);
	});

	it('rounds to decimals', () => {
		const wrapper = mount(YMNumberBox, {
			props: { min: 0, max: 10, decimals: 2, modelValue: 1.234 }
		});
		const vm = wrapper.vm as unknown as NumberBoxApi;
		expect(vm.read()).toBe(1.23);
	});

	it('blocklist prevents invalid keys', async () => {
		const wrapper = mount(YMNumberBox);
		const input = wrapper.find('input');
		await input.trigger('keydown', { code: 'KeyA' });
		const vm = wrapper.vm as unknown as NumberBoxApi;
		expect(vm.read()).toBe(0);
	});

	it('exposes bridge functions and decimals property', () => {
		const wrapper = mount(YMNumberBox);
		const el = wrapper.element as unknown as NumberBoxApi & { decimals: number };
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(el.input!.tagName).toBe('INPUT');
		el.decimals = 3;
		expect(el.decimals).toBe(3);
	});

	it('disable adds disabled class', () => {
		const wrapper = mount(YMNumberBox);
		const vm = wrapper.vm as unknown as NumberBoxApi;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
	});
});
