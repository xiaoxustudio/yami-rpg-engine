import { describe, expect, it, vi } from 'vitest';

describe('treeListStatics.textBox 惰性创建', () => {
	const boxesIn = (spy: { mock: { results: { value: unknown }[] } }): HTMLElement[] =>
		spy.mock.results
			.map((r) => r.value as HTMLElement)
			.filter(
				(el) => el instanceof HTMLElement && el.classList.contains('node-list-text-box')
			);

	it('import 时不建 DOM，首次访问才建，并且缓存同一实例', async () => {
		vi.resetModules();
		const spy = vi.spyOn(document, 'createElement');
		try {
			const mod = await import('../tree-api');
			expect(boxesIn(spy).length, 'import 阶段不应创建重命名文本框').toBe(0);

			const first = mod.treeListStatics.textBox;
			const second = mod.treeListStatics.textBox;
			expect(first).toBe(second);
			expect(first.classList.contains('node-list-text-box')).toBe(true);
			expect(boxesIn(spy).length, '首次访问应恰好创建一个').toBe(1);
		} finally {
			spy.mockRestore();
		}
	});
});
