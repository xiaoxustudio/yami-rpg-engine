import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFileVar from '../YMFileVar.vue';
import type { FileVarApi } from '../file-var-api';
import { elementDataOf } from '../../../../utils/element-data';

describe('YMFileVar', () => {
	it('write string switches to constant and stores value', () => {
		const wrapper = mount(YMFileVar, { props: { modelValue: 'test.png' } });
		const vm = wrapper.vm as unknown as FileVarApi;
		expect(vm.read()).toBe('test.png');
		expect(wrapper.classes()).toContain('constant');
	});

	it('write object switches to variable mode', async () => {
		const wrapper = mount(YMFileVar);
		const vm = wrapper.vm as unknown as FileVarApi;
		vm.write({ type: 'local', key: 'key' });
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		expect(vm.read()).toEqual({ type: 'local', key: 'key' });
	});

	it('switch toggles modes', async () => {
		const wrapper = mount(YMFileVar, { props: { modelValue: 'test.png' } });
		const vm = wrapper.vm as unknown as FileVarApi;
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('variable');
		vm.switch();
		await wrapper.vm.$nextTick();
		expect(wrapper.classes()).toContain('constant');
	});

	it('renders file slot in constant mode', () => {
		const wrapper = mount(YMFileVar, {
			props: { modelValue: 'test.png' },
			slots: {
				file: '<div class="file-slot-test">FILE</div>'
			}
		});
		expect(wrapper.find('.file-slot-test').exists()).toBe(true);
	});

	it('renders variable slot in variable mode', async () => {
		const wrapper = mount(YMFileVar, {
			props: { modelValue: { type: 'local', key: 'key' } },
			slots: {
				variable: '<div class="var-slot-test">VAR</div>'
			}
		});
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.var-slot-test').exists()).toBe(true);
	});

	it('slash key switches mode', async () => {
		const wrapper = mount(YMFileVar, { props: { modelValue: 'test.png' } });
		await wrapper.trigger('keydown', { code: 'Slash' });
		expect(wrapper.classes()).toContain('variable');
	});

	it('exposes bridge functions on the instance, mode stays on the root element', () => {
		const wrapper = mount(YMFileVar, { props: { modelValue: 'test.png' } });
		const vm = wrapper.vm as unknown as FileVarApi;
		expect(typeof vm.read).toBe('function');
		expect(typeof vm.write).toBe('function');
		expect(typeof vm.switch).toBe('function');
		const el = wrapper.element as unknown as FileVarApi;
		expect(elementDataOf<FileVarApi>(el).mode).toBe('constant');
		expect(typeof (el as unknown as { read?: unknown }).read).toBe('undefined');
	});

	it('disable adds disabled class', () => {
		const wrapper = mount(YMFileVar);
		const vm = wrapper.vm as unknown as FileVarApi;
		vm.disable();
		expect(wrapper.classes()).toContain('disabled');
	});
});
