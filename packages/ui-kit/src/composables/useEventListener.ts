import { onBeforeUnmount, onMounted, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

export interface UseEventListenerOptions {
	native?: boolean | AddEventListenerOptions;
	enabled?: MaybeRefOrGetter<boolean>;
}

/**
 * 把「挂全局监听」收成唯一写法：挂与摘永远成对。
 *
 * **只在组件的 setup 期调用**：内部用了 `onMounted` / `onBeforeUnmount`，脱离组件作用域调用
 * 会静默什么都不挂，因此不要放进异步回调或事件处理器里。
 *
 * 与 `packages/editor/src/composables/useEventListener.ts` 是两份实现，口径与测试必须同步。
 *
 * @param target 监听目标。支持 `MaybeRefOrGetter`——绑定尚为 `null` 的模板 ref 时必须这么传。
 * @param type 事件名。
 * @param handler 事件处理器。内部持有其引用，不因组件重渲染而重复注册。
 * @param options `native` 透传原生选项；`enabled` 控制是否挂载（可响应式）。
 */
export function useEventListener<T extends EventTarget, K extends string>(
	target: MaybeRefOrGetter<T | null | undefined>,
	type: K,
	handler: (event: Event) => void,
	options?: UseEventListenerOptions
): void {
	const native = options?.native;
	const isEnabled = (): boolean => options?.enabled === undefined || toValue(options.enabled);

	const stop = (resolved: T | null | undefined): void => {
		resolved?.removeEventListener(type, handler, native);
	};
	const start = (resolved: T | null | undefined): void => {
		resolved?.addEventListener(type, handler, native);
	};

	let attached: T | null | undefined;
	let mounted = false;

	/**
	 * 让真实状态与「target + enabled」一致。三条不变式：
	 *   1. `attached !== null` ⟺ 目标元素上确实挂着监听（沿用初版语义）；
	 *   2. `attached === null` 表示「还没挂上」——目标可能是尚未赋值的模板 ref，
	 *      因此**下次 target 变化必须重试**，不能把 `null` 当成"挂完了"；
	 *   3. 挂载之前不碰 DOM（`onMounted` 才首次生效）。
	 */
	const apply = (): void => {
		if (!mounted) return;
		const next = isEnabled() ? toValue(target) : undefined;
		if (attached !== null) {
			if (next === attached) return; // 没变化，别重复注册
			stop(attached); // `undefined`（enabled 关）或换到另一个元素
		}
		attached = next ?? null;
		start(next);
	};

	onMounted(() => {
		mounted = true;
		apply();
	});
	onBeforeUnmount(() => {
		mounted = false;
		stop(attached);
		attached = null;
	});

	watch([() => toValue(target), isEnabled], apply, { flush: 'post', immediate: true });
}
