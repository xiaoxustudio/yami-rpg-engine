import { describe, expect, it } from 'vitest';
import { collectPaletteItems, elementOfRef } from '../layout/palette-items';

const makeRoot = (className: string, values: string[]): HTMLElement => {
	const root = document.createElement('div');
	for (const value of values) {
		const child = document.createElement('div');
		child.className = className;
		child.setAttribute('value', value);
		root.append(child);
	}
	const other = document.createElement('div');
	other.className = 'not-an-item';
	root.append(other);
	return root;
};

describe('palette-items（登记辅助）', () => {
	it('元素 ref：按类名收集 nav-item / page-frame，过滤非目标类与空 value', () => {
		const nav = makeRoot('nav-item', ['project', 'scene']);
		const manager = makeRoot('page-frame', ['project', 'scene']);
		const entries = collectPaletteItems(nav, manager);
		expect(entries.map((entry) => entry.value)).toEqual([
			'project',
			'scene',
			'project',
			'scene'
		]);
		expect(entries.filter((entry) => entry.nav !== undefined)).toHaveLength(2);
		expect(entries.filter((entry) => entry.page !== undefined)).toHaveLength(2);
		expect(entries[0].nav).toBe(nav.children[0]);
		expect(entries[2].page).toBe(manager.children[0]);
	});

	it('组件 ref：经 $el 取根元素后收集（回归：不读实例自身的 children）', () => {
		const nav = makeRoot('nav-item', ['project']);
		const manager = makeRoot('page-frame', ['project']);
		const entries = collectPaletteItems({ $el: nav }, { $el: manager });
		expect(entries.map((entry) => entry.value)).toEqual(['project', 'project']);
		expect(entries[0].nav).toBe(nav.children[0]);
		expect(entries[1].page).toBe(manager.children[0]);
	});

	it('组件实例无 $el（未挂载/未暴露）：返回空且不抛错', () => {
		expect(() => collectPaletteItems({}, {})).not.toThrow();
		expect(collectPaletteItems({}, {})).toEqual([]);
	});

	it('ref 为 null/undefined：返回空且不抛错', () => {
		expect(() => collectPaletteItems(null, undefined)).not.toThrow();
		expect(collectPaletteItems(null, undefined)).toEqual([]);
	});

	it('elementOfRef：元素直接返回，组件取 $el，其余为 null', () => {
		const el = document.createElement('div');
		expect(elementOfRef(el)).toBe(el);
		expect(elementOfRef({ $el: el })).toBe(el);
		expect(elementOfRef({ $el: 'not-an-element' })).toBeNull();
		expect(elementOfRef(null)).toBeNull();
		expect(elementOfRef(undefined)).toBeNull();
	});
});
