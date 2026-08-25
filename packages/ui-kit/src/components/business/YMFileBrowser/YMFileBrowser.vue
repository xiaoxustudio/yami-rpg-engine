<template>
	<YMFileNavPane ref="navEl" :links="links" :directory-api="childDirectoryApi" :file-system="childFileSystem" :path-util="childPathUtil" :menu-state="childMenuState" :create-text-box="childCreateTextBox" />
	<YMFileHeadPane ref="headEl" :links="links" :menu-popup="props.menuPopup" :is-folder-item="isFolderItem" />
	<YMFileBodyPane ref="bodyEl" :links="links" :data-api="props.dataApi" :window-api="props.windowApi" :gl-api="props.glApi" :menu-state="props.menuState" :clipboard-api="props.clipboardApi" :reference-api="props.referenceApi" :localize="props.localize" :editor-api="props.editorApi" :directory-api="props.directoryApi" :file-system-api="props.fileSystemApi" :path-util="props.pathUtil" :file-classes="props.fileClasses" :set-icon-clip="props.setIconClip" :create-text-box="props.createTextBox" />
</template>

<script setup lang="ts">
interface FileBrowserApi extends HTMLElement {
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
}
interface FileNavApi extends HTMLElement {
	load?(...folders: unknown[]): void;
	select?(item: unknown): void;
	getSelections?(): unknown[];
	unselect?(): void;
	clear?(): void;
	selections?: unknown[];
	[key: string]: unknown;
}
interface FileBodyApi extends HTMLElement {
	load?(folders: unknown[]): void;
	select?(...files: unknown[]): void;
	clear?(): void;
	updateFiles?(): void;
	selections?: unknown[];
	[key: string]: unknown;
}
interface FileHeadApi extends HTMLElement {
	updateAddress?(): void;
	searcherEl?: { deleteInputContent?(): void };
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
import { hideDragImage,  addClass, hasClass, removeClass } from '../../../utils/dom';
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
	rename: (oldPath: string, newPath: string) => Directory?.rename?.(oldPath, newPath) ?? Promise.resolve(),
	existsSync: (p: string) => Directory?.existsSync?.(p) ?? false
};
const childPathUtil = { dirname: (p: string) => Path?.dirname?.(p) ?? '' };
const childMenuState = () => props.menuState?.() ?? '';
const childCreateTextBox = props.createTextBox;

let display: 'normal' | 'search' = 'normal';
let directory: string | null = null;
let keyword: RegExp | null = null;
let dragging: DragEvent | PointerEvent | null = null;
let filters: unknown[] | null = null;
let backupFolders: unknown[] = [];
let searchResults: unknown[] = [];
// oxlint-disable-next-line no-explicit-any
let links: any = {};

function update(): void {
	const node = el.value as unknown as FileBrowserApi;
	if (node) {
		node.display = display;
		node.searchResults = searchResults;
	}
	const body = bodyEl.value?.el as unknown as FileBodyApi;
	body?.updateFiles?.();
	(headEl.value as unknown as FileHeadApi)?.updateAddress?.();
}

function searchFiles(kw: RegExp | string): void {
	const nav = navEl.value?.el as unknown as FileNavApi;
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
		const items = directory ?? Directory?.assets?.subfolders ?? [];
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
			(headEl.value as unknown as FileHeadApi)?.el?.querySelector?.('.file-head-searcher');
			break;
	}
}

function backToParentFolder(): boolean {
	const nav = navEl.value?.el as unknown as FileNavApi;
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
			(headEl.value as unknown as FileHeadApi)?.searcherEl?.deleteInputContent?.();
			active.focus();
			return true;
		}
	}
	return false;
}

