<template>
	<div class="file-body-pane" ref="el" :data-v-ref="''">
		<!-- M3 切片 5b：行元素改由模板渲染——`:key`/`:style`/`:class` 全部吃"行描述"数据，
		     api 只负责算可见窗口，并把模板建出的元素经 `bindRowElement` 登记回 `elements[]` -->
		<div class="file-body-content" ref="contentEl" tabindex="0" :data-v-ref="''">
			<div
				v-for="row in visibleRows"
				:key="row.key"
				:ref="(el) => bindRowElement(row, el)"
				class="file-body-item"
				:class="{ 'file-item': !row.isFolder, selected: row.selected }"
				:style="row.style"
			>
				<!-- M5：文件名由模板渲染（Vue 负责改名后的更新）；图标仍由 api 建（画布/图片类不可替代） -->
				<span class="file-body-name">{{ row.name }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	h,
	ref,
	shallowRef,
	computed,
	onMounted,
	onBeforeUnmount,
	type ComponentPublicInstance
} from 'vue';
import {
	addClass,
	hasClass,
	hasScrollBar,
	hide,
	isInContent,
	rect,
	removeClass,
	show,
	attachDoubleclick,
	focusWithOptions
} from '../../../utils/dom';
import { attachApi } from '../../../utils/attach-api';
import { elementDataOf } from '../../../utils/element-data';
import { renderDetached } from '../../../utils/detached';
import { createFileBodyCore, type GridMetrics } from './file-body-core';
import {
	computeViewMetrics,
	fileRowKeyOf,
	VIEW_MODE_BY_INDEX,
	type FileBodyViewMode
} from './file-body-render';

const core = createFileBodyCore();

// B1 收口：离屏建元素统一走 ui-kit 的 detached 接缝（本文件不再直接调用受限的 document.*）
const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => renderDetached(vnode);

interface FileBodyContext {
	element?: FileBodyItemApi;
}

interface FileBodyData {
	portrait?: string;
	icon?: string;
	clip?: number[];
	enabled?: boolean;
}

interface FileBodyMeta {
	guid: string;
	mtimeMs?: number;
	file?: FileBodyFile;
}

interface FileBodyStats {
	mtimeMs?: number;
	ino?: number;
}

interface FileBodyFile {
	path: string;
	name: string;
	basename: string;
	extname: string;
	type: string;
	alias?: string;
	children: FileBodyFile[];
	parent?: FileBodyFile;
	data?: FileBodyData;
	meta?: FileBodyMeta;
	stats?: FileBodyStats;
	getContext(node: HTMLElement): FileBodyContext;
	[k: string]: unknown;
}

interface FileBodyRelatedList {
	isEmpty: boolean;
}

type FileBodyEvent = Event & {
	value?: unknown;
	raw?: PointerEvent;
	clientX?: number;
	clientY?: number;
};

interface FileBodyTextBox extends HTMLElement {
	input: HTMLElement & { blur(): void };
	write(value: string): void;
	read(): string;
	getFocus(mode: string): void;
	fitContent(): void;
	setMaxLength(length: number): void;
}

interface FileBrowserLinks {
	browser: {
		filters?: string[];
		display?: string;
		searchResults?: FileBodyFile[];
		backToParentFolder?(): boolean;
		getFilePaths?(files: FileBodyFile[]): { absolutePaths: string[] };
	};
	nav: {
		selections: FileBodyFile[];
		load(folder: FileBodyFile): void;
		scrollToSelection(mode: string): void;
	};
	body?: HTMLElement | null;
	/**
	 * 视图切换器：`setViewIndex()` 写 `head.view.write(idx)`。
	 * 由 `YMFileBrowser.setupLinks()` 在初始化时挂上，**在那之前可能为 null**
	 *（元素还没渲染出来），所以标 `?` 并在唯一读点补 `!`。
	 */
	head?: { view: { write(index: number): void } } | null;
}

type FileBodyIconApi = HTMLElement & {
	isImageChanged?: () => boolean;
};

interface FileBodyItemApi extends HTMLElement {
	/** M3 切片 1：派生层给的稳定行 key（M3 换 `v-for` 后直接当 `:key`） */
	rowKey?: string;
	file: FileBodyFile;
	context?: FileBodyContext;
	changed?: boolean;
	nameBox?: HTMLElement;
	fileIcon?: FileBodyIconApi;
}

type FileBodyContentApi = HTMLElement & {
	range?: Uint32Array;
	count?: number;
	cpl?: number;
	countPerLine?: number;
	normalCountPerLine?: number;
	scrollCountPerLine?: number;
	scrollCount?: number;
	itemSize?: number;
	itemWidth?: number;
	visibleLines?: number;
};

type FileBodyPaneApi = HTMLElement & {
	textBox?: FileBodyTextBox;
	content?: FileBodyContentApi;
	elements?: (FileBodyItemApi | undefined)[];
	links?: FileBrowserLinks;
	setViewIndex?: (idx: number) => void;
	updateViewMode?: () => void;
	updateFiles?: () => void;
	resize?: () => void;
	computeGridProperties?: () => void;
	updateContentSize?: () => void;
	updateContentOffset?: () => void;
	resetContentStyle?: () => void;
	createFlatItems?: (dir: FileBodyFile[]) => void;
	select?: (...files: FileBodyFile[]) => void;
	selectAll?: () => void;
	unselect?: () => void;
	selectByPath?: (path: string) => void;
	selectDefault?: () => void;
	selectRelativeInGridMode?: (direction: 'prev' | 'next' | 'prev-line' | 'next-line') => void;
	getDirName?: () => string;
	createFolder?: () => void;
	showInExplorer?: () => void;
	openFileLocation?: (file: FileBodyFile) => void;
	openFile?: (file: FileBodyFile) => void;
	copyFiles?: (cut?: boolean) => void;
	pasteFiles?: (targetPath?: string) => void;
	deleteFiles?: () => void;
	rename?: (file: FileBodyFile) => void;
	cancelRenaming?: () => void;
	importFiles?: () => void;
	exportFile?: () => void;
	clearElements?: (start: number) => void;
	clear?: () => HTMLElement;
	on?: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
};

/** P4b：内容元素上的元素数据（`count` 仍在 DATA_FIELDS 内） */
const contentData = (el: unknown): { count?: number } => elementDataOf<{ count?: number }>(el);

/** P4b：行元素上的元素数据（`changed` 仍在 DATA_FIELDS 内） */
const rowData = (el: unknown): { changed?: boolean } => elementDataOf<{ changed?: boolean }>(el);

interface Props {
	links: FileBrowserLinks;
	dataApi?: { manifest: { guidMap: Record<string, FileBodyMeta> } };
	windowApi?: {
		confirm(options: { message: string }, items: { label: string; click?: () => void }[]): void;
		getTopWindow(): { id?: string } | null;
	};
	glApi?: { maxTexSize: number };
	menuState?: () => string;
	clipboardApi?: {
		write(type: string, data: unknown): void;
		read(type: string): { cut?: boolean; guids?: string[] } | null;
	};
	referenceApi?: {
		findRelated(guid: string): FileBodyRelatedList | null;
		openList(list: FileBodyRelatedList | null): void;
		openRelated(guid: string): void;
	};
	localize?: { createGetter(key: string): (key: string) => string };
	editorApi?: { config: { dialogs: { import?: string; export?: string } } };
	directoryApi?: {
		sortFiles(dir: FileBodyFile[]): void;
		getFolder(path: string): FileBodyFile | null;
		update(): Promise<boolean>;
		deleteFiles(files: FileBodyFile[]): Promise<void>;
		moveFiles(path: string, dir: FileBodyFile[]): Promise<void>;
		copyFiles(path: string, dir: FileBodyFile[], prefix?: string): Promise<void>;
		saveFiles(files: FileBodyFile[]): Promise<void>;
		readdir(paths: string[]): Promise<FileBodyFile[]>;
		assets: FileBodyFile | null;
		/**
		 * inode → 文件引用 的映射。
		 *
		 * **口径收紧（2026-09-20）**：全仓**其余** 5 处 `inoMap` 声明（`YMFileNavPane.vue:143`、
		 * `file-nav-pane-core.ts:43/138`、`YMFileBrowser.vue:347`、`directory-tree.ts:30`、
		 * `directory-object.ts:17`）**全都是 `Record<string, unknown>`**，只有这一处还写着 `any`。
		 * 而真正的提供方是 `Directory.inoMap`（`directory-object.ts:17`，即 `Record<string, unknown>`）
		 * ⇒ 原先的 `any` 比它的实际来源还宽，属纯粹的孤例，直接对齐。
		 */
		inoMap: Record<string, unknown>;
	};
	fileSystemApi?: {
		path(p: string): string;
		route(p: string): string;
		getPath(guid: string): string;
		getFileName(dir: string, name: string, ext?: string): { path: string; route: string };
		getImageResolution(p: string): Promise<{ width: number; height: number }>;
		showInExplorer(p: string): void;
		showOpenDialog(options: {
			defaultPath?: string;
			filters?: { name: string; extensions: string[] }[];
			properties?: string[];
		}): Promise<{ filePaths: string[] }>;
		showSaveDialog(options: { defaultPath?: string }): Promise<{ filePath?: string }>;
		mkdir(p: string, options?: { recursive?: boolean }): Promise<void>;
		// oxlint-disable-next-line no-explicit-any
		copyFile(src: string, dst: string): Promise<any>;
		// oxlint-disable-next-line no-explicit-any
		stat(p: string, bigint?: boolean): Promise<any>;
		// oxlint-disable-next-line no-explicit-any
		rename(oldPath: string, newPath: string): Promise<any>;
		existsSync(p: string): boolean;
		addOversizeImagePaths(p: string): void;
	};
	pathUtil?: {
		dirname(p: string): string;
		normalize(p: string): string;
		slash(p: string): string;
		extname(p: string): string;
		basename(p: string, ext?: string): string;
		resolve(...paths: string[]): string;
	};
	// oxlint-disable-next-line no-explicit-any
	fileClasses?: { FileItem: any; FolderItem: any };
	setIconClip?: (
		icon: HTMLElement,
		path: string,
		cx: number,
		cy: number,
		cw: number,
		ch: number
	) => void;
	// oxlint-disable-next-line no-explicit-any
	createTextBox?: () => any;
}

