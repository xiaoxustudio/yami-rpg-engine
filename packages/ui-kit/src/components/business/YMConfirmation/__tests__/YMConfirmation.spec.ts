import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMConfirmation from '../YMConfirmation.vue';

describe('YMConfirmation', () => {
	it('renders message and item labels', () => {
		const wrapper = mount(YMConfirmation, {
			props: {
				message: '确认删除？',
				items: [{ label: '确定' }, { label: '取消' }]
			}
		});
		expect(wrapper.find('#confirmation-message').text()).toBe('确认删除？');
		const labels = wrapper
			.findAll('button')
			.filter((b) => b.isVisible())
			.map((b) => b.text());
		expect(labels).toEqual(['确定', '取消']);
	});

	it('emits confirm with button index on click', async () => {
		const wrapper = mount(YMConfirmation, {
			props: {
				message: 'm',
				items: [{ label: 'A' }, { label: 'B' }]
			}
		});
		const buttons = wrapper.findAll('button').filter((b) => b.isVisible());
		await buttons[1].trigger('click');
		expect(wrapper.emitted('confirm')).toBeTruthy();
		expect(wrapper.emitted('confirm')?.[0]).toEqual([1]);
	});

	it('hides buttons with no matching item', () => {
		const wrapper = mount(YMConfirmation, {
			props: {
				message: 'm',
				items: [{ label: 'only' }]
			}
		});
		const visible = wrapper.findAll('button').filter((b) => b.isVisible());
		expect(visible).toHaveLength(1);
		expect(visible[0].text()).toBe('only');
	});
});
