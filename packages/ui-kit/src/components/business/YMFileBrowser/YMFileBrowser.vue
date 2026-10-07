<template>
	<YMFileNavPane
		ref="navEl"
		:links="links"
		:directory-api="childDirectoryApi"
		:file-system="childFileSystem"
		:path-util="childPathUtil"
		:menu-state="childMenuState"
		:create-text-box="childCreateTextBox"
	/>
	<YMFileHeadPane
		ref="headEl"
		:links="links"
		:menu-popup="props.menuPopup"
		:is-folder-item="isFolderItem"
	/>
	<YMFileBodyPane
		ref="bodyEl"
		:links="links"
		:data-api="props.dataApi"
		:window-api="props.windowApi"
		:gl-api="props.glApi"
		:menu-state="props.menuState"
		:clipboard-api="props.clipboardApi"
		:reference-api="props.referenceApi"
		:localize="props.localize"
		:editor-api="props.editorApi"
		:directory-api="props.directoryApi"
		:file-system-api="props.fileSystemApi"
		:path-util="props.pathUtil"
		:file-classes="props.fileClasses"
		:set-icon-clip="props.setIconClip"
		:create-text-box="props.createTextBox"
	/>
</template>

<script setup lang="ts">
type FileBrowserApi = HTMLElement & {
	directory?: unknown;
	load?(folders: unknown[]): void;
	select?(item: unknown): void;
	getSelections?(): unknown[];
	unselect?(meta?: unknown): void;
	update?(): void;
	searchFiles?(kw: string | RegExp): void;
	restoreDisplay?(): void;
	backToParentFolder?(): void;
	close?(): void;
	getActivePage?(event: Event): unknown;
	getFilePaths?(files: unknown[]): { relativePaths: string[]; absolutePaths: string[] };
	display?: string;
	searchResults?: unknown[];
	[key: string]: unknown;
};
type FileNavApi = HTMLElement & {
	load?(...folders: unknown[]): void;
	select?(item: unknown): void;
	getSelections?(): unknown[];
	unselect?(): void;
	clear?(): void;
	selections?: unknown[];
	[key: string]: unknown;
};
type FileBodyApi = HTMLElement & {
	load?(folders: unknown[]): void;
	select?(...files: unknown[]): void;
	clear?(): void;
	updateFiles?(): void;
	selections?: unknown[];
	[key: string]: unknown;
};
interface ActivePage extends HTMLElement {
	pressing?: unknown;
	activeFile?: unknown;
	selections: unknown[];
	textBox: { parentNode: Node | null };
}
interface FileHeadApi extends HTMLElement {
	updateAddress?(): void;
	searcher?: { write?(value: string): void; deleteInputContent?(): void };
	el?: HTMLElement;
	[key: string]: unknown;
}
interface DragState {
	dropPath: string | null;
	dropTarget: unknown;
	promise?: Promise<unknown[]>;
	filePaths?: unknown[];
	selections?: unknown[];
	mode?: string;
	dragLeaved?: boolean;
	allowCopy?: boolean;
	allowMove?: boolean;
	page?: unknown;
	target?: { contains(el: Node): boolean };
	[key: string]: unknown;
}
interface OsDragEvent {
	mode?: string;
	preventDefault: () => void;
	allowMove?: boolean;
	allowCopy?: boolean;
	dragLeaved?: boolean;
	dropMode?: unknown;
	page?: unknown;
	files?: unknown[];
	filePaths?: unknown[];
	promise?: Promise<unknown[]>;
	dataTransfer: DataTransfer;
	cmdOrCtrlKey?: boolean;
}

interface OsDragEvent {
	mode?: string;
	preventDefault: () => void;
	allowMove?: boolean;
	allowCopy?: boolean;
	dragLeaved?: boolean;
	dropMode?: unknown;
	page?: unknown;
	files?: unknown[];
	filePaths?: unknown[];
	promise?: Promise<unknown[]>;
	dataTransfer: DataTransfer;
	cmdOrCtrlKey?: boolean;
}

