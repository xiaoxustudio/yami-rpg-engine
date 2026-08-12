import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import {
	MENU_SERVICE_KEY,
	provideMenuService,
	useMenuService
} from '@app/composables/useMenuService';

const Consumer = defineComponent({
	setup() {
		const service = useMenuService();
		return () => h('div', service.getState());
	}
});

describe('useMenuService（provide/inject 菜单服务示范）', () => {
	it('provider 提供状态（父组件 → 子组件）', () => {
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

	it('未提供时使用默认值 closed', () => {
		const wrapper = mount(Consumer);
		expect(wrapper.text()).toBe('closed');
		wrapper.unmount();
	});

	it('支持 global.provide 注入（InjectionKey 类型化）', () => {
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
