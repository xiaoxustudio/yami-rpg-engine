import {
	createSelectListApi,
	createSelectListElement,
	getElementApi,
	type SelectListApi
} from '@ui-kit';
import { setTooltip } from '@app/utils/element-utils.ts';

export function attachSelectListApi(el: HTMLElement): void {
	createSelectListApi(el, { setTooltip });
}

export function createSelectList(): SelectListApi {
	return createSelectListElement({ setTooltip }) as SelectListApi;
}

/**
 * 进程内唯一的选择器窗口。
 *
 * 它是工厂件：能力在 ui-kit 旁表里（元素只作 key），消费方（`Select.open(...)`）按方法用，
 * 所以这里导出**表对象**而不是元素 —— 元素上没有 `open/close`。
 */
const selectListElement = createSelectList();
export const Select =
	getElementApi<SelectListApi>(selectListElement) ?? (selectListElement as SelectListApi);