const props = withDefaults(defineProps<Props>(), {
	dataApi: () => ({ manifest: { guidMap: {} } }),
	windowApi: () => ({ confirm: () => {}, getTopWindow: () => null }),
	glApi: () => ({ maxTexSize: 0 }),
	menuState: () => '',
	clipboardApi: () => ({ write: () => {}, read: () => null }),
	referenceApi: () => ({
		findRelated: () => ({ isEmpty: true }),
		openList: () => {},
		openRelated: () => {}
	}),
	localize: () => ({ createGetter: () => () => '' }),
	editorApi: () => ({ config: { dialogs: {} } }),
	directoryApi: () => ({
		sortFiles: () => {},
		getFolder: () => null,
		update: () => Promise.resolve(false),
		deleteFiles: () => Promise.resolve(),
		moveFiles: () => Promise.resolve(),
		copyFiles: () => Promise.resolve(),
		saveFiles: () => Promise.resolve(),
		readdir: () => Promise.resolve([]),
		assets: null,
		inoMap: {}
	}),
	fileSystemApi: () => ({
		path: (p: string) => p,
		route: (p: string) => p,
		getPath: (p: string) => p,
		getFileName: () => ({ path: '', route: '' }),
		getImageResolution: () => Promise.resolve({ width: 0, height: 0 }),
		showInExplorer: () => {},
		showOpenDialog: () => Promise.resolve({ filePaths: [] }),
		showSaveDialog: () => Promise.resolve({}),
		mkdir: () => Promise.resolve(),
		copyFile: () => Promise.resolve(),
		stat: () => Promise.resolve(),
		rename: () => Promise.resolve(),
		existsSync: () => false,
		addOversizeImagePaths: () => {}
	}),
	pathUtil: () => ({
		dirname: () => '',
		normalize: (p: string) => p,
		slash: (p: string) => p,
		extname: () => '',
		basename: (p: string) => p,
		resolve: (...p: string[]) => p.join('/')
	}),
	fileClasses: () => ({ FileItem: null, FolderItem: null }),
	setIconClip: () => {},
	createTextBox: () => null
});

const FileItem = props.fileClasses?.FileItem;
const FolderItem = props.fileClasses?.FolderItem;
const Directory = props.directoryApi;
const File = props.fileSystemApi;
const FSP = props.fileSystemApi;
const Path = props.pathUtil;
const Data = props.dataApi;
const Window = props.windowApi;
const GL = props.glApi;
const Menu = props.menuState;
const Clipboard = props.clipboardApi;
const Reference = props.referenceApi;
const Local = props.localize;
const Editor = props.editorApi;

const encodeURL = (string: string): string => {
	const regexp = /([()])/g;
	return `url(${encodeURI(string).replace(regexp, '\\$1')})`;
};

const el = ref<HTMLElement>();
const contentEl = ref<HTMLElement>();

let viewIndex: number | null = null;
let viewMode: string | null = null;
let timerCallback: () => void = () => {};
const timer: {
	target: HTMLElement | null;
	running: boolean;
	elapsed: number;
	timeoutId: ReturnType<typeof setTimeout> | null;
	add(): void;
	remove(): void;
} = {
	target: null,
	running: false,
	elapsed: 0,
	timeoutId: null as ReturnType<typeof setTimeout> | null,
	add(): void {
		this.timeoutId = setTimeout(() => {
			this.timeoutId = null;
			this.elapsed = 500;
			timerCallback();
		}, 500);
	},
	remove(): void {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
};
let elements: (FileBodyItemApi | undefined)[] & {
	count: number;
	start: number;
	end: number;
	cpl: number;
};
let activeFile: FileBodyFile | null = null;
/**
 * M3 切片 5a（api 数据化）：扁平化后的**文件数据**（排序后，与 `elements` 同序）。
 * 选区/导航/默认选中一律读它——窗口外的行在 `elements[]` 里是空槽，读元素会让这些方法
 * 只对"当前渲染出的一段"生效；数据层没有这个问题，也正好是后续模板换源的前提。
 */
let flatFiles: FileBodyFile[] = [];
let selections: FileBodyFile[] = [];
let pressing: ((event: PointerEvent) => void) | null = null;
let openEventEnabled = false;
let selectEventEnabled = false;
let unselectEventEnabled = false;
let popupEventEnabled = false;
let textBox: FileBodyTextBox;
let windowKeydownHandler: (event: KeyboardEvent) => void;
let windowResizeHandler: () => void;
let resizeObserver: ResizeObserver | null = null;

function setViewIndex(idx: number): void {
	idx = core.clamp(idx, 0, 4);
	if (viewIndex !== idx) {
		const { head } = props.links;
		viewIndex = idx;
		// 能改视图下标说明浏览器的 setupLinks() 早已跑过（head 已挂上）
		head!.view.write(idx);
		updateViewMode();
	}
}

function updateViewMode(): void {
	let mode: string | null = null;
	switch (viewIndex) {
		case 0:
			mode = 'list';
			break;
		case 1:
			mode = 'small';
			break;
		case 2:
			mode = 'medium';
			break;
		case 3:
			mode = 'large';
			break;
		case 4:
			mode = 'huge';
			break;
	}
	if (viewMode !== mode) {
		const node = el.value as FileBodyPaneApi;
		if (mode === 'list') addClass(node, 'horizontal');
		else removeClass(node, 'horizontal');
		const content = contentEl.value as FileBodyContentApi;
		removeClass(content, viewMode!);
		addClass(content, mode!);
		resetContentStyle();
		viewMode = mode;
		computeGridProperties();
		resize();
		updateContentOffset();
	}
}

function getFiles(): FileBodyFile[] {
	const { browser, nav } = props.links;
	const folders = nav.selections;
	const filters = browser.filters;
	if (!filters) {
		let length = 0;
		for (const folder of folders) {
			length += folder.children.length;
		}
		let i = 0;
		const items = Array.from<FileBodyFile>({ length });
		for (const folder of folders) {
			for (const item of folder.children) {
				items[i++] = item;
			}
		}
		return items;
	}
	const items: FileBodyFile[] = [];
	for (const folder of folders) {
		for (const item of folder.children) {
			if (item instanceof FolderItem || filters.includes(item.type)) {
				items.push(item);
			}
		}
	}
	return items;
}

function updateFiles(): void {
	const els = elements;
	els.start = -1;
	els.count = 0;

	const { browser } = props.links;
	switch (browser.display) {
		case 'normal':
			createFlatItems(getFiles());
			break;
		case 'search':
			createFlatItems(browser.searchResults!);
			break;
	}

	clearElements(els.count);
	resize();
}

/** M3 切片 5 前置：单个可见行的**模板所需数据**（与 DOM 双写，便于逐项核对） */
export interface FileBodyRowDescriptor {
	key: string;
	/** 全局行下标（在全部行中的位置） */
	index: number;
	/** 显示名（原 `updateFileElement` 取 `file.basename`） */
	name: string;
	isFolder: boolean;
	/** 该行当前是否被选中（原实现通过 `selected` 类表达） */
	selected: boolean;
	/** 定位样式（原实现直接写 `element.style`） */
	style: { left: string; top: string };
}

/** M3 切片 3：可见行的**数据模型**（供 `v-for` 换源前的等价性验证与后续模板化使用） */
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
	/** M3 切片 5 前置：模板渲染一行所需的全部数据（与 DOM 双写） */
	rows: FileBodyRowDescriptor[];
}

const rowModel = shallowRef<FileBodyRowModel>({
	start: 0,
	end: 0,
	countPerLine: 0,
	viewMode: 'list',
	keys: [],
	rows: []
});

/** M3 切片 5b：模板渲染的可见行（= 行描述，由 `resize()` 更新） */
const visibleRows = computed<FileBodyRowDescriptor[]>(() => rowModel.value.rows);

/**
 * M3 切片 5b：`:ref` 回写桥。模板渲染出行元素后，把它登记进 api 的簿记
 * （`elements[]` 与 `file.context.element`），并沿用既有 `updateOnResize`
 * 生成图标、名称与拖拽属性——这三块的实现没有改动。
 */
