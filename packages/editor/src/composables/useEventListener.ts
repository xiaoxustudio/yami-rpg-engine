import { onBeforeUnmount, onMounted, toValue, watch } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

/** `useEventListener` 的扩展选项。 */
export interface UseEventListenerOptions {
	/** 透传给 `addEventListener` 的原生选项（`capture` / `once` / `passive`）。 */
	native?: boolean | AddEventListenerOptions;
	/**
	 * 是否挂载监听；传 `MaybeRefOrGetter<boolean>` 时**随其变化自动挂 / 摘**。
	 *
	 * 为什么需要它：本仓有一批「满足条件才挂全局监听」的用法，典型是弹出层——打开时挂
	 * `document` 的 `pointerdown` 用于点击外部关闭，关闭时立刻摘
	 * （`YMColorBox.openBuiltin` / `YMSelectBox`）。`useEventListener` 默认是
	 * 「挂载即注册、卸载才摘」，直接换过去会让监听在非弹层期常驻，语义就变了。
	 * 有了 `enabled` 才能在不改变附加时机的前提下把这类用法也收口。
	 */
	enabled?: MaybeRefOrGetter<boolean>;
}

/**
 * 把「挂全局监听」收成唯一写法：**挂与摘永远成对**，调用方不再手写 `onBeforeUnmount`。
 *
 * 为什么需要它：仓库里曾有一批 `.vue` 直接写 `window.addEventListener`，每一处都要自己记得
 * 配一个 `removeEventListener`。这类"记得配"的纪律在有大量存量监听的背景下不可能靠自觉维持
 * （`-api.ts` 层的 `addEventListener` 与 `removeEventListener` 数量长期不成比例）。
 * 作用域销毁即摘除，把纪律变成机制。
 *
 * 当前存量与终态口径**以 `pnpm migration:ledger` 的 `vue-global-listeners` 轴为准**——
 * 本注释刻意不写具体数字，免得随迁移进度变成过时信息。
 *
 * ⚠️ 与 `@yami/ui-kit` 的同名 composable **是两份实现**，这是有意的：ui-kit 不许反向依赖
 * editor，而 editor 依赖 ui-kit。两份的口径与测试必须同步——两边各有一份 spec 断言同一组
 * 行为（改一边忘另一边，对应包的门禁会红）。
 *
 * **只在组件的 setup 期调用**：内部用了 `onMounted` / `onBeforeUnmount`，脱离组件作用域调用
 * 会静默什么都不挂（Vue 只警告不抛错），因此不要放进异步回调或事件处理器里。
 *
 * @param target 监听目标。支持 `MaybeRefOrGetter`——**绑定尚为 `null` 的模板 ref 时必须这么传**
 *   （`useEventListener(root, 'keydown', …)`，而不是 `useEventListener(root.value, …)`：
 *   后者在 setup 期拿到的是 `null`，之后 ref 赋值不会重新挂载）。
 * @param type 事件名。
 * @param handler 事件处理器。内部持有其引用，因此**不因组件重渲染而重复注册**。
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

	// target / enabled 任一变化都重算；挂载前的一次由上面的 `mounted` 守卫吞掉。
	//
	// ⚠️ `flush: 'post'` 的**测试含义**：挂载/摘除发生在微任务里，不是同步的。
	// 所以"同步 `dispatchEvent(pointerdown)`、紧接着断言监听已登记"的旧用例会红 ——
	// 补 `await nextTick()` 即可。真实浏览器里用户事件必然分属不同 task，故这是
	// **把测试对齐真实时序**，不是放宽断言。
	watch([() => toValue(target), isEnabled], apply, { flush: 'post', immediate: true });
}