function dirchange(event: Event): void {
	const body = bodyEl.value?.el as unknown as FileBodyApi;
	switch (display) {
		case 'normal':
			break;
		case 'search':
			searchFiles(keyword!);
			break;
	}
	const files = Array.from((body as FileBodyApi).selections ?? []);
	if (files.length !== 0) {
		const { inoMap } = Directory as unknown as { inoMap: Record<string, unknown> };
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
	const node = el.value as unknown as FileBrowserApi;
	if (directory) {
		directory = null;
		restoreDisplay();
		// oxlint-disable-next-line no-unsafe-optional-chaining
		(navEl.value?.el as unknown as FileNavApi).clear?.();
		(headEl.value as unknown as FileHeadApi)?.el?.querySelector?.('.file-head-address');
		// oxlint-disable-next-line no-unsafe-optional-chaining
		(bodyEl.value?.el as unknown as FileBodyApi).clear?.();
	}
}

function getActivePage(event: Event): HTMLElement | null {
	const nav = navEl.value?.el as unknown as FileNavApi;
	const body = bodyEl.value?.el as unknown as FileBodyApi;
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

function pointerdown(event: PointerEvent): void {
	const node = el.value as unknown as FileBrowserApi;
	switch ((dragging as DragState | null)?.mode) {
		case 'drag':
			dragend();
			return;
		case 'os-drag':
			osDragend();
			return;
	}
}

function dragstart(event: DragEvent): void {
	const node = el.value as unknown as FileBrowserApi;
	const page = getActivePage(event) as unknown as { pressing?: unknown; activeFile?: unknown; selections: unknown[]; textBox: { parentNode: Node | null } };
	if (page && !dragging) {
		if (page.pressing) {
			page.pressing = null;
		}
		const files = page.activeFile ? [page.activeFile] : (page as { selections: unknown[] }).selections;
		if (!files.includes(Directory?.assets) && !page.textBox.parentNode) {
			const { relativePaths, absolutePaths } = getFilePaths(files);
			dragging = event;
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
			(event as OsDragEvent).promise = Directory?.readdir?.(absolutePaths) ?? Promise.resolve([]);
			(event as OsDragEvent).promise!.then((dir: unknown[]) => {
				if (dir.length === 0) {
					dragend();
				}
			});
			(event as OsDragEvent).dataTransfer.effectAllowed = 'copyMove';
			hideDragImage(event.dataTransfer);
			node.addEventListener('dragenter', dragover as unknown as EventListener);
			node.addEventListener('dragleave', dragleave as unknown as EventListener);
			node.addEventListener('dragover', dragover as unknown as EventListener);
			node.addEventListener('drop', drop as unknown as EventListener);
			if (files.length === 1 && files[0] instanceof FileItem) {
				const name = (files[0] as { basename: string; extname: string }).basename + (files[0] as { extname: string }).extname;
				(event as OsDragEvent).dataTransfer.setData(
					'DownloadURL',
					`application/octet-stream:${name}:${absolutePaths[0]}`
				);
			}
		}
	}
}

function dragend(event?: DragEvent): void {
	const node = el.value as unknown as FileBrowserApi;
	if (dragging) {
		const { dropTarget, page } = dragging as unknown as DragState;
		if (dropTarget instanceof HTMLElement) {
			removeClass(dropTarget, 'drop-target');
		}
		if ((dragging as unknown as DragState).dragLeaved) {
			(page as { deactivateFile?(): void }).deactivateFile?.();
		} else {
			(page as { selectActiveFile?(): void }).selectActiveFile?.();
		}
		dragging = null;
		node.removeEventListener('dragenter', dragover as unknown as EventListener);
		node.removeEventListener('dragleave', dragleave as unknown as EventListener);
		node.removeEventListener('dragover', dragover as unknown as EventListener);
		node.removeEventListener('drop', drop as unknown as EventListener);
	}
}

function dragleave(event: DragEvent): void {
	const d = dragging as unknown as DragState;
	if (d?.dropTarget && !(el.value as HTMLElement).contains(event.relatedTarget as Node)) {
		removeClass(d.dropTarget, 'drop-target');
		d.dropTarget = null;
		if (event.relatedTarget) {
			d.dragLeaved = true;
		}
	}
}

function dragover(event: DragEvent): void {
	const node = el.value as unknown as FileBrowserApi;
	const d = dragging as unknown as DragState;
	if (d) {
		const { dropTarget } = d;
		let element = event.target as HTMLElement;
		if (!d.allowCopy && !(d as DragState).target!.contains(element)) {
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
				d.dropPath = (element as unknown as { file: { path: string } }).file.path;
				d.promise!
					.then((dir: unknown[]) => {
						const { path } = (element as unknown as { file: { path: string } }).file;
						const filePaths = d.filePaths ?? [];
						for (const filePath of filePaths) {
							if (
								path === (filePath as string) ||
								(path.indexOf(filePath as string) === 0 && path[(filePath as string).length] === '/')
							) {
								return true;
							}
						}
						return Directory?.existFiles?.(path, dir as unknown[]) ?? false;
					})
					.then((existed: boolean) => {
						if (!existed && d.dropTarget === element) {
							d.allowMove = true;
						}
					});
			} else {
				if (hasClass(element, 'file-body-pane')) {
					const nav = navEl.value?.el as unknown as FileNavApi;
					const selections = nav.selections ?? [];
					d.dropPath = selections.length === 1 ? (selections[0] as { path: string }).path : null;
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
	const node = el.value as unknown as FileBrowserApi;
	const d = dragging as unknown as DragState;
	if (d) {
		event.stopPropagation();
		if (!d.dropPath) return;
		const dropPath = File?.path?.(d.dropPath) ?? d.dropPath;
		const dropName = Path?.basename?.(dropPath) ?? dropPath;
		const get = (Local as unknown as { createGetter?: (key: string) => (key: string) => string })?.createGetter?.('menuFileOnDrop') ?? ((key: string) => '');
		const menuItems: { label: string; click: () => void }[] = [];
		switch (d.dropMode) {
			case 'move':
				menuItems.push({
					label: get('moveTo').replace('<dirName>', dropName),
					click: () => {
						d.promise!
							.then((dir: unknown[]) => Directory?.moveFiles?.(dropPath, dir))
							.finally(() => {
								Directory?.update?.();
							});
					}
				});
				break;
			case 'copy':
				menuItems.push({
					label: get('copyTo').replace('<dirName>', dropName),
					click: () => {
						d.promise!
							.then((dir: unknown[]) =>
								Directory?.saveFiles?.(d.files)?.then(() =>
									Directory?.copyFiles?.(dropPath, dir)
								)
							)
							.finally(() => {
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
	const node = el.value as unknown as FileBrowserApi;
	if (!dragging) {
		dragging = event;
		(event as OsDragEvent).mode = 'os-drag';
		(event as { dropTarget?: unknown }).dropTarget = null;
		(event as { dropPath?: string | null }).dropPath = null;
		node.addEventListener('dragenter', osDragover as unknown as EventListener);
		node.addEventListener('dragleave', osDragleave as unknown as EventListener);
		node.addEventListener('dragover', osDragover as unknown as EventListener);
		node.addEventListener('drop', osDrop as unknown as EventListener);
	}
}

function osDragend(event?: DragEvent): void {
	const node = el.value as unknown as FileBrowserApi;
	if (dragging) {
		const { dropTarget } = dragging as unknown as DragState;
		if (dropTarget instanceof HTMLElement) {
			removeClass(dropTarget, 'drop-target');
		}
		dragging = null;
		node.removeEventListener('dragenter', osDragover as unknown as EventListener);
		node.removeEventListener('dragleave', osDragleave as unknown as EventListener);
		node.removeEventListener('dragover', osDragover as unknown as EventListener);
		node.removeEventListener('drop', osDrop as unknown as EventListener);
	}
}

function osDragleave(event: DragEvent): void {
	return dragleave(event);
}

function osDragover(event: DragEvent): void {
	const node = el.value as unknown as FileBrowserApi;
	const d = dragging as unknown as DragState;
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
				d.dropPath = (element as unknown as { file: { path: string } }).file.path;
			} else {
				if (hasClass(element, 'file-body-pane')) {
					const nav = navEl.value?.el as unknown as FileNavApi;
					const selections = nav.selections ?? [];
					d.dropPath = selections.length === 1 ? (selections[0] as { path: string }).path : null;
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
	const node = el.value as unknown as FileBrowserApi;
	const { files } = (event as OsDragEvent).dataTransfer;
	if (files.length === 0) return;
	const d = dragging as unknown as DragState;
	if (d) {
		let { dropPath } = d;
		if (!dropPath) return;
		dropPath = File?.path?.(dropPath) ?? dropPath;
		const paths = Array.prototype.map.call(files, (file: File) => (file as File & { path: string }).path);
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
	const nav = navEl.value?.el as unknown as FileNavApi;
	const head = (headEl.value?.el as unknown as FileHeadApi) || (el.value?.querySelector('.file-head-pane') as unknown as FileHeadApi);
	const body = (bodyEl.value?.el as unknown as FileBodyApi) || (el.value?.querySelector('.file-body-pane') as unknown as FileBodyApi);
	const node = (nav?.closest('.file-browser') || el.value) as unknown as FileBrowserApi;
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
			const node = el.value as unknown as FileBrowserApi;
			if (!node) return;
		node.addEventListener('pointerdown', pointerdown as unknown as EventListener);
		node.addEventListener('dragstart', dragstart as unknown as EventListener);
		node.addEventListener('dragend', dragend as unknown as EventListener);
		window.addEventListener('os-dragstart', osDragstart as unknown as EventListener);
		window.addEventListener('os-dragend', osDragend as unknown as EventListener);
		dirchangeHandler = dirchange;
		window.addEventListener('dirchange', dirchangeHandler as unknown as EventListener);

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
	window.removeEventListener('os-dragstart', osDragstart as unknown as EventListener);
	window.removeEventListener('os-dragend', osDragend as unknown as EventListener);
	window.removeEventListener('dirchange', dirchangeHandler as unknown as EventListener);
});

defineExpose({ update, searchFiles, backToParentFolder, el });
</script>

<style module>
:global(:where(.file-browser)) {
	position: absolute;
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
