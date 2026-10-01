import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTextBox from '../YMTextBox/YMTextBox.vue';
import YMTextArea from '../YMTextArea/YMTextArea.vue';
import YMNumberBox from '../YMNumberBox/YMNumberBox.vue';
import YMSliderBox from '../YMSliderBox/YMSliderBox.vue';
import YMKeyboardBox from '../YMKeyboardBox/YMKeyboardBox.vue';
import YMGamepadBox from '../YMGamepadBox/YMGamepadBox.vue';

/**
 * 可访问名（`aria-label`）透传。
 *
 * 背景：本仓的可见标签是控件**前面**的 `<div class="text">`（例如
 * `<div class="text">应用名称</div>` + `<TextBox id="..."/>`），控件与标签在 DOM 上并无关联，
 * 读屏聚焦时只会念「编辑框」。`label` 让调用方把这个可见标签同时作为可访问名交给原生控件。
 *
 * 这里逐一点名 6 个「原生控件」型原语（input / textarea / range）：
 * `YMSelectBox` / `YMColorBox` 的交互元素是自绘 div，需先定 role，不在本用例范围。
 */
const cases = [
	{ name: 'YMTextBox', component: YMTextBox, control: 'input' },
	{ name: 'YMTextArea', component: YMTextArea, control: 'textarea' },
	{ name: 'YMNumberBox', component: YMNumberBox, control: 'input' },
	{ name: 'YMSliderBox', component: YMSliderBox, control: 'input' },
	{ name: 'YMKeyboardBox', component: YMKeyboardBox, control: 'input' },
	{ name: 'YMGamepadBox', component: YMGamepadBox, control: 'input' }
] as const;

describe('输入原语的可访问名', () => {
	for (const { name, component, control } of cases) {
		it(`${name}: label 落到原生控件的 aria-label 上`, () => {
			const wrapper = mount(component, { props: { label: '应用名称' } });
			expect(wrapper.find(control).attributes('aria-label')).toBe('应用名称');
			wrapper.unmount();
		});

		it(`${name}: 不传 label 时不写 aria-label（无噪音属性）`, () => {
			const wrapper = mount(component);
			expect(wrapper.find(control).attributes('aria-label')).toBeUndefined();
			wrapper.unmount();
		});
	}
});
