import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTextArea from '../YMTextArea.vue';
import type { TextAreaApi } from '../text-area-api';

describe('YMTextArea', () => {
	it('read/write roundtrip', () => {
		const wrapper = mount(YMTextArea);
		const vm = wrapper.vm as unknown as TextAreaApi;
		vm.write('line1\nline2');
		expect(vm.read()).toBe('line1\nline2');
	});

	it('emits update:modelValue and input on typing', async () => {
		const wrapper = mount(YMTextArea);
		const input = wrapper.find('textarea');
		await input.setValue('abc');
		expect(wrapper.emitted('update:modelValue')![0]).toEqual(['abc']);
		expect(wrapper.emitted('input')![0]).toEqual(['abc']);
	});

	it('marks inputting class on keydown', async () => {
		const wrapper = mount(YMTextArea);
		const input = wrapper.find('textarea');
		await input.trigger('keydown', { code: 'KeyA' });
		expect(wrapper.classes()).toContain('inputting');
	});

	it('disable hides textarea', () => {
		const wrapper = mount(YMTextArea);
		const vm = wrapper.vm as unknown as TextAreaApi;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
		vm.enable();
		expect(wrapper.classes()).not.toContain('disabled');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMTextArea);
		const el = wrapper.element as unknown as TextAreaApi;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(el.input!.tagName).toBe('TEXTAREA');
	});

	it('syncs with external modelValue', async () => {
		const wrapper = mount(YMTextArea, { props: { modelValue: 'a' } });
		await wrapper.setProps({ modelValue: 'b' });
		expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('b');
	});
});
