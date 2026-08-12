import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMColorBox from '../YMColorBox.vue';
import type { ColorBoxApi } from '../color-box-api';

describe('YMColorBox', () => {
	it('read/write roundtrip and sets foreground color', () => {
		const wrapper = mount(YMColorBox, { props: { modelValue: 'ff0000' } });
		const vm = wrapper.vm as unknown as ColorBoxApi;
		expect(vm.read()).toBe('ff0000');
		const fg = wrapper.find('.color-box-foreground').element as HTMLElement;
		expect(fg.style.backgroundColor).toContain('255, 0, 0');
	});

	it('write with alpha channel', () => {
		const wrapper = mount(YMColorBox);
		const vm = wrapper.vm as unknown as ColorBoxApi;
		vm.write('00ff0080');
		const fg = wrapper.find('.color-box-foreground').element as HTMLElement;
		expect(fg.style.backgroundColor).toContain('0, 255, 0');
	});

	it('input emits input and change events', async () => {
		const wrapper = mount(YMColorBox);
		const vm = wrapper.vm as unknown as ColorBoxApi;
		const el = wrapper.element as unknown as ColorBoxApi;
		const changes: unknown[] = [];
		el.addEventListener('change', () => changes.push(1));
		vm.input('00ff00');
		await wrapper.vm.$nextTick();
		expect(changes).toHaveLength(1);
		expect(wrapper.emitted('input')![0]).toEqual(['00ff00']);
	});

	it('opens builtin popup on click', async () => {
		const wrapper = mount(YMColorBox, { props: { modelValue: 'ff0000' } });
		await wrapper.trigger('click');
		expect(wrapper.find('.color-popup').exists()).toBe(true);
		const input = wrapper.find('input[type=color]');
		expect(input.exists()).toBe(true);
		expect((input.element as HTMLInputElement).value).toBe('#ff0000');
	});

	it('picks color from native input', async () => {
		const wrapper = mount(YMColorBox, { props: { modelValue: 'ff0000' } });
		await wrapper.trigger('click');
		const input = wrapper.find('input[type=color]');
		await input.setValue('#00ff00');
		expect((wrapper.vm as unknown as ColorBoxApi).read()).toBe('00ff00ff');
		expect(wrapper.find('.color-popup').exists()).toBe(false);
	});

	it('emits open event when popup disabled', async () => {
		const wrapper = mount(YMColorBox, { props: { popup: false } });
		await wrapper.trigger('click');
		expect(wrapper.emitted('open')).toHaveLength(1);
		expect(wrapper.find('.color-popup').exists()).toBe(false);
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMColorBox, { props: { modelValue: 'ff0000' } });
		const el = wrapper.element as unknown as ColorBoxApi;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.on).toBe('function');
		expect(el.foreground.tagName).toBe('DIV');
	});

	it('disable adds disabled class', () => {
		const wrapper = mount(YMColorBox);
		const vm = wrapper.vm as unknown as ColorBoxApi;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
	});
});
