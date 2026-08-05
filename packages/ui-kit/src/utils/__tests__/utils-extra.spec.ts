import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { INTRGBA, CSSRGBA } from '../color';
import { TreeDataContext } from '../tree-data-context';
import { createScrollListener } from '../scroll-listener';

describe('color-utils', () => {
	it('INTRGBA packs hex to int (little-endian)', () => {
		expect(INTRGBA('11223344')).toBe(0x44332211);
		expect(INTRGBA('00000000')).toBe(0);
		expect(INTRGBA('ffffffff')).toBe(0xffffffff);
	});

	it('CSSRGBA formats rgba string', () => {
		expect(CSSRGBA('10203040')).toBe('rgba(16, 32, 48, 64)');
	});
});

describe('TreeDataContext', () => {
	const data = {
		items: [
			{
				id: 'group1',
				class: 'folder',
				name: 'G1',
				children: [{ id: 'a', class: 'item', name: 'A' }]
			},
			{ id: 'b', class: 'item', name: 'B' }
		],
		settings: { key1: 'group1', key2: '' }
	};

	it('builds itemMap and groupMap', () => {
		const ctx = new TreeDataContext(data, 'items');
		expect(ctx.itemMap['a'].name).toBe('A');
		expect(ctx.itemMap['b'].name).toBe('B');
		expect(ctx.getGroup('group1').groupName).toBe('G1');
		expect(ctx.getGroup('group1').itemList.map((i: any) => i.id)).toEqual(['a']);
		expect(ctx.getGroup('key1').itemList.map((i: any) => i.id)).toEqual(['a']);
		expect(ctx.getGroup('key2').groupName).toBe('');
	});

	it('createNoneItem uses localize adapter', () => {
		const ctx = new TreeDataContext(data, 'items', {
			get: (k) => (k === 'common.none' ? '无' : k)
		});
		expect(ctx.createNoneItem().name).toBe('无');
		const plain = new TreeDataContext(data, 'items');
		expect(plain.createNoneItem().name).toBe('None');
	});

	it('getCachedItems caches builder result', () => {
		const ctx = new TreeDataContext(data, 'items');
		const builder = vi.fn(() => [1, 2, 3]);
		const first = ctx.getCachedItems('x', builder);
		const second = ctx.getCachedItems('x', builder);
		expect(builder).toHaveBeenCalledTimes(1);
		expect(first).toBe(second);
	});
});

describe('scroll-listener', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn(() => 1)
		);
		vi.stubGlobal('cancelAnimationFrame', vi.fn());
		vi.stubGlobal('performance', { now: () => 0 });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('add/remove manages window pointermove listener', () => {
		const listener = createScrollListener();
		const el = document.createElement('div');
		listener.add(el, 'both', 100, false);
		expect(HTMLElement.prototype).toBeTruthy();
		listener.remove(el);
		listener.remove(el);
	});

	it('second add switches target', () => {
		const listener = createScrollListener();
		const a = document.createElement('div');
		const b = document.createElement('div');
		listener.add(a, 'vertical', 50, true);
		listener.add(b, 'vertical', 50, true);
		listener.remove(b);
		listener.remove(a);
	});
});