function bindRowElement(
	row: FileBodyRowDescriptor,
	target: Element | ComponentPublicInstance | null
): void {
	// 注意：`ComponentPublicInstance` 是**类型**，运行时不存在，不能 `instanceof`；
	// 行元素一定是 `HTMLElement`，据此判别即可。
	if (!(target instanceof HTMLElement)) return;
	const node = target as FileBodyItemApi;
	const file = flatFiles[row.index];
	if (file === undefined) return;
	const pane = el.value as FileBodyPaneApi;
	const context = file.getContext(pane);
	node.rowKey = row.key;
	node.file = file;
	node.context = context;
	context.element = node;
	rowData(node).changed = true;
	elements[row.index] = node;
	updateOnResize(node);
}

/**
 * M5：重建可见行描述（模板的渲染数据源）。
 * **每次 `resize()` 都调用**（不再只在窗口变化时）——文件名、选中态等数据可能已变，
 * 而改名如今走"模型 → 模板"，不再有 `updateFileElement` 直接写 DOM 的兜底。
 */
function rebuildRowDescriptors(start: number, end: number, cpl: number): void {
	const content = contentEl.value as FileBodyContentApi;
	const { countPerLine, itemSize, itemWidth } = content;
	const descriptors: FileBodyRowDescriptor[] = [];
	const keys: string[] = [];
	for (let i = start; i < end; i++) {
		const file = flatFiles[i];
		if (file === undefined) continue;
		let left: string;
		let top: string;
		if (viewMode === 'list') {
			const col = Math.floor(i / countPerLine!);
			const row = i % countPerLine!;
			left = `${col * itemWidth! + 4}px`;
			top = `${row * 20}px`;
		} else {
			const col = i % countPerLine!;
			const row = Math.floor(i / countPerLine!);
			left = `${col * itemWidth! + 4}px`;
			top = `${row * itemSize! + 4}px`;
		}
		const key = fileRowKeyOf(file);
		keys.push(key);
		descriptors.push({
			key,
			index: i,
			// 命名与命令式实现一致：文件用 `basename`（`updateFileElement`），文件夹用 `name`（`updateFolderElement`）
			name:
				file instanceof FileItem
					? ((file as { basename?: string }).basename ?? '')
					: file.name,
			isFolder: !(file instanceof FileItem),
			selected: selections.includes(file),
			style: { left, top }
		});
	}
	rowModel.value = {
		start,
		end,
		countPerLine: cpl,
		viewMode: viewMode ?? 'list',
		keys,
		rows: descriptors
	};
}

function resize(): void {
	const node = el.value as FileBodyPaneApi;
	const ch = node.clientHeight;
	const els = elements;
	if (ch === 0) return;
	const [start, end] = computeStartAndEnd();
	updateContentSize();
	const cpl = (contentEl.value as FileBodyContentApi).countPerLine!;
	if (els.start !== start || els.end !== end || els.cpl !== cpl) {
		els.start = start;
		els.end = end;
		els.cpl = cpl;
		updateContentOffset();
	}
	// M3 切片 5b：行描述**只从数据算**（不再从 DOM 反读）——模板照它渲染行，
	// api 不再建/挂/摘元素（Vue 负责生命周期，元素经 `bindRowElement` 回写）。
	// M5：**每次 resize 都重建**（不再只在窗口变化时），这样改名等数据变化能经模型反映到模板。
	rebuildRowDescriptors(start, end, cpl);
}

/** M3 切片 3：读取可见行模型（只读副本，避免调用方改到内部状态） */
function getRowModel(): FileBodyRowModel {
	return {
		...rowModel.value,
		keys: [...rowModel.value.keys],
		rows: rowModel.value.rows.map((row) => ({ ...row, style: { ...row.style } }))
	};
}

/**
 * M3 切片 5 前置：只刷新行描述里的**选中态**（选中/取消选中不触发 `resize`，
 * 但模板换源后 `selected` 需要即时反映；只改这一个字段，避免整份模型重建）。
 */
function refreshRowSelection(): void {
	const rows = rowModel.value.rows;
	if (rows.length === 0) return;
	const next: FileBodyRowDescriptor[] = [];
	for (const row of rows) {
		const element = elements[row.index] as FileBodyItemApi | undefined;
		next.push(
			element === undefined ? row : { ...row, selected: hasClass(element, 'selected') }
		);
	}
	rowModel.value = { ...rowModel.value, rows: next };
}

function applyGridMetrics(metrics: GridMetrics): void {
	const content = contentEl.value as FileBodyContentApi;
	content.itemSize = metrics.itemSize;
	content.itemWidth = metrics.itemWidth;
	content.visibleLines = metrics.visibleLines;
	content.normalCountPerLine = metrics.normalCountPerLine;
	content.scrollCountPerLine = metrics.scrollCountPerLine;
	content.scrollCount = metrics.scrollCount;
}

function computeGridProperties(): void {
	const node = el.value as FileBodyPaneApi;
	const nodeRect = rect(node);
	if (nodeRect.width <= 0) return;
	const content = contentEl.value as FileBodyContentApi;
	contentData(content).count = -1;
	elements.start = -1;
	elements.end = -1;
	// M2 切片 5：模式 → 度量 的映射改由派生层给（`list`/`small`/`medium`/`large`/`huge` 与原先同一张表；
	// 未知/未定的 viewMode 与原 `switch` 一样"什么都不设"）
	if (!VIEW_MODE_BY_INDEX.includes(viewMode as FileBodyViewMode)) return;
	applyGridMetrics(
		computeViewMetrics(viewMode as FileBodyViewMode, core, {
			width: nodeRect.width,
			height: nodeRect.height
		})
	);
}

function computeStartAndEnd(): Uint32Array {
	const node = el.value as FileBodyPaneApi;
	const content = contentEl.value as FileBodyContentApi;
	const range = content.range!;
	const count = elements.count;
	const scroll =
		viewMode === 'list' ? Math.max(node.scrollLeft - 4, 0) : Math.max(node.scrollTop - 4, 0);
	const { countPerLine, itemSize, visibleLines } = content;
	const { start, end } = core.computeVisibleRange(
		scroll,
		count,
		countPerLine!,
		itemSize!,
		visibleLines!
	);
	range[0] = start;
	range[1] = end;
	return range;
}

function updateContentSize(): void {
	const node = el.value as FileBodyPaneApi;
	const content = contentEl.value as FileBodyContentApi;
	const data = contentData(content);
	const count = elements.count;
	const cpl = content.countPerLine;
	if (node.clientHeight !== 0 && (data.count !== count || content.cpl !== cpl)) {
		data.count = count;
		content.cpl = cpl;
		const PADDING = 4;
		const GAP = 2;
		const { style, countPerLine, itemSize } = content;
		const lines = Math.ceil(count / countPerLine!);
		const length = Math.max(lines * itemSize! - GAP, 0) + PADDING * 2;
		if (viewMode === 'list') {
			style.width = `${length}px`;
		} else {
			style.height = `${length}px`;
		}
	}
}

function updateContentOffset(): void {
	const content = contentEl.value as FileBodyContentApi;
	const { style } = content;
	style.paddingLeft = '';
	style.paddingTop = '';
}
function resetContentStyle(): void {
	const content = contentEl.value as FileBodyContentApi;
	contentData(content).count = -1;
	content.cpl = -1;
	const { style } = content;
	switch (viewMode) {
		case 'list':
			style.width = '';
			style.paddingLeft = '';
			break;
		default:
			style.height = '';
			style.paddingTop = '';
			break;
	}
}

function updateOnResize(element: FileBodyItemApi): void {
	const data = rowData(element);
	if (data.changed) {
		data.changed = false;
		const { file } = element;
		if (file instanceof FileItem) {
			updateFileElement(element);
			return;
		}
		if (file instanceof FolderItem) {
			updateFolderElement(element);
			return;
		}
	}
}

/**
 * M3 切片 5b：`createFlatItems` 只记录数据（排序后的文件列表 + 行数）；
 * 行元素由模板 `v-for` 渲染，经 `bindRowElement` 回写进 `elements[]`。
 */
function createFlatItems(dir: FileBodyFile[]): void {
	Directory?.sortFiles(dir);
	flatFiles = dir;
	elements.count = dir.length;
}

/**
 * M5（换源后清理）：`createFolderElement` / `createFileElement` 已随切片 5b 删除——
 * 行元素现在由模板渲染，登记工作由 `bindRowElement` 承担（做的是同一件事：
 * 挂 `file`/`context`/`rowKey` 并标记 `changed`），这两个函数因此成了死代码。
 */

