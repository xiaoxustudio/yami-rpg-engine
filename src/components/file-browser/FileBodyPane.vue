<template>
	<file-body-pane ref="el">
		<file-body-content ref="contentEl" tabindex="0"></file-body-content>
	</file-body-pane>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { addClass, hasClass, hasScrollBar, hide, isInContent, rect, removeClass, show } from '@/util/element-utils';
import { attachDoubleclick } from '@/util/doubleclick.ts';
import { Path } from '@/util/config.ts';
import { Data } from '@/data/data-object.ts';
import { Window } from '@/tools/window-object.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Menu } from '@/components/menu-list.ts';
import { createTextBox as createTextBoxFactory } from '@/components/text-box.ts';
import { Directory } from '@/file/directory-object.ts';
import { FileItem } from '@/file/file-item.ts';
import { File } from '@/file/file-system-core.ts';
import { FSP } from '@/file/file-system.ts';
import { FolderItem } from '@/file/folder-item.ts';
import { Reference } from '@/log/related-references.ts';
import { Editor } from '@/main/editor.ts';
import { Local } from '@/tools/localization.ts';
import { Path as PathUtil } from '@/util/config.ts';
import { FileBrowserLinks } from '@/types/file-browser-links.ts';
import { Timer } from '@/util/timer.ts';
import { setIconClip } from '@/util/icon-clip.ts';

const props = defineProps<{
	links: FileBrowserLinks;
}>();

const el = ref<HTMLElement>();
const contentEl = ref<HTMLElement>();

let viewIndex: number | null = null;
let viewMode: string | null = null;
let timer: any;
let elements: any[] & {
	versionId: number;
	count: number;
	start: number;
	end: number;
};
let activeFile: FileItem | null = null;
let selections: any[] = [];
let pressing: ((event: PointerEvent) => void) | null = null;
let openEventEnabled = false;
let selectEventEnabled = false;
let unselectEventEnabled = false;
let popupEventEnabled = false;
let textBox: any;
let windowKeydownHandler: (event: KeyboardEvent) => void;

function setViewIndex(idx: number): void {
	idx = Math.clamp(idx, 0, 4);
	if (viewIndex !== idx) {
		const { head } = props.links;
		viewIndex = idx;
		(head as any).view.write(idx);
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
		const node = el.value as any;
		mode === 'list' ? addClass(node, 'horizontal') : removeClass(node, 'horizontal');
		const content = contentEl.value as any;
		removeClass(content, viewMode!);
		addClass(content, mode!);
		resetContentStyle();
		viewMode = mode;
		computeGridProperties();
		resize();
		updateContentOffset();
	}
}

function getFiles(): any[] {
	const { browser, nav } = props.links;
	const folders = nav.selections;
	const filters = browser.filters;
	if (!filters) {
		let length = 0;
		for (const folder of folders) {
			length += folder.children.length;
		}
		let i = 0;
		const items = new Array(length);
		for (const folder of folders) {
			for (const item of folder.children) {
				items[i++] = item;
			}
		}
		return items;
	}
	const items: any[] = [];
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
			createFlatItems(browser.searchResults);
			break;
	}

	clearElements(els.count);
	resize();
}

function resize(): void {
	const node = el.value as any;
	const ch = node.clientHeight;
	const els = elements;
	if (ch === 0) return;
	const [start, end] = computeStartAndEnd();
	updateContentSize();
	if (els.start !== start || els.end !== end) {
		els.start = start;
		els.end = end;
		updateContentOffset();
		const versionId = els.versionId++;
		for (let i = start; i < end; i++) {
			const element = els[i];
			element.versionId = versionId;
			updateOnResize(element);
		}
		const content = contentEl.value as any;
		const nodes = content.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i] as any;
			if (element.versionId !== versionId) {
				element.remove();
			}
		}
		const foot = els[end - 1];
		if (foot && !foot.parentNode) {
			content.appendChild(foot);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = els[i];
			if (element.parentNode === null) {
				const next = els[i + 1];
				content.insertBefore(element, next);
			}
		}
	}
}

