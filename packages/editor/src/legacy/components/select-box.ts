import { createSelectBoxElement, type SelectBoxApi } from '@ui-kit';
import { Select } from './select-list';

export function createSelectBox(): SelectBoxApi {
	return createSelectBoxElement({ popup: (box) => (Select as any).open(box) });
}

export function selectBoxSetItemNames(box: any, options: any): void {
	for (const item of box.dataItems ?? []) {
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
