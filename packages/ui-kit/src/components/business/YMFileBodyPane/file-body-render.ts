/**
 * 把「文件列表 + 视图模式 → 行数据与网格度量」抽成**纯数据**推导。
 *
 * 现状：度量数学在 `file-body-core.ts` 里（`computeListGridMetrics` / `computeTileGridMetrics` /
 * `computeVisibleRange` / `computeNavigationIndex`），本文件补的是**视图模式 → 度量**的映射
 * 与行数据（哪一行是文件/文件夹、行 key）。派生与渲染解耦：渲染怎么变，这里的输出都不许变。
 *
 * 与 `command-render.ts` / tree `tree-render.ts` 对齐：行 key 用 **WeakMap 发号**
 * （文件路径可能重复出现，且同一对象跨多次派生必须拿到同一个 key ⇒ Vue 只移动/复用行）。
 */
import type { FileBodyCore, GridMetrics } from './file-body-core';
import { ROW_HEIGHT } from '../../../utils/common-list';

export type FileBodyViewMode = 'list' | 'small' | 'medium' | 'large' | 'huge';

/** `viewIndex`（0..4）→ 视图模式；与原 `updateViewMode` 的 switch 一致，越界按边界夹取 */
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

/** 平铺视图的单元尺寸（原 `computeGridProperties` 里的字面量：small/medium/large/huge） */
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

/** 派生层看到的文件形状：只要能取到路径/名字/是否文件夹（刻意不加索引签名，便于消费方直接传自己的类实例） */
export interface FileRenderItem {
	path?: string;
	name?: string;
	basename?: string;
}

export interface FileRowDescriptor<T extends object = FileRenderItem> {
	/** 稳定行 key（WeakMap 发号，跨多次派生不变） */
	key: string;
	item: T;
	/** 在传入列表中的下标 */
	index: number;
	/** 显示名（原实现取 `basename`） */
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

/**
 * 文件列表 → 行数据（顺序与传入一致）。
 * 对元素类型泛型化：消费方可以直接传自己的 `FileItem`/`FolderItem` 实例（无需索引签名）。
 */
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

/** `getFiles` 的纯推导：多文件夹的 children 展平；`filters` 为空时不过滤，否则保留文件夹或类型命中项 */
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

/** 网格内边距（原 `updateContentSize` / 行定位的字面量 4） */
export const FILE_GRID_PADDING = 4;

/** 网格单元之间的间隙（原 `updateContentSize` 的字面量 2） */
export const FILE_GRID_GAP = 2;

/** 列表视图的固定行高（统一出处 utils/common-list） */
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

/** 单个可见行的模板所需数据（与 DOM 双写，便于逐项核对） */
export interface FileBodyRowDescriptor {
	/** 稳定行 key（`fileRowKeyOf` 发号） */
	key: string;
	/** 全局行下标（在全部行中的位置） */
	index: number;
	/** 显示名（由消费方注入：文件取 `basename`、文件夹取 `name`） */
	name: string;
	isFolder: boolean;
	/** 该行当前是否被选中（原实现通过 `selected` 类表达） */
	selected: boolean;
	/** 定位样式（原实现直接写 `element.style`） */
	style: { left: string; top: string };
}

/** 可见行的数据模型（供 `v-for` 换源前的等价性验证与模板化使用） */
export interface FileBodyRowModel {
	/** 可见窗口起点（含） */
	start: number;
	/** 可见窗口终点（不含） */
	end: number;
	/** 每行（列表视图）或每行单元（平铺视图）数量 */
	countPerLine: number;
	/** 当前视图模式 */
	viewMode: string;
	/** 可见行的稳定 key，顺序与 DOM 中的行一致 */
	keys: string[];
	/** 模板渲染一行所需的全部数据（与 DOM 双写） */
	rows: FileBodyRowDescriptor[];
}

/** `getRowModel` 用的只读副本（避免调用方改到内部状态） */
export const cloneRowModel = (model: FileBodyRowModel): FileBodyRowModel => ({
	...model,
	keys: [...model.keys],
	rows: model.rows.map((row) => ({ ...row, style: { ...row.style } }))
});

/**
 * 可见窗口 `[start, end)` → 行描述（纯推导：key/定位/名称/文件夹标记/选中态）。
 * 原 `YMFileBodyPane.vue` 的 `rebuildRowDescriptors` 主体；名称与选中态由消费方注入，
 * 不依赖 `instanceof` 或组件状态。
 */
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