function computeGridProperties(): void {
	const content = contentEl.value as any;
	content.count = -1;
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
	const node = el.value as any;
	const content = contentEl.value as any;
	const WIDTH = 240;
	const HEIGHT = 20;
	const PADDING = 4;
	const GAP = 2;
	const SCROLLBAR_HEIGHT = 12;
	const nodeRect = rect(node);
	const cw = nodeRect.width;
	const ch = nodeRect.height;
	const ow = Math.max(cw - PADDING * 2 + GAP, 0);
	const oh = Math.max(ch - PADDING * 2, 0);
	const iw = WIDTH + GAP;
	const ih = HEIGHT;
	const visibleLines = Math.ceil((cw + GAP) / iw) + 1;
	const normalCountPerLine = Math.max(Math.floor(oh / ih), 1);
	const scrollCountPerLine = Math.max(Math.floor((oh - SCROLLBAR_HEIGHT) / ih), 1);
	const scrollCount = Math.floor(ow / iw) * normalCountPerLine + 1;
	content.itemSize = iw;
	content.visibleLines = visibleLines;
	content.normalCountPerLine = normalCountPerLine;
	content.scrollCountPerLine = scrollCountPerLine;
	content.scrollCount = scrollCount;
}

function computeTileGridProperties(width: number, height: number): void {
	const node = el.value as any;
	const content = contentEl.value as any;
	const PADDING = 4;
	const GAP = 2;
	const SCROLLBAR_WIDTH = 12;
	const nodeRect = rect(node);
	const cw = nodeRect.width;
	const ch = nodeRect.height;
	const ow = Math.max(cw - PADDING * 2 + GAP, 0);
	const oh = Math.max(ch - PADDING * 2 + GAP, 0);
	const iw = width + GAP;
	const ih = height + GAP;
	const visibleLines = Math.ceil((ch + GAP) / ih) + 1;
	const normalCountPerLine = Math.max(Math.floor(ow / iw), 1);
	const scrollCountPerLine = Math.max(Math.floor((ow - SCROLLBAR_WIDTH) / iw), 1);
	const scrollCount = Math.floor(oh / ih) * normalCountPerLine + 1;
	content.itemSize = ih;
	content.visibleLines = visibleLines;
	content.normalCountPerLine = normalCountPerLine;
	content.scrollCountPerLine = scrollCountPerLine;
	content.scrollCount = scrollCount;
}

function computeStartAndEnd(): Uint32Array {
	const node = el.value as any;
	const content = contentEl.value as any;
	const range = content.range;
	const count = elements.count;
	const scroll =
		viewMode === 'list'
			? Math.max(node.scrollLeft - 4, 0)
			: Math.max(node.scrollTop - 4, 0);
	const { countPerLine, itemSize, visibleLines } = content;
	const lines = Math.ceil(count / countPerLine);
	const sLine = Math.clamp(Math.floor(scroll / itemSize), 0, lines - 1);
	const start = countPerLine * sLine;
	const length = countPerLine * visibleLines;
	const end = Math.min(start + length, count);
	range[0] = start;
	range[1] = end;
	return range;
}

function updateContentSize(): void {
	const node = el.value as any;
	const content = contentEl.value as any;
	const count = elements.count;
	if (node.clientHeight !== 0 && content.count !== count) {
		content.count = count;
		const PADDING = 4;
		const GAP = 2;
		const { style, countPerLine, itemSize } = content;
		const lines = Math.ceil(count / countPerLine);
		const length = Math.max(lines * itemSize - GAP, 0) + PADDING * 2;
		if (viewMode === 'list') {
			style.width = `${length}px`;
		} else {
			style.height = `${length}px`;
		}
	}
}

function updateContentOffset(): void {
	const content = contentEl.value as any;
	const PADDING = 4;
	const start = elements.start;
	const { style, countPerLine, itemSize } = content;
	const padding = (start / countPerLine) * itemSize + PADDING;
	if (viewMode === 'list') {
		style.paddingLeft = `${padding}px`;
	} else {
		style.paddingTop = `${padding}px`;
	}
}

