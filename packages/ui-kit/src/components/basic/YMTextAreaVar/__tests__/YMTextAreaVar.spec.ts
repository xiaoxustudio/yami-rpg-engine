import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTextAreaVar from '../YMTextAreaVar.vue';

describe('YMTextAreaVar', () => {
	it('write string stays constant and stores value', () => {
		const wrapper = mount(YMTextAreaVar, { props: { modelValue: 'line1' } });
		const vm = wrapper.vm as any;
		expect(vm.read()).toBe('line1');
		expect(wrapper.classes()).toContain('constant');
		expect(wrapper.find('textarea').exists()).toBe(true);
	});

	it('write object switches to variable mode', async () => {
		const wrapper = mount(YMTextAreaVar);
		const vm = wrapper.vm as any;
		vm.write({ type: 'local', key: 'text' });
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		expect(wrapper.find('textarea').isVisible()).toBe(false);
		expect(vm.read()).toEqual({ type: 'local', key: 'text' });
	});

	it('switch toggles modes', async () => {
		const wrapper = mount(YMTextAreaVar, { props: { modelValue: 'a' } });
		const vm = wrapper.vm as any;
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('constant');
	});

	it('slash key switches mode', async () => {
		const wrapper = mount(YMTextAreaVar, { props: { modelValue: 'a' } });
		await wrapper.trigger('keydown', { code: 'Slash' });
		expect(wrapper.classes()).toContain('variable');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMTextAreaVar, { props: { modelValue: 'a' } });
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.switch).toBe('function');
	});
});