function updateFolderElement(element: FileBodyItemApi): void {
	if (!element.nameBox) {
		// M5：名字同样由**模板**渲染（`{{ row.name }}`）⇒ 只能复用模板那一个，不能再 append
		// 第二个（否则一行里出现两个 `.file-body-name`，改名时还会 hide 错节点）；
		// 图标插到名字**之前**，保持与命令式实现一致的"图标 + 名字"顺序。
		const nameBox = element.querySelector('.file-body-name') as HTMLElement | null;
		const fileIcon = renderElement(h('span', { class: ['file-body-icon', 'icon-folder'] }));
		if (nameBox) {
			element.insertBefore(fileIcon, nameBox);
			element.nameBox = nameBox;
		} else {
			element.appendChild(fileIcon);

			const created = renderElement(h('span', { class: 'file-body-name' }));
			created.textContent = element.file.name;
			element.appendChild(created);
			element.nameBox = created;
		}

		element.draggable = true;
		element.fileIcon = fileIcon;
	}
}

function updateFileElement(element: FileBodyItemApi): void {
	const { file } = element;
	// M5：名字那一段由**模板**渲染（`{{ row.name }}`）⇒ 这里只补图标，并把它插到名字之前；
	// 名字本身不再由 api 写（改名走模型 → 模板重渲染）。
	const nameBox =
		element.nameBox ?? (element.querySelector('.file-body-name') as HTMLElement | null);
	if (!element.nameBox && nameBox) element.nameBox = nameBox;
	if (!element.fileIcon) {
		const fileIcon = createIcon(file);
		if (nameBox) element.insertBefore(fileIcon, nameBox);
		else element.appendChild(fileIcon);
		if (!nameBox) {
			const created = renderElement(h('span', { class: 'file-body-name' }));
			created.textContent = file.basename;
			element.appendChild(created);
			element.nameBox = created;
		}

		element.draggable = true;
		element.fileIcon = fileIcon;

		const { selections: sels } = { selections };
		if (sels.length !== 0 && sels.includes(file)) {
			addClass(element, 'selected');
		}
	}
	if (element.fileIcon!.isImageChanged?.()) {
		updateIcon(file);
	}
}

function createIcon(file: FileBodyFile): HTMLElement {
	const icon = renderElement(h('span', { class: 'file-body-icon' }));
	switch (file.type) {
		case 'actor': {
			const data = file.data;
			if (!data?.portrait) {
				addClass(icon, 'icon-file-actor');
				break;
			}
			const meta = Data.manifest.guidMap[data.portrait];
			const [cx, cy, cw, ch] = data.clip!;
			if (!meta || cw * ch === 0) break;
			const version = meta.mtimeMs;
			const path = `${File?.getPath(data.portrait)}?ver=${version}`;
			(icon as FileBodyIconApi).isImageChanged = () => version !== meta.mtimeMs;
			props.setIconClip?.(icon, path, cx, cy, cw, ch);
			break;
		}
		case 'skill':
		case 'item':
		case 'equipment':
		case 'state': {
			const data = file.data;
			if (!data?.icon) {
				addClass(icon, 'icon-file-cube');
				break;
			}
			const meta = Data.manifest.guidMap[data.icon];
			const [cx, cy, cw, ch] = data.clip!;
			if (!meta || cw * ch === 0) break;
			const version = meta.mtimeMs;
			const path = `${File?.getPath(data.icon)}?ver=${version}`;
			(icon as FileBodyIconApi).isImageChanged = () => version !== meta.mtimeMs;
			props.setIconClip?.(icon, path, cx, cy, cw, ch);
			break;
		}
		case 'trigger':
			addClass(icon, 'icon-file-trigger');
			break;
		case 'event':
			addClass(icon, 'icon-file-event');
			icon.textContent = 'EV';
			if (!file.data?.enabled) {
				addClass(icon, 'disabled');
			}
			break;
		case 'scene':
			addClass(icon, 'icon-file-scene');
			break;
		case 'tileset':
			addClass(icon, 'icon-file-tileset');
			break;
		case 'ui':
			addClass(icon, 'icon-file-ui');
			break;
		case 'animation':
			addClass(icon, 'icon-file-animation');
			break;
		case 'particle':
			addClass(icon, 'icon-file-particle');
			break;
		case 'image': {
			const version = file.stats!.mtimeMs;
			const path = `${file.path}?ver=${version}`;
			icon.style.backgroundImage = encodeURL(File?.route(path) ?? path);
			File?.getImageResolution(path).then(
				({ width, height }: { width: number; height: number }) => {
					if (width <= 128 && height <= 128) {
						icon.style.imageRendering = 'pixelated';
					}
					if (Math.max(width, height) > GL.maxTexSize) {
						FileItem?.addOversizeImagePaths(file.path);
					}
				}
			);
			break;
		}
		case 'audio':
			addClass(icon, 'icon-file-event');
			addClass(icon, 'icon-file-audio');
			icon.textContent = '\uf028';
			break;
		case 'video':
			addClass(icon, 'icon-file-event');
			addClass(icon, 'icon-file-video');
			icon.textContent = '\uf008';
			break;
		case 'font':
			addClass(icon, 'icon-file-font');
			break;
		case 'script':
			addClass(icon, 'icon-file-event');
			addClass(icon, 'icon-file-script');
			switch (file.extname) {
				case '.js':
					icon.textContent = 'JS';
					break;
				case '.ts':
					icon.textContent = 'TS';
					break;
			}
			break;
		default:
			addClass(icon, 'icon-file-other');
			icon.textContent = file.extname.slice(1);
			break;
	}
	return icon;
}

function updateIcon(file: FileBodyFile): void {
	const node = el.value as FileBodyPaneApi;
	const { element } = file.getContext(node);
	if (element?.fileIcon) {
		const icon = createIcon(file);
		element.replaceChild(icon, element.fileIcon);
		element.fileIcon = icon;
	}
}

/**
 * 按下文件行时的「激活」入口：**先看元素上的覆写**，没有才走本实现。
 *
 * legacy 里这里是 `this.activateFile(...)`——元素成员，所以选择器窗口能把它换成 `select`
 * （`Selector.body.activateFile = Selector.body.select`，按下即选中）。换源后闭包直调会让那行
 * 赋值变成死代码。
 */
function activateFileViaElement(file: FileBodyFile): void {
	const host = el.value as
		| (FileBodyPaneApi & { activateFile?: (file: FileBodyFile) => void })
		| undefined;
	const override = host?.activateFile;
	if (typeof override === 'function' && override !== activateFile) {
		override.call(host, file);
		return;
	}
	activateFile(file);
}

function activateFile(file: FileBodyFile): void {
	const node = el.value as FileBodyPaneApi;
	if (file instanceof FolderItem) {
		return select(file);
	}
	activeFile = file;
	if (!selections.includes(file)) {
		const context = file.getContext(node);
		addClass(context.element!, 'selected');
		for (const f of selections) {
			const c = f.getContext(node);
			if (c.element) removeClass(c.element, 'selected');
		}
	}
	const pointerup = (_event: PointerEvent) => {
		if (pressing === pointerup) {
			pressing = null;
			selectActiveFile();
		}
	};
	pressing = pointerup;
	window.addEventListener('pointerup', pointerup, { once: true });
}

function selectActiveFile(): void {
	if (activeFile instanceof FileItem) {
		if (!selections.includes(activeFile!)) {
			select(activeFile!);
		}
		activeFile = null;
	}
}

/**
 * 取消激活文件（legacy `deactivateFile`）：撤掉按下的临时高亮并恢复选中项的高亮。
 *
 * 拖拽流程会用到它——`YMFileBrowser.dragstart`/`dragend` 在**元素上**读 `activeFile`、
 * 写 `pressing`、调 `selectActiveFile`/`deactivateFile`；这些在 legacy 里都是元素成员，
 * 换源后成了本模块的闭包变量，不暴露出去就是"读写全落空"（拖未选中的文件会拖空）。
 */
function deactivateFile(): void {
	if (activeFile instanceof FileItem) {
		const node = el.value as FileBodyPaneApi;
		if (!selections.includes(activeFile!)) {
			const context = activeFile!.getContext(node);
			if (context.element) removeClass(context.element, 'selected');
			for (const file of selections) {
				const fileContext = file.getContext(node);
				if (fileContext.element) addClass(fileContext.element, 'selected');
			}
		}
		activeFile = null;
	}
}

function select(...files: FileBodyFile[]): void {
	const node = el.value as FileBodyPaneApi;
	unselect();
	selections = files;
	for (const file of files) {
		const context = file.getContext(node);
		if (context.element) addClass(context.element, 'selected');
	}
	// M3 切片 5 前置：选中态也要进入行描述（选中不触发 resize，模板换源后需要这里补一次）
	refreshRowSelection();
	if (selectEventEnabled) {
		const select = new Event('select') as FileBodyEvent;
		select.value = files;
		node.dispatchEvent(select);
	}
}

/**
 * M3 切片 5a（api 数据化）：全选读**数据**（`flatFiles`）而不是元素槽位。
 * 顺带修掉一个潜在缺陷：原先按 `elements[i].file` 取，而窗口外的行槽位是 `undefined`，
 * 于是"全选"只会选到当前渲染出的那一段。
 */
function selectAll(): void {
	const files = flatFiles.slice();
	select(...files);
}

function unselect(): void {
	const node = el.value as FileBodyPaneApi;
	const files = selections;
	if (files.length !== 0) {
		textBox?.input?.blur?.();
		for (const file of files) {
			const context = file.getContext(node);
			const element = context.element;
			if (element !== undefined) {
				removeClass(element, 'selected');
			}
		}
		selections = [];
		// M3 切片 5 前置：取消选中同样要回写行描述
		refreshRowSelection();
		if (unselectEventEnabled) {
			const unselect = new Event('unselect') as FileBodyEvent;
			unselect.value = files;
			node.dispatchEvent(unselect);
		}
	}
}

