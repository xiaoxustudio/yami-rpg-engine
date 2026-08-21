import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { MENU_SERVICE_KEY, provideMenuService, useMenuService } from '../useMenuService';

const Consumer = defineComponent({
	setup() {
		const service = useMenuService();
		return () => h('div', service.getState());
	}
});

describe('useMenuService', () => {
	it('provider provides state to child', () => {
		const Provider = defineComponent({
			setup() {
				provideMenuService({ getState: () => 'open' });
				return () => h(Consumer);
			}
		});
		const wrapper = mount(Provider);
		expect(wrapper.text()).toBe('open');
		wrapper.unmount();
	});

	it('falls back to default closed when not provided', () => {
		const wrapper = mount(Consumer);
		expect(wrapper.text()).toBe('closed');
		wrapper.unmount();
	});

	it('supports global.provide injection', () => {
		const wrapper = mount(Consumer, {
			global: {
				provide: {
					[MENU_SERVICE_KEY]: { getState: () => 'closed' }
				}
			}
		});
		expect(wrapper.text()).toBe('closed');
		wrapper.unmount();
	});
});
