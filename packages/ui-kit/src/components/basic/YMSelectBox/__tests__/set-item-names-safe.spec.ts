import { describe, expect, it } from 'vitest';
import { createSelectBoxElement } from '../select-box-api';
import type { SelectBoxApi } from '../select-box-api';
import { elementDataOf } from '../../../../utils/element-data';
import { getElementApi } from '../../../../utils/element-apis';

describe('YMSelectBox setItemNames 兼容性', () => {
	it('未 loadItems 时 setItemNames 不抛错（dataItems 为初始空数组）', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		expect(() => api.setItemNames({ a: 'A' })).not.toThrow();
	});

	it('clear 后 setItemNames 不抛错（dataItems 为 null）', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([{ name: 'A', value: 'a' }]);
		api.clear();
		expect(() => api.setItemNames({ a: 'A' })).not.toThrow();
	});

	it('loadItems 后再 setItemNames 正常改名', () => {
		const el = createSelectBoxElement() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([{ name: 'A', value: 'a' }]);
		api.setItemNames({ a: '改名' });
		const dataItems =
			(api.read() as { dataItems?: Array<{ name: string }> } | null)?.dataItems ??
			elementDataOf<{ dataItems?: Array<{ name: string }> }>(el).dataItems;
		expect(dataItems?.[0]?.name).toBe('改名');
	});
});
