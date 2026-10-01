export interface DetailBoxContext {
	toggle(): void;
	/**
	 * 当前是否展开。供 `YMDetailSummary` 绑定 `aria-expanded` 用——折叠状态原先只存在于
	 * `.detail-box` 的 `open` 属性与子节点的 `hidden` class 上，读屏读不到。
	 * 写成函数而不是暴露 ref：调用方只能读，写一律走 `toggle()`。
	 */
	isOpen(): boolean;
}

export const DetailBoxKey: symbol = Symbol('ym-detail-box');
