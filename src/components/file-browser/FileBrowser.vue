<template>
	<FileNavPane ref="navEl" :links="links" />
	<FileHeadPane ref="headEl" :links="links" />
	<FileBodyPane ref="bodyEl" :links="links" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { addClass, removeClass } from '@/util/element-utils';
import { Menu } from '@/components/menu-list.ts';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { Local } from '@/tools/localization.ts';
import { Path } from '@/util/config.ts';
import { FileBrowserLinks } from '@/types/file-browser-links.ts';
import { useBrowserStore } from '@app/stores/browser.ts';
import { useSelectorStore } from '@app/stores/selector.ts';
import FileNavPane from './FileNavPane.vue';
import FileHeadPane from './FileHeadPane.vue';
import FileBodyPane from './FileBodyPane.vue';

const props = defineProps<{
	links?: FileBrowserLinks;
}>();

const el = ref<HTMLElement>();
const navEl = ref<InstanceType<typeof FileNavPane>>();
const headEl = ref<InstanceType<typeof FileHeadPane>>();
const bodyEl = ref<InstanceType<typeof FileBodyPane>>();

let display: 'normal' | 'search' = 'normal';
let directory: string | null = null;
let keyword: RegExp | null = null;
let dragging: DragEvent | PointerEvent | null = null;
let filters: any[] | null = null;
let backupFolders: any[] = [];
let searchResults: any[] = [];
let links: FileBrowserLinks = {} as FileBrowserLinks;

function update(): void {
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
		(Directory as any).searchFiles(filters, (keyword = kw as RegExp), directory, (searchResults = []));
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
					nav.load((Directory as any).getFolder(path.slice(0, index)));
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

function getFilePaths(files: FileItem[]): { relativePaths: string[]; absolutePaths: string[] } {
	const relativePaths = files.map((file) => file.path);
	const absolutePaths = relativePaths.map((path) => File.path(path));
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
		if (!files.includes((Directory as any).assets) && !page.textBox.parentNode) {
			const { relativePaths, absolutePaths } = getFilePaths(files as FileItem[]);
			dragging = event;
			(event as any).mode = 'drag';
			(event as any).preventDefault = Function.empty as any;
			(event as any).allowMove = false;
			(event as any).allowCopy = false;
			(event as any).dragLeaved = false;
			(event as any).dropTarget = null;
			(event as any).dropPath = null;
			(event as any).dropMode = null;
			(event as any).page = page;
			(event as any).files = files;
			(event as any).filePaths = relativePaths;
			(event as any).promise = (Directory as any).readdir(absolutePaths);
			(event as any).promise.then((dir: any[]) => {
				if (dir.length === 0) {
					dragend();
				}
			});
			(event as any).dataTransfer.effectAllowed = 'copyMove';
			(event as any).dataTransfer.hideDragImage();
			node.on('dragenter', dragover);
			node.on('dragleave', dragleave);
			node.on('dragover', dragover);
			node.on('drop', drop);
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
		node.off('dragenter', dragover);
		node.off('dragleave', dragleave);
		node.off('dragover', dragover);
		node.off('drop', drop);
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
				element instanceof (node.constructor as any) ||
				element.tagName === 'FILE-NAV-PANE' ||
				element.tagName === 'FILE-BODY-PANE' ||
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
						return (Directory as any).existFiles(path, dir);
					})
					.then((existed: boolean) => {
						if (!existed && d.dropTarget === element) {
							d.allowMove = true;
						}
					});
			} else {
				if (element.tagName === 'FILE-BODY-PANE') {
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
		const dropPath = File.path(d.dropPath);
		const dropName = Path.basename(dropPath);
		const get = (Local as any).createGetter('menuFileOnDrop');
		const menuItems: any[] = [];
		switch (d.dropMode) {
			case 'move':
				menuItems.push({
					label: get('moveTo').replace('<dirName>', dropName),
					click: () => {
						d.promise
							.then((dir: any[]) => (Directory as any).moveFiles(dropPath, dir))
							.finally(() => {
								(Directory as any).update();
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
								(Directory as any)
									.saveFiles(d.files)
									.then(() => (Directory as any).copyFiles(dropPath, dir))
							)
							.finally(() => {
								(Directory as any).update();
							});
					}
				});
				break;
		}
		(Menu as any).popup({ x: event.clientX, y: event.clientY }, menuItems);
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
		node.on('dragenter', osDragover);
		node.on('dragleave', osDragleave);
		node.on('dragover', osDragover);
		node.on('drop', osDrop);
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
		node.off('dragenter', osDragover);
		node.off('dragleave', osDragleave);
		node.off('dragover', osDragover);
		node.off('drop', osDrop);
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
				element.tagName === 'FILE-BROWSER' ||
				element.tagName === 'FILE-NAV-PANE' ||
				element.tagName === 'FILE-BODY-PANE' ||
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
				if (element.tagName === 'FILE-BODY-PANE') {
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
		dropPath = File.path(dropPath);
		const map = Array.prototype.map;
		const paths = map.call(files, (file: any) => file.path);
		(Directory as any)
			.readdir(paths)
			.then((dir: any[]) => {
				return (Directory as any).copyFiles(dropPath, dir, '');
			})
			.finally(() => {
				(Directory as any).update();
			});
	}
}

function setupLinks() {
	const nav = navEl.value?.el as any;
	const node = nav?.closest('file-browser') as any;
	const head = (headEl.value?.el as any) || (node?.querySelector('file-head-pane') as any);
	const body = (bodyEl.value?.el as any) || (node?.querySelector('file-body-pane') as any);
	el.value = node;
	links.browser = node;
	links.nav = nav;
	links.head = head;
	links.body = body;
	nav.links = links;
	head.links = links;
	body.links = links;
	node.links = links;
	Object.defineProperty(node, 'nav', {
		get: () => node.querySelector('file-nav-pane'),
		configurable: true
	});
	Object.defineProperty(node, 'head', {
		get: () => node.querySelector('file-head-pane'),
		configurable: true
	});
	Object.defineProperty(node, 'body', {
		get: () => node.querySelector('file-body-pane'),
		configurable: true
	});
}

let dirchangeHandler: (event: Event) => void;

onMounted(() => {
	setupLinks();
	const node = el.value as any;
	node.addEventListener('pointerdown', pointerdown as any);
	node.addEventListener('dragstart', dragstart as any);
	node.addEventListener('dragend', dragend as any);
	window.addEventListener('os-dragstart', osDragstart as any);
	window.addEventListener('os-dragend', osDragend as any);
	dirchangeHandler = dirchange;
	window.addEventListener('dirchange', dirchangeHandler as any);

	if (node.id === 'project-browser') {
		useBrowserStore().initialize();
	} else if (node.id === 'selector-browser') {
		const selectorStore = useSelectorStore();
		selectorStore.initialize();
		(node as any).open = selectorStore.open;
	}

	(node as any).display = 'normal';
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

onBeforeUnmount(() => {
	window.removeEventListener('os-dragstart', osDragstart as any);
	window.removeEventListener('os-dragend', osDragend as any);
	window.removeEventListener('dirchange', dirchangeHandler as any);
});

defineExpose({ update, searchFiles, backToParentFolder, el });
</script>