import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import { hideDragImage, addClass, hasClass, removeClass } from '../../../utils/dom';
import type { MenuItem, MenuOptions } from '../../basic/YMMenuList/menu-api';
import YMFileNavPane from '../YMFileNavPane/YMFileNavPane.vue';
import YMFileHeadPane from '../YMFileHeadPane/YMFileHeadPane.vue';
import YMFileBodyPane from '../YMFileBodyPane/YMFileBodyPane.vue';

interface Props {
	id?: string;
	menuPopup?: (options: MenuOptions, items: MenuItem[]) => void;
	// oxlint-disable-next-line no-explicit-any
	directoryApi?: any;
	// oxlint-disable-next-line no-explicit-any
	fileSystemApi?: any;
	// oxlint-disable-next-line no-explicit-any
	pathUtil?: any;
	// oxlint-disable-next-line no-explicit-any
	localize?: any;
	// oxlint-disable-next-line no-explicit-any
	fileClasses?: { FileItem: any; FolderItem: any };
	menuState?: () => string;
	// oxlint-disable-next-line no-explicit-any
	createTextBox?: () => any;
	// oxlint-disable-next-line no-explicit-any
	dataApi?: any;
	// oxlint-disable-next-line no-explicit-any
	windowApi?: any;
	// oxlint-disable-next-line no-explicit-any
	glApi?: any;
	// oxlint-disable-next-line no-explicit-any
	clipboardApi?: any;
	// oxlint-disable-next-line no-explicit-any
	referenceApi?: any;
	// oxlint-disable-next-line no-explicit-any
	editorApi?: any;
	// oxlint-disable-next-line no-explicit-any
	setIconClip?: any;
	onBrowserMount?: () => void;
	onSelectorMount?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
	menuPopup: () => {},
	directoryApi: () => ({}),
	fileSystemApi: () => ({}),
	pathUtil: () => ({}),
	localize: () => ({}),
	fileClasses: () => ({ FileItem: null, FolderItem: null }),
	menuState: () => '',
	createTextBox: () => null,
	dataApi: () => ({}),
	windowApi: () => ({}),
	glApi: () => ({}),
	clipboardApi: () => ({}),
	referenceApi: () => ({}),
	editorApi: () => ({}),
	setIconClip: () => {},
	onBrowserMount: () => {},
	onSelectorMount: () => {}
});

const FileItem = props.fileClasses?.FileItem;
const FolderItem = props.fileClasses?.FolderItem;
const Directory = props.directoryApi;
const File = props.fileSystemApi;
const Path = props.pathUtil;
const Local = props.localize;

const el = ref<HTMLElement>();
const navEl = ref<InstanceType<typeof YMFileNavPane>>();
const headEl = ref<InstanceType<typeof YMFileHeadPane>>();
const bodyEl = ref<InstanceType<typeof YMFileBodyPane>>();

const isFolderItem = (obj: unknown): boolean => obj instanceof FolderItem;

const childDirectoryApi = {
	sortFiles: (dir: unknown) => Directory?.sortFiles?.(dir),
	getFolder: (path: string) => Directory?.getFolder?.(path),
	update: () => Directory?.update?.(),
	assets: Directory?.assets,
	inoMap: Directory?.inoMap
};
const childFileSystem = {
	path: (p: string) => File?.path?.(p) ?? p,
	rename: (oldPath: string, newPath: string) =>
		Directory?.rename?.(oldPath, newPath) ?? Promise.resolve(),
	existsSync: (p: string) => Directory?.existsSync?.(p) ?? false
};
const childPathUtil = { dirname: (p: string) => Path?.dirname?.(p) ?? '' };
const childMenuState = () => props.menuState?.() ?? '';
const childCreateTextBox = props.createTextBox;

let display: 'normal' | 'search' = 'normal';
let keyword: RegExp | null = null;
type Dragging = (DragEvent | PointerEvent) & DragState;
let dragging: Dragging | null = null;
let filters: unknown[] | null = null;
let backupFolders: unknown[] = [];
let searchResults: unknown[] = [];
// oxlint-disable-next-line no-explicit-any
let links: any = {};

