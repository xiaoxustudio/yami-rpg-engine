import { elementDataOf, getElementApi } from '@ui-kit';
import { describe, expect, it } from 'vitest';
import type { SelectBoxApi } from '@ui-kit';
import { createSelectBox, selectBoxSetItemNames } from '@app/components/select-box';

describe('select-box 转发层（9.32 递归修复 + 9.35 popup 回归保护）', () => {
	it('createSelectBox returns select-box with api', () => {
		const el = createSelectBox() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		expect(el.classList.contains('select-box')).toBe(true);
		// 契约锁：能力在旁表里，元素上不再挂方法
		expect(typeof (el as unknown as Record<string, unknown>).loadItems).toBe('undefined');
		expect(typeof api.loadItems).toBe('function');
		expect(typeof api.write).toBe('function');
		expect(typeof api.read).toBe('function');
		expect(typeof api.setItemNames).toBe('function');
	});

	it('selectBoxSetItemNames rewrite mode does not recurse（9.32 回归）', () => {
		const el = createSelectBox() as unknown as SelectBoxApi & {
			lightItems: { all: Array<{ name: string; value: string }> };
		};
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		el.lightItems = {
			all: [
				{ name: 'Raw', value: 'raw' },
				{ name: 'Global', value: 'global' }
			]
		};
		// 重写模式：临时把 dataItems 换成另一批项，再走转发层改名（9.32 曾在此递归）
		api.setItemNames = function (
			options: Record<string, string | { name?: string; tip?: string }>
		): void {
			const data = elementDataOf<{ dataItems?: unknown[] }>(el);
			const backup = data.dataItems;
			data.dataItems = el.lightItems.all;
			selectBoxSetItemNames(
				el as unknown as Parameters<typeof selectBoxSetItemNames>[0],
				options
			);
			data.dataItems = backup;
		};
		api.setItemNames({ raw: 'RAW-OK', global: 'GLOBAL-OK' });
		expect(el.lightItems.all[0].name).toBe('RAW-OK');
		expect(el.lightItems.all[1].name).toBe('GLOBAL-OK');
	});

	it('write/read roundtrip with loadItems', () => {
		const el = createSelectBox() as unknown as SelectBoxApi;
		const api = getElementApi<SelectBoxApi>(el)!;
		api.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
		api.write(true);
		expect(api.read()).toBe(true);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('True');
	});
});
