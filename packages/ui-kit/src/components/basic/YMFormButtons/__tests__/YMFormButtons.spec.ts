import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFormButtons from '../YMFormButtons.vue';

describe('YMFormButtons', () => {
	it('confirm/apply/cancel 按钮点击后事件冒泡到父级', async () => {
		const events: string[] = [];
		const parent = document.createElement('div');
		for (const type of ['confirm', 'apply', 'cancel']) {
			parent.addEventListener(type, () => events.push(type));
		}
		const wrapper = mount(YMFormButtons, {
			props: { idPrefix: 'p', showApply: true },
			attachTo: parent
		});
		const buttons = wrapper.findAll('button');
		for (const btn of buttons) {
			(btn.element as HTMLButtonElement).click();
		}
		await wrapper.vm.$nextTick();
		expect(events).toEqual(['confirm', 'apply', 'cancel']);
		wrapper.unmount();
	});

	it('confirmDisabled 时确认按钮被禁用且点击不派发 confirm', async () => {
		const events: string[] = [];
		const parent = document.createElement('div');
		parent.addEventListener('confirm', () => events.push('confirm'));
		const wrapper = mount(YMFormButtons, {
			props: { idPrefix: 'p', confirmDisabled: true },
			attachTo: parent
		});
		const confirm = wrapper.get('button[name="confirm"]');
		expect((confirm.element as HTMLButtonElement).disabled).toBe(true);
		// 元素上的 hotkey 提示不受影响（attribute 只被 tooltip 读取）
		expect(confirm.attributes('hotkey')).toBe('Ctrl+Enter');
		(confirm.element as HTMLButtonElement).click();
		await wrapper.vm.$nextTick();
		expect(events).toEqual([]);
		// 取消按钮不受影响
		const cancel = wrapper.get('button[name="cancel"]');
		expect((cancel.element as HTMLButtonElement).disabled).toBe(false);
		(cancel.element as HTMLButtonElement).click();
		await wrapper.vm.$nextTick();
		expect(events).toEqual([]);
		wrapper.unmount();
	});

	it('confirmDisabled 默认关闭，且可随 props 变化切换', async () => {
		const wrapper = mount(YMFormButtons, { props: { idPrefix: 'p' } });
		const confirm = wrapper.get('button[name="confirm"]');
		expect((confirm.element as HTMLButtonElement).disabled).toBe(false);
		await wrapper.setProps({ confirmDisabled: true });
		expect((confirm.element as HTMLButtonElement).disabled).toBe(true);
		await wrapper.setProps({ confirmDisabled: false });
		expect((confirm.element as HTMLButtonElement).disabled).toBe(false);
		wrapper.unmount();
	});
});
