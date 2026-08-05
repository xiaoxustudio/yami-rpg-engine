<template>
	<YMFileNavPane ref="navEl" :links="links" :directory-api="childDirectoryApi" :file-system="childFileSystem" :path-util="childPathUtil" :menu-state="childMenuState" :create-text-box="childCreateTextBox" />
	<YMFileHeadPane ref="headEl" :links="links" :menu-popup="props.menuPopup" :is-folder-item="isFolderItem" />
	<YMFileBodyPane ref="bodyEl" :links="links" :data-api="props.dataApi" :window-api="props.windowApi" :gl-api="props.glApi" :menu-state="props.menuState" :clipboard-api="props.clipboardApi" :reference-api="props.referenceApi" :localize="props.localize" :editor-api="props.editorApi" :directory-api="props.directoryApi" :file-system-api="props.fileSystemApi" :path-util="props.pathUtil" :file-classes="props.fileClasses" :set-icon-clip="props.setIconClip" :create-text-box="props.createTextBox" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { addClass, hasClass, removeClass } from '../../../utils/dom';
import YMFileNavPane from '../YMFileNavPane/YMFileNavPane.vue';
import YMFileHeadPane from '../YMFileHeadPane/YMFileHeadPane.vue';
import YMFileBodyPane from '../YMFileBodyPane/YMFileBodyPane.vue';

