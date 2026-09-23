import { describe, expect, it, vi } from 'vitest';

import * as cluster from '@app/tools/window-cluster.ts';
import { getLazyWindow, primeWindows } from '@app/tools/window-registry.ts';

/**
 * 阶段 1c 第 ④ 步的**前置不变式**（第 110 轮新增）。
 *
 * ## 这条用例守的是什么
 *
 * `PHASE-1C-TEST-PREREQ.md` 的 ④ 计划把「④-2c 删镜像 / ④-3 / ④-4 退役字面量」标成
 * **只有真机才能验收**，理由写的是：真机走 `main/initialize.ts:91` 的
 * `primeWindows(clusterRef)`，按小写键直接 `windows.set('ui', …)`，于是**绕过 `loadUI`**，
 * 而 vitest 走的正是 loader 路径 ⇒「套件会绿着骗你」。
 *
 * 这条理由在**第 ① 步（提交 00729b15）之后就不成立了**：那一步为了「让 UI 接线直连遗留窗口
 * 模块」，删掉了 `window-cluster.ts` 里的 `export { UI }`。`primeWindows` 遍历的是该模块的
 * **命名空间对象**，键集就是它的导出名 —— 没有 `UI` 就没有小写 `'ui'` 这个键，
 * 真机的 UI 槽位因此仍然由 `loadUI` 填充，与 vitest 同一条路。
 *
 * ⇒ 本文件把这条不变式钉住：**`primeWindows` 喂进来的键集里不许出现 `ui`**。
 * 谁把 `export { UI }` 加回 `window-cluster.ts`，用例 B 立刻变红 —— 那一行一旦回去，
 * 「装配写在 loader 里等于没写」才重新成立，④ 的验收口径也必须跟着改。
 *
 * ## 仪器自证（两个方向都要能红）
 *
 * - 用例 A 证明**机制有效**：给 `primeWindows` 一个带 `UI` 键的对象，`'ui'` 槽位确实被预热
 *   （loader 不被调用、读到的是预热值）。若 `primeWindows` 的实现被改坏，A 变红。
 * - 用例 B 证明**生产调用点喂的键集里没有 `ui`**。若有人把 `export { UI }` 加回去，B 变红。
 *
 * 只用 A 会漏掉「生产喂的对象变了」；只用 B 会漏掉「机制本身坏了」。
 */
describe('1c ④ 前置不变式：UI 对象的到达路径只有 loadUI 一条', () => {
	it('A. 机制有效：primeWindows 里的 UI 键确实会预热 ui 槽位（不调用 loader）', () => {
		const primed = { initialize: vi.fn() };
		primeWindows({ UI: primed });

		const loader = vi.fn(async () => ({ initialize: vi.fn() }));
		const proxy = getLazyWindow('ui', loader) as { initialize: unknown };

		// 预热命中 ⇒ 读到的就是被塞进去的那个对象，loader 一次都不该被调用
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
