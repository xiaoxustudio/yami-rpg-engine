import { elementDataValueOf } from '../../../utils/element-data';
import { clamp } from '../../../utils/dom';

/** own 属性优先（组件自装访问器、普通对象夹具），否则读元素数据——见 `elementDataValueOf`。 */
const itemDataValue = (item: { dataValue?: unknown }): unknown => elementDataValueOf(item);

const ROW_HEIGHT = 20;

export type RelativeDirection = 'up' | 'down';

export type VisibleRange = {
	start: number;
	end: number;
};

export type HeadAndFootMargins = {
	marginTop: number;
	marginBottom: number;
};

export interface CommonListCore {
	findItemIndex: (items: { dataValue?: unknown }[], count: number, value: unknown) => number;
	computeVisibleRange: (scrollTop: number, clientHeight: number, count: number) => VisibleRange;
	computeHeadAndFootMargins: (
		count: number,
		start: number,
		end: number,
		padded: boolean
	) => HeadAndFootMargins;
	computeItemScrollTop: (scrollTop: number, index: number, clientHeight: number) => number;
	computeRelativeIndex: (
		direction: RelativeDirection,
		count: number,
		currentIndex: number
	) => number;
	clearElements: (list: unknown[], start: number) => void;
}

export function createCommonListCore(): CommonListCore {
	const findItemIndex = (
		items: { dataValue?: unknown }[],
		count: number,
		value: unknown
	): number => {
		let index = 0;
		for (let i = 0; i < count; i++) {
			// 行元素的 `dataValue` 是元素数据（原型访问器退役后 `items[i].dataValue` 会变成
			// 读普通 expando，`findItemIndex` 会恒返回 0 ⇒ 选中项静默失效）。规则与 `utils/dom.ts`
			// 的 `read` 一致：**own 属性优先**（宿主自己装的访问器 / 普通对象夹具），否则读元素数据。
			if (itemDataValue(items[i]) === value) {
				index = i;
				break;
			}
		}
		return index;
	};

	const computeVisibleRange = (
		scrollTop: number,
		clientHeight: number,
		count: number
	): VisibleRange => {
		const start = Math.min(Math.floor(scrollTop / ROW_HEIGHT), count - 1);
		const length = Math.ceil(clientHeight / ROW_HEIGHT) + 1;
		const end = Math.min(start + length, count);
		return { start, end };
	};

	const computeHeadAndFootMargins = (
		count: number,
		start: number,
		end: number,
		padded: boolean
	): HeadAndFootMargins => {
		const pad = padded ? 1 : 0;
		return {
			marginTop: start * ROW_HEIGHT,
			marginBottom: (count - end + pad) * ROW_HEIGHT
		};
	};

	const computeItemScrollTop = (scrollTop: number, index: number, clientHeight: number): number =>
		clamp(scrollTop, index * ROW_HEIGHT + ROW_HEIGHT - clientHeight, index * ROW_HEIGHT);

	const computeRelativeIndex = (
		direction: RelativeDirection,
		count: number,
		currentIndex: number
	): number => {
		const last = count - 1;
		switch (direction) {
			case 'up':
				if (currentIndex !== -1) {
					return Math.max(currentIndex - 1, 0);
				}
				return last;
			case 'down':
				if (currentIndex !== -1) {
					return Math.min(currentIndex + 1, last);
				}
				return 0;
		}
	};

	const clearElements = (list: unknown[], start: number): void => {
		let i = start;
		while (list[i] !== undefined) {
			list[i++] = undefined;
		}
	};

	return {
		findItemIndex,
		computeVisibleRange,
		computeHeadAndFootMargins,
		computeItemScrollTop,
		computeRelativeIndex,
		clearElements
	};
}
