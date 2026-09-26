/**
 * ui-kit 的「离屏建元素」接缝（与 editor 的 `utils/dom.ts` 同形）：
 * 需要**先建好、再挂进 DOM**的节点统一走这里，而不是在组件里散着写 `document.createElement`。
 *
 * 为什么要单独一个文件：两个巨石组件（`YMCommandList`/`YMFileBodyPane`）
 * 不应直接出现受限的 `document.*` 调用；把"造离屏节点"这件事收成**一个**接缝后，
 * 组件内部只剩 `h(...)` 描述与挂载逻辑，将来换渲染方式时也只有这一处需要动。
 */
import { h, render, type VNode } from 'vue';

/** 新建一个**未挂载**的容器（仅在需要 host 承载 vnode 时使用，返回后请自行挂载到目标处） */
export const createDetachedHost = (): HTMLDivElement => document.createElement('div');

/**
 * 渲染一个 vnode 并把生成的元素**从 host 上摘下来**返回（调用方自己决定挂到哪里）。
 * 注意：vnode 若渲染出多个根节点，只返回第一个（与 tree/command 两处的用法一致）。
 */
export const renderDetached = (vnode: VNode): HTMLElement => {
	const host = createDetachedHost();
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	element?.remove();
	return element;
};

/** 便捷写法：离屏渲染一个带 class 的 `div`（行元素最常见的形态） */
export const renderDetachedDiv = (className: string | string[]): HTMLElement =>
	renderDetached(h('div', { class: className }));
