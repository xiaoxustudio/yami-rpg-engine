import { describe, expect, it, vi } from 'vitest';

/**
 * `treeListStatics.textBox` 的惰性契约。
 *
 * 它原先是对象字面量里的一个立即执行 IIFE：**模块加载期**就 `document.createElement`
 * （无 DOM 时返回 `null as unknown as TextBox`，谎报一个非空 host）。现在改为
 * 首次访问时才创建 —— 这两条断言就是这个意图的守门：
 *
 * 1. `import` 之后还不应该有任何 `.node-list-text-box` 被创建；
 * 2. 首次访问创建出来，且再访问拿到的是**同一个**实例（缓存语义与改动前一致）。
 */
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
