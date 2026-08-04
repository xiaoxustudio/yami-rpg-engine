import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTextBox from '../YMTextBox.vue';

describe('YMTextBox', () => {
	it('read/write roundtrip', () => {
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as any;
		vm.write('hello');
		expect(vm.read()).toBe('hello');
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello');
	});

	it('emits update:modelValue and input on typing', async () => {
		const wrapper = mount(YMTextBox);
		const input = wrapper.find('input');
		await input.setValue('abc');
		expect(wrapper.emitted('update:modelValue')![0]).toEqual(['abc']);
		expect(wrapper.emitted('input')![0]).toEqual(['abc']);
	});

	it('emits change on change event', async () => {
		const wrapper = mount(YMTextBox);
		const input = wrapper.find('input');
		await input.setValue('x');
		await input.trigger('change');
		expect(wrapper.emitted('change')![0]).toEqual(['x']);
	});

	it('disable hides input', () => {
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as any;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
		expect((wrapper.find('input').element as HTMLElement).style.display).toBe('none');
		vm.enable();
		expect(wrapper.classes()).not.toContain('disabled');
	});

	it('setPlaceholder and setMaxLength work', () => {
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as any;
		vm.setPlaceholder('Type here');
		vm.setMaxLength(10);
		const input = wrapper.find('input').element as HTMLInputElement;
		expect(input.placeholder).toBe('Type here');
		expect(input.maxLength).toBe(10);
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMTextBox);
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.getFocus).toBe('function');
		expect(el.input.tagName).toBe('INPUT');
	});

	it('deleteInputContent invokes execCommand delete', async () => {
		const calls: string[] = [];
		const orig = document.execCommand;
		(document as any).execCommand = (cmd: string) => {
			calls.push(cmd);
			return false;
		};
		const wrapper = mount(YMTextBox);
		const vm = wrapper.vm as any;
		vm.write('abc');
		vm.deleteInputContent();
		expect(calls).toContain('delete');
		(document as any).execCommand = orig;
	});

	it('syncs with external modelValue', async () => {
		const wrapper = mount(YMTextBox, { props: { modelValue: 'init' } });
		await wrapper.setProps({ modelValue: 'next' });
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('next');
	});
});
