import { elementDataValueOf } from '../../../utils/element-data';
import { clamp } from '../../../utils/dom';
import {
	ROW_HEIGHT,
	clearElementSlots,
	computeRowMargins,
	computeVisibleRange
} from '../../../utils/common-list';

/** own 属性优先（组件自装访问器、普通对象夹具），否则读元素数据——见 `elementDataValueOf`。 */
const itemDataValue = (item: { dataValue?: unknown }): unknown => elementDataValueOf(item);

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
			if (itemDataValue(items[i]) === value) {
				index = i;
				break;
			}
		}
		return index;
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

	return {
		findItemIndex,
		computeVisibleRange,
		computeHeadAndFootMargins: computeRowMargins,
		computeItemScrollTop,
		computeRelativeIndex,
		clearElements: clearElementSlots
	};
}