/**
 * 当前项目的目录根（宿主写在浏览器元素上：`Browser.directory = [Directory.assets]`）。
 *
 * 必须读元素属性，不能只用模块局部变量：局部变量没有任何赋值点，`close()` 里的清理分支就永远
 * 进不去——关掉/切换项目时，上一个项目的文件行、文件夹行与地址栏都留在 DOM 里，打开新项目后
 * 与新内容叠在一起（"上一次的项目在背景"）。与 legacy 的 `this.directory` 一致（legacy 里它同时是搜索基集：`Directory.searchFiles(filters, kw, this.directory, list)`）。
 */
const directoryItems = (): unknown[] | null => {
	const value = (el.value as FileBrowserApi | undefined)?.directory;
	return Array.isArray(value) ? value : null;
};

/**
 * 把模块内的 `display` / `searchResults` 镜像到浏览器元素上（nav 侧读 `browser.display`
 * 决定面包屑与"返回上一级"的行为）。`update()` 与 `restoreDisplay()` 都要镜像一次——
 * legacy 里 `display` 就是元素属性本身，改完即生效；换源后它是模块变量，漏镜像就会读到旧值。
 */
function syncDisplayState(): void {
	const node = el.value as FileBrowserApi | undefined;
	if (!node) return;
	node.display = display;
	node.searchResults = searchResults;
}

function update(): void {
	syncDisplayState();
	const body = bodyEl.value?.el as FileBodyApi;
	body?.updateFiles?.();
	(headEl.value as FileHeadApi | undefined)?.updateAddress?.();
}

function searchFiles(kw: RegExp | string): void {
	const nav = navEl.value?.el as FileNavApi;
	if (kw instanceof RegExp || kw.length !== 0) {
		if (display === 'normal') {
			display = 'search';
			backupFolders = nav.selections ?? [];
			nav.unselect?.();
		}
		if (typeof kw === 'string') {
			kw = kw.replace(/[(){}\\^$*+?.|[\]]/g, '\\$&');
			kw = new RegExp(kw, 'i');
		}
		const items = directoryItems() ?? Directory?.assets?.subfolders ?? [];
		Directory?.searchFiles?.(filters, (keyword = kw as RegExp), items, (searchResults = []));
		update();
	} else {
		if (display === 'search') {
			display = 'normal';
			nav.load?.(...(backupFolders as unknown[]));
			keyword = null;
			backupFolders = [];
			searchResults = [];
		}
	}
}

function restoreDisplay(): void {
	switch (display) {
		case 'normal':
			break;
		case 'search':
			display = 'normal';
			backupFolders = [];
			searchResults = [];
			syncDisplayState();
			(
				(headEl.value as { el?: FileHeadApi } | undefined)?.el?.searcher as
					| { write?(value: string): void }
					| undefined
			)?.write?.('');
			break;
	}
}

function backToParentFolder(): boolean {
	const nav = navEl.value?.el as FileNavApi;
	switch (display) {
		case 'normal': {
			const folders = nav.selections ?? [];
			if (folders.length === 1) {
				const path = (folders[0] as { path: string }).path;
				const index = path.lastIndexOf('/');
				if (index !== -1) {
					nav.load?.(Directory?.getFolder?.(path.slice(0, index)));
					return true;
				}
			}
			return false;
		}
		case 'search': {
			const active = document.activeElement as HTMLElement;
			(
				(headEl.value as { el?: FileHeadApi } | undefined)?.el?.searcher as
					| { deleteInputContent?(): void }
					| undefined
			)?.deleteInputContent?.();
			active.focus();
			return true;
		}
	}
	return false;
}