interface Props {
	id?: string;
	menuPopup?: (options: any, items: any[]) => void;
	directoryApi?: any;
	fileSystemApi?: any;
	pathUtil?: any;
	localize?: any;
	fileClasses?: { FileItem: any; FolderItem: any };
	menuState?: () => string;
	createTextBox?: () => any;
	dataApi?: any;
	windowApi?: any;
	glApi?: any;
	clipboardApi?: any;
	referenceApi?: any;
	editorApi?: any;
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

const isFolderItem = (obj: any): boolean => obj instanceof FolderItem;

const childDirectoryApi = {
	sortFiles: (dir: any) => Directory?.sortFiles?.(dir),
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
let filters: any[] | null = null;
let backupFolders: any[] = [];
let searchResults: any[] = [];
let links: any = {};

function update(): void {
	const node = el.value as any;
	if (node) {
		node.display = display;
		node.searchResults = searchResults;
	}
	const body = bodyEl.value?.el as any;
	body?.updateFiles?.();
	(headEl.value as any)?.updateAddress?.();
}

function searchFiles(kw: RegExp | string): void {
	const nav = navEl.value?.el as any;
	if (kw instanceof RegExp || kw.length !== 0) {
		if (display === 'normal') {
			display = 'search';
			backupFolders = nav.selections;
			nav.unselect();
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
			nav.load(...backupFolders);
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
			(headEl.value as any)?.el?.querySelector?.('.file-head-searcher');
			break;
	}
}

function backToParentFolder(): boolean {
	const nav = navEl.value?.el as any;
	switch (display) {
		case 'normal': {
			const folders = nav.selections;
			if (folders.length === 1) {
				const path = folders[0].path;
				const index = path.lastIndexOf('/');
				if (index !== -1) {
					nav.load(Directory?.getFolder?.(path.slice(0, index)));
					return true;
				}
			}
			return false;
		}
		case 'search': {
			const active = document.activeElement as HTMLElement;
			(headEl.value as any)?.searcherEl?.deleteInputContent?.();
			active.focus();
			return true;
		}
	}
	return false;
}

function dirchange(event: Event): void {
	const body = bodyEl.value?.el as any;
	switch (display) {
		case 'normal':
			break;
		case 'search':
			searchFiles(keyword!);
			break;
	}
	const files = Array.from((body as any).selections);
	if (files.length !== 0) {
		const { inoMap } = Directory as any;
		let modified = false;
		let i = files.length;
		while (--i >= 0) {
			const sFile = files[i];
			const ino = (sFile as any).stats.ino;
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
			(body as any).select(...files);
		}
	}
}

function close(): void {
	const node = el.value as any;
	if (directory) {
		directory = null;
		restoreDisplay();
		(navEl.value?.el as any).clear();
		(headEl.value as any)?.el?.querySelector?.('.file-head-address');
		(bodyEl.value?.el as any).clear();
	}
}

function getActivePage(event: Event): HTMLElement | null {
	const nav = navEl.value?.el as any;
	const body = bodyEl.value?.el as any;
	return nav.contains(event.target as Node)
		? nav
		: body.contains(event.target as Node)
			? body
			: null;
}

function getFilePaths(files: any[]): { relativePaths: string[]; absolutePaths: string[] } {
	const relativePaths = files.map((file) => file.path);
	const absolutePaths = relativePaths.map((path) => File?.path?.(path) ?? path);
	return { relativePaths, absolutePaths };
}

function pointerdown(event: PointerEvent): void {
	const node = el.value as any;
	switch ((dragging as any)?.mode) {
		case 'drag':
			dragend();
			return;
		case 'os-drag':
			osDragend();
			return;
	}
}

function dragstart(event: DragEvent): void {
	const node = el.value as any;
	const page = getActivePage(event) as any;
	if (page && !dragging) {
		if (page.pressing) {
			page.pressing = null;
		}
		const files = page.activeFile ? [page.activeFile] : page.selections;
		if (!files.includes(Directory?.assets) && !page.textBox.parentNode) {
			const { relativePaths, absolutePaths } = getFilePaths(files);
			dragging = event;
			(event as any).mode = 'drag';
			(event as any).preventDefault = () => {};
			(event as any).allowMove = false;
			(event as any).allowCopy = false;
			(event as any).dragLeaved = false;
			(event as any).dropTarget = null;
			(event as any).dropPath = null;
			(event as any).dropMode = null;
			(event as any).page = page;
			(event as any).files = files;
			(event as any).filePaths = relativePaths;
			(event as any).promise = Directory?.readdir?.(absolutePaths) ?? Promise.resolve([]);
			(event as any).promise.then((dir: any[]) => {
				if (dir.length === 0) {
					dragend();
				}
			});
			(event as any).dataTransfer.effectAllowed = 'copyMove';
			(event as any).dataTransfer.hideDragImage();
			node.addEventListener('dragenter', dragover as any);
			node.addEventListener('dragleave', dragleave as any);
			node.addEventListener('dragover', dragover as any);
			node.addEventListener('drop', drop as any);
			if (files.length === 1 && files[0] instanceof FileItem) {
				const name = files[0].basename + files[0].extname;
				(event as any).dataTransfer.setData(
					'DownloadURL',
					`application/octet-stream:${name}:${absolutePaths[0]}`
				);
			}
		}
	}
}

function dragend(event?: DragEvent): void {
	const node = el.value as any;
	if (dragging) {
		const { dropTarget, page } = dragging as any;
		if (dropTarget instanceof HTMLElement) {
			removeClass(dropTarget, 'drop-target');
		}
		if ((dragging as any).dragLeaved) {
			page.deactivateFile?.();
		} else {
			page.selectActiveFile?.();
		}
		dragging = null;
		node.removeEventListener('dragenter', dragover as any);
		node.removeEventListener('dragleave', dragleave as any);
		node.removeEventListener('dragover', dragover as any);
		node.removeEventListener('drop', drop as any);
	}
}

function dragleave(event: DragEvent): void {
	const d = dragging as any;
	if (d?.dropTarget && !(el.value as any).contains(event.relatedTarget as Node)) {
		removeClass(d.dropTarget, 'drop-target');
		d.dropTarget = null;
		if (event.relatedTarget) {
			d.dragLeaved = true;
		}
	}
}

function dragover(event: DragEvent): void {
	const node = el.value as any;
	const d = dragging as any;
	if (d) {
		const { dropTarget } = d;
		let element = event.target as HTMLElement;
		if (!d.allowCopy && !(d as any).target.contains(element)) {
			d.allowCopy = true;
		}
		while (
			!(
				hasClass(element, 'file-browser') ||
				hasClass(element, 'file-nav-pane') ||
				hasClass(element, 'file-body-pane') ||
				(element as any).file instanceof FolderItem
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
			if ((element as any).file instanceof FolderItem) {
				addClass(element, 'drop-target');
				d.dropPath = (element as any).file.path;
				d.promise
					.then((dir: any[]) => {
						const { path } = (element as any).file;
						const { filePaths } = d;
						for (const filePath of filePaths) {
							if (
								path === filePath ||
								(path.indexOf(filePath) === 0 && path[filePath.length] === '/')
							) {
								return true;
							}
						}
						return Directory?.existFiles?.(path, dir) ?? false;
					})
					.then((existed: boolean) => {
						if (!existed && d.dropTarget === element) {
							d.allowMove = true;
						}
					});
			} else {
				if (hasClass(element, 'file-body-pane')) {
					const nav = navEl.value?.el as any;
					const { selections } = nav;
					d.dropPath = selections.length === 1 ? selections[0].path : null;
				} else {
					d.dropPath = null;
				}
			}
		}
		if (!d.dropPath) return;
		if ((event as any).cmdOrCtrlKey) {
			if (d.allowCopy) {
				d.dropMode = 'copy';
				(event as any).dataTransfer.dropEffect = 'copy';
				event.preventDefault();
			}
		} else {
			if (d.allowMove) {
				d.dropMode = 'move';
				(event as any).dataTransfer.dropEffect = 'move';
				event.preventDefault();
			}
		}
	}
}

function drop(event: DragEvent): void {
	const node = el.value as any;
	const d = dragging as any;
	if (d) {
		event.stopPropagation();
		if (!d.dropPath) return;
		const dropPath = File?.path?.(d.dropPath) ?? d.dropPath;
		const dropName = Path?.basename?.(dropPath) ?? dropPath;
		const get = (Local as any)?.createGetter?.('menuFileOnDrop') ?? (() => '');
		const menuItems: any[] = [];
		switch (d.dropMode) {
			case 'move':
				menuItems.push({
					label: get('moveTo').replace('<dirName>', dropName),
					click: () => {
						d.promise
							.then((dir: any[]) => Directory?.moveFiles?.(dropPath, dir))
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
						d.promise
							.then((dir: any[]) =>
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
	const node = el.value as any;
	if (!dragging) {
		dragging = event;
		(event as any).mode = 'os-drag';
		(event as any).dropTarget = null;
		(event as any).dropPath = null;
		node.addEventListener('dragenter', osDragover as any);
		node.addEventListener('dragleave', osDragleave as any);
		node.addEventListener('dragover', osDragover as any);
		node.addEventListener('drop', osDrop as any);
	}
}

function osDragend(event?: DragEvent): void {
	const node = el.value as any;
	if (dragging) {
		const { dropTarget } = dragging as any;
		if (dropTarget instanceof HTMLElement) {
			removeClass(dropTarget, 'drop-target');
		}
		dragging = null;
		node.removeEventListener('dragenter', osDragover as any);
		node.removeEventListener('dragleave', osDragleave as any);
		node.removeEventListener('dragover', osDragover as any);
		node.removeEventListener('drop', osDrop as any);
	}
}

function osDragleave(event: DragEvent): void {
	return dragleave(event);
}

function osDragover(event: DragEvent): void {
	const node = el.value as any;
	const d = dragging as any;
	if (d) {
		const { dropTarget } = d;
		let element = event.target as HTMLElement;
		while (
			!(
				hasClass(element, 'file-browser') ||
				hasClass(element, 'file-nav-pane') ||
				hasClass(element, 'file-body-pane') ||
				(element as any).file instanceof FolderItem
			)
		) {
			element = element.parentNode as HTMLElement;
		}
		if (dropTarget !== element) {
			if (dropTarget instanceof HTMLElement) {
				removeClass(dropTarget, 'drop-target');
			}
			d.dropTarget = element;
			if ((element as any).file instanceof FolderItem) {
				addClass(element, 'drop-target');
				d.dropPath = (element as any).file.path;
			} else {
				if (hasClass(element, 'file-body-pane')) {
					const nav = navEl.value?.el as any;
					const { selections } = nav;
					d.dropPath = selections.length === 1 ? selections[0].path : null;
				} else {
					d.dropPath = null;
				}
			}
		}
		if (d.dropPath) {
			event.preventDefault();
			(event as any).dataTransfer.dropEffect = 'copy';
		}
	}
}

function osDrop(event: DragEvent): void {
	const node = el.value as any;
	const { files } = (event as any).dataTransfer;
	if (files.length === 0) return;
	const d = dragging as any;
	if (d) {
		let { dropPath } = d;
		if (!dropPath) return;
		dropPath = File?.path?.(dropPath) ?? dropPath;
		const paths = Array.prototype.map.call(files, (file: any) => file.path);
		Directory?.readdir?.(paths)
			?.then((dir: any[]) => {
				return Directory?.copyFiles?.(dropPath, dir, '');
			})
			?.finally(() => {
				Directory?.update?.();
			});
	}
}

function setupLinks() {
	const nav = navEl.value?.el as any;
	const head = (headEl.value?.el as any) || (el.value?.querySelector('.file-head-pane') as any);
	const body = (bodyEl.value?.el as any) || (el.value?.querySelector('.file-body-pane') as any);
	const node = nav?.closest('.file-browser') || el.value as any;
	el.value = node;
	links.browser = node;
	links.nav = nav;
	links.head = head;
	links.body = body;
	if (nav) nav.links = links;
	if (head) head.links = links;
	if (body) body.links = links;
	if (node) {
		node.links = links;
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
		const node = el.value as any;
		if (!node) return;
		node.addEventListener('pointerdown', pointerdown as any);
		node.addEventListener('dragstart', dragstart as any);
		node.addEventListener('dragend', dragend as any);
		window.addEventListener('os-dragstart', osDragstart as any);
		window.addEventListener('os-dragend', osDragend as any);
		dirchangeHandler = dirchange;
		window.addEventListener('dirchange', dirchangeHandler as any);

		if (node.id === 'project-browser') {
			props.onBrowserMount?.();
		} else if (node.id === 'selector-browser') {
			props.onSelectorMount?.();
		}

		(node as any).display = 'normal';
		(node as any).searchResults = [];
		(node as any).update = update;
		(node as any).searchFiles = searchFiles;
		(node as any).restoreDisplay = restoreDisplay;
		(node as any).backToParentFolder = backToParentFolder;
		(node as any).close = close;
		(node as any).getActivePage = getActivePage;
		(node as any).getFilePaths = getFilePaths;
		(node as any).dragstart = dragstart;
		(node as any).dragend = dragend;
		(node as any).dragleave = dragleave;
		(node as any).dragover = dragover;
		(node as any).drop = drop;
		(node as any).osDragstart = osDragstart;
		(node as any).osDragend = osDragend;
		(node as any).osDragleave = osDragleave;
		(node as any).osDragover = osDragover;
		(node as any).osDrop = osDrop;
		(node as any).links = links;
	});
});

onBeforeUnmount(() => {
	window.removeEventListener('os-dragstart', osDragstart as any);
	window.removeEventListener('os-dragend', osDragend as any);
	window.removeEventListener('dirchange', dirchangeHandler as any);
});

defineExpose({ update, searchFiles, backToParentFolder, el });
</script>
