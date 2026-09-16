import { elementDataOf } from '@ui-kit';

/**
 * P4b：画布 `screen` 元素上的滚动缓存。
 *
 * 这几个引擎（scene / ui / animation / particle / sprite / palette）都在自己的
 * `screen` 元素上缓存"未乘 dpr 的原始滚动位置"，用于把鼠标坐标换算回画布坐标。
 * 过去靠 `HTMLElement.prototype` 上的同名访问器透明读写；现在改为显式元素数据，
 * `rawScrollLeft` / `rawScrollTop` 也从 `DATA_FIELDS` 摘掉了。
 */
export interface ScreenScrollData {
	rawScrollLeft: number;
	rawScrollTop: number;
}

export const screenScrollData = (el: unknown): ScreenScrollData =>
	elementDataOf<ScreenScrollData>(el);
