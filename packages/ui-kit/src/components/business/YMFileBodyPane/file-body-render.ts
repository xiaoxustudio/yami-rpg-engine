import type { FileBodyCore, GridMetrics } from './file-body-core';
import { ROW_HEIGHT } from '../../../utils/common-list';

export type FileBodyViewMode = 'list' | 'small' | 'medium' | 'large' | 'huge';

export const VIEW_MODE_BY_INDEX: readonly FileBodyViewMode[] = [
	'list',
	'small',
	'medium',
	'large',
	'huge'
];

export const viewModeOfIndex = (viewIndex: number): FileBodyViewMode => {
	const index = Math.min(Math.max(Math.trunc(viewIndex), 0), VIEW_MODE_BY_INDEX.length - 1);
	return VIEW_MODE_BY_INDEX[index];
};

export const TILE_SIZE_BY_VIEW_MODE: Record<
	Exclude<FileBodyViewMode, 'list'>,
	readonly [number, number]
> = {
	small: [40, 72],
	medium: [72, 104],
	large: [136, 168],
	huge: [264, 296]
};

/** 按视图模式算出网格度量（纯：把 core 的两个度量函数按模式分派，不改任何状态） */
export const computeViewMetrics = (
	viewMode: FileBodyViewMode,
	core: FileBodyCore,
	viewport: { width: number; height: number }
): GridMetrics => {
	if (viewMode === 'list') return core.computeListGridMetrics(viewport.width, viewport.height);
	const [width, height] = TILE_SIZE_BY_VIEW_MODE[viewMode];
	return core.computeTileGridMetrics(viewport.width, viewport.height, width, height);
};

export interface FileRenderItem {
	path?: string;
	name?: string;
	basename?: string;
}

export interface FileRowDescriptor<T extends object = FileRenderItem> {
	key: string;
	item: T;
	index: number;
	name: string;
	path: string;
	isFolder: boolean;
}

const rowKeys = new WeakMap<object, string>();
let rowKeySeq = 0;

/** 稳定行 key（同 `command-render.rowKeyOf` / tree `rowKeyOf`） */
export const fileRowKeyOf = (item: object): string => {
	let key = rowKeys.get(item);
	if (key === undefined) {
		key = `f${++rowKeySeq}`;
		rowKeys.set(item, key);
	}
	return key;
};

/** 只把字符串/数字转成文本：避免把对象 `String()` 成 `[object Object]` */
const asText = (value: unknown): string => {
	if (typeof value === 'string') return value;
	if (typeof value === 'number') return String(value);
	return '';
};

const nameOf = (item: object): string => {
	const value = item as { basename?: unknown; name?: unknown };
	return asText(value.basename) || asText(value.name);
};

const pathOf = (item: object): string => asText((item as { path?: unknown }).path);

const defaultIsFolder = (item: object): boolean =>
	(item as { constructor?: { name?: string } }).constructor?.name === 'FolderItem';

export const deriveFileRows = <T extends object>(
	files: readonly T[] = [],
	isFolderOf: (item: T) => boolean = defaultIsFolder as (item: T) => boolean
): FileRowDescriptor<T>[] =>
	files.map((item, index) => ({
		key: fileRowKeyOf(item),
		item,
		index,
		name: nameOf(item),
		path: pathOf(item),
		isFolder: isFolderOf(item)
	}));

export const flattenFolderChildren = <T extends object>(
	folders: readonly { children: readonly T[] }[],
	filters: readonly string[] | null | undefined,
	isFolder: (item: T) => boolean,
	typeOf: (item: T) => string
): T[] => {
	const items: T[] = [];
	for (const folder of folders) {
		for (const item of folder.children) {
			if (!filters || isFolder(item) || filters.includes(typeOf(item))) {
				items.push(item);
			}
		}
	}
	return items;
};

export const FILE_GRID_PADDING = 4;

export const FILE_GRID_GAP = 2;

export const FILE_LIST_ROW_HEIGHT = ROW_HEIGHT;

/** 行在网格中的定位（纯：按视图模式/列数/单元尺寸推导，不读写任何状态） */
export const fileRowOffset = (
	viewMode: FileBodyViewMode,
	index: number,
	countPerLine: number,
	itemWidth: number,
	itemSize: number
): { left: string; top: string } => {
	if (viewMode === 'list') {
		const col = Math.floor(index / countPerLine);
		const row = index % countPerLine;
		return {
			left: `${col * itemWidth + FILE_GRID_PADDING}px`,
			top: `${row * FILE_LIST_ROW_HEIGHT}px`
		};
	}
	const col = index % countPerLine;
	const row = Math.floor(index / countPerLine);
	return {
		left: `${col * itemWidth + FILE_GRID_PADDING}px`,
		top: `${row * itemSize + FILE_GRID_PADDING}px`
	};
};

export interface FileBodyWindowRowInput<T extends object> {
	files: readonly T[];
	start: number;
	end: number;
	viewMode: FileBodyViewMode;
	countPerLine: number;
	itemWidth: number;
	itemSize: number;
	isFolderOf: (item: T) => boolean;
	isSelected: (item: T) => boolean;
	nameOf: (item: T) => string;
}

export interface FileBodyRowDescriptor {
	key: string;
	index: number;
	name: string;
	isFolder: boolean;
	selected: boolean;
	style: { left: string; top: string };
}

export interface FileBodyRowModel {
	start: number;
	end: number;
	countPerLine: number;
	viewMode: string;
	keys: string[];
	rows: FileBodyRowDescriptor[];
}

/** `getRowModel` 用的只读副本（避免调用方改到内部状态） */
export const cloneRowModel = (model: FileBodyRowModel): FileBodyRowModel => ({
	...model,
	keys: [...model.keys],
	rows: model.rows.map((row) => ({ ...row, style: { ...row.style } }))
});

export const buildFileBodyWindowRows = <T extends object>(
	input: FileBodyWindowRowInput<T>
): FileBodyRowDescriptor[] => {
	const {
		files,
		start,
		end,
		viewMode,
		countPerLine,
		itemWidth,
		itemSize,
		isFolderOf,
		isSelected,
		nameOf
	} = input;
	const rows: FileBodyRowDescriptor[] = [];
	for (let i = start; i < end; i++) {
		const file = files[i];
		if (file === undefined) continue;
		const { left, top } = fileRowOffset(viewMode, i, countPerLine, itemWidth, itemSize);
		rows.push({
			key: fileRowKeyOf(file),
			index: i,
			name: nameOf(file),
			isFolder: isFolderOf(file),
			selected: isSelected(file),
			style: { left, top }
		});
	}
	return rows;
};
