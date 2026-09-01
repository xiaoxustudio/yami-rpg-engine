export type GridMetrics = {
	itemSize: number;
	itemWidth: number;
	visibleLines: number;
	normalCountPerLine: number;
	scrollCountPerLine: number;
	scrollCount: number;
};

export type VisibleRange = {
	start: number;
	end: number;
};

export type GridDirection = 'prev' | 'next' | 'prev-line' | 'next-line';

export interface FileBodyCore {
	clamp: (value: number, min: number, max: number) => number;
	computeListGridMetrics: (cw: number, ch: number) => GridMetrics;
	computeTileGridMetrics: (cw: number, ch: number, width: number, height: number) => GridMetrics;
	computeVisibleRange: (
		scroll: number,
		count: number,
		countPerLine: number,
		itemSize: number,
		visibleLines: number
	) => VisibleRange;
	computeNavigationIndex: (
		direction: GridDirection,
		count: number,
		countPerLine: number,
		hasSelection: boolean,
		start: number,
		end: number
	) => number;
}

export function createFileBodyCore(): FileBodyCore {
	const clamp = (value: number, min: number, max: number): number =>
		Math.min(Math.max(value, min), max);

	const computeListGridMetrics = (cw: number, ch: number): GridMetrics => {
		const WIDTH = 240;
		const HEIGHT = 20;
		const PADDING = 4;
		const GAP = 2;
		const SCROLLBAR_HEIGHT = 12;
		const ow = Math.max(cw - PADDING * 2 + GAP, 0);
		const oh = Math.max(ch - PADDING * 2, 0);
		const iw = WIDTH + GAP;
		const ih = HEIGHT;
		const visibleLines = Math.ceil((cw + GAP) / iw) + 1;
		const normalCountPerLine = Math.max(Math.floor(oh / ih), 1);
		const scrollCountPerLine = Math.max(Math.floor((oh - SCROLLBAR_HEIGHT) / ih), 1);
		const scrollCount = Math.floor(ow / iw) * normalCountPerLine + 1;
		return {
			itemSize: iw,
			itemWidth: iw,
			visibleLines,
			normalCountPerLine,
			scrollCountPerLine,
			scrollCount
		};
	};

	const computeTileGridMetrics = (
		cw: number,
		ch: number,
		width: number,
		height: number
	): GridMetrics => {
		const PADDING = 4;
		const GAP = 2;
		const SCROLLBAR_WIDTH = 12;
		const ow = Math.max(cw - PADDING * 2 + GAP, 0);
		const oh = Math.max(ch - PADDING * 2 + GAP, 0);
		const iw = width + GAP;
		const ih = height + GAP;
		const visibleLines = Math.ceil((ch + GAP) / ih) + 1;
		const normalCountPerLine = Math.max(Math.floor(ow / iw), 1);
		const scrollCountPerLine = Math.max(Math.floor((ow - SCROLLBAR_WIDTH) / iw), 1);
		const scrollCount = Math.floor(oh / ih) * normalCountPerLine + 1;
		return {
			itemSize: ih,
			itemWidth: iw,
			visibleLines,
			normalCountPerLine,
			scrollCountPerLine,
			scrollCount
		};
	};

	const computeVisibleRange = (
		scroll: number,
		count: number,
		countPerLine: number,
		itemSize: number,
		visibleLines: number
	): VisibleRange => {
		const lines = Math.ceil(count / countPerLine);
		const sLine = clamp(Math.floor(scroll / itemSize), 0, lines - 1);
		const start = countPerLine * sLine;
		const length = countPerLine * visibleLines;
		const end = Math.min(start + length, count);
		return { start, end };
	};

	const computeNavigationIndex = (
		direction: GridDirection,
		count: number,
		countPerLine: number,
		hasSelection: boolean,
		start: number,
		end: number
	): number => {
		if (!hasSelection) {
			switch (direction) {
				case 'prev':
				case 'prev-line':
					return count - 1;
				case 'next':
				case 'next-line':
					return 0;
			}
		}
		switch (direction) {
			case 'prev':
				return start - 1;
			case 'next':
				return end + 1;
			case 'prev-line':
				return start - countPerLine;
			case 'next-line': {
				let index = end + countPerLine;
				if (index >= count) {
					const line = Math.floor(index / countPerLine);
					const head = line * countPerLine;
					if (count > head) {
						index = count - 1;
					}
				}
				return index;
			}
		}
	};

	return {
		clamp,
		computeListGridMetrics,
		computeTileGridMetrics,
		computeVisibleRange,
		computeNavigationIndex
	};
}