function selectByPath(path: string): void {
	// M3 切片 5a：按路径查找走数据层（窗口外的行同样能被选中）
	for (const file of flatFiles) {
		if (file.path === path) {
			return select(file);
		}
	}
	unselect();
}

function selectDefault(): void {
	// M3 切片 5a：默认选中第一行，同样取数据（`els[i]` 在窗口外是空槽）
	if (flatFiles.length !== 0) {
		select(flatFiles[0]);
	}
}

function selectRelativeInGridMode(direction: 'prev' | 'next' | 'prev-line' | 'next-line'): void {
	// M3 切片 5a：网格导航全部走数据层（下标即数据下标，不再依赖"元素是否已渲染"）
	const count = flatFiles.length;
	if (count > 0) {
		let start = Infinity;
		let end = -Infinity;
		const { selections: sels } = { selections };
		for (const file of sels) {
			const idx = flatFiles.indexOf(file);
			if (idx !== -1) {
				start = Math.min(start, idx);
				end = Math.max(end, idx);
			}
		}
		const { countPerLine } = contentEl.value as FileBodyContentApi;
		const index = core.computeNavigationIndex(
			direction,
			count,
			countPerLine!,
			start !== Infinity,
			start,
			end
		);
		const file = flatFiles[index];
		if (file === undefined) return;
		if (!(sels.length === 1 && sels[0] === file)) {
			select(file);
		}
		scrollToSelectionInGridMode();
	}
}

function scrollToSelectionInGridMode(mode: string = 'active'): void {
	const node = el.value as FileBodyPaneApi;
	const { selections: sels } = { selections };
	if (sels.length === 1 && hasScrollBar(node)) {
		const selection = sels[0];
		const els = elements;
		const count = els.count;
		for (let i = 0; i < count; i++) {
			if (els[i]!.file === selection) {
				const size = (contentEl.value as FileBodyContentApi).itemSize!;
				const apl = (contentEl.value as FileBodyContentApi).countPerLine!;
				const pos = Math.floor(i / apl) * size;
				const PADDING = 4;
				const GAP = 2;
				let property: 'scrollLeft' | 'scrollTop';
				let clientSize: number;
				switch (viewMode) {
					case 'list':
						property = 'scrollLeft';
						clientSize = node.clientWidth;
						break;
					default:
						property = 'scrollTop';
						clientSize = node.clientHeight;
						break;
				}
				let scroll = node[property];
				switch (mode) {
					case 'active':
						scroll = core.clamp(
							scroll,
							pos + size + PADDING * 2 - GAP - clientSize,
							pos
						);
						break;
					default:
						return;
				}
				if (node[property] !== scroll) {
					node[property] = scroll;
				}
				break;
			}
		}
	}
}

function getDirName(): string {
	let dirname = '';
	const files = selections;
	switch (files.length) {
		case 0: {
			const { nav } = props.links;
			const folders = nav.selections;
			if (folders.length === 1) {
				dirname = folders[0].path;
			}
			break;
		}
		case 1: {
			const file = files[0];
			dirname = file.path;
			if (file instanceof FileItem) {
				dirname = Path?.dirname(dirname) ?? '';
			}
			break;
		}
	}
	return dirname;
}

function createFolder(): void {
	const dirname = getDirName();
	if (dirname) {
		const { path, route } = File?.getFileName(dirname, 'New Folder') ?? { path: '', route: '' };
		FSP?.mkdir(route, { recursive: true })
			.then(() => Directory?.update())
			.then((changed: boolean) => {
				if (changed) {
					const folder = Directory?.getFolder(path);
					if (folder?.path === path) {
						props.links.nav.load(folder.parent!);
						select(folder);
						rename(folder);
					}
				}
			});
	}
}

function showInExplorer(): void {
	const node = el.value as FileBodyPaneApi;
	let length = 0;
	const els = elements;
	for (const file of selections) {
		const { element } = file.getContext(node);
		if (els.includes(element!)) {
			File?.showInExplorer(File?.path(file.path) ?? file.path);
			if (++length === 10) break;
		}
	}
}

function openFileLocation(file: FileBodyFile): void {
	if (file) {
		const folder = Directory?.getFolder(file.path);
		if (folder instanceof FolderItem) {
			const { nav } = props.links;
			nav.load(folder!);
			nav.scrollToSelection('middle');
		}
	}
}

function openFile(file: FileBodyFile): void {
	const node = el.value as FileBodyPaneApi;
	if (file instanceof FolderItem) {
		const { nav } = props.links;
		nav.load(file);
		nav.scrollToSelection('middle');
	}
	if ((file instanceof FileItem || file?.meta?.guid) && openEventEnabled) {
		const open = new Event('open') as FileBodyEvent;
		open.value = file;
		node.dispatchEvent(open);
	}
}

function copyFiles(cut: boolean = false): void {
	const guids: string[] = [];
	for (const file of selections) {
		if (file instanceof FolderItem) return;
		if (file instanceof FileItem) {
			guids.push(file.meta!.guid);
		}
	}
	if (guids.length !== 0) {
		Clipboard?.write('yami.files', { cut, guids });
	}
}

function pasteFiles(targetPath?: string): void {
	const { browser, nav } = props.links;
	if (!targetPath && nav.selections.length === 1) {
		targetPath = nav.selections[0].path;
	}
	if (!targetPath) return;
	const copy = Clipboard?.read('yami.files');
	if (copy) {
		const files: FileBodyFile[] = [];
		for (const guid of copy.guids!) {
			const meta = Data.manifest.guidMap[guid];
			if (meta) files.push(meta.file!);
		}
		if (files.length !== 0) {
			const { absolutePaths } = browser.getFilePaths!(files);
			Directory?.readdir(absolutePaths)
				.then((dir: FileBodyFile[]) => {
					const path = File?.path(targetPath) ?? targetPath;
					return copy.cut
						? Directory!.moveFiles(path, dir)
						: Directory!.saveFiles(files).then(() => Directory!.copyFiles(path, dir));
				})
				.finally(() => {
					Directory?.update();
				});
		}
		if (copy.cut) {
			Clipboard?.write('yami.no-files', null);
		}
	}
}

function deleteFiles(): void {
	const node = el.value as FileBodyPaneApi;
	const files: FileBodyFile[] = [];
	const { selections: sels } = { selections };
	if (!sels.some((s) => s === Directory?.assets)) {
		const els = elements;
		for (const file of sels) {
			const { element } = file.getContext(node);
			if (els.includes(element!)) {
				files.push(file);
			}
		}
	}
	const { length } = files;
	if (length === 0) return;
	const get = Local?.createGetter('confirmation') ?? (() => '');
	if (length === 1 && files[0] instanceof FileItem) {
		const list = Reference?.findRelated(files[0].meta!.guid);
		if (!list?.isEmpty) {
			Reference?.openList(list);
			return Window?.confirm(
				{
					message: get('deleteReferencedFile').replace(
						'<filename>',
						files[0].alias ?? files[0].name
					)
				},
				[
					{
						label: get('yes'),
						click: () => {
							Directory?.deleteFiles(files).then(() => {
								return Directory?.update();
							});
						}
					},
					{
						label: get('no')
					}
				]
			);
		}
	}
	return Window?.confirm(
		{
			message:
				length === 1
					? get('deleteSingleFile').replace('<filename>', files[0].alias ?? files[0].name)
					: get('deleteMultipleFiles').replace('<number>', String(length))
		},
		[
			{
				label: get('yes'),
				click: () => {
					Directory?.deleteFiles(files).then(() => {
						return Directory?.update();
					});
				}
			},
			{
				label: get('no')
			}
		]
	);
}

function rename(file: FileBodyFile): void {
	const node = el.value as FileBodyPaneApi;
	if (
		document.activeElement === contentEl.value &&
		file !== Directory?.assets &&
		!textBox?.parentNode
	) {
		const context = file.getContext(node);
		const element = context.element;
		if (element && element.parentNode) {
			hide(element.nameBox);
			element.appendChild(textBox);
			textBox.write(file.basename ?? file.name);
			textBox.getFocus('all');
			switch (viewMode) {
				case 'list':
					textBox.fitContent();
					break;
				default:
					textBox.style.width = '';
					break;
			}
		}
	}
}

function cancelRenaming(): void {
	if (timer.target) {
		timer.target = null;
	}
	if (timer.running) {
		timer.running = false;
		timer.remove();
	}
}

