import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMNumberVar from '../YMNumberVar.vue';
import type { NumberVarApi } from '../number-var-api';
import { elementDataOf } from '../../../../utils/element-data';

describe('YMNumberVar', () => {
	it('write number switches to constant and stores value', () => {
		const wrapper = mount(YMNumberVar, { props: { min: 0, max: 10, modelValue: 5 } });
		const vm = wrapper.vm as unknown as NumberVarApi;
		expect(vm.read()).toBe(5);
		expect(wrapper.classes()).toContain('constant');
		expect(wrapper.find('.number-box').exists()).toBe(true);
	});

	it('write object switches to variable mode', async () => {
		const wrapper = mount(YMNumberVar);
		const vm = wrapper.vm as unknown as NumberVarApi;
		vm.write({ type: 'local', key: 'hp' });
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		expect(wrapper.find('.number-box').isVisible()).toBe(false);
		expect(vm.read()).toEqual({ type: 'local', key: 'hp' });
	});

	it('write string number converts to constant', () => {
		const wrapper = mount(YMNumberVar, { props: { min: 0, max: 100 } });
		const vm = wrapper.vm as unknown as NumberVarApi;
		vm.write('42');
		expect(vm.read()).toBe(42);
		expect(wrapper.classes()).toContain('constant');
	});

	it('switch toggles modes', async () => {
		const wrapper = mount(YMNumberVar, { props: { modelValue: 3 } });
		const vm = wrapper.vm as unknown as NumberVarApi;
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

	it('exposes the API on the component instance, not on the root element', () => {
		const wrapper = mount(YMNumberVar, { props: { modelValue: 3 } });
		const vm = wrapper.vm as unknown as NumberVarApi;
		expect(typeof vm.read).toBe('function');
		expect(typeof vm.write).toBe('function');
		expect(typeof vm.switch).toBe('function');
		expect(typeof (wrapper.element as unknown as NumberVarApi).read).toBe('undefined');
		expect(elementDataOf<NumberVarApi>(wrapper.element).mode).toBe('constant');
	});

	it('disable adds disabled class', () => {
		const wrapper = mount(YMNumberVar);
		const vm = wrapper.vm as unknown as NumberVarApi;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
	});
});
