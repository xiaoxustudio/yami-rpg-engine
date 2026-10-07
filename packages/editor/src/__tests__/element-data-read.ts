import { elementDataOf } from '@ui-kit';

export interface TestSelectItem {
	name?: string;
	tip?: string;
	value: unknown;
}

/** 控件元素上的下拉项（生产侧由 `select-box-api` 写入元素数据）。 */
export const dataItemsOf = (el: unknown): TestSelectItem[] | null | undefined =>
	elementDataOf<{ dataItems?: TestSelectItem[] | null }>(el).dataItems;
