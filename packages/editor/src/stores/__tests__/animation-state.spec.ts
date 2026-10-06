import { describe, expect, it } from 'vitest';
import { getAnimationStore, animationStateKeys } from '@app/stores/animation';

describe('useAnimationStore（Animation 窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getAnimationStore();
		expect(store.state).toBe('closed');
		expect(store.target).toBe(null);
		expect(store.motion).toBe(null);
		expect(store.direction).toBe(null);
		expect(store.mode).toBe(null);
		expect(store.speed).toBe(null);
		expect(store.zoom).toBe(null);
	});

	// 12 = 7（state/target/motion/direction/mode/speed/zoom）+ 5 个开关（showMark/showOnionskin/
	// mirror/loop/playing）—— 后 5 个早就被 `animation-window.ts` 的 `animationBridgeKeys` 桥接了，
	// 但导出白名单一直少写它们（本批补齐）。桥侧的「真装了 getter/setter + 双向读写」由
	// `animation-state-keys.spec.ts` 单独钉住。
	it('状态键完整（12 项）', () => {
		const store = getAnimationStore();
		expect(animationStateKeys).toHaveLength(12);
		for (const key of animationStateKeys) {
			expect(key in store, String(key)).toBe(true);
		}
	});

	it('字段直接赋值读回', () => {
		const store = getAnimationStore();
		store.mode = '1-dir';
		expect(store.mode).toBe('1-dir');
		store.speed = 2;
		expect(store.speed).toBe(2);
		store.zoom = 3;
		expect(store.zoom).toBe(3);
		store.direction = 1;
		expect(store.direction).toBe(1);
		store.motion = { id: 'm1', mode: '1-dir' };
		expect(store.motion?.id).toBe('m1');
		store.mode = null;
		store.speed = null;
		store.zoom = null;
		store.direction = null;
		store.motion = null;
	});
});
