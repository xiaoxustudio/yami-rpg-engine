import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMKeyboardBox from './YMKeyboardBox.vue';

describe('YMKeyboardBox', () => {
	it('read/write roundtrip', () => {
		const wrapper = mount(YMKeyboardBox);
		const vm = wrapper.vm as any;
		vm.write(65);
		expect(vm.read()).toBe(65);
		expect((wrapper.find('input').element as HTMLInputElement).value).toBe('65');
	});

	it('inputCode dispatches input event with value', async () => {
		const wrapper = mount(YMKeyboardBox);
		const vm = wrapper.vm as any;
		const el = wrapper.element as any;
		const events: any[] = [];
		el.on('input', (e: any) => events.push(e.value));
		vm.inputCode(42);
		await wrapper.vm.$nextTick();
		expect(events).toEqual([42]);
		expect(vm.read()).toBe(42);
	});

	it('backspace clears value to 0 and empties input', async () => {
		const wrapper = mount(YMKeyboardBox);
		const vm = wrapper.vm as any;
		vm.write(65);
		const input = wrapper.find('input');
		await input.trigger('keydown', { code: 'Backspace' });
		expect(vm.read()).toBe(0);
		expect((input.element as HTMLInputElement).value).toBe('');
	});

	it('keydown shows pretty key name (KeyA -> A)', async () => {
		const wrapper = mount(YMKeyboardBox);
		const input = wrapper.find('input');
		await input.trigger('keydown', { code: 'KeyA', keyCode: 65 });
		expect((input.element as HTMLInputElement).value).toBe('A');
	});

	it('keydown shows pretty key name (ArrowUp -> Up)', async () => {
		const wrapper = mount(YMKeyboardBox);
		const input = wrapper.find('input');
		await input.trigger('keydown', { code: 'ArrowUp', keyCode: 38 });
		expect((input.element as HTMLInputElement).value).toBe('Up');
	});

	it('disable hides children and adds class', () => {
		const wrapper = mount(YMKeyboardBox);
		const vm = wrapper.vm as any;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
		expect((wrapper.find('input').element as HTMLElement).style.display).toBe('none');
		vm.enable();
		expect(wrapper.classes()).not.toContain('disabled');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMKeyboardBox);
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.getFocus).toBe('function');
		expect(el.input.tagName).toBe('INPUT');
	});

	it('on(focus) enables focus event forwarding', async () => {
		const wrapper = mount(YMKeyboardBox);
		const el = wrapper.element as any;
		const events: any[] = [];
		el.on('focus', () => events.push(1));
		const input = wrapper.find('input');
		await input.trigger('focus');
		await wrapper.vm.$nextTick();
		expect(events).toHaveLength(1);
	});
});
