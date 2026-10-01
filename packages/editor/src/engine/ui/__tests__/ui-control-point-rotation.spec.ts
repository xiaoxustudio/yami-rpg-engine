import { describe, expect, it } from 'vitest';

import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';
import type { UIShape } from '@app/engine/ui/ui-singleton.ts';

/**
 * `UIEngine.updateControlPoints` 的**父链旋转累加** —— 本文件对应一次真实崩溃（2026-10-01）：
 *
 * ```
 * TypeError: Cannot read properties of null (reading 'rotation')
 *   at UIEngine.updateControlPoints (ui-engine.ts)
 *   at UIEngine.drawControlPoints
 *   at UIEngine.renderingFunction
 *   at Timer.update
 * ```
 *
 * 触发链：在元素面板里选中一个 UI 元素 → `ui-transform.ts` 的 `setTarget` →
 * `requestRendering()` → 下一帧 `drawControlPoints` → `updateControlPoints`。
 *
 * 根因：`52ced02b1` 把这句
 * `while ((element = element.parent)?.transform) { rotation += element.transform.rotation }`
 * 改写成 `for (let parent = instance.parent; parent !== null; parent = parent.parent)`，
 * 理由写在注释里：「`transform` 在具名类型下是非可选的，所以 `?.transform` 只可能在父元素为
 * null 时为假」。**这条前提是错的**：根实例就是 `transform: null` ——
 * `root-element.ts` 的 `RootElement` 构造时显式传 `{ transform: null }`（根不参与 transform 链），
 * 而 `element-base.ts` 那句 `this.transform = data.transform as TransformShape` 把它断言掉了。
 * 于是循环一路走到根，读 `null.rotation`，**每帧抛错**，选中框/控制点整块画不出来。
 *
 * 本文件钉住的是「父链到**没有 transform 的祖先**为止」这条语义：根必须被跳过（它没有 transform），
 * 而不是被解引用。
 */
describe('UIEngine.updateControlPoints：父链旋转累加', () => {
	const makePoints = () => ({
		rotate: {
			TL: { x: 0, y: 0 },
			TR: { x: 0, y: 0 },
			BL: { x: 0, y: 0 },
			BR: { x: 0, y: 0 }
		},
		resize: {
			T: { x: 0, y: 0 },
			L: { x: 0, y: 0 },
			R: { x: 0, y: 0 },
			B: { x: 0, y: 0 },
			TL: { x: 0, y: 0 },
			TR: { x: 0, y: 0 },
			BL: { x: 0, y: 0 },
			BR: { x: 0, y: 0 }
		}
	});

	/** 只喂 `updateControlPoints` 真正读到的字段，避免为一条断言拖进整个引擎装配。 */
	const engineOf = () => ({
		scale: 1,
		controlPoints: makePoints(),
		controlPointRotation: 0
	});

	it('父链走到根（transform 为 null）时不得抛错，且旋转只累加有 transform 的祖先', () => {
		const store = getUIStore();
		const self = engineOf();
		// 真实的树形：根实例 transform 为 null（RootElement），它的孩子才是可选中元素
		const root = { transform: null, parent: null };
		const parent = { transform: { rotation: 30 }, parent: root };
		const instance = {
			transform: { rotation: 10 },
			parent,
			matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
			x: 0,
			y: 0,
			width: 10,
			height: 10
		};
		store.target = { instance } as never;
		try {
			expect(
				() => UIEngine.updateControlPoints!.call(self as unknown as UIShape),
				'父链上的根实例没有 transform，不能被解引用'
			).not.toThrow();
			expect(self.controlPointRotation, '应为 自身 10 + 父 30（根不贡献）').toBe(40);
		} finally {
			store.target = null;
		}
	});

	it('多级父链：逐级累加，遇到 transform 缺失即停（与重构前语义一致）', () => {
		const store = getUIStore();
		const self = engineOf();
		const root = { transform: null, parent: null };
		const grand = { transform: { rotation: 5 }, parent: root };
		const parent = { transform: { rotation: 30 }, parent: grand };
		const instance = {
			transform: { rotation: 10 },
			parent,
			matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
			x: 0,
			y: 0,
			width: 10,
			height: 10
		};
		store.target = { instance } as never;
		try {
			UIEngine.updateControlPoints!.call(self as unknown as UIShape);
			expect(self.controlPointRotation, '10 + 30 + 5').toBe(45);
		} finally {
			store.target = null;
		}
	});

	it('没有 target 时不做任何事（不抛错、不改 controlPointRotation）', () => {
		const store = getUIStore();
		const self = engineOf();
		store.target = null;
		self.controlPointRotation = 7;
		UIEngine.updateControlPoints!.call(self as unknown as UIShape);
		expect(self.controlPointRotation).toBe(7);
	});
});
