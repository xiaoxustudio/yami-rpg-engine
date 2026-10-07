import { describe, expect, it, vi } from 'vitest';

import * as cluster from '@app/tools/window-cluster.ts';
import { getLazyWindow, primeWindows } from '@app/tools/window-registry.ts';

describe('1c ④ 前置不变式：UI 对象的到达路径只有 loadUI 一条', () => {
	it('A. 机制有效：primeWindows 里的 UI 键确实会预热 ui 槽位（不调用 loader）', () => {
		const primed = { initialize: vi.fn() };
		primeWindows({ UI: primed });

		const loader = vi.fn(async () => ({ initialize: vi.fn() }));
		const proxy = getLazyWindow('ui', loader) as { initialize: unknown };

		expect(proxy.initialize).toBe(primed.initialize);
		expect(loader).not.toHaveBeenCalled();
	});

	it('B. 生产调用点：window-cluster 的导出名里没有 ui（反证：加回 `export { UI }` 即变红）', () => {
		const primedNames = Object.keys(cluster).map((key) => key.toLowerCase());

		expect(
			Object.keys(cluster).length,
			'window-cluster 应当有导出（否则下面这条是空真）'
		).toBeGreaterThan(0);
		expect(
			primedNames,
			'window-cluster 重新导出 UI ⇒ primeWindows 会绕过 loadUI，④ 的 CI 盲区会复活'
		).not.toContain('ui');
	});
});
