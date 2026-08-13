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
});