function importFiles(): void {
	const { nav } = props.links;
	const folders = nav.selections;
	if (folders.length !== 1) return;
	const folder = folders[0];
	const dialogs: { import?: string; export?: string } = Editor?.config.dialogs ?? {};
	const location = Path?.normalize(dialogs.import!) ?? '';
	const images = ['png', 'jpg', 'jpeg', 'cur', 'webp'];
	const audio = ['mp3', 'm4a', 'ogg', 'wav', 'flac'];
	const videos = ['mp4', 'mkv', 'webm'];
	const fonts = ['ttf', 'otf', 'woff', 'woff2'];
	File?.showOpenDialog({
		defaultPath: location,
		filters: [
			{
				name: 'Resources',
				extensions: [...images, ...audio, ...videos, ...fonts]
			},
			{ name: 'Images', extensions: images },
			{ name: 'Audio', extensions: audio },
			{ name: 'Videos', extensions: videos },
			{ name: 'Fonts', extensions: fonts }
		],
		properties: ['multiSelections']
	}).then(({ filePaths }: { filePaths: string[] }) => {
		if (filePaths.length !== 0) {
			const dir = folder.path;
			const promises: Promise<void>[] = [];
			const length = filePaths.length;
			for (let i = 0; i < length; i++) {
				const src = Path?.slash(filePaths[i]) ?? filePaths[i];
				const ext = Path?.extname(src) ?? '';
				const base = Path?.basename(src, ext) ?? src;
				const dst = File?.getFileName(dir, base, ext)?.route ?? '';
				promises.push(FSP?.copyFile(src, dst) ?? Promise.resolve());
			}
			Promise.all(promises).then(() => {
				return Directory?.update();
			});
			if (dialogs && filePaths.length > 0) {
				dialogs.import = Path?.slash(Path?.dirname(filePaths[0]) ?? '') ?? '';
			}
		}
	});
}

function exportFile(): void {
	const files = selections;
	const dialogs: { import?: string; export?: string } = Editor?.config.dialogs ?? {};
	if (files.length === 1 && files[0] instanceof FileItem) {
		const file = files[0];
		const name = file.basename + file.extname;
		File?.showSaveDialog({
			defaultPath: Path?.resolve(dialogs.export!, name) ?? name
		})
			.then(({ filePath }: { filePath?: string }) => {
				if (filePath) {
					dialogs.export = Path?.slash(Path?.dirname(filePath) ?? '') ?? '';
					return FSP?.copyFile(File?.path(file.path) ?? file.path, filePath);
				}
			})
			.finally(() => {
				Directory?.update();
			});
	} else {
		File?.showOpenDialog({
			defaultPath: Path?.normalize(dialogs.export!) ?? '',
			properties: ['openDirectory']
		})
			.then(({ filePaths }: { filePaths: string[] }) => {
				if (filePaths.length === 1) {
					const dirPath = filePaths[0];
					dialogs.export = Path?.slash(dirPath) ?? '';
					return Directory?.readdir(
						files.map((file) => File?.path(file.path) ?? file.path)
					).then((dir: FileBodyFile[]) => {
						return Directory?.copyFiles(dirPath, dir, '');
					});
				}
			})
			.finally(() => {
				Directory?.update();
			});
	}
}

function clearElements(start: number): void {
	const els = elements;
	if (els.length > 256 && els.length !== start) {
		els.length = start;
	}
	let i = start;
	while (els[i] !== undefined) {
		els[i++] = undefined;
	}
}

function clear(): HTMLElement {
	const node = el.value as FileBodyPaneApi;
	unselect();
	// M3 切片 5b：**不再 `content.textContent = ''`**——行归模板（Vue）管，直接清空会把 Vue 的节点表打乱；
	// 行数只经 `elements.count` / 行模型反映。
	clearElements(0);
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	resetContentStyle();
	// 清空后必须把行模型也归零（否则模型留着旧行、与 DOM 不一致——探针实测 count=0/dom=0 但 modelRows=5）
	rebuildRowDescriptors(0, 0, 0);
	return node;
}

function keydown(event: KeyboardEvent): void {
	const node = el.value as FileBodyPaneApi;
	if ((event as KeyboardEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey) {
		switch (event.code) {
			case 'ArrowUp':
				node.scrollTop -= 20;
				break;
			case 'ArrowDown':
				node.scrollTop += 20;
				break;
			case 'KeyA':
				selectAll();
				break;
			default:
				return;
		}
		event.stopImmediatePropagation();
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Space':
				event.preventDefault();
				return;
			case 'Enter':
			case 'NumpadEnter': {
				const files = selections;
				if (files.length === 1) {
					const file = files[0];
					const { element } = file.getContext(node);
					if (elements.includes(element!)) {
						openFile(file);
					}
				}
				break;
			}
			case 'Delete':
				deleteFiles();
				break;
			case 'Escape':
			case 'Backspace': {
				const { browser } = props.links;
				if (!browser.backToParentFolder!()) return;
				break;
			}
			case 'ArrowLeft':
				event.preventDefault();
				switch (viewMode) {
					case 'list':
						selectRelativeInGridMode('prev-line');
						break;
					default:
						selectRelativeInGridMode('prev');
						break;
				}
				break;
			case 'ArrowRight':
				event.preventDefault();
				switch (viewMode) {
					case 'list':
						selectRelativeInGridMode('next-line');
						break;
					default:
						selectRelativeInGridMode('next');
						break;
				}
				break;
			case 'ArrowUp':
				event.preventDefault();
				switch (viewMode) {
					case 'list':
						selectRelativeInGridMode('prev');
						break;
					default:
						selectRelativeInGridMode('prev-line');
						break;
				}
				break;
			case 'ArrowDown':
				event.preventDefault();
				switch (viewMode) {
					case 'list':
						selectRelativeInGridMode('next');
						break;
					default:
						selectRelativeInGridMode('next-line');
						break;
				}
				break;
			case 'F2': {
				const files = selections;
				if (files.length === 1) {
					cancelRenaming();
					rename(files[0]);
				}
				break;
			}
			default:
				return;
		}
		event.stopImmediatePropagation();
	}
}

