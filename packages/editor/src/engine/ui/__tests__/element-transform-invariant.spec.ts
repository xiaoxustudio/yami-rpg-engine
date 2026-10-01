import { describe, expect, it } from 'vitest';

// ⚠️ 必须先走登记顺序：`root-element.ts` 在模块顶层 `extends uiElClasses.Element`，
// 而 `Element` 由 `element-base.ts` 登记 —— 反过来 import 会当场
// `TypeError: Super constructor null of RootElement is not a constructor`。
// `element-register.ts` 就是这条顺序的唯一定义（element-base → root-element → 各元素类）。
import '@app/engine/ui/element-register.ts';
import { createElementTransform } from '@app/engine/ui/element-base.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';
import type { UIShape } from '@app/engine/ui/ui-singleton.ts';

/**
 * **「每个元素实例都有变换数据」这条不变式的运行期保证** —— 本文件对应 2026-10-01 的每帧崩溃：
 *
 * `ui-engine.ts` 的 `updateControlPoints` 沿父链累加旋转，走到**根实例**时读
 * `parent.transform.rotation`，而根当时的 `transform` 是 `null`（`root-element.ts` 显式传的），
 * 于是每帧抛 `Cannot read properties of null (reading 'rotation')`。
 *
 * 根因是「类型说非空、运行期可为 null」：`element-base.ts` 的 `transform: TransformShape`
 * （以及 `element-classes.ts` 的 `UIElementInstance.transform`）声明成非空，靠一句
 * `data.transform as TransformShape` 断言兜着。修法与仓内对 `matrix` 的判定一致 ——
 * **把不变式修成真的，而不是给读点补 `!`**：
 *
 * - `element-base.ts` 构造函数：`data.transform ?? createElementTransform()`（漏传/null 都补恒等变换）；
 * - `root-element.ts`：不再传 `{ transform: null }`（根照旧不参与变换链，只是不再留 null）。
 *
 * 本文件同时钉住 `createElementTransform()` 的字段口径 —— 它必须与元素检视器的
 * `Inspector.uiElement.createTransform()`（`inspector/element-page.ts`）一致，两处是同一个「出厂态」。
 */
const IDENTITY_TRANSFORM = {
	anchorX: 0,
	anchorY: 0,
	x: 0,
	x2: 0,
	y: 0,
	y2: 0,
	width: 0,
	width2: 0,
	height: 0,
	height2: 0,
	rotation: 0,
	scaleX: 1,
	scaleY: 1,
	skewX: 0,
	skewY: 0,
	opacity: 1
};

const point = () => ({ x: 0, y: 0 });
/** `updateControlPoints` 会往这些点里写坐标，形状齐了即可（不关心具体值）。 */
const makeControlPoints = () => ({
	rotate: { TL: point(), TR: point(), BL: point(), BR: point() },
	resize: {
		T: point(),
		L: point(),
		R: point(),
		B: point(),
		TL: point(),
		TR: point(),
		BL: point(),
		BR: point()
	}
});

describe('元素实例的 transform 非空（根实例也有一份恒等变换）', () => {
	it('createElementTransform() 是恒等变换，且与检视器 createTransform() 的字段口径一致', () => {
		expect(createElementTransform()).toEqual(IDENTITY_TRANSFORM);
	});

	it('缺省 / 显式 null 都补恒等变换，且每次构造都是独立对象', () => {
		const omitted = new uiElClasses.Element!();
		const explicitNull = new uiElClasses.Element!({ transform: null });
		expect(omitted.transform, '缺省必须是恒等变换，不能再是 undefined').toEqual(
			IDENTITY_TRANSFORM
		);
		expect(explicitNull.transform, '显式 null 也必须兜底').toEqual(IDENTITY_TRANSFORM);
		expect(omitted.transform, '两份不能共享同一个对象（否则改一处会串台）').not.toBe(
			explicitNull.transform
		);
	});

	it('根实例的 transform 非空（这正是父链旋转累加每帧抛错的根因）', () => {
		const root = new uiElClasses.Root!();
		expect(root.transform, '根曾经是 null').not.toBeNull();
		expect(root.transform).toEqual(IDENTITY_TRANSFORM);
	});

	it('真实实例链：根作父节点时父链累加不抛错，根只贡献 0', () => {
		const store = getUIStore();
		const root = new uiElClasses.Root!();
		const child = new uiElClasses.Element!({
			transform: { ...createElementTransform(), rotation: 25 }
		});
		// 只接父链（不走 appendChild：它会触发 resize()，而基类没有实现该方法）
		child.parent = root;
		const receiver = { scale: 1, controlPoints: makeControlPoints(), controlPointRotation: 0 };
		store.target = { instance: child } as never;
		try {
			expect(
				() => UIEngine.updateControlPoints!.call(receiver as unknown as UIShape),
				'根实例现在有恒等变换，父链累加不得再抛错'
			).not.toThrow();
			expect(receiver.controlPointRotation, '子元素 25 + 根 0').toBe(25);
		} finally {
			store.target = null;
		}
	});
});
