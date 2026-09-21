import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry.ts';

/**
 * 回归：懒加载窗口失败时**不得产生未处理的 rejection**。
 *
 * ## 这一条守的是什么（2026-09-21 实测的真实故障）
 *
 * `@yami/editor` 全量套件曾经 **2066 个用例全绿、却 exit 1**：
 *
 * ```
 * EnvironmentTeardownError: Cannot load '/src/composables/useZoomWindow.ts'
 *   imported from .../src/title/menu-bar.ts after the environment was torn down.
 * ```
 *
 * 成因不是「并发负载」也不是测试写错，而是本模块的 `void ensure(...)` **丢弃了派生 promise，
 * 却没给原始 promise 挂 rejection 回调** ⇒ Node 记为 `unhandledRejection` ⇒ vitest 判套件失败。
 * 触发链：`stores/__tests__/ui-state.spec.ts` 写 store 字段 → 懒代理 `get`/`set` trap 取不到
 * 实例 → 触发 `loadUI()` 动态 `import('window-cluster')` → 该 barrel 静态 re-export
 * `useZoomWindow`（→ `menu-bar.ts`）；环境在 import 完成前拆除 ⇒ reject。
 *
 * ## 为什么这样断言（而不是「跑一遍看有没有报错」）
 *
 * vitest 把 unhandled rejection 记成**套件级错误**，不会让本文件的 `expect` 失败 —— 也就是说
 * 「用例全绿但退出码是 1」正是当初骗过人的形态。所以这里**自己装 `process` 监听器**，
 * 把它变成一条**可断言的数字**：换回 `void ensure(...)`（去掉 catch）时本文件必须失败。
 * 这正是本仓库的「仪器要自证」纪律。
 *
 * ⚠️ `pending` 是**模块级缓存**且失败项**不会清除**（保持既有语义，避免 loader 反复失败时无限重试）。
 * 因此每个用例必须用**独立的窗口名**，否则第二个用例会直接复用第一个用例缓存下来的 rejection。
 */

/** 每个用例一个独立窗口名 —— 绕开模块级 `pending` 缓存（失败项不会清除）。 */
let seq = 0;
const uniqueName = (): string => `probe-${++seq}-${Date.now()}`;

/** 装监听器，收集本进程当前收到的 `unhandledRejection` 数量。 */
function captureUnhandledRejections(): { count: () => number; dispose: () => void } {
	let count = 0;
	const onUnhandled = (): void => {
		count += 1;
	};
	process.on('unhandledRejection', onUnhandled);
	return {
		count: () => count,
		dispose: () => process.off('unhandledRejection', onUnhandled)
	};
}

/**
 * 让出足够多轮微任务，确保 Node 已经**判定**某个 rejection 是否无人处理。
 *
 * Node 的判定发生在 promise 被 reject 之后的微任务检查点，`setTimeout` 必然晚于它；
 * 用 `setImmediate` 再快一档会更贴近边界，这里取两者兼顾的写法。
 */
async function flushUnhandledRejectionCheck(): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, 0));
	await new Promise((resolve) => setImmediate(resolve));
}

const disposers: Array<() => void> = [];
afterEach(() => {
	for (const dispose of disposers.splice(0)) dispose();
});

describe('window-registry 懒加载失败不产生未处理 rejection', () => {
	it('get trap：惰加载失败时只记「已处理」，不冒泡成 unhandledRejection', async () => {
		const spy = captureUnhandledRejections();
		disposers.push(spy.dispose);

		const name = uniqueName();
		const loader = vi.fn(() => Promise.reject(new Error('boom: lazy load failed')));
		const proxy = getLazyWindow<{ anything?: unknown }>(name, loader);

		// 首次访问：实例还没到 ⇒ 触发加载并返回 undefined（既有语义，不要改）
		expect(proxy.anything).toBeUndefined();
		expect(loader).toHaveBeenCalledTimes(1);

		await flushUnhandledRejectionCheck();
		expect(spy.count(), 'get trap 不得产生未处理的 rejection').toBe(0);
	});

	it('set trap：惰加载失败时，写入回填链也不得产生未处理 rejection', async () => {
		const spy = captureUnhandledRejections();
		disposers.push(spy.dispose);

		const name = uniqueName();
		const loader = vi.fn(() => Promise.reject(new Error('boom: lazy load failed')));
		const proxy = getLazyWindow<Record<string, unknown>>(name, loader);

		// set trap 会 create `ensure().then(回填)` —— **派生的第二个 promise**，
		// 它必须自带 catch，否则原 promise 被标记了「已处理」也照样冒泡。
		proxy.someField = 1;
		expect(loader).toHaveBeenCalledTimes(1);

		await flushUnhandledRejectionCheck();
		expect(spy.count(), 'set trap 的回填链不得产生未处理的 rejection').toBe(0);
	});

	it('loadWindow：调用方仍能拿到真实的 rejection（不因内部标记而变成 resolve）', async () => {
		const name = uniqueName();
		const loader = () => Promise.reject(new Error('boom: keep the rejection visible'));

		// 「已处理」标记绝不能把失败改写成成功 —— 否则会把真实故障藏起来。
		await expect(loadWindow(name, loader)).rejects.toThrow('keep the rejection visible');
	});

	it('加载失败后沿用缓存：不重复调用 loader（锁住既有语义，防止改成无限重试）', async () => {
		const spy = captureUnhandledRejections();
		disposers.push(spy.dispose);

		const name = uniqueName();
		const loader = vi.fn(() => Promise.reject(new Error('boom')));
		const proxy = getLazyWindow<{ anything?: unknown }>(name, loader);

		expect(proxy.anything).toBeUndefined();
		expect(proxy.anything).toBeUndefined();
		await flushUnhandledRejectionCheck();

		expect(loader).toHaveBeenCalledTimes(1);
		expect(spy.count()).toBe(0);
	});
});