function dirchange(_event: Event): void {
	const body = bodyEl.value?.el as FileBodyApi;
	switch (display) {
		case 'normal':
			break;
		case 'search':
			searchFiles(keyword!);
			break;
	}
	const files = Array.from((body as FileBodyApi).selections ?? []);
	if (files.length !== 0) {
		const { inoMap } = Directory as { inoMap: Record<string, unknown> };
		let modified = false;
		let i = files.length;
		while (--i >= 0) {
			const sFile = files[i];
			const ino = (sFile as { stats: { ino: number } }).stats.ino;
			const dFile = inoMap[ino];
			if (sFile !== dFile) {
				modified = true;
				if (dFile) {
					files[i] = dFile;
				} else {
					files.splice(i, 1);
				}
			}
		}
		if (modified) {
			(body as FileBodyApi).select?.(...files);
		}
	}
}

function close(): void {
	const node = el.value as FileBrowserApi | undefined;
	if (node?.directory) {
		node.directory = null;
		restoreDisplay();
		const nav = navEl.value?.el as FileNavApi | undefined;
		const body = bodyEl.value?.el as FileBodyApi | undefined;
		nav?.clear?.();
		body?.clear?.();
		(headEl.value as FileHeadApi | undefined)?.updateAddress?.();
	}
}

function getActivePage(event: Event): HTMLElement | null {
	const nav = navEl.value?.el as FileNavApi;
	const body = bodyEl.value?.el as FileBodyApi;
	return nav.contains(event.target as Node)
		? nav
		: body.contains(event.target as Node)
			? body
			: null;
}

function getFilePaths(files: unknown[]): { relativePaths: string[]; absolutePaths: string[] } {
	const relativePaths = files.map((file) => (file as { path: string }).path);
	const absolutePaths = relativePaths.map((path) => File?.path?.(path) ?? path);
	return { relativePaths, absolutePaths };
}

/**
 * 渲染出来的文件行元素在运行时挂着自己的 `file`（`FileItem`/`FolderItem` 实例）。
 * 断言只在这一处做，调用方直接用返回值 —— 原先 3 个读点各自写了一遍
 * `(element as unknown as { file: { path: string } }).file.path`。
 */
const fileElementOf = (element: HTMLElement): { path: string } | null => {
	const file = (element as { file?: unknown }).file;
	return file instanceof FolderItem ? (file as { path: string }) : null;
};

function pointerdown(_event: PointerEvent): void {
	switch (dragging?.mode) {
		case 'drag':
			dragend();
			return;
		case 'os-drag':
			osDragend();
			return;
	}
}

function dragstart(event: DragEvent): void {
	const node = el.value as FileBrowserApi;
	const page = getActivePage(event) as ActivePage | null;
	if (page && !dragging) {
		if (page.pressing) {
			page.pressing = null;
		}
		const files = page.activeFile ? [page.activeFile] : page.selections;
		if (!files.includes(Directory?.assets) && !page.textBox.parentNode) {
			const { relativePaths, absolutePaths } = getFilePaths(files);
			dragging = event as Dragging;
			(event as OsDragEvent).mode = 'drag';
			(event as OsDragEvent).preventDefault = () => {};
			(event as OsDragEvent).allowMove = false;
			(event as OsDragEvent).allowCopy = false;
			(event as OsDragEvent).dragLeaved = false;
			(event as { dropTarget?: unknown }).dropTarget = null;
			(event as { dropPath?: string | null }).dropPath = null;
			(event as OsDragEvent).dropMode = null;
			(event as OsDragEvent).page = page;
			(event as OsDragEvent).files = files;
			(event as OsDragEvent).filePaths = relativePaths;
			(event as OsDragEvent).promise =
				Directory?.readdir?.(absolutePaths) ?? Promise.resolve([]);
			(event as OsDragEvent).promise!.then((dir: unknown[]) => {
				if (dir.length === 0) {
					dragend();
				}
			});
			(event as OsDragEvent).dataTransfer.effectAllowed = 'copyMove';
			hideDragImage(event.dataTransfer);
			node.addEventListener('dragenter', dragover as EventListener);
			node.addEventListener('dragleave', dragleave as EventListener);
			node.addEventListener('dragover', dragover as EventListener);
			node.addEventListener('drop', drop as EventListener);
			if (files.length === 1 && files[0] instanceof FileItem) {
				const name =
					(files[0] as { basename: string; extname: string }).basename +
					(files[0] as { extname: string }).extname;
				(event as OsDragEvent).dataTransfer.setData(
					'DownloadURL',
					`application/octet-stream:${name}:${absolutePaths[0]}`
				);
			}
		}
	}
}

