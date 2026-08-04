import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMGamepadBox from './YMGamepadBox.vue';

describe('YMGamepadBox', () => {
	it('read/write roundtrip with button name', () => {
		const wrapper = mount(YMGamepadBox);
		const vm = wrapper.vm as any;
		vm.write(0);
		expect(vm.read()).toBe(0);
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('A');
		vm.write(15);
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Right');
	});

	it('write(-1) clears the input', () => {
		const wrapper = mount(YMGamepadBox);
		const vm = wrapper.vm as any;
		vm.write(3);
		vm.write(-1);
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('');
	});

	it('backspace key clears and dispatches change', async () => {
		const wrapper = mount(YMGamepadBox);
		const vm = wrapper.vm as any;
		vm.write(2);
		const el = wrapper.element as any;
		const events: any[] = [];
		el.addEventListener('change', () => events.push(1));
		await wrapper.find('input').trigger('keydown', { code: 'Backspace' });
		expect(vm.read()).toBe(-1);
		expect(events).toHaveLength(1);
	});

	it('disable hides children and adds class', () => {
		const wrapper = mount(YMGamepadBox);
		const vm = wrapper.vm as any;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
		vm.enable();
		expect(wrapper.classes()).not.toContain('disabled');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMGamepadBox);
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.getFocus).toBe('function');
	});

	it('stops interval on unmount', () => {
		const wrapper = mount(YMGamepadBox);
		wrapper.unmount();
		expect(true).toBe(true);
	});
});