function pointerdown(event: PointerEvent): void {
	const node = el.value as FileBodyPaneApi;
	cancelRenaming();
	switch (event.button) {
		case 0:
		case 2: {
			let element = event.target as HTMLElement;
			const content = contentEl.value as FileBodyContentApi;
			if (event.button === 2) {
				focusWithOptions(content, { preventScroll: true });
			}
			if (element === content) {
				element = node;
			}
			if (element === node) {
				if (node.contains(document.activeElement as Node) && isInContent(node, event)) {
					unselect();
				}
			} else {
				if (hasClass(element, 'file-body-icon') || hasClass(element, 'file-body-name')) {
					element = element.parentNode as HTMLElement;
				}
				if (hasClass(element, 'file-body-item')) {
					if (event.altKey && (element as FileBodyItemApi).file instanceof FileItem) {
						Reference?.openRelated((element as FileBodyItemApi).file.meta!.guid);
						event.preventDefault();
						event.stopImmediatePropagation();
						return;
					}
					const sels = selections;
					const length = sels.length;
					if (
						(event as PointerEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey &&
						length !== 0
					) {
						const els = elements;
						const files = Array.from(sels);
						for (let i = length - 1; i >= 0; i--) {
							const { element } = files[i].getContext(node);
							if (!els.includes(element!)) {
								files.splice(i, 1);
							}
						}
						if (!sels.includes((element as FileBodyItemApi).file)) {
							files.push((element as FileBodyItemApi).file);
							select(...files);
						} else if (event.button === 0) {
							const file = (element as FileBodyItemApi).file;
							const index = files.indexOf(file);
							if (index !== -1) files.splice(index, 1);
							const pointerup = (event: PointerEvent) => {
								if (pressing === pointerup) {
									pressing = null;
									if (element.contains(event.target as Node)) {
										select(...files);
									}
								}
							};
							pressing = pointerup;
							window.addEventListener('pointerup', pointerup, { once: true });
						}
						return;
					}
					if (event.shiftKey && length !== 0) {
						const els = elements;
						let start = els.indexOf(element as FileBodyItemApi);
						let end = start;
						for (let i = 0; i < length; i++) {
							const { element } = sels[i].getContext(node);
							const index = els.indexOf(element!);
							if (index !== -1) {
								start = Math.min(start, index);
								end = Math.max(end, index);
							}
						}
						if (start !== -1) {
							const slice = els.slice(start, end + 1);
							select(...slice.map((element) => element!.file));
							return;
						}
					}
					if (!hasClass(element, 'selected')) {
						switch (event.button) {
							case 0:
								activateFileViaElement((element as FileBodyItemApi).file);
								break;
							case 2:
								select((element as FileBodyItemApi).file);
								break;
						}
					} else if (event.button === 0) {
						if (length > 1) {
							const pointerup = (event: PointerEvent) => {
								if (pressing === pointerup) {
									pressing = null;
									if (element.contains(event.target as Node)) {
										select((element as FileBodyItemApi).file);
									}
								}
							};
							pressing = pointerup;
							window.addEventListener('pointerup', pointerup, { once: true });
						} else {
							activateFileViaElement((element as FileBodyItemApi).file);
							if (
								Menu?.() === 'closed' &&
								document.activeElement === content &&
								(event.target as HTMLElement).classList.contains('file-body-name')
							) {
								timer.target = event.target as HTMLElement;
							}
						}
					}
				}
			}
			if (event.target === node) {
				event.preventDefault();
				focusWithOptions(content, { preventScroll: true });
			}
			break;
		}
		case 3: {
			const { browser } = props.links;
			browser.backToParentFolder!();
			break;
		}
	}
}

function pointerup(event: PointerEvent): void {
	const node = el.value as FileBodyPaneApi;
	const content = contentEl.value as FileBodyContentApi;
	switch (event.button) {
		case 0:
			if (document.activeElement === content && timer.target === event.target) {
				timer.running = true;
				timer.elapsed = 0;
				timer.add();
			}
			break;
		case 2:
			if (document.activeElement === content && popupEventEnabled) {
				const popup = new Event('popup') as FileBodyEvent;
				popup.raw = event;
				popup.clientX = event.clientX;
				popup.clientY = event.clientY;
				node.dispatchEvent(popup);
			}
			break;
	}
}

function doubleclick(event: Event): void {
	let element = event.target as HTMLElement;
	if (hasClass(element, 'file-body-icon') || hasClass(element, 'file-body-name')) {
		element = element.parentNode as HTMLElement;
	}
	if (hasClass(element, 'file-body-item')) {
		event.preventDefault();
		cancelRenaming();
		openFile((element as FileBodyItemApi).file);
	}
}

function wheel(event: WheelEvent): void {
	const node = el.value as FileBodyPaneApi;
	const { deltaY } = event;
	if (deltaY !== 0) {
		if ((event as WheelEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey) {
			event.preventDefault();
			const idx = viewIndex!;
			const delta = Math.sign(-deltaY);
			return setViewIndex(idx + delta);
		}
		if (viewMode === 'list' && node.clientWidth < node.scrollWidth) {
			node.scrollLeft += deltaY < 0 ? -60 : 60;
		}
	}
}

function windowKeydown(event: KeyboardEvent): void {
	if (event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				if (!Window?.getTopWindow() || Window?.getTopWindow()?.id === 'selector') {
					addClass(contentEl.value, 'alt');
					window.addEventListener('keyup', windowKeyup);
					window.addEventListener('pointermove', windowPointermove);
				}
				break;
		}
	}
}

function windowKeyup(event: KeyboardEvent): void {
	if (!event.altKey) {
		switch (event.code) {
			case 'AltLeft':
				removeClass(contentEl.value, 'alt');
				window.removeEventListener('keyup', windowKeyup);
				window.removeEventListener('pointermove', windowPointermove);
				break;
		}
	}
}

function windowPointermove(event: PointerEvent): void {
	if (!event.altKey) {
		removeClass(contentEl.value, 'alt');
		window.removeEventListener('keyup', windowKeyup);
		window.removeEventListener('pointermove', windowPointermove);
	}
}

function createTextBox(): FileBodyTextBox {
	const tb = props.createTextBox?.();
	if (!tb) return tb;
	tb.setMaxLength(64);
	addClass(tb, 'file-body-text-box');
	addClass(tb.input, 'file-body-text-box-input');

	// oxlint-disable-next-line no-explicit-any
	tb.addEventListener('keydown', function (this: any, event: KeyboardEvent) {
		event.stopPropagation();
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
			case 'Escape': {
				const item = this.parentNode;
				const content = item.parentNode as HTMLElement;
				this.input.blur();
				focusWithOptions(content, { preventScroll: true });
				break;
			}
		}
	});

	tb.addEventListener('beforeinput', function (event: InputEvent) {
		if (event.inputType === 'insertText' && typeof event.data === 'string') {
			const regexp = /[\\/:*?"<>|]/;
			if (regexp.test(event.data)) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	});

	// oxlint-disable-next-line no-explicit-any
	tb.addEventListener('input', function (this: any, _event: Event) {
		if (this.style.width !== '') {
			this.fitContent();
		}
	});

	tb.addEventListener('select', function (event: Event) {
		event.stopPropagation();
	});

	tb.input.addEventListener('blur', function () {
		const item = tb.parentNode;
		const file = item.file;
		const name = tb.read().trim();
		let filename = name;
		tb.remove();
		show(item.nameBox);
		if (!name) return;
		if (file instanceof FileItem) {
			const guid = file.meta?.guid;
			if (typeof guid === 'string') {
				filename += '.' + guid;
			}
			filename += file.extname;
		}
		if (filename !== file.name) {
			const dir = Path?.dirname(file.path) ?? '';
			const path = File?.path(`${dir}/${filename}`) ?? `${dir}/${filename}`;
			FSP?.stat(path, FolderItem?.bigint)
				.then((stats: FileBodyStats) => {
					if (stats.ino === file.stats!.ino) {
						throw new Error('same file');
					}
				})
				.catch((_error: unknown) => {
					return FSP?.rename(File?.path(file.path) ?? file.path, path).then(() => {
						item.nameBox.textContent = name;
						return Directory?.update();
					});
				});
		}
	});

	return tb;
}

function on(
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void {
	const node = el.value as FileBodyPaneApi;
	node.addEventListener(type, listener, options);
	switch (type) {
		case 'open':
			openEventEnabled = true;
			break;
		case 'select':
			selectEventEnabled = true;
			break;
		case 'unselect':
			unselectEventEnabled = true;
			break;
		case 'popup':
			popupEventEnabled = true;
			break;
	}
}

onMounted(() => {
	const node = el.value as FileBodyPaneApi;
	const content = contentEl.value as FileBodyContentApi;

	timerCallback = () => {
		const files = selections;
		if (files.length === 1) {
			const file = files[0];
			const target = timer.target;
			const context = file.getContext(node);
			const element = context.element;
			if (element!.contains(target)) {
				rename(file);
			}
		}
		timer.target = null;
		timer.running = false;
	};

	elements = [] as unknown as typeof elements;
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	elements.cpl = -1;

	content.range = new Uint32Array(2);
	Object.defineProperty(content, 'countPerLine', {
		// oxlint-disable-next-line no-explicit-any
		get: function (this: any) {
			return elements.count < this.scrollCount
				? this.normalCountPerLine
				: this.scrollCountPerLine;
		}
	});

	textBox = createTextBox();
	node.textBox = textBox;

	let resizeRaf = 0;
	const scrollResize = (): void => {
		if (resizeRaf) return;
		resizeRaf = requestAnimationFrame(() => {
			resizeRaf = 0;
			resize();
		});
	};

	node.addEventListener('scroll', scrollResize);
	node.addEventListener('keydown', keydown);
	node.addEventListener('pointerdown', pointerdown);
	node.addEventListener('pointerup', pointerup);
	attachDoubleclick(node, doubleclick);
	node.addEventListener('wheel', wheel, { passive: true });

	if (typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(() => {
			requestAnimationFrame(() => {
				if (node.clientHeight > 0 && elements.count > 0) {
					computeGridProperties();
					elements.start = -1;
					elements.end = -1;
					resize();
				}
			});
		});
		resizeObserver.observe(node);
	}

	windowResizeHandler = () => {
		requestAnimationFrame(() => {
			if (node.clientHeight > 0 && elements.count > 0) {
				computeGridProperties();
				elements.start = -1;
				elements.end = -1;
				resize();
			}
		});
	};
	window.addEventListener('resize', windowResizeHandler);

	windowKeydownHandler = windowKeydown;
	window.addEventListener('keydown', windowKeydownHandler);

	attachApi(node, {
		setViewIndex,
		updateViewMode,
		updateFiles,
		resize,
		// M3 切片 3：可见行模型（数据化渲染的前置）
		getRowModel,
		computeGridProperties,
		updateContentSize,
		updateContentOffset,
		resetContentStyle,
		createFlatItems,
		select,
		selectAll,
		unselect,
		selectByPath,
		selectDefault,
		selectRelativeInGridMode,
		getDirName,
		createFolder,
		showInExplorer,
		openFileLocation,
		openFile,
		copyFiles,
		pasteFiles,
		deleteFiles,
		rename,
		cancelRenaming,
		importFiles,
		exportFile,
		clearElements,
		clear,
		selectActiveFile,
		deactivateFile,
		on
	});
	node.content = content;
	Object.defineProperty(node, 'selections', {
		get: () => selections,
		configurable: true
	});
	// 拖拽流程（`YMFileBrowser`）用的四个成员：legacy 里它们是元素成员，
	// 换源后成了闭包变量 —— 不暴露出去，宿主侧的读/写/调用全部落空。
	Object.defineProperty(node, 'activeFile', {
		get: () => activeFile,
		configurable: true
	});
	Object.defineProperty(node, 'pressing', {
		get: () => pressing,
		set: (value: ((event: PointerEvent) => void) | null) => {
			pressing = value;
		},
		configurable: true
	});
	Object.defineProperty(node, 'elements', {
		get: () => elements,
		configurable: true
	});
	Object.defineProperty(node, 'links', {
		configurable: true,
		get: () => props.links,
		set: () => {}
	});
	Object.defineProperty(node, 'viewIndex', {
		get: () => viewIndex,
		configurable: true
	});
});

onBeforeUnmount(() => {
	window.removeEventListener('keydown', windowKeydownHandler);
	window.removeEventListener('resize', windowResizeHandler);
	resizeObserver?.disconnect?.();
});

defineExpose({ setViewIndex, updateFiles, select, unselect, clear, on, el });
</script>

<style module>
:global(:where(.file-body-pane)) {
	position: absolute;
	left: 18%;
	right: 0;
	top: 24px;
	height: calc(100% - 24px);
	overflow-x: hidden;
	overflow-y: auto;
}

:global(:where(.file-body-pane.horizontal)) {
	overflow-x: auto;
	overflow-y: hidden;
}

:global(:where(.file-body-item)) {
	border-radius: 2px;
}

:global(:where(.file-body-item:hover)) {
	background-color: var(--list-item-background-hover);
}

:global(:where(.file-body-item.drop-target)) {
	background-color: var(--drop-target-background);
}

:global(:where(.file-body-content:focus > .file-body-item.selected)) {
	color: white;
	background-color: var(--selected-background);
}

:global(:where(.file-body-content:not(:focus) > .file-body-item:not(:focus-within).selected)) {
	background-color: var(--selected-background-blur);
}

:global(:where(.file-body-content.alt > .file-item)) {
	cursor: pointer;
}

:global(:where(.file-body-content.alt > .file-item:hover)) {
	background-color: var(--command-global-event-link-background);
}

:global(:where(.file-body-icon)) {
	display: block;
	pointer-events: none;
	background-position: center;
	background-repeat: no-repeat;
	background-size: 100%;
}

:global(:where(:focus > .selected > .file-body-icon.icon-folder)) {
	background-color: var(--folder-icon-color-selected);
}

:global(:where(.file-body-icon.icon-folder)) {
	background-color: var(--folder-icon-color);
	mask-image: url(../../../Images/folder_folded.png);
	-webkit-mask-image: url(../../../Images/folder_folded.png);
	mask-size: 100%;
	-webkit-mask-size: 100%;
}

:global(:where(.file-body-icon.icon-file-scene)) {
	background-image: url(../../../Images/file_scene.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-ui)) {
	background-image: url(../../../Images/file_ui.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-animation)) {
	background-image: url(../../../Images/file_animation.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-particle)) {
	background-image: url(../../../Images/file_particle.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-actor)) {
	background-image: url(../../../Images/file_actor.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-cube)) {
	background-image: url(../../../Images/file_cube.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-trigger)) {
	background-image: url(../../../Images/file_trigger.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-tileset)) {
	background-image: url(../../../Images/file_tileset.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-font)) {
	background-image: url(../../../Images/file_font.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-event)) {
	font-family: var(--font-family-bold);
	font-weight: bold;
	text-align: center;
	color: green;
	background-image: url(../../../Images/file_other.png);
	opacity: 0.8;
}

:global(:where(.file-body-icon.icon-file-event.disabled)) {
	opacity: 0.25;
}

:global(:where(.file-body-icon.icon-file-script)) {
	color: #004080;
}

:global(:where(.file-body-icon.icon-file-audio)) {
	font-family: var(--font-family-symbol);
	color: #008080;
}

:global(:where(.file-body-icon.icon-file-video)) {
	font-family: var(--font-family-symbol);
	color: #000000;
}

:global(:where(.file-body-icon.icon-file-other)) {
	font-family: var(--font-family-bold);
	font-weight: bold;
	text-align: center;
	color: #404040;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	background-image: url(../../../Images/file_other.png);
	opacity: 0.8;
}

:global(:where(.file-body-name)) {
	display: -webkit-box;
	height: 30px;
	overflow: hidden;
	white-space: break-spaces;
	text-overflow: ellipsis;
	word-break: break-word;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
}

:global(:where(.file-body-text-box)) {
	display: inline-block;
	position: static;
	width: 100%;
	text-indent: 0;
	border-color: var(--input-border-color) !important;
}

:global(:where(.file-body-text-box-input)) {
	position: static;
	padding: 2px;
	text-align: inherit;
	vertical-align: top;
	color: var(--text-color-rename);
}

:global(:where(.file-body-content.list)) {
	display: block;
	position: relative;
	padding: 0;
	text-align: left;
	/* width: 100%; */
	height: 100%;
	font-size: 1em;
	line-height: 20px;
	/* background-color: green; */
}

:global(:where(.file-body-content.list > .file-body-item)) {
	position: absolute;
	width: 240px;
	height: 20px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.file-body-content.list > .file-body-item > .file-body-icon)) {
	display: inline-block;
	vertical-align: top;
	margin: 2px;
	width: 16px;
	height: 16px;
	line-height: 16px;
	image-rendering: auto !important;
	/* background: green; */
	/* pointer-events: none; */
	/* background-position: center; */
	/* background-repeat: no-repeat; */
	/* background-size: 100%; */
}

:global(:where(.file-body-content.list > .file-body-item > .file-body-icon.icon-file-event)) {
	padding-top: 1px;
	font-size: 0.5em;
}

:global(:where(.file-body-content.list > .file-body-item > .file-body-icon.icon-file-other)) {
	padding-top: 1px;
	font-size: 0.4em;
}

:global(:where(.file-body-content.list > .file-body-item > .file-body-name)) {
	display: inline-block;
	vertical-align: top;
	width: 220px;
	height: 20px;
	white-space: pre;
	/* background-color: red; */
}

:global(:where(.file-body-content.small)) {
	display: block;
	position: relative;
	padding: 0;
	text-align: center;
	justify-content: space-evenly;
	grid-column-gap: 2px;
	grid-row-gap: 2px;
	grid-template-columns: repeat(auto-fill, 40px);
	grid-template-rows: repeat(auto-fill, 72px);
	font-size: 0.9em;
	line-height: 15px;
}

/* 必须指定.file-body-item的宽度，否则可能是0px高度 */
:global(:where(.file-body-content.small > .file-body-item)) {
	position: absolute;
	width: 40px;
	height: 72px;
}

:global(:where(.file-body-content.small > .file-body-item > .file-body-icon)) {
	margin: 4px;
	width: 32px;
	height: 32px;
	line-height: 32px;
}

:global(:where(.file-body-content.small > .file-body-item > .file-body-icon.icon-file-event)) {
	padding-top: 2px;
	font-size: 1em;
}

:global(:where(.file-body-content.small > .file-body-item > .file-body-icon.icon-file-other)) {
	padding-top: 2px;
	font-size: 0.8em;
}

:global(:where(.file-body-content.medium)) {
	display: block;
	position: relative;
	padding: 0;
	text-align: center;
	justify-content: space-evenly;
	grid-column-gap: 2px;
	grid-row-gap: 2px;
	grid-template-columns: repeat(auto-fill, 72px);
	grid-template-rows: repeat(auto-fill, 104px);
	font-size: 1em;
	line-height: 15px;
}

:global(:where(.file-body-content.medium > .file-body-item)) {
	position: absolute;
	width: 72px;
	height: 104px;
}

:global(:where(.file-body-content.medium > .file-body-item > .file-body-icon)) {
	margin: 4px;
	width: 64px;
	height: 64px;
	line-height: 64px;
}

:global(:where(.file-body-content.medium > .file-body-item > .file-body-icon.icon-file-event)) {
	padding-top: 4px;
	font-size: 2em;
}

:global(:where(.file-body-content.medium > .file-body-item > .file-body-icon.icon-file-other)) {
	padding-top: 4px;
	font-size: 1.6em;
}

:global(:where(.file-body-content.large)) {
	display: block;
	position: relative;
	padding: 0;
	text-align: center;
	justify-content: space-evenly;
	grid-column-gap: 2px;
	grid-row-gap: 2px;
	grid-template-columns: repeat(auto-fill, 136px);
	grid-template-rows: repeat(auto-fill, 168px);
	font-size: 1em;
	line-height: 15px;
}

:global(:where(.file-body-content.large > .file-body-item)) {
	position: absolute;
	width: 136px;
	height: 168px;
}

:global(:where(.file-body-content.large > .file-body-item > .file-body-icon)) {
	margin: 4px;
	width: 128px;
	height: 128px;
	line-height: 128px;
}

:global(:where(.file-body-content.large > .file-body-item > .file-body-icon.icon-file-event)) {
	padding-top: 8px;
	font-size: 4em;
}

:global(:where(.file-body-content.large > .file-body-item > .file-body-icon.icon-file-other)) {
	padding-top: 8px;
	font-size: 3.2em;
}

:global(:where(.file-body-content.huge)) {
	display: block;
	position: relative;
	padding: 0;
	text-align: center;
	justify-content: space-evenly;
	grid-column-gap: 2px;
	grid-row-gap: 2px;
	grid-template-columns: repeat(auto-fill, 264px);
	grid-template-rows: repeat(auto-fill, 296px);
	font-size: 1em;
	line-height: 15px;
}

:global(:where(.file-body-content.huge > .file-body-item)) {
	position: absolute;
	width: 264px;
	height: 296px;
}

:global(:where(.file-body-content.huge > .file-body-item > .file-body-icon)) {
	margin: 4px;
	width: 256px;
	height: 256px;
	line-height: 256px;
}

:global(:where(.file-body-content.huge > .file-body-item > .file-body-icon.icon-file-event)) {
	padding-top: 16px;
	font-size: 8em;
}

:global(:where(.file-body-content.huge > .file-body-item > .file-body-icon.icon-file-other)) {
	padding-top: 16px;
	font-size: 6.4em;
}
</style>
