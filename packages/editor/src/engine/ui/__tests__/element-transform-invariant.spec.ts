import { describe, expect, it } from 'vitest';

import '@app/engine/ui/element-register.ts';
import { createElementTransform } from '@app/engine/ui/element-base.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import { getUIStore } from '@app/stores/ui';
import type { UIShape } from '@app/engine/ui/ui-singleton.ts';

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
