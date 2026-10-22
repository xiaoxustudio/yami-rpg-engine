export interface DetailBoxContext {
	toggle(): void;
	/**
	 * 当前是否展开。
	 * 写成函数而不是暴露 ref：调用方只能读，写一律走 `toggle()`。
	 */
	isOpen(): boolean;
}

export const DetailBoxKey: symbol = Symbol('ym-detail-box');
