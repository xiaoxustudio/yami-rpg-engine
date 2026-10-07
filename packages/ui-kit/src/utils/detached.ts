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
