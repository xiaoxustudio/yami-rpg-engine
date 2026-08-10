import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TextBox from '@app/components/common/TextBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';

interface TextBoxBridgeEl extends HTMLElement {
	input: HTMLInputElement;
	write(value: string): void;
}

interface SliderBoxBridgeEl extends HTMLElement {
	input: HTMLInputElement;
	write(value: number): void;
}

interface RadioBoxBridgeEl extends HTMLElement {
	input(value: string): void;
}

describe('包装层输入事件转发（输入事件 Vue 化回归保护）', () => {
	it('TextBox input 转发（input 元素事件 → emit input）', async () => {
		const wrapper = mount(TextBox, {
			props: { id: 'test-tb' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as TextBoxBridgeEl;
		expect(typeof el.write).toBe('function');
		el.write('Hello');
		el.input!.dispatchEvent(new Event('input', { bubbles: true }));
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('input');
		expect(emitted).toBeTruthy();
		expect(emitted![0][0]).toBe('Hello');
		wrapper.unmount();
	});

	it('SliderBox input 转发（input 元素事件 → emit input 值）', async () => {
		const wrapper = mount(SliderBox, {
			props: { id: 'test-sl', min: '0', max: '4' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as SliderBoxBridgeEl;
		expect(typeof el.write).toBe('function');
		el.write(3);
		el.input!.dispatchEvent(new Event('input', { bubbles: true }));
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('input');
		expect(emitted).toBeTruthy();
		expect(emitted![0][0]).toBe(3);
		wrapper.unmount();
	});

	it('RadioBox proxy input 事件转发（同组多实例均 emit——去重在窗口层）', async () => {
		const wrapper = mount(RadioBox, {
			props: { id: 'test-radio', name: 'test-group', value: 'a' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as RadioBoxBridgeEl;
		expect(typeof el.input).toBe('function');
		el.input('a');
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('input')).toBeTruthy();
		wrapper.unmount();
	});
});
