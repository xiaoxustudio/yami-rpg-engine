import { afterEach, describe, expect, it, vi } from 'vitest';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry.ts';

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

		proxy.someField = 1;
		expect(loader).toHaveBeenCalledTimes(1);

		await flushUnhandledRejectionCheck();
		expect(spy.count(), 'set trap 的回填链不得产生未处理的 rejection').toBe(0);
	});

	it('loadWindow：调用方仍能拿到真实的 rejection（不因内部标记而变成 resolve）', async () => {
		const name = uniqueName();
		const loader = () => Promise.reject(new Error('boom: keep the rejection visible'));

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
