import { clamp } from '../../../utils/dom';
import {
	ROW_HEIGHT,
	clearElementSlots,
	computeRowMargins,
	computeVisibleRange
} from '../../../utils/common-list';

export type ParamDataItem = { enabled?: boolean };

export type SelectionRange = {
	start: number;
	end: number;
};

export type VisibleRange = {
	start: number;
	end: number;
};

export type HeadAndFootMargins = {
	marginTop: number;
	marginBottom: number;
};

export type ToggleResult = {
	method: 'enable' | 'disable';
	items: ParamDataItem[];
};

export interface ParamListCore {
	resolveSelectionRange: (
		start: number,
		end: number,
		count: number,
		hasDataItem: (index: number) => boolean
	) => SelectionRange;
	computeVisibleRange: (scrollTop: number, clientHeight: number, count: number) => VisibleRange;
	computeHeadAndFootMargins: (
		count: number,
		start: number,
		end: number,
		padded: boolean
	) => HeadAndFootMargins;
	computeFlexibleHeight: (count: number) => number;
	computeSelectionScrollTop: (scrollTop: number, active: number, innerHeight: number) => number;
	computeDragSelectIndex: (
		y: number,
		paddingTop: number,
		itemHeight: number,
		count: number
	) => number;
	collectToggleItems: (
		data: (ParamDataItem | null)[],
		start: number,
		end: number
	) => ToggleResult;
	setItemsEnabled: (items: ParamDataItem[], enabled: boolean) => void;
	clearElements: (list: unknown[], start: number) => void;
}

export function createParamListCore(): ParamListCore {
	const resolveSelectionRange = (
		start: number,
		end: number,
		count: number,
		hasDataItem: (index: number) => boolean
	): SelectionRange => {
		if (start > end) {
			[start, end] = [end, start];
		}
		const last = count - 1;
		start = clamp(start, 0, last);
		end = clamp(end, 0, last);
		if (start !== end && !hasDataItem(end)) {
			end--;
		}
		return { start, end };
	};

	const computeFlexibleHeight = (count: number): number => Math.min(count * ROW_HEIGHT, 500) + 2;

	const computeSelectionScrollTop = (
		scrollTop: number,
		active: number,
		innerHeight: number
	): number =>
		clamp(scrollTop, active * ROW_HEIGHT + ROW_HEIGHT - innerHeight, active * ROW_HEIGHT);

	const computeDragSelectIndex = (
		y: number,
		paddingTop: number,
		itemHeight: number,
		count: number
	): number => {
		const line = Math.floor((y - paddingTop) / itemHeight);
		return clamp(line, 0, count - 1);
	};

	const collectToggleItems = (
		data: (ParamDataItem | null)[],
		start: number,
		end: number
	): ToggleResult => {
		let method: 'enable' | 'disable' = 'disable';
		const items: ParamDataItem[] = [];
		for (let i = start; i <= end; i++) {
			const item = data[i];
			if (item) {
				switch (method) {
					case 'disable':
						if (!item.enabled) {
							method = 'enable';
							items.length = 0;
						}
						items.push(item);
						continue;
					case 'enable':
						if (!item.enabled) {
							items.push(item);
						}
						continue;
				}
			}
		}
		return { method, items };
	};

	const setItemsEnabled = (items: ParamDataItem[], enabled: boolean): void => {
		for (const item of items) {
			item.enabled = enabled;
		}
	};

	return {
		resolveSelectionRange,
		// 窗口/边距/清空槽位统一走 `utils/common-list.ts` 的唯一一份（本地那三份是逐字重复）
		computeVisibleRange,
		computeHeadAndFootMargins: computeRowMargins,
		computeFlexibleHeight,
		computeSelectionScrollTop,
		computeDragSelectIndex,
		collectToggleItems,
		setItemsEnabled,
		clearElements: clearElementSlots
	};
}
