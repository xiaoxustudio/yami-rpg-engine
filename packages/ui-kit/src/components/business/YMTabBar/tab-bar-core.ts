export type TabItemMeta = {
	guid?: string;
	path?: string;
	[k: string]: unknown;
};

export type TabItem = {
	item?: string;
	icon: string;
	name: string;
	type?: string;
	meta?: TabItemMeta;
	tab?: HTMLElement;
	[k: string]: unknown;
};

export type DropPosition = 'before' | 'after';

export type HintRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export interface TabBarCore {
	parseTabName: (item: TabItem) => string;
	arrayRemove: (arr: TabItem[], item: TabItem) => boolean;
	insertTabItem: (items: TabItem[], item: TabItem, index: number) => boolean;
	findTabByProperty: (items: TabItem[], key: string, value: unknown) => TabItem | undefined;
	collectOtherTabs: (
		items: TabItem[],
		keepItem: TabItem,
		dirItem: TabItem | null | undefined
	) => TabItem[];
	collectTabsToTheRight: (
		items: TabItem[],
		item: TabItem,
		dirItem: TabItem | null | undefined
	) => TabItem[];
	moveTabItem: (
		items: TabItem[],
		source: TabItem,
		target: TabItem,
		position: DropPosition
	) => number | null;
	computeDropPosition: (clientX: number, box: { left: number; width: number }) => DropPosition;
	computeHintRect: (rect: HintRect, position: DropPosition) => HintRect;
}

export function createTabBarCore(): TabBarCore {
	const parseTabName = (item: TabItem): string => `${item.icon} ${item.name}`;

	const arrayRemove = (arr: TabItem[], item: TabItem): boolean => {
		const index = arr.indexOf(item);
		if (index !== -1) {
			arr.splice(index, 1);
			return true;
		}
		return false;
	};

	const insertTabItem = (items: TabItem[], item: TabItem, index: number): boolean => {
		if (items.includes(item)) {
			return false;
		}
		items.splice(index + 1, 0, item);
		return true;
	};

	const findTabByProperty = (
		items: TabItem[],
		key: string,
		value: unknown
	): TabItem | undefined => {
		for (const context of items) {
			if (context[key] === value) {
				return context;
			}
		}
		return undefined;
	};

	const collectOtherTabs = (
		items: TabItem[],
		keepItem: TabItem,
		dirItem: TabItem | null | undefined
	): TabItem[] => {
		const closedItems: TabItem[] = [];
		let i = items.length;
		while (--i >= 0) {
			const tab = items[i];
			if (tab === keepItem) continue;
			if (tab === dirItem) continue;
			items.splice(i, 1);
			closedItems.push(tab);
		}
		return closedItems;
	};

	const collectTabsToTheRight = (
		items: TabItem[],
		item: TabItem,
		dirItem: TabItem | null | undefined
	): TabItem[] => {
		const closedItems: TabItem[] = [];
		const index = items.indexOf(item);
		if (index === -1) {
			return closedItems;
		}
		let i = items.length;
		while (--i > index) {
			const tab = items[i];
			if (tab === dirItem) continue;
			items.splice(i, 1);
			closedItems.push(tab);
		}
		return closedItems;
	};

	const moveTabItem = (
		items: TabItem[],
		source: TabItem,
		target: TabItem,
		position: DropPosition
	): number | null => {
		if (!arrayRemove(items, source)) {
			return null;
		}
		let index = items.indexOf(target);
		if (position === 'after') {
			index++;
		}
		items.splice(index, 0, source);
		return index;
	};

	const computeDropPosition = (
		clientX: number,
		box: { left: number; width: number }
	): DropPosition => {
		const middle = box.width / 2;
		const offsetX = clientX - box.left;
		return offsetX < middle ? 'before' : 'after';
	};

	const computeHintRect = (rect: HintRect, position: DropPosition): HintRect => {
		if (position === 'before') {
			return { ...rect, left: rect.left - 1, width: 2 };
		}
		return { ...rect, left: rect.left + rect.width - 1, width: 2 };
	};

	return {
		parseTabName,
		arrayRemove,
		insertTabItem,
		findTabByProperty,
		collectOtherTabs,
		collectTabsToTheRight,
		moveTabItem,
		computeDropPosition,
		computeHintRect
	};
}
