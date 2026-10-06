import { describe, expect, it } from 'vitest';
import { animationStateKeys, getAnimationStore } from '@app/stores/animation';
import { Animation } from '@app/animation/animation-window.ts';

// 漂移回归（pinia-migration-analysis.md 第 1.1 节）：白名单在仓库里有**两份** ——
// `stores/animation.ts` 导出的 `animationStateKeys`（文档化契约）与
// `animation/animation-window.ts:630` （叶子模块 `stores/animation-keys.ts`）的 `ANIMATION_STATE_KEYS`（真正被桥接循环迭代）。
// 两者曾经不一致：导出那份少写了 5 个已桥接键（showMark/showOnionskin/mirror/loop/playing）。
// 这里把「真实被桥接的键」写死成期望值，从两侧钉住：缺一个都会红。

const BRIDGED_KEYS = [
	'state',
	'target',
	'motion',
	'direction',
	'mode',
	'speed',
	'zoom',
	'showMark',
	'showOnionskin',
	'mirror',
	'loop',
	'playing'
] as const;

describe('animation 白名单与桥一致（漂移回归）', () => {
	it('导出的 animationStateKeys 与桥接键集合一致', () => {
		expect([...animationStateKeys].sort()).toEqual([...BRIDGED_KEYS].sort());
	});

	it('每个键在 Animation 单例上都是 get/set 访问器（真装了桥）', () => {
		for (const key of BRIDGED_KEYS) {
			const descriptor = Object.getOwnPropertyDescriptor(Animation, key);
			expect(typeof descriptor?.get, key).toBe('function');
			expect(typeof descriptor?.set, key).toBe('function');
		}
	});

	it('store ← 单例 / store → 单例 双向可读写', () => {
		const store = getAnimationStore();
		Animation.showMark = true;
		expect(store.showMark).toBe(true);

		store.showMark = false;
		expect(Animation.showMark).toBe(false);
	});
});