function dragend(_event?: DragEvent): void {
	const node = el.value as FileBrowserApi;
	if (dragging) {
		const { dropTarget, page } = dragging;
		if (dropTarget instanceof HTMLElement) {
			removeClass(dropTarget, 'drop-target');
		}
		if (dragging.dragLeaved) {
			(page as { deactivateFile?(): void }).deactivateFile?.();
		} else {
			(page as { selectActiveFile?(): void }).selectActiveFile?.();
		}
		dragging = null;
		node.removeEventListener('dragenter', dragover as EventListener);
		node.removeEventListener('dragleave', dragleave as EventListener);
		node.removeEventListener('dragover', dragover as EventListener);
		node.removeEventListener('drop', drop as EventListener);
	}
}

function dragleave(event: DragEvent): void {
	const d = dragging;
	if (d?.dropTarget && !(el.value as HTMLElement).contains(event.relatedTarget as Node)) {
		removeClass(d.dropTarget, 'drop-target');
		d.dropTarget = null;
		if (event.relatedTarget) {
			d.dragLeaved = true;
		}
	}
}

function dragover(event: DragEvent): void {
	const d = dragging;
	if (d) {
		const { dropTarget } = d;
		let element = event.target as HTMLElement;
		if (!d.allowCopy && !d.target!.contains(element)) {
			d.allowCopy = true;
		}
		while (
			!(
				hasClass(element, 'file-browser') ||
				hasClass(element, 'file-nav-pane') ||
				hasClass(element, 'file-body-pane') ||
				(element as { file?: unknown }).file instanceof FolderItem
			)
		) {
			element = element.parentNode as HTMLElement;
		}
		if (dropTarget !== element) {
			if (dropTarget instanceof HTMLElement) {
				removeClass(dropTarget, 'drop-target');
			}
			d.allowMove = false;
			d.dropTarget = element;
			if ((element as { file?: unknown }).file instanceof FolderItem) {
				addClass(element, 'drop-target');
				d.dropPath = fileElementOf(element)!.path;
				d.promise!.then((dir: unknown[]) => {
					const { path } = fileElementOf(element)!;
					const filePaths = d.filePaths ?? [];
					for (const filePath of filePaths) {
						if (
							path === (filePath as string) ||
							(path.indexOf(filePath as string) === 0 &&
								path[(filePath as string).length] === '/')
						) {
							return true;
						}
					}
					return Directory?.existFiles?.(path, dir as unknown[]) ?? false;
				}).then((existed: boolean) => {
					if (!existed && d.dropTarget === element) {
						d.allowMove = true;
					}
				});
			} else {
				if (hasClass(element, 'file-body-pane')) {
					const nav = navEl.value?.el as FileNavApi;
					const selections = nav.selections ?? [];
					d.dropPath =
						selections.length === 1 ? (selections[0] as { path: string }).path : null;
				} else {
					d.dropPath = null;
				}
			}
		}
		if (!d.dropPath) return;
		if ((event as OsDragEvent).cmdOrCtrlKey) {
			if (d.allowCopy) {
				d.dropMode = 'copy';
				(event as { dataTransfer: DataTransfer }).dataTransfer.dropEffect = 'copy';
				event.preventDefault();
			}
		} else {
			if (d.allowMove) {
				d.dropMode = 'move';
				(event as OsDragEvent).dataTransfer.dropEffect = 'move';
				event.preventDefault();
			}
		}
	}
}

