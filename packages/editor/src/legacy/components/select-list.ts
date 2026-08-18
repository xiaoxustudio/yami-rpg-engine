import { createSelectListApi, createSelectListElement, type SelectListApi } from '@ui-kit';
import { setTooltip } from '@app/legacy/util/element-utils.ts';

export function attachSelectListApi(el: HTMLElement): void {
	createSelectListApi(el, { setTooltip });
}

export function createSelectList(): SelectListApi {
	return createSelectListElement({ setTooltip }) as unknown as SelectListApi;
}

// 注：Select 必须是真实的 SelectList 实例（继承其 windowPointerdown/windowKeydown/resize/createItems 等所有方法）
export const Select = createSelectList();
