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

	it('RadioBox 运行期切成 disabled 后点击不再生效，切回来又生效', async () => {
		const wrapper = mount(RadioBox, {
			props: { id: 'test-radio-toggle', name: 'test-group-toggle', value: 'a' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as HTMLElement;

		// 适配器原先用「挂载时的 `isDisabled` 快照」喂 `:disabled`，运行期改动传不进去，
		// 于是被标成 disabled 的单选仍然照常响应点击。`props.disabled` 直连后由 ui-kit 侧拦截。
		await wrapper.setProps({ disabled: true });
		await wrapper.vm.$nextTick();
		el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('input')).toBeFalsy();

		// 解除禁用后同一条点击路径必须生效——否则上面那句可能只是「路径本来就不通」
		await wrapper.setProps({ disabled: false });
		await wrapper.vm.$nextTick();
		el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		await wrapper.vm.$nextTick();
		expect(wrapper.emitted('input')).toBeTruthy();
		wrapper.unmount();
	});
});
