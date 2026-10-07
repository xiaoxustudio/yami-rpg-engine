import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import YMTextBox from '../YMTextBox/YMTextBox.vue';
import YMTextArea from '../YMTextArea/YMTextArea.vue';
import YMNumberBox from '../YMNumberBox/YMNumberBox.vue';
import YMSliderBox from '../YMSliderBox/YMSliderBox.vue';
import YMKeyboardBox from '../YMKeyboardBox/YMKeyboardBox.vue';
import YMGamepadBox from '../YMGamepadBox/YMGamepadBox.vue';
import YMSelectBox from '../YMSelectBox/YMSelectBox.vue';
import YMColorBox from '../YMColorBox/YMColorBox.vue';

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

describe('自绘控件的 ARIA 语义', () => {
	it('YMSelectBox: 按 select-only combobox 标注，值仍由节点文本承担', () => {
		const wrapper = mount(YMSelectBox, {
			props: { id: 'sb', label: '类型', items: [{ name: 'A', value: 'a' }] }
		});
		expect(wrapper.attributes('role')).toBe('combobox');
		expect(wrapper.attributes('aria-haspopup')).toBe('listbox');
		expect(wrapper.attributes('aria-expanded')).toBe('false');
		expect(wrapper.attributes('aria-label')).toBe('类型');
		expect(wrapper.attributes('aria-controls')).toBe('sb-popup');
		wrapper.unmount();
	});

	it('YMSelectBox: 展开后弹层是 listbox、选项是带选中态的 option', async () => {
		const wrapper = mount(YMSelectBox, {
			props: {
				id: 'sb',
				items: [
					{ name: 'A', value: 'a' },
					{ name: 'B', value: 'b' }
				],
				modelValue: 'b'
			}
		});
		wrapper.element.dispatchEvent(
			new PointerEvent('pointerdown', { button: 0, bubbles: true })
		);
		await wrapper.vm.$nextTick();
		expect(wrapper.attributes('aria-expanded')).toBe('true');
		const listbox = wrapper.find('[role="listbox"]');
		expect(listbox.exists()).toBe(true);
		expect(listbox.attributes('id')).toBe('sb-popup');
		const options = wrapper.findAll('[role="option"]');
		expect(options.length).toBe(2);
		expect(options[0].attributes('aria-selected')).toBe('false');
		expect(options[1].attributes('aria-selected')).toBe('true');
		wrapper.unmount();
	});

	it('YMSelectBox: 不传 label / id 时不写 aria-label 与 aria-controls', () => {
		const wrapper = mount(YMSelectBox);
		expect(wrapper.attributes('aria-label')).toBeUndefined();
		expect(wrapper.attributes('aria-controls')).toBeUndefined();
		wrapper.unmount();
	});

	it('YMColorBox: 按 button 标注（值不在本次范围，见组件内注释）', () => {
		const enabled = mount(YMColorBox, { props: { label: '颜色' } });
		expect(enabled.attributes('role')).toBe('button');
		expect(enabled.attributes('aria-label')).toBe('颜色');
		expect(enabled.attributes('aria-disabled')).toBeUndefined();
		enabled.unmount();

		const disabled = mount(YMColorBox, { props: { disabled: true } });
		expect(disabled.attributes('aria-disabled')).toBe('true');
		expect(disabled.attributes('aria-label')).toBeUndefined();
		disabled.unmount();
	});
});
