/**
 * P6/M2 派生层（`YMFileBodyPane`）：把「文件列表 + 视图模式 → 行数据与网格度量」抽成**纯数据**推导。
 *
 * 现状：度量数学**已经**在 `file-body-core.ts` 里（`computeListGridMetrics` / `computeTileGridMetrics` /
 * `computeVisibleRange` / `computeNavigationIndex`），但**视图模式 → 度量**的映射还长在 SFC 里
 * （`computeGridProperties` 的 `switch` + `updateViewMode` 的 `switch`），行数据（哪一行是文件/文件夹、
 * 行 key）也散在 `createFlatItems` / `createFileElement` 里。M2 只做**抽派生、不动渲染**：
 * 调用方暂时仍是老实现，M3 再把模板 `v-for` 接到这里的输出上。
 *
 * 与 `command-render.ts` / tree `tree-render.ts` 对齐：行 key 用 **WeakMap 发号**
 * （文件路径可能重复出现，且同一对象跨多次派生必须拿到同一个 key ⇒ Vue 只移动/复用行）。
 */
import type { FileBodyCore, GridMetrics } from './file-body-core';

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
