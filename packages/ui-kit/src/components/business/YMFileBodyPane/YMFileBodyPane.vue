<template>
	<div class="file-body-pane" ref="el" :data-v-ref="''">
		<div class="file-body-content" ref="contentEl" tabindex="0" :data-v-ref="''"></div>
	</div>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { h, render, ref, onMounted, onBeforeUnmount } from 'vue';
import {
	addClass,
	hasClass,
	hasScrollBar,
	hide,
	isInContent,
	rect,
	removeClass,
	show,
	attachDoubleclick
} from '../../../utils/dom';
import { attachApi } from '../../../utils/attach-api';
import { createFileBodyCore } from './file-body-core';

const core = createFileBodyCore();

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => {
	const host = document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
};

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

interface FileBodyEvent extends Event {
	value?: unknown;
	raw?: PointerEvent;
	clientX?: number;
	clientY?: number;
}

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
	// oxlint-disable-next-line no-explicit-any
	[key: string]: any;
}

interface FileBodyIconApi extends HTMLElement {
	isImageChanged?: () => boolean;
}

interface FileBodyItemApi extends HTMLElement {
	file: FileBodyFile;
	context?: FileBodyContext;
	changed?: boolean;
	versionId?: number;
	nameBox?: HTMLElement;
	fileIcon?: FileBodyIconApi;
}

interface FileBodyContentApi extends HTMLElement {
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
}

interface FileBodyPaneApi extends HTMLElement {
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
}

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
		// oxlint-disable-next-line no-explicit-any
		inoMap: Record<string, any>;
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
	versionId: number;
	count: number;
	start: number;
	end: number;
	cpl: number;
};
let activeFile: FileBodyFile | null = null;
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
		head.view.write(idx);
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
		const versionId = els.versionId++;
		const content = contentEl.value as FileBodyContentApi;
		const { countPerLine, itemSize, itemWidth } = content;
		for (let i = start; i < end; i++) {
			const element = els[i]!;
			element.versionId = versionId;
			if (viewMode === 'list') {
				const col = Math.floor(i / countPerLine!);
				const row = i % countPerLine!;
				element.style.left = `${col * itemWidth! + 4}px`;
				element.style.top = `${row * 20}px`;
			} else {
				const col = i % countPerLine!;
				const row = Math.floor(i / countPerLine!);
				element.style.left = `${col * itemWidth! + 4}px`;
				element.style.top = `${row * itemSize! + 4}px`;
			}
			updateOnResize(element);
		}
		const nodes = content.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i] as FileBodyItemApi;
			if (element.versionId !== versionId) {
				element.remove();
			}
		}
		const foot = els[end - 1];
		if (foot && !foot.parentNode) {
			content.appendChild(foot);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = els[i]!;
			if (element.parentNode === null) {
				const next = els[i + 1]!;
				content.insertBefore(element, next);
			}
		}
	}
}

function computeGridProperties(): void {
	const node = el.value as FileBodyPaneApi;
	if (rect(node).width <= 0) return;
	const content = contentEl.value as FileBodyContentApi;
	content.count = -1;
	elements.start = -1;
	elements.end = -1;
	switch (viewMode) {
		case 'list':
			return computeListGridProperties();
		case 'small':
			return computeTileGridProperties(40, 72);
		case 'medium':
			return computeTileGridProperties(72, 104);
		case 'large':
			return computeTileGridProperties(136, 168);
		case 'huge':
			return computeTileGridProperties(264, 296);
	}
}

function computeListGridProperties(): void {
	const node = el.value as FileBodyPaneApi;
	const content = contentEl.value as FileBodyContentApi;
	const nodeRect = rect(node);
	const metrics = core.computeListGridMetrics(nodeRect.width, nodeRect.height);
	content.itemSize = metrics.itemSize;
	content.itemWidth = metrics.itemWidth;
	content.visibleLines = metrics.visibleLines;
	content.normalCountPerLine = metrics.normalCountPerLine;
	content.scrollCountPerLine = metrics.scrollCountPerLine;
	content.scrollCount = metrics.scrollCount;
}

