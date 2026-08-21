import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMRename from '../YMRename.vue';

describe('YMRename', () => {
	it('renders label, title and input value', () => {
		const wrapper = mount(YMRename, {
			props: { modelValue: 'foobar', label: '名称', title: '重命名' }
		});
		expect(wrapper.text()).toContain('重命名');
		expect(wrapper.text()).toContain('名称');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('foobar');
	});

	it('emits update:modelValue on input', async () => {
		const wrapper = mount(YMRename, {
			props: { modelValue: 'a' }
		});
		const input = wrapper.find('input');
		await input.setValue('new-value');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new-value']);
	});
});
