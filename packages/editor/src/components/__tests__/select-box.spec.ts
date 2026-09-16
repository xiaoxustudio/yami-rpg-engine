import { elementDataOf } from '@ui-kit';
import { describe, expect, it } from 'vitest';
import type { SelectBoxApi } from '@ui-kit';
import { createSelectBox, selectBoxSetItemNames } from '@app/components/select-box';

describe('select-box 转发层（9.32 递归修复 + 9.35 popup 回归保护）', () => {
	it('createSelectBox returns select-box with api', () => {
		const el = createSelectBox() as unknown as SelectBoxApi;
		expect(el.classList.contains('select-box')).toBe(true);
		expect(typeof el.loadItems).toBe('function');
		expect(typeof el.write).toBe('function');
		expect(typeof el.read).toBe('function');
		expect(typeof el.setItemNames).toBe('function');
	});

	it('selectBoxSetItemNames rewrite mode does not recurse（9.32 回归）', () => {
		const el = createSelectBox() as unknown as SelectBoxApi & {
			lightItems: { all: Array<{ name: string; value: string }> };
		};
		el.loadItems([
			{ name: 'A', value: 'a' },
			{ name: 'B', value: 'b' }
		]);
		// 模拟 scene-tilemap 的重写模式（重写 setItemNames 并调用 selectBoxSetItemNames）
		el.lightItems = {
			all: [
				{ name: 'Raw', value: 'raw' },
				{ name: 'Global', value: 'global' }
			]
		};
		el.setItemNames = function (
			this: typeof el,
			options: Record<string, string | { name?: string; tip?: string }>
		) {
			// P4b：`dataItems` 是控件元素上的元素数据（原型访问器退役后 `this.dataItems` 会读到 undefined）。
			const data = elementDataOf<{ dataItems?: unknown[] }>(this);
			const backup = data.dataItems;
			data.dataItems = this.lightItems.all;
			selectBoxSetItemNames(
				this as unknown as Parameters<typeof selectBoxSetItemNames>[0],
				options
			);
			data.dataItems = backup;
		};
		el.setItemNames({ raw: 'RAW-OK', global: 'GLOBAL-OK' });
		expect(el.lightItems.all[0].name).toBe('RAW-OK');
		expect(el.lightItems.all[1].name).toBe('GLOBAL-OK');
	});

	it('write/read roundtrip with loadItems', () => {
		const el = createSelectBox() as unknown as SelectBoxApi;
		el.loadItems([
			{ name: 'False', value: false },
			{ name: 'True', value: true }
		]);
		el.write(true);
		expect(el.read()).toBe(true);
		expect(elementDataOf<{ info: HTMLElement }>(el).info.textContent).toBe('True');
	});
});
