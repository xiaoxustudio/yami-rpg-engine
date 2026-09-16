import { createSelectBoxElement, elementDataOf, type SelectBoxApi } from '@ui-kit';
import { Select } from '@app/components/select-list';

export function createSelectBox(): SelectBoxApi {
	return createSelectBoxElement({ popup: (box) => Select.open(box) });
}

export function selectBoxSetItemNames(
	box: {
		dataItems: Array<{ name?: string; tip?: string; value: string | number }> | null;
		dataValue?: unknown;
		update?: (...args: unknown[]) => unknown;
	},
	options: Record<string, string | { name?: string; tip?: string }>
): void {
	// P4b：`dataItems` 是选择框元素上的元素数据（原型访问器退役后 `box.dataItems` 会读到 undefined，
	// 于是 `setItemNames` 会静默什么都不改）。
	const data = elementDataOf<{
		dataItems?: Array<{ name?: string; tip?: string; value: string | number }> | null;
	}>(box);
	for (const item of data.dataItems ?? []) {
		const key = item.value;
		const option = options[key];
		switch (typeof option) {
			case 'string':
				item.name = option;
				continue;
			case 'object':
				if (option && 'name' in option) {
					item.name = option.name;
				}
				if (option && 'tip' in option) {
					item.tip = typeof option.tip === 'string' ? option.tip : option.name;
				}
				continue;
		}
	}
	if (box.dataValue !== null && typeof box.update === 'function') {
		box.update();
	}
}
