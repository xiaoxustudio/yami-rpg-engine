import { beforeEach, describe, expect, it } from 'vitest';
import { getSelectionStore } from '@app/stores/selection';
import { getColorStore } from '@app/stores/color';

describe('Selection → stores/selection（text-capture）', () => {
	beforeEach(() => {
		const store = getSelectionStore();
		store.inserting = false;
		store.context = null;
	});

	it('单例写 → store 读（inserting / context 两个字段）', async () => {
		const { Selection } = await import('@app/tools/text-capture.ts');
		const snapshot = { target: { name: 'input' }, inserting: true };
		Selection.inserting = true;
		Selection.context = snapshot as never;

		const store = getSelectionStore();
		expect(store.inserting).toBe(true);
		expect(store.context).toStrictEqual(snapshot);
	});

	it('store 写 → 单例读（legacy 读取兼容）', async () => {
		const { Selection } = await import('@app/tools/text-capture.ts');
		const store = getSelectionStore();
		store.inserting = true;
		store.context = { target: null, inserting: true };
		expect(Selection.inserting).toBe(true);
		expect(Selection.context).toStrictEqual({ target: null, inserting: true });
	});
});

describe('Color → stores/color（color-picker）', () => {
	it('单例写 → store 读（4 个字段）', async () => {
		const { Color } = await import('@app/tools/color-picker-window.ts');
		Color.paletteX = 12;
		Color.paletteY = 34;
		Color.pillarY = 56;
		Color.indexEnabled = true;

		const store = getColorStore();
		expect(store.paletteX).toBe(12);
		expect(store.paletteY).toBe(34);
		expect(store.pillarY).toBe(56);
		expect(store.indexEnabled).toBe(true);
	});

	it('store 写 → 单例读，且初值是 0 / false 而不是 undefined', async () => {
		const { Color } = await import('@app/tools/color-picker-window.ts');
		const store = getColorStore();
		store.paletteX = 7;
		store.paletteY = 8;
		store.pillarY = 9;
		store.indexEnabled = false;

		expect(Color.paletteX).toBe(7);
		expect(Color.paletteY).toBe(8);
		expect(Color.pillarY).toBe(9);
		expect(Color.indexEnabled).toBe(false);

		store.paletteX = 0;
		store.indexEnabled = false;
		expect(Color.paletteX).toBe(0);
		expect(Color.indexEnabled).toBe(false);
	});
});