function computeTileGridProperties(width: number, height: number): void {
	const node = el.value as FileBodyPaneApi;
	const content = contentEl.value as FileBodyContentApi;
	const nodeRect = rect(node);
	const metrics = core.computeTileGridMetrics(nodeRect.width, nodeRect.height, width, height);
	content.itemSize = metrics.itemSize;
	content.itemWidth = metrics.itemWidth;
	content.visibleLines = metrics.visibleLines;
	content.normalCountPerLine = metrics.normalCountPerLine;
	content.scrollCountPerLine = metrics.scrollCountPerLine;
	content.scrollCount = metrics.scrollCount;
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
	const count = elements.count;
	const cpl = content.countPerLine;
	if (node.clientHeight !== 0 && (content.count !== count || content.cpl !== cpl)) {
		content.count = count;
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
	content.count = -1;
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
	if (element.changed) {
		element.changed = false;
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

function createFlatItems(dir: FileBodyFile[]): void {
	Directory?.sortFiles(dir);
	const els = elements;
	const length = dir.length;
	for (let i = 0; i < length; i++) {
		const file = dir[i];
		if (file instanceof FileItem) {
			els[els.count++] = createFileElement(file);
			continue;
		}
		if (file instanceof FolderItem) {
			els[els.count++] = createFolderElement(file);
			continue;
		}
	}
}

function createFolderElement(file: FileBodyFile): FileBodyItemApi {
	const node = el.value as FileBodyPaneApi;
	const context = file.getContext(node);
	let element = context.element;
	if (element === undefined) {
		element = document.createElement('div') as unknown as FileBodyItemApi;
		addClass(element, 'file-body-item');
		element.file = file;
		element.context = context;
		context.element = element;
		const { selections: sels } = { selections };
		if (sels.length !== 0 && sels.includes(file)) {
			addClass(element, 'selected');
		}
	}
	element.changed = true;
	return element;
}

function updateFolderElement(element: FileBodyItemApi): void {
	if (!element.nameBox) {
		const fileIcon = renderElement(h('span', { class: ['file-body-icon', 'icon-folder'] }));
		element.appendChild(fileIcon);

		const nameBox = renderElement(h('span', { class: 'file-body-name' }));
		nameBox.textContent = element.file.name;
		element.appendChild(nameBox);

		element.draggable = true;
		element.fileIcon = fileIcon;
		element.nameBox = nameBox;
	}
}

function createFileElement(file: FileBodyFile): FileBodyItemApi {
	const node = el.value as FileBodyPaneApi;
	const context = file.getContext(node);
	let element = context.element;
	if (element === undefined) {
		element = document.createElement('div') as unknown as FileBodyItemApi;
		addClass(element, 'file-body-item');
		addClass(element, 'file-item');
		element.file = file;
		element.context = context;
		context.element = element;
	}
	element.changed = true;
	return element;
}

function updateFileElement(element: FileBodyItemApi): void {
	const { file } = element;
	const node = el.value as FileBodyPaneApi;
	if (!element.nameBox) {
		const fileIcon = createIcon(file);
		element.appendChild(fileIcon);

		const nameBox = renderElement(h('span', { class: 'file-body-name' }));
		nameBox.textContent = file.basename;
		element.appendChild(nameBox);

		element.draggable = true;
		element.fileIcon = fileIcon;
		element.nameBox = nameBox;

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
	const node = el.value as FileBodyPaneApi;
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
	const pointerup = (event: PointerEvent) => {
		if (pressing === pointerup) {
			pressing = null;
			selectActiveFile();
		}
	};
	pressing = pointerup;
	window.addEventListener('pointerup', pointerup, { once: true });
}

function deactivateFile(): void {
	const node = el.value as FileBodyPaneApi;
	if (activeFile instanceof FileItem) {
		if (!selections.includes(activeFile!)) {
			const context = activeFile!.getContext(node);
			removeClass(context.element!, 'selected');
			for (const f of selections) {
				const c = f.getContext(node);
				if (c.element) addClass(c.element, 'selected');
			}
		}
		activeFile = null;
	}
}

function selectActiveFile(): void {
	if (activeFile instanceof FileItem) {
		if (!selections.includes(activeFile!)) {
			select(activeFile!);
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
	if (selectEventEnabled) {
		const select = new Event('select') as FileBodyEvent;
		select.value = files;
		node.dispatchEvent(select);
	}
}

function selectAll(): void {
	const node = el.value as FileBodyPaneApi;
	const els = elements;
	const count = els.count;
	const files = Array.from<FileBodyFile>({ length: count });
	for (let i = 0; i < count; i++) {
		files[i] = els[i]!.file;
	}
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
		if (unselectEventEnabled) {
			const unselect = new Event('unselect') as FileBodyEvent;
			unselect.value = files;
			node.dispatchEvent(unselect);
		}
	}
}

function selectByPath(path: string): void {
	const node = el.value as FileBodyPaneApi;
	const els = elements;
	const count = els.count;
	for (let i = 0; i < count; i++) {
		const { file } = els[i]!;
		if (file.path === path) {
			return select(file);
		}
	}
	unselect();
}

function selectDefault(): void {
	const els = elements;
	const count = els.count;
	for (let i = 0; i < count; i++) {
		if (hasClass(els[i]!, 'selected')) return;
	}
	if (count !== 0) {
		select(els[0]!.file);
	}
}

function selectRelativeInGridMode(direction: 'prev' | 'next' | 'prev-line' | 'next-line'): void {
	const node = el.value as FileBodyPaneApi;
	const els = elements;
	const count = els.count;
	if (count > 0) {
		let start = Infinity;
		let end = -Infinity;
		const { selections: sels } = { selections };
		for (const file of sels) {
			const { element } = file.getContext(node);
			const idx = els.indexOf(element!);
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
		const file = els[index]?.file;
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
					scroll = core.clamp(scroll, pos + size + PADDING * 2 - GAP - clientSize, pos);
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
	const node = el.value as FileBodyPaneApi;
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
	const content = contentEl.value as FileBodyContentApi;
	content.textContent = '';
	clearElements(0);
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	resetContentStyle();
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
				content.focus({ preventScroll: true });
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
								activateFile((element as FileBodyItemApi).file);
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
							activateFile((element as FileBodyItemApi).file);
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
				content.focus({ preventScroll: true });
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
	const node = el.value as FileBodyPaneApi;
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
				content.focus({ preventScroll: true });
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
	tb.addEventListener('input', function (this: any, event: Event) {
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
				.catch((error: unknown) => {
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
	elements.versionId = 0;
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
		on
	});
	node.content = content;
	Object.defineProperty(node, 'selections', {
		get: () => selections,
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
