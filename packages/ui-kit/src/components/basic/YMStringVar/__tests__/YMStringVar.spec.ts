import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMStringVar from '../YMStringVar.vue';
import type { StringVarApi } from '../string-var-api';

describe('YMStringVar', () => {
	it('write string stays constant and stores value', () => {
		const wrapper = mount(YMStringVar, { props: { modelValue: 'hello' } });
		const vm = wrapper.vm as unknown as StringVarApi;
		expect(vm.read()).toBe('hello');
		expect(wrapper.classes()).toContain('constant');
		expect(wrapper.find('input').exists()).toBe(true);
	});

	it('write object switches to variable mode', async () => {
		const wrapper = mount(YMStringVar);
		const vm = wrapper.vm as unknown as StringVarApi;
		vm.write({ type: 'local', key: 'name' });
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		expect(wrapper.find('input').isVisible()).toBe(false);
		expect(vm.read()).toEqual({ type: 'local', key: 'name' });
	});

	it('switch toggles modes', async () => {
		const wrapper = mount(YMStringVar, { props: { modelValue: 'a' } });
		const vm = wrapper.vm as unknown as StringVarApi;
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('constant');
	});

	it('renders variable slot in variable mode', async () => {
		const wrapper = mount(YMStringVar, {
			props: { modelValue: { type: 'local', key: 'name' } },
			slots: { variable: '<div class="var-slot-test">VAR</div>' }
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.var-slot-test').exists()).toBe(true);
	});

	it('slash key switches mode', async () => {
		const wrapper = mount(YMStringVar, { props: { modelValue: 'a' } });
		await wrapper.trigger('keydown', { code: 'Slash' });
		expect(wrapper.classes()).toContain('variable');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMStringVar, { props: { modelValue: 'a' } });
		const el = wrapper.element as unknown as StringVarApi;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.switch).toBe('function');
	});
});
