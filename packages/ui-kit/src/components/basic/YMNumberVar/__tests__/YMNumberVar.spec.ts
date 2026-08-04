import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMNumberVar from '../YMNumberVar.vue';

describe('YMNumberVar', () => {
	it('write number switches to constant and stores value', () => {
		const wrapper = mount(YMNumberVar, { props: { min: 0, max: 10, modelValue: 5 } });
		const vm = wrapper.vm as any;
		expect(vm.read()).toBe(5);
		expect(wrapper.classes()).toContain('constant');
		expect(wrapper.find('.number-box').exists()).toBe(true);
	});

	it('write object switches to variable mode', async () => {
		const wrapper = mount(YMNumberVar);
		const vm = wrapper.vm as any;
		vm.write({ type: 'local', key: 'hp' });
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		expect(wrapper.find('.number-box').exists()).toBe(false);
		expect(vm.read()).toEqual({ type: 'local', key: 'hp' });
	});

	it('write string number converts to constant', () => {
		const wrapper = mount(YMNumberVar, { props: { min: 0, max: 100 } });
		const vm = wrapper.vm as any;
		vm.write('42');
		expect(vm.read()).toBe(42);
		expect(wrapper.classes()).toContain('constant');
	});

	it('switch toggles modes', async () => {
		const wrapper = mount(YMNumberVar, { props: { modelValue: 3 } });
		const vm = wrapper.vm as any;
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('constant');
	});

	it('renders variable slot in variable mode', async () => {
		const wrapper = mount(YMNumberVar, {
			props: { modelValue: { type: 'local', key: 'hp' } },
			slots: {
				variable: '<div class="var-slot-test">VAR</div>'
			}
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.var-slot-test').exists()).toBe(true);
	});

	it('slash key switches mode', async () => {
		const wrapper = mount(YMNumberVar, { props: { modelValue: 3 } });
		await wrapper.trigger('keydown', { code: 'Slash' });
		expect(wrapper.classes()).toContain('variable');
	});

	it('exposes bridge functions on root element', () => {
		const wrapper = mount(YMNumberVar, { props: { modelValue: 3 } });
		const el = wrapper.element as any;
		expect(typeof el.read).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.switch).toBe('function');
		expect(el.mode).toBe('constant');
	});

	it('disable adds disabled class', () => {
		const wrapper = mount(YMNumberVar);
		const vm = wrapper.vm as any;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
	});
});