function drop(event: DragEvent): void {
	const d = dragging;
	if (d) {
		event.stopPropagation();
		if (!d.dropPath) return;
		const dropPath = File?.path?.(d.dropPath) ?? d.dropPath;
		const dropName = Path?.basename?.(dropPath) ?? dropPath;
		const get =
			(Local as { createGetter?: (key: string) => (key: string) => string })?.createGetter?.(
				'menuFileOnDrop'
			) ?? ((_key: string) => '');
		const menuItems: { label: string; click: () => void }[] = [];
		switch (d.dropMode) {
			case 'move':
				menuItems.push({
					label: get('moveTo').replace('<dirName>', dropName),
					click: () => {
						d.promise!.then((dir: unknown[]) =>
							Directory?.moveFiles?.(dropPath, dir)
						).finally(() => {
							Directory?.update?.();
						});
					}
				});
				break;
			case 'copy':
				menuItems.push({
					label: get('copyTo').replace('<dirName>', dropName),
					click: () => {
						d.promise!.then((dir: unknown[]) =>
							Directory?.saveFiles?.(d.files)?.then(() =>
								Directory?.copyFiles?.(dropPath, dir)
							)
						).finally(() => {
							Directory?.update?.();
						});
					}
				});
				break;
		}
		props.menuPopup?.({ x: event.clientX, y: event.clientY }, menuItems);
		dragend();
	}
}

function osDragstart(event: DragEvent): void {
	const node = el.value as FileBrowserApi;
	if (!dragging) {
		dragging = event as Dragging;
		(event as OsDragEvent).mode = 'os-drag';
		(event as { dropTarget?: unknown }).dropTarget = null;
		(event as { dropPath?: string | null }).dropPath = null;
		node.addEventListener('dragenter', osDragover as EventListener);
		node.addEventListener('dragleave', osDragleave as EventListener);
		node.addEventListener('dragover', osDragover as EventListener);
		node.addEventListener('drop', osDrop as EventListener);
	}
}

function osDragend(_event?: DragEvent): void {
	const node = el.value as FileBrowserApi;
	if (dragging) {
		const { dropTarget } = dragging;
		if (dropTarget instanceof HTMLElement) {
			removeClass(dropTarget, 'drop-target');
		}
		dragging = null;
		node.removeEventListener('dragenter', osDragover as EventListener);
		node.removeEventListener('dragleave', osDragleave as EventListener);
		node.removeEventListener('dragover', osDragover as EventListener);
		node.removeEventListener('drop', osDrop as EventListener);
	}
}

function osDragleave(event: DragEvent): void {
	return dragleave(event);
}

function osDragover(event: DragEvent): void {
	const d = dragging;
	if (d) {
		const { dropTarget } = d;
		let element = event.target as HTMLElement;
		while (
			!(
				hasClass(element, 'file-browser') ||
				hasClass(element, 'file-nav-pane') ||
				hasClass(element, 'file-body-pane') ||
				(element as { file?: unknown }).file instanceof FolderItem
			)
		) {
			element = element.parentNode as HTMLElement;
		}
		if (dropTarget !== element) {
			if (dropTarget instanceof HTMLElement) {
				removeClass(dropTarget, 'drop-target');
			}
			d.dropTarget = element;
			if ((element as { file?: unknown }).file instanceof FolderItem) {
				addClass(element, 'drop-target');
				d.dropPath = fileElementOf(element)!.path;
			} else {
				if (hasClass(element, 'file-body-pane')) {
					const nav = navEl.value?.el as FileNavApi;
					const selections = nav.selections ?? [];
					d.dropPath =
						selections.length === 1 ? (selections[0] as { path: string }).path : null;
				} else {
					d.dropPath = null;
				}
			}
		}
		if (d.dropPath) {
			event.preventDefault();
			(event as { dataTransfer: DataTransfer }).dataTransfer.dropEffect = 'copy';
		}
	}
}

