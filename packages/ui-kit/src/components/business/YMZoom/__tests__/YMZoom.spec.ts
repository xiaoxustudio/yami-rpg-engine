import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMZoom from '../YMZoom.vue';

describe('YMZoom', () => {
	it('renders label, title and input value', () => {
		const wrapper = mount(YMZoom, {
			props: { modelValue: 1.5, label: '缩放', title: '缩放窗口' }
		});
		expect(wrapper.text()).toContain('缩放窗口');
		expect(wrapper.text()).toContain('缩放');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('1.5');
	});

	it('emits update:modelValue on input', async () => {
		const wrapper = mount(YMZoom, {
			props: { modelValue: 1 }
		});
		const input = wrapper.find('input');
		await input.setValue('2');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
	});

	it('点「确定」时 emit confirm（回归：原先这个事件永远不到）', () => {
		const wrapper = mount(YMZoom, { attachTo: document.body, props: { modelValue: 1 } });
		const confirm = wrapper.element.querySelector(
			'button[name="confirm"]'
		) as HTMLButtonElement;
		confirm.click();
		expect(wrapper.emitted('confirm')).toHaveLength(1);
	});
});
