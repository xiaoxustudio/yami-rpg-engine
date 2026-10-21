import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { useEventListener } from '../useEventListener';

/** 最小宿主组件：把 composable 挂在真实的 mount/unmount 生命周期上。 */
const Host = defineComponent({
	props: {
		onEvent: { type: Function, required: true }
	},
	setup(props) {
		const handler = (event: Event): void => props.onEvent(event);
		useEventListener(window, 'probe', handler);
		return () => h('div');
	}
});

/**
 * 带 `enabled` 开关的宿主：证明「条件性挂全局监听」可响应式开关
 * （`YMColorBox`/`YMSelectBox` 的弹出层点外部关闭就是这种形态）。
 */
const ToggleHost = defineComponent({
	props: {
		onEvent: { type: Function, required: true },
		on: { type: Boolean, default: false }
	},
	setup(props) {
		const handler = (event: Event): void => props.onEvent(event);
		useEventListener(window, 'probe', handler, { enabled: () => props.on });
		return () => h('div');
	}
});

/**
 * 目标初始为 `null`（模板 ref 尚未赋值）的宿主：证明 `MaybeRefOrGetter` 的跟随挂载。
 *
 * 这里用**模板 ref + `v-if`**，而不是读 `wrapper.vm.$.setupState` 去改内部状态 ——
 * `setupState` 在 Vue 类型里是 `@internal`，`oxlint` 的 type-aware 检查会直接报
 * 「Property 'setupState' does not exist on type 'ComponentInternalInstance'」，
 * 连 `as unknown as` 也绕不过（TS 层面 `unknown` 断言合法，但该字段本就不在类型里）。
 * 模板 ref 是公开 API，且更贴近真实用法。
 */
const DeferredHost = defineComponent({
	props: {
		onEvent: { type: Function, required: true },
		ready: { type: Boolean, default: false }
	},
	setup(props) {
		const root = ref<HTMLElement | null>(null);
		const handler = (event: Event): void => props.onEvent(event);
		// 传 getter（不是 `root.value`）：setup 期 root 还是 null，传值会永久挂空对象。
		useEventListener(() => (props.ready ? root.value : null), 'probe', handler);
		return () => h('div', { ref: root });
	}
});

describe('useEventListener', () => {
	it('挂载后能收到事件', () => {
		const onEvent = vi.fn();
		const wrapper = mount(Host, { props: { onEvent } });

		window.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});

	it('卸载后监听被摘除（不泄漏）', () => {
		const onEvent = vi.fn();
		const wrapper = mount(Host, { props: { onEvent } });
		wrapper.unmount();

		window.dispatchEvent(new Event('probe'));
		expect(onEvent).not.toHaveBeenCalled();
	});

	it('卸载时对同一 handler 调用 removeEventListener', () => {
		const remove = vi.spyOn(window, 'removeEventListener');
		const wrapper = mount(Host, { props: { onEvent: vi.fn() } });
		wrapper.unmount();

		expect(remove).toHaveBeenCalledWith('probe', expect.any(Function), undefined);
		remove.mockRestore();
	});

	it('target 由 null 变为元素后自动挂上（getter 跟随）', async () => {
		const onEvent = vi.fn();
		const wrapper = mount(DeferredHost, { props: { onEvent } });
		const element = wrapper.element as HTMLElement;

		await wrapper.setProps({ ready: true });
		element.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		// 卸载后同一元素不再收到
		wrapper.unmount();
		element.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);
	});

	it('enabled=false 时不注册；置真后挂上、再置假后摘掉', async () => {
		const onEvent = vi.fn();
		const wrapper = mount(ToggleHost, { props: { onEvent } });

		window.dispatchEvent(new Event('probe'));
		expect(onEvent).not.toHaveBeenCalled();

		await wrapper.setProps({ on: true });
		window.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		await wrapper.setProps({ on: false });
		window.dispatchEvent(new Event('probe'));
		expect(onEvent).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});
});
