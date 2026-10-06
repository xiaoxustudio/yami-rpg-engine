import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { CurveFrame, CurveState } from '@app/composables/useCurveWindow';

/**
 * 曲线（缓动曲线编辑器）窗口状态。
 *
 * 原先是 `composables/useCurveWindow.ts:96-102` 的模块级 `let state/target/index` —— 一个没有
 * Pinia 对应物的手写 store。同文件的 `page/head/list/canvas/curveMap` 是 DOM/实例句柄，
 * **不入 store**（代理 HTMLElement 会破坏身份），仍留在模块作用域。
 *
 * 升进 store 后：DevTools 可见、可按 pinia 实例隔离；composable 侧用一个访问器对象
 * `curve` 读写它，实现区里 `curve.state = 'open'` 这类写法保持原样。
 */
export const useCurveStore = defineStore('curve', () => {
	const state = shallowRef<CurveState>('closed');
	const target = shallowRef<CurveFrame | null>(null);
	const index = shallowRef<string | null>(null);

	return { state, target, index };
});

export function getCurveStore() {
	return useCurveStore(pinia);
}
