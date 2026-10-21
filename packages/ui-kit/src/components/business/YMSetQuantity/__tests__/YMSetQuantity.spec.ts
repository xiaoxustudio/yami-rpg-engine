import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMSetQuantity from '../YMSetQuantity.vue';

describe('YMSetQuantity', () => {
	it('renders label, title and number input value', () => {
		const wrapper = mount(YMSetQuantity, {
			props: { modelValue: 7, max: 99, label: '数量', title: '设置数量' }
		});
		expect(wrapper.text()).toContain('设置数量');
		expect(wrapper.text()).toContain('数量');
		const input = wrapper.find('input');
		expect((input.element as HTMLInputElement).value).toBe('7');
		expect((input.element as HTMLInputElement).max).toBe('99');
	});

	it('emits update:modelValue on change', async () => {
		const wrapper = mount(YMSetQuantity, {
			props: { modelValue: 1, max: 10 }
		});
		const input = wrapper.find('input');
		await input.setValue('5');
		await input.trigger('change');
		expect(wrapper.emitted('update:modelValue')).toBeTruthy();
		expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe(5);
	});

	// 契约已从「DOM 桥」改为「Vue emit 链」（2026-10）：`YMFormButtons` 现在 emit
	// `confirm`，`YMWindowFrame` 用模板 `@confirm` 接住再 emit，本组件再 `@confirm` 转发出去。
	// 原先本条用 `root.dispatchEvent(new Event('confirm'))` 打在窗口根元素上，那是在断言
	// YMWindowFrame 里那层 `element.addEventListener('confirm', …)` 桥 —— 那层桥已删
	// （它正是 12 个包装组件"点确定没反应"的来源，且全仓没有任何生产代码派发原生 `confirm`）。
	// 现在改为断言**真实用户路径**：点确定按钮 → 一路 emit 上来。
	it('点确定按钮时转发 confirm（emit 链）', async () => {
		const wrapper = mount(YMSetQuantity, {
			props: { modelValue: 1, max: 10 }
		});
		await wrapper.find('button[name="confirm"]').trigger('click');
		expect(wrapper.emitted('confirm')).toBeTruthy();
	});
});
