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
/**
 * 浏览器根元素上**只剩宿主写入的数据**：`directory`（`Browser.directory = [assets]`）。
 * 方法、`display` / `searchResults` / `links` 都不再挂元素，改走实例与句柄表。
 */
type FileBrowserApi = HTMLElement & {
	directory?: unknown;
};
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

import { ref, onMounted, nextTick } from 'vue';
import { useEventListener } from '../../../composables/useEventListener';
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

/**
 * 交给三个 pane 的浏览器句柄。
 *
 * 以前 `links` 对象整体被 `defineProperty` 到 nav/head/body 元素上，pane 再从自己的元素
 * 读 `el.links`；现在只有 props 一条通道。`browser` 的成员写成 getter 而不是快照：
 * `display` / `searchResults` / `backupFolders` 是模块级状态，快照会让 pane 读到旧值。
 */
const browserHandle = {
	get display(): 'normal' | 'search' {
		return display;
	},
	get searchResults(): unknown[] {
		return searchResults;
	},
	get backupFolders(): unknown[] {
		return backupFolders;
	},
	get filters(): unknown[] | null {
		return filters;
	},
	update,
	searchFiles,
	restoreDisplay,
	backToParentFolder,
	getFilePaths
};

/**
 * 显式句柄表：`nav` / `head` / `body` 都是**组件实例**（各自的 `defineExpose`）。
 * 在 `onMounted` 的 `nextTick` 里填（模板 ref 挂载后才可用）。
 */
const links = {
	// 浏览器自己的句柄：pane 经它读 `display` / `searchResults` / `backupFolders` 并回调方法
	browser: browserHandle,
	// 三个 pane 只按**句柄**（组件实例的子集）参与协作：浏览器用不到它们的全部能力，
	// 声明成最小集合能让「谁依赖谁」在类型上可见
	nav: null as NavHandle | null,
	head: null as HeadHandle | null,
	body: null as BodyHandle | null
};

/** nav 侧句柄：选中项只经 `getSelections()`；`pressing` / `textBox` 供拖拽流程判定 */
interface NavHandle {
	el?: HTMLElement;
	getSelections?(): unknown[];
	load?(...folders: unknown[]): void;
	unselect?(): void;
	clear?(): void;
	scrollToSelection?(mode?: string): void;
	update?(): void;
	resize?(): void;
	activeFile?: unknown;
	pressing?: ((event: PointerEvent) => void) | null;
	textBox?: { parentNode: Node | null };
	selectActiveFile?(): void;
	deactivateFile?(): void;
}

/** head 侧句柄：地址栏刷新 + 搜索框（清关键字）+ 视图滑块 */
interface HeadHandle {
	el?: HTMLElement;
	updateAddress?(): void;
	searcher?: { write?(value: string): void; deleteInputContent?(): void };
	view?: { write?(index: number): void };
}

/** body 侧句柄：行刷新 / 选中 / 视图与条数 */
interface BodyHandle {
	el?: HTMLElement;
	updateFiles?(): void;
	select?(...files: unknown[]): void;
	clear?(): void;
	getSelections?(): unknown[];
	getFileCount?(): number;
	getRowFiles?(): unknown[];
	content?: HTMLElement;
	activeFile?: unknown;
	pressing?: ((event: PointerEvent) => void) | null;
	textBox?: { parentNode: Node | null };
	selectActiveFile?(): void;
	deactivateFile?(): void;
	setViewIndex?(index: number): void;
}

/** 拖拽流程里 nav 与 body 的公共面（页面元素反查句柄后统一用这份） */
type PageHandle = NavHandle | BodyHandle;

const navHandle = (): NavHandle | null => (navEl.value as NavHandle | undefined) ?? null;
const headHandle = (): HeadHandle | null => (headEl.value as HeadHandle | undefined) ?? null;
const bodyHandle = (): BodyHandle | null => (bodyEl.value as BodyHandle | undefined) ?? null;

/**
 * 由元素反查页面句柄。
 *
 * `getActivePage()` 仍然返回元素——`contains(event.target)` 是纯 DOM 判定；
 * 但读选中项/激活文件/改名文本框改走组件实例，元素上不再有这些属性。
 */
const handleOfPage = (page: HTMLElement | null): PageHandle | null => {
	if (page === null) return null;
	return page === navEl.value?.el ? links.nav : links.body;
};

/**
 * 当前项目的目录根（宿主写在浏览器元素上：`Browser.directory = [Directory.assets]`）。
 *
 * 必须读元素属性，不能只用模块局部变量：局部变量没有任何赋值点，`close()` 里的清理分支就永远
 * 进不去——关掉/切换项目时，上一个项目的文件行、文件夹行与地址栏都留在 DOM 里，打开新项目后
 * 与新内容叠在一起（"上一次的项目在背景"）。
 */
const directoryItems = (): unknown[] | null => {
	const value = (el.value as FileBrowserApi | undefined)?.directory;
	return Array.isArray(value) ? value : null;
};