function osDrop(event: DragEvent): void {
	const { files } = (event as OsDragEvent).dataTransfer;
	if (files.length === 0) return;
	const d = dragging;
	if (d) {
		let { dropPath } = d;
		if (!dropPath) return;
		dropPath = File?.path?.(dropPath) ?? dropPath;
		const paths = Array.prototype.map.call(
			files,
			(file: File) => (file as File & { path: string }).path
		);
		Directory?.readdir?.(paths)
			?.then((dir: unknown[]) => {
				return Directory?.copyFiles?.(dropPath, dir, '');
			})
			?.finally(() => {
				Directory?.update?.();
			});
	}
}

function setupLinks() {
	const nav = navEl.value?.el as FileNavApi;
	const head =
		(headEl.value?.el as FileHeadApi) ||
		(el.value?.querySelector('.file-head-pane') as FileHeadApi);
	const body =
		(bodyEl.value?.el as FileBodyApi) ||
		(el.value?.querySelector('.file-body-pane') as FileBodyApi);
	const node = (nav?.closest('.file-browser') || el.value) as FileBrowserApi;
	el.value = node;
	links.browser = node;
	links.nav = nav;
	links.head = head;
	links.body = body;
	const attachLinks = (target: HTMLElement | null): void => {
		if (!target) return;
		Object.defineProperty(target, 'links', {
			configurable: true,
			get: () => links
		});
	};
	attachLinks(nav);
	attachLinks(head);
	attachLinks(body);
	if (node) {
		attachLinks(node);
		Object.defineProperty(node, 'nav', {
			get: () => node.querySelector('.file-nav-pane'),
			configurable: true
		});
		Object.defineProperty(node, 'head', {
			get: () => node.querySelector('.file-head-pane'),
			configurable: true
		});
		Object.defineProperty(node, 'body', {
			get: () => node.querySelector('.file-body-pane'),
			configurable: true
		});
	}
}

let dirchangeHandler: (event: Event) => void;

onMounted(() => {
	nextTick(() => {
		setupLinks();
		const node = el.value as FileBrowserApi;
		if (!node) return;
		node.addEventListener('pointerdown', pointerdown as EventListener);
		node.addEventListener('dragstart', dragstart as EventListener);
		node.addEventListener('dragend', dragend as EventListener);
		window.addEventListener('os-dragstart', osDragstart as EventListener);
		window.addEventListener('os-dragend', osDragend as EventListener);
		dirchangeHandler = dirchange;
		window.addEventListener('dirchange', dirchangeHandler as EventListener);

		if (node.id === 'project-browser') {
			props.onBrowserMount?.();
		} else if (node.id === 'selector-browser') {
			props.onSelectorMount?.();
		}

		(node as FileBrowserApi).display = 'normal';
		(node as FileBrowserApi).searchResults = [];
		attachApi(node, {
			update,
			searchFiles,
			restoreDisplay,
			backToParentFolder,
			close,
			getActivePage,
			getFilePaths,
			dragstart,
			dragend,
			dragleave,
			dragover,
			drop,
			osDragstart,
			osDragend,
			osDragleave,
			osDragover,
			osDrop
		});
		Object.defineProperty(node, 'links', {
			configurable: true,
			get: () => links,
			set: () => {}
		});
	});
});

onBeforeUnmount(() => {
	window.removeEventListener('os-dragstart', osDragstart as EventListener);
	window.removeEventListener('os-dragend', osDragend as EventListener);
	window.removeEventListener('dirchange', dirchangeHandler as EventListener);
});

defineExpose({ update, searchFiles, backToParentFolder, el });
</script>

<style module>
:global(:where(.file-browser)) {
	position: absolute;
	inset: 0;
}

:global(:where(.file-browser.hide-nav-pane > .file-nav-pane)) {
	display: none;
}

:global(:where(.file-browser.hide-nav-pane > .file-head-pane)) {
	left: 0;
}

:global(:where(.file-browser.hide-nav-pane > .file-body-pane)) {
	left: 0;
	top: 24px;
	height: calc(100% - 24px);
}
</style>