function resetContentStyle(): void {
	const content = contentEl.value as any;
	content.count = -1;
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

function updateOnResize(element: any): void {
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

function createFlatItems(dir: any[]): void {
	Directory.sortFiles(dir);
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

function createFolderElement(file: any): HTMLElement {
	const node = el.value as any;
	const context = file.getContext(node);
	let element = context.element;
	if (element === undefined) {
		element = document.createElement('file-body-item') as unknown as HTMLElement & {
			file: any;
			context: any;
			changed?: boolean;
		};
		(element as HTMLElement & { file: any; context: any }).file = file;
		(element as HTMLElement & { file: any; context: any }).context = context;
		context.element = element;
		const { selections: sels } = { selections };
		if (sels.length !== 0 && sels.includes(file)) {
			addClass(element as HTMLElement, 'selected');
		}
	}
	(element as HTMLElement & { changed?: boolean }).changed = true;
	return element;
}

function updateFolderElement(element: any): void {
	if (!element.nameBox) {
		const fileIcon = document.createElement('file-body-icon');
		addClass(fileIcon, 'icon-folder');
		element.appendChild(fileIcon);

		const nameBox = document.createElement('file-body-name');
		nameBox.textContent = element.file.name;
		element.appendChild(nameBox);

		element.draggable = true;
		element.fileIcon = fileIcon;
		element.nameBox = nameBox;
	}
}

function createFileElement(file: any): HTMLElement {
	const node = el.value as any;
	const context = file.getContext(node);
	let element = context.element;
	if (element === undefined) {
		element = document.createElement('file-body-item') as unknown as HTMLElement & {
			file: any;
			context: any;
			changed?: boolean;
		};
		addClass(element as HTMLElement, 'file-item');
		(element as HTMLElement & { file: any; context: any }).file = file;
		(element as HTMLElement & { file: any; context: any }).context = context;
		context.element = element;
	}
	(element as HTMLElement & { changed?: boolean }).changed = true;
	return element;
}

function updateFileElement(element: any): void {
	const { file } = element;
	const node = el.value as any;
	if (!element.nameBox) {
		const fileIcon = createIcon(file);
		element.appendChild(fileIcon);

		const nameBox = document.createElement('file-body-name');
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
	if (element.fileIcon.isImageChanged?.()) {
		updateIcon(file);
	}
}

function createIcon(file: any): HTMLElement {
	const node = el.value as any;
	const icon = document.createElement('file-body-icon');
	switch (file.type) {
		case 'actor': {
			const data = file.data;
			if (!data?.portrait) {
				addClass(icon, 'icon-file-actor');
				break;
			}
			const meta = (Data as any).manifest.guidMap[data.portrait];
			const [cx, cy, cw, ch] = data.clip;
			if (!meta || cw * ch === 0) break;
			const version = meta.mtimeMs;
			const path = `${File.getPath(data.portrait)}?ver=${version}`;
			(icon as any).isImageChanged = () => version !== meta.mtimeMs;
			setIconClip(icon, path, cx, cy, cw, ch);
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
			const meta = (Data as any).manifest.guidMap[data.icon];
			const [cx, cy, cw, ch] = data.clip;
			if (!meta || cw * ch === 0) break;
			const version = meta.mtimeMs;
			const path = `${File.getPath(data.icon)}?ver=${version}`;
			(icon as any).isImageChanged = () => version !== meta.mtimeMs;
			setIconClip(icon, path, cx, cy, cw, ch);
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
			const version = file.stats.mtimeMs;
			const path = `${file.path}?ver=${version}`;
			(icon as HTMLElement).style.backgroundImage = CSS.encodeURL(File.route(path));
			(File as any)
				.getImageResolution(path)
				.then(({ width, height }: { width: number; height: number }) => {
					if (width <= 128 && height <= 128) {
						(icon as HTMLElement).style.imageRendering = 'pixelated';
					}
					if (Math.max(width, height) > GL.maxTexSize) {
						(FileItem as any).addOversizeImagePaths(file.path);
					}
				});
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

function updateIcon(file: any): void {
	const node = el.value as any;
	const { element } = file.getContext(node);
	if (element?.fileIcon) {
		const icon = createIcon(file);
		element.replaceChild(icon, element.fileIcon);
		element.fileIcon = icon;
	}
}

function activateFile(file: any): void {
	const node = el.value as any;
	if (file instanceof FolderItem) {
		return select(file);
	}
	activeFile = file;
	if (!selections.includes(file)) {
		const context = file.getContext(node);
		addClass(context.element, 'selected');
		for (const f of selections) {
			const c = f.getContext(node);
			c.element && removeClass(c.element, 'selected');
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
	const node = el.value as any;
	if (activeFile instanceof FileItem) {
		if (!selections.includes(activeFile)) {
			const context = activeFile.getContext(node);
			removeClass(context.element, 'selected');
			for (const f of selections) {
				const c = f.getContext(node);
				c.element && addClass(c.element, 'selected');
			}
		}
		activeFile = null;
	}
}

function selectActiveFile(): void {
	if (activeFile instanceof FileItem) {
		if (!selections.includes(activeFile)) {
			select(activeFile);
		}
		activeFile = null;
	}
}

function select(...files: any[]): void {
	const node = el.value as any;
	unselect();
	selections = files;
	for (const file of files) {
		const context = file.getContext(node);
		context.element && addClass(context.element, 'selected');
	}
	if (selectEventEnabled) {
		const select: any = new Event('select');
		select.value = files;
		node.dispatchEvent(select);
	}
}

function selectAll(): void {
	const node = el.value as any;
	const els = elements;
	const count = els.count;
	const files = new Array(count);
	for (let i = 0; i < count; i++) {
		files[i] = els[i].file;
	}
	select(...files);
}

function unselect(): void {
	const node = el.value as any;
	const files = selections;
	if (files.length !== 0) {
		textBox.input.blur();
		for (const file of files) {
			const context = file.getContext(node);
			const element = context.element;
			if (element !== undefined) {
				removeClass(element, 'selected');
			}
		}
		selections = [];
		if (unselectEventEnabled) {
			const unselect: any = new Event('unselect');
			unselect.value = files;
			node.dispatchEvent(unselect);
		}
	}
}

function selectByPath(path: string): void {
	const node = el.value as any;
	const els = elements;
	const count = els.count;
	for (let i = 0; i < count; i++) {
		const { file } = els[i];
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
		if (hasClass(els[i], 'selected')) return;
	}
	if (count !== 0) {
		select(els[0].file);
	}
}

function selectRelativeInGridMode(direction: 'prev' | 'next' | 'prev-line' | 'next-line'): void {
	const node = el.value as any;
	const els = elements;
	const count = els.count;
	if (count > 0) {
		let index: number;
		let start = Infinity;
		let end = -Infinity;
		const { selections: sels } = { selections };
		for (const file of sels) {
			const { element } = file.getContext(node);
			const idx = els.indexOf(element);
			if (idx !== -1) {
				start = Math.min(start, idx);
				end = Math.max(end, idx);
			}
		}
		if (start === Infinity) {
			switch (direction) {
				case 'prev':
				case 'prev-line':
					index = count - 1;
					break;
				case 'next':
				case 'next-line':
					index = 0;
					break;
			}
		} else {
			const { countPerLine } = contentEl.value as any;
			switch (direction) {
				case 'prev':
					index = start - 1;
					break;
				case 'next':
					index = end + 1;
					break;
				case 'prev-line':
					index = start - countPerLine;
					break;
				case 'next-line':
					index = end + countPerLine;
					if (index >= count) {
						const line = Math.floor(index / countPerLine);
						const head = line * countPerLine;
						if (count > head) {
							index = count - 1;
						}
					}
					break;
			}
		}
		const file = els[index]?.file;
		if (file === undefined) return;
		if (!(sels.length === 1 && sels[0] === file)) {
			select(file);
		}
		scrollToSelectionInGridMode();
	}
}

function scrollToSelectionInGridMode(mode: string = 'active'): void {
	const node = el.value as any;
	const { selections: sels } = { selections };
	if (sels.length === 1 && hasScrollBar(node)) {
		const selection = sels[0];
		const els = elements;
		const count = els.count;
		for (let i = 0; i < count; i++) {
			if (els[i].file === selection) {
				const size = (contentEl.value as any).itemSize;
				const apl = (contentEl.value as any).countPerLine;
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
						scroll = Math.clamp(scroll, pos + size + PADDING * 2 - GAP - clientSize, pos);
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
				dirname = Path.dirname(dirname);
			}
			break;
		}
	}
	return dirname;
}

function createFolder(): void {
	const dirname = getDirName();
	if (dirname) {
		const { path, route } = File.getFileName(dirname, 'New Folder');
		FSP.mkdir(route, { recursive: true })
			.then(() => (Directory as any).update())
			.then((changed: boolean) => {
				if (changed) {
					const folder = (Directory as any).getFolder(path);
					if (folder.path === path) {
						props.links.nav.load(folder.parent);
						select(folder);
						rename(folder);
					}
				}
			});
	}
}

function showInExplorer(): void {
	const node = el.value as any;
	let length = 0;
	const els = elements;
	for (const file of selections) {
		const { element } = file.getContext(node);
		if (els.includes(element)) {
			(File as any).showInExplorer(File.path(file.path));
			if (++length === 10) break;
		}
	}
}

function openFileLocation(file: any): void {
	if (file) {
		const folder = (Directory as any).getFolder(file.path);
		if (folder instanceof FolderItem) {
			const { nav } = props.links;
			nav.load(folder);
			nav.scrollToSelection('middle');
		}
	}
}

function openFile(file: any): void {
	const node = el.value as any;
	if (file instanceof FolderItem) {
		const { nav } = props.links;
		nav.load(file);
		nav.scrollToSelection('middle');
	}
	if (file instanceof FileItem && openEventEnabled) {
		const open: any = new Event('open');
		open.value = file;
		node.dispatchEvent(open);
	}
}

function copyFiles(cut: boolean = false): void {
	const guids: string[] = [];
	for (const file of selections) {
		if (file instanceof FolderItem) return;
		if (file instanceof FileItem) {
			guids.push(file.meta.guid);
		}
	}
	if (guids.length !== 0) {
		(Clipboard as any).write('yami.files', { cut, guids });
	}
}

function pasteFiles(targetPath?: string): void {
	const { browser, nav } = props.links;
	if (!targetPath && nav.selections.length === 1) {
		targetPath = nav.selections[0].path;
	}
	if (!targetPath) return;
	const copy = (Clipboard as any).read('yami.files');
	if (copy) {
		const files: any[] = [];
		for (const guid of copy.guids) {
			const meta = (Data as any).manifest.guidMap[guid];
			if (meta) files.push(meta.file);
		}
		if (files.length !== 0) {
			const { absolutePaths } = browser.getFilePaths(files);
			(Directory as any)
				.readdir(absolutePaths)
				.then((dir: any[]) => {
					const path = File.path(targetPath);
					return copy.cut
						? (Directory as any).moveFiles(path, dir)
						: (Directory as any)
								.saveFiles(files)
								.then(() => (Directory as any).copyFiles(path, dir));
				})
				.finally(() => {
					(Directory as any).update();
				});
		}
		if (copy.cut) {
			(Clipboard as any).write('yami.no-files', null);
		}
	}
}

function deleteFiles(): void {
	const node = el.value as any;
	const files: any[] = [];
	const { selections: sels } = { selections };
	if (!sels.includes((Directory as any).assets)) {
		const els = elements;
		for (const file of sels) {
			const { element } = file.getContext(node);
			if (els.includes(element)) {
				files.push(file);
			}
		}
	}
	const { length } = files;
	if (length === 0) return;
	const get = (Local as any).createGetter('confirmation');
	if (length === 1 && files[0] instanceof FileItem) {
		const list = (Reference as any).findRelated(files[0].meta.guid);
		if (!list.isEmpty) {
			(Reference as any).openList(list);
			return Window.confirm(
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
							(Directory as any).deleteFiles(files).then(() => {
								return (Directory as any).update();
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
	return Window.confirm(
		{
			message:
				length === 1
					? get('deleteSingleFile').replace('<filename>', files[0].alias ?? files[0].name)
					: get('deleteMultipleFiles').replace('<number>', length)
		},
		[
			{
				label: get('yes'),
				click: () => {
					(Directory as any).deleteFiles(files).then(() => {
						return (Directory as any).update();
					});
				}
			},
			{
				label: get('no')
			}
		]
	);
}

function rename(file: any): void {
	const node = el.value as any;
	if (
		document.activeElement === contentEl.value &&
		file !== (Directory as any).assets &&
		!textBox.parentNode
	) {
		const context = file.getContext(node);
		const element = context.element;
		if (element && element.parentNode) {
			hide(element.nameBox);
			element.appendChild(textBox as any);
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
	const dialogs = (window as any).Editor.config.dialogs;
	const location = Path.normalize(dialogs.import);
	const images = ['png', 'jpg', 'jpeg', 'cur', 'webp'];
	const audio = ['mp3', 'm4a', 'ogg', 'wav', 'flac'];
	const videos = ['mp4', 'mkv', 'webm'];
	const fonts = ['ttf', 'otf', 'woff', 'woff2'];
	(File as any)
		.showOpenDialog({
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
		})
		.then(({ filePaths }: { filePaths: string[] }) => {
			if (filePaths.length !== 0) {
				const dir = folder.path;
				const promises: Promise<void>[] = [];
				const length = filePaths.length;
				for (let i = 0; i < length; i++) {
					const src = Path.slash(filePaths[i]);
					const ext = Path.extname(src);
					const base = Path.basename(src, ext);
					const dst = File.getFileName(dir, base, ext).route;
					promises.push(FSP.copyFile(src, dst));
				}
				Promise.all(promises).then(() => {
					return (Directory as any).update();
				});
				dialogs.import = Path.slash(Path.dirname(filePaths[0]));
			}
		});
}

function exportFile(): void {
	const node = el.value as any;
	const files = selections;
	const dialogs = (window as any).Editor.config.dialogs;
	if (files.length === 1 && files[0] instanceof FileItem) {
		const file = files[0];
		const name = file.basename + file.extname;
		(File as any)
			.showSaveDialog({
				defaultPath: Path.resolve(dialogs.export, name)
			})
			.then(({ filePath }: { filePath?: string }) => {
				if (filePath) {
					dialogs.export = Path.slash(Path.dirname(filePath));
					return FSP.copyFile(File.path(file.path), filePath);
				}
			})
			.finally(() => {
				(Directory as any).update();
			});
	} else {
		(File as any)
			.showOpenDialog({
				defaultPath: Path.normalize(dialogs.export),
				properties: ['openDirectory']
			})
			.then(({ filePaths }: { filePaths: string[] }) => {
				if (filePaths.length === 1) {
					const dirPath = filePaths[0];
					dialogs.export = Path.slash(dirPath);
					return (Directory as any)
						.readdir(files.map((file: any) => File.path(file.path)))
						.then((dir: any[]) => {
							return (Directory as any).copyFiles(dirPath, dir, '');
						});
				}
			})
			.finally(() => {
				(Directory as any).update();
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
	const node = el.value as any;
	unselect();
	const content = contentEl.value as any;
	content.textContent = '';
	clearElements(0);
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	resetContentStyle();
	return node;
}

function keydown(event: KeyboardEvent): void {
	const node = el.value as any;
	if (event.cmdOrCtrlKey) {
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
					if (elements.includes(element)) {
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
				if (!browser.backToParentFolder()) return;
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
	const node = el.value as any;
	cancelRenaming();
	switch (event.button) {
		case 0:
		case 2: {
			let element = event.target as HTMLElement;
			const content = contentEl.value as any;
			if (element === content) {
				element = node;
			}
			if (element === node) {
				if (
					node.contains(document.activeElement as Node) &&
					isInContent(node, event)
				) {
					unselect();
				}
			} else {
				if (element.tagName === 'FILE-BODY-ICON' || element.tagName === 'FILE-BODY-NAME') {
					element = element.parentNode as HTMLElement;
				}
				if (element.tagName === 'FILE-BODY-ITEM') {
					if (event.altKey && (element as any).file instanceof FileItem) {
						(Reference as any).openRelated((element as any).file.meta.guid);
						event.preventDefault();
						event.stopImmediatePropagation();
						return;
					}
					const sels = selections;
					const length = sels.length;
					if (event.cmdOrCtrlKey && length !== 0) {
						const els = elements;
						const files = Array.from(sels);
						for (let i = length - 1; i >= 0; i--) {
							const { element } = (files[i] as any).getContext(node);
							if (!els.includes(element)) {
								files.splice(i, 1);
							}
						}
						if (!sels.includes((element as any).file)) {
							(files as any).append((element as any).file);
							select(...files);
						} else if (event.button === 0) {
							(files as any).remove((element as any).file);
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
						let start = els.indexOf(element);
						let end = start;
						for (let i = 0; i < length; i++) {
							const { element } = sels[i].getContext(node);
							const index = els.indexOf(element);
							if (index !== -1) {
								start = Math.min(start, index);
								end = Math.max(end, index);
							}
						}
						if (start !== -1) {
							const slice = els.slice(start, end + 1);
							select(...slice.map((element: any) => element.file));
							return;
						}
					}
					if (!hasClass(element, 'selected')) {
						switch (event.button) {
							case 0:
								activateFile((element as any).file);
								break;
							case 2:
								select((element as any).file);
								break;
						}
					} else if (event.button === 0) {
						if (length > 1) {
							const pointerup = (event: PointerEvent) => {
								if (pressing === pointerup) {
									pressing = null;
									if (element.contains(event.target as Node)) {
										select((element as any).file);
									}
								}
							};
							pressing = pointerup;
							window.addEventListener('pointerup', pointerup, { once: true });
						} else {
							activateFile((element as any).file);
							if (
								(Menu as any).state === 'closed' &&
								document.activeElement === content &&
								(event.target as HTMLElement).tagName === 'FILE-BODY-NAME'
							) {
								timer.target = event.target;
							}
						}
					}
				}
			}
			if (event.target === node) {
				event.preventDefault();
				content.focus();
			}
			break;
		}
		case 3: {
			const { browser } = props.links;
			browser.backToParentFolder();
			break;
		}
	}
}

function pointerup(event: PointerEvent): void {
	const node = el.value as any;
	const content = contentEl.value as any;
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
				const popup: any = new Event('popup');
				popup.raw = event;
				popup.clientX = event.clientX;
				popup.clientY = event.clientY;
				node.dispatchEvent(popup);
			}
			break;
	}
}

function doubleclick(event: Event): void {
	const node = el.value as any;
	let element = event.target as HTMLElement;
	if (element.tagName === 'FILE-BODY-ICON' || element.tagName === 'FILE-BODY-NAME') {
		element = element.parentNode as HTMLElement;
	}
	if (element.tagName === 'FILE-BODY-ITEM') {
		event.preventDefault();
		cancelRenaming();
		openFile((element as any).file);
	}
}

function wheel(event: WheelEvent): void {
	const node = el.value as any;
	const { deltaY } = event;
	if (deltaY !== 0) {
		if (event.cmdOrCtrlKey) {
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
				if (
					!(Window as any).getTopWindow() ||
					(Window as any).getTopWindow()?.id === 'selector'
				) {
					addClass(contentEl.value as any, 'alt');
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
				removeClass(contentEl.value as any, 'alt');
				window.removeEventListener('keyup', windowKeyup);
				window.removeEventListener('pointermove', windowPointermove);
				break;
		}
	}
}

function windowPointermove(event: PointerEvent): void {
	if (!event.altKey) {
		removeClass(contentEl.value as any, 'alt');
		window.removeEventListener('keyup', windowKeyup);
		window.removeEventListener('pointermove', windowPointermove);
	}
}

function createTextBox(): HTMLElement {
	const tb = createTextBoxFactory();
	tb.setMaxLength(64);
	addClass(tb, 'file-body-text-box');
	addClass(tb.input, 'file-body-text-box-input');

	tb.addEventListener('keydown', function (this: any, event: KeyboardEvent) {
		event.stopPropagation();
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
			case 'Escape': {
				const item = this.parentNode as any;
				const content = item.parentNode as HTMLElement;
				this.input.blur();
				content.focus();
				break;
			}
		}
	});

	tb.addEventListener('beforeinput', function (event: any) {
		if (event.inputType === 'insertText' && typeof event.data === 'string') {
			const regexp = /[\\/:*?"<>|]/;
			if (regexp.test(event.data)) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	});

	tb.addEventListener('input', function (this: any, event: Event) {
		if (this.style.width !== '') {
			this.fitContent();
		}
	});

	tb.addEventListener('select', function (event: Event) {
		event.stopPropagation();
	});

	tb.addEventListener('blur', function (this: any, event: Event) {
		const item = this.parentNode as any;
		const file = item.file;
		const name = this.read().trim();
		let filename = name;
		this.remove();
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
			const dir = Path.dirname(file.path);
			const path = File.path(`${dir}/${filename}`);
			FSP.stat(path, (FolderItem as any).bigint)
				.then((stats: any) => {
					if (stats.ino === file.stats.ino) {
						throw new Error('same file');
					}
				})
				.catch((error: any) => {
					return FSP.rename(File.path(file.path), path).then(() => {
						item.nameBox.textContent = name;
						return (Directory as any).update();
					});
				});
		}
	});

	return tb;
}

function on(type: string, listener: (event: any) => void, options?: boolean | AddEventListenerOptions): void {
	const node = el.value as any;
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
	const node = el.value!;
	const content = contentEl.value as any;

	timer = new Timer({
		duration: 500,
		callback: (timer: any) => {
			const files = selections;
			if (files.length === 1) {
				const file = files[0];
				const target = timer.target;
				const context = file.getContext(node);
				const element = context.element;
				if (element.contains(target)) {
					rename(file);
				}
			}
			timer.target = null;
			timer.running = false;
		}
	});

	elements = [] as any;
	elements.versionId = 0;
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;

	content.range = new Uint32Array(2);
	Object.defineProperty(content, 'countPerLine', {
		get: function (this: any) {
			return elements.count < this.scrollCount
				? this.normalCountPerLine
				: this.scrollCountPerLine;
		}
	});

	textBox = createTextBox();
	(node as any).textBox = textBox;

	node.addEventListener('scroll', resize as any);
	node.addEventListener('keydown', keydown as any);
	node.addEventListener('pointerdown', pointerdown as any);
	node.addEventListener('pointerup', pointerup as any);
	attachDoubleclick(node, doubleclick as any);
	node.addEventListener('wheel', wheel as any);

	const resizeObserver = new ResizeObserver(() => {
		if (node.clientHeight > 0 && elements.count > 0) {
			resize();
		}
	});
	resizeObserver.observe(node);

	windowKeydownHandler = windowKeydown;
	window.addEventListener('keydown', windowKeydownHandler as any);

	(node as any).setViewIndex = setViewIndex;
	(node as any).updateViewMode = updateViewMode;
	(node as any).updateFiles = updateFiles;
	(node as any).resize = resize;
	(node as any).computeGridProperties = computeGridProperties;
	(node as any).updateContentSize = updateContentSize;
	(node as any).updateContentOffset = updateContentOffset;
	(node as any).resetContentStyle = resetContentStyle;
	(node as any).createFlatItems = createFlatItems;
	(node as any).select = select;
	(node as any).selectAll = selectAll;
	(node as any).unselect = unselect;
	(node as any).selectByPath = selectByPath;
	(node as any).selectDefault = selectDefault;
	(node as any).selectRelativeInGridMode = selectRelativeInGridMode;
	(node as any).getDirName = getDirName;
	(node as any).createFolder = createFolder;
	(node as any).showInExplorer = showInExplorer;
	(node as any).openFileLocation = openFileLocation;
	(node as any).openFile = openFile;
	(node as any).copyFiles = copyFiles;
	(node as any).pasteFiles = pasteFiles;
	(node as any).deleteFiles = deleteFiles;
	(node as any).rename = rename;
	(node as any).cancelRenaming = cancelRenaming;
	(node as any).importFiles = importFiles;
	(node as any).exportFile = exportFile;
	(node as any).clearElements = clearElements;
	(node as any).clear = clear;
	(node as any).on = on;
	(node as any).content = content;
	Object.defineProperty(node, 'selections', {
		get: () => selections,
		configurable: true
	});
	(node as any).elements = elements;
	(node as any).links = props.links;
	Object.defineProperty(node, 'viewIndex', {
		get: () => viewIndex,
		configurable: true
	});
});

onBeforeUnmount(() => {
	window.removeEventListener('keydown', windowKeydownHandler as any);
});

defineExpose({ setViewIndex, updateFiles, select, unselect, clear, on, el });
</script>