function update(): void {
	bodyHandle()?.updateFiles?.();
	headHandle()?.updateAddress?.();
}

function searchFiles(kw: RegExp | string): void {
	const nav = navHandle();
	if (kw instanceof RegExp || kw.length !== 0) {
		if (display === 'normal') {
			display = 'search';
			backupFolders = nav?.getSelections?.() ?? [];
			nav?.unselect?.();
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
			nav?.load?.(...(backupFolders as unknown[]));
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
			headHandle()?.searcher?.write?.('');
			break;
	}
}

function backToParentFolder(): boolean {
	const nav = navHandle();
	switch (display) {
		case 'normal': {
			const folders = nav?.getSelections?.() ?? [];
			if (folders.length === 1) {
				const path = (folders[0] as { path: string }).path;
				const index = path.lastIndexOf('/');
				if (index !== -1) {
					nav?.load?.(Directory?.getFolder?.(path.slice(0, index)));
					return true;
				}
			}
			return false;
		}
		case 'search': {
			const active = document.activeElement as HTMLElement;
			headHandle()?.searcher?.deleteInputContent?.();
			active.focus();
			return true;
		}
	}
	return false;
}

function dirchange(_event: Event): void {
	const body = bodyHandle();
	switch (display) {
		case 'normal':
			break;
		case 'search':
			searchFiles(keyword!);
			break;
	}
	const files = Array.from(body?.getSelections?.() ?? []);
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
			body?.select?.(...files);
		}
	}
}

function close(): void {
	const node = el.value as FileBrowserApi | undefined;
	if (node?.directory) {
		node.directory = null;
		restoreDisplay();
		navHandle()?.clear?.();
		bodyHandle()?.clear?.();
		headHandle()?.updateAddress?.();
	}
}

function getActivePage(event: Event): HTMLElement | null {
	const nav = navEl.value?.el;
	const body = bodyEl.value?.el;
	if (nav === undefined || body === undefined) return null;
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
	const page = getActivePage(event);
	const handle = handleOfPage(page);
	if (page && handle && !dragging) {
		if (handle.pressing) {
			handle.pressing = null;
		}
		const files: unknown[] = handle.activeFile
			? [handle.activeFile]
			: (handle.getSelections?.() ?? []);
		if (!files.includes(Directory?.assets) && !handle.textBox?.parentNode) {
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
		const handle = handleOfPage(page as HTMLElement | null);
		if (dragging.dragLeaved) {
			handle?.deactivateFile?.();
		} else {
			handle?.selectActiveFile?.();
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
					const selections = navEl.value?.getSelections?.() ?? [];
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
					const selections = navEl.value?.getSelections?.() ?? [];
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

/**
 * 挂载后把三个 pane 的**组件实例**装进句柄表。
 *
 * 只做这件事：以前这里会把 `links` 对象 `defineProperty` 到 nav/head/body 元素上，
 * 再在浏览器元素上挂 `nav` / `head` / `body` / `links` 四个元素属性，pane 与宿主都从元素读，
 * 「元素 = 句柄」一旦拆开就两边都不知道对方改了。现在只有 props/handle 一条通道。
 *
 * 时机仍必须 `nextTick`：模板 ref 在挂载后才填。
 */
function setupLinks(): void {
	const nav = navEl.value?.el;
	const node = (nav?.closest('.file-browser') || el.value) as FileBrowserApi | undefined;
	if (node) el.value = node;
	links.nav = navHandle();
	links.head = headHandle();
	links.body = bodyHandle();
}

const windowHooksReady = ref(false);

useEventListener(window, 'os-dragstart', (event) => osDragstart(event as DragEvent), {
	enabled: windowHooksReady
});
useEventListener(window, 'os-dragend', (event) => osDragend(event as DragEvent), {
	enabled: windowHooksReady
});
useEventListener(window, 'dirchange', dirchange, { enabled: windowHooksReady });

onMounted(() => {
	nextTick(() => {
		setupLinks();
		const node = el.value as FileBrowserApi;
		if (!node) return;
		node.addEventListener('pointerdown', pointerdown as EventListener);
		node.addEventListener('dragstart', dragstart as EventListener);
		node.addEventListener('dragend', dragend as EventListener);
		windowHooksReady.value = true;

		if (node.id === 'project-browser') {
			props.onBrowserMount?.();
		} else if (node.id === 'selector-browser') {
			props.onSelectorMount?.();
		}
	});
});

/**
 * 浏览器组的对外契约：实例（而不是元素）携带方法，三个 pane 实例与 `links` 句柄表也在这里。
 *
 * `display` / `searchResults` 以前镜像到元素上供 pane/测试读，现在由 handle 的 getter 与
 * 这里的 getter 提供——元素只保留宿主写入的**目录数据** `directory`（editor 的
 * `Browser.directory = [assets]` 契约不变）。
 */
defineExpose({
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
	osDrop,
	links,
	nav: navEl,
	head: headEl,
	body: bodyEl,
	el,
	get display() {
		return display;
	},
	get searchResults() {
		return searchResults;
	}
});
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
