import { createSelectListApi, createSelectListElement, type SelectListApi } from '@ui-kit';
import { setTooltip } from '@app/utils/element-utils.ts';

export function attachSelectListApi(el: HTMLElement): void {
	createSelectListApi(el, { setTooltip });
}

export function createSelectList(): SelectListApi {
	return createSelectListElement({ setTooltip }) as SelectListApi;
}

export const Select = createSelectList();
