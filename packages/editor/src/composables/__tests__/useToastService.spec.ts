import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import {
	TOAST_SERVICE_KEY,
	provideToastService,
	useToastService
} from '@app/composables/useToastService';

const Consumer = defineComponent({
	setup() {
		const service = useToastService();
		return () => h('div', typeof service.show === 'function' ? 'toast-ok' : 'toast-missing');
	}
});

describe('useToastService（provide/inject toast 服务）', () => {
	it('provider 提供服务（父组件 → 子组件）', () => {
		const Provider = defineComponent({
			setup() {
				provideToastService({
					show: () => document.createElement('div'),
					dismiss: () => undefined
				});
				return () => h(Consumer);
			}
		});
		const wrapper = mount(Provider);
		expect(wrapper.text()).toBe('toast-ok');
		wrapper.unmount();
	});

	it('未提供时使用默认实现（legacy Toast 兜底）', () => {
		const wrapper = mount(Consumer);
		expect(wrapper.text()).toBe('toast-ok');
		wrapper.unmount();
	});

	it('支持 global.provide 注入（InjectionKey 类型化）', () => {
		const wrapper = mount(Consumer, {
			global: {
				provide: {
					[TOAST_SERVICE_KEY]: {
						show: () => document.createElement('div'),
						dismiss: () => undefined
					}
				}
			}
		});
		expect(wrapper.text()).toBe('toast-ok');
		wrapper.unmount();
	});
});
