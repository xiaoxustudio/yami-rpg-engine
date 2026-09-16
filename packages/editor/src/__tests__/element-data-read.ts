/**
 * P4b 收口后的**测试侧**元素数据读取助手。
 *
 * 背景：`DATA_FIELDS` 与 `defineDataAccessors()` 退役后，`HTMLElement.prototype` 上不再有访问器，
 * 于是套件里 `el.dataItems` 这类隐式读法会**静默**拿到 `undefined`（不报错，只是断言全空）。
 * 元素数据一律经 `elementDataOf` 显式读取——与生产侧（`select-box-api` 等）写入的是同一份 WeakMap。
 *
 * 用法：
 *   expect(dataItemsOf(control)).toHaveLength(15);
 *   expect(dataItemsOf(control)!.map((item) => item.value)).toEqual([true, false]);
 */
import { elementDataOf } from '@ui-kit';

export interface TestSelectItem {
	name?: string;
	tip?: string;
	value: unknown;
}

/** 控件元素上的下拉项（生产侧由 `select-box-api` 写入元素数据）。 */
export const dataItemsOf = (el: unknown): TestSelectItem[] | null | undefined =>
	elementDataOf<{ dataItems?: TestSelectItem[] | null }>(el).dataItems;
