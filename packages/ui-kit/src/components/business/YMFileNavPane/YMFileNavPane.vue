<template>
	<div class="file-nav-pane" ref="el" tabindex="-1" :data-v-ref="''"></div>
</template>

<script setup lang="ts">
import { h, render, ref, onMounted, onBeforeUnmount } from 'vue';
import {
	addClass,
	hasClass,
	hasScrollBar,
	rect,
	removeClass,
	attachDoubleclick
} from '../../../utils/dom';
import {
	commonListResize,
	commonListUpdateHeadAndFoot,
	type CommonListLike
} from '../../../utils/common-list';
import { attachApi } from '../../../utils/attach-api';
import { elementDataOf } from '../../../utils/element-data';
import { createFileNavCore } from './file-nav-pane-core';
import { createPayloadEvent } from '../../../utils/payload-event';

const core = createFileNavCore();

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => {
	const host = document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
};

interface FileItem {
	name: string;
	path: string;
	stats: { ino: unknown };
	parent?: FileItem;
	subfolders: FileItem[];
	getContext(element: HTMLElement): FileItemContext;
}

interface FileItemContext {
	element?: FolderElement;
	expanded: boolean;
}

type FolderElement = HTMLElement & {
	file: FileItem;
	context: FileItemContext;
	indent: number;
	changed?: boolean;
	fileIcon?: HTMLElement;
	folderMark?: HTMLElement;
	textNode?: Text;
	markVisible?: boolean;
	textIndent?: number;
	expanded?: boolean;
}

/** P4b：这些字段走元素数据（WeakMap），不再是元素上的隐式属性 */
interface FolderElementData {
	folderMark?: HTMLElement;
	markVisible?: boolean;
	textNode?: Text;
	/** P4b：`expanded` / `changed` / `indent` 同样住在元素数据里（仍在 DATA_FIELDS 内） */
	expanded?: boolean;
	changed?: boolean;
	indent: number;
}

interface FolderItemList extends Array<FileItem> {
	sorted?: boolean;
}

interface TextBoxElement extends HTMLElement {
	input: HTMLInputElement;
	setMaxLength(maxLength: number): void;
	write(text: string): void;
	read(): string;
	fitContent(): void;
	getFocus(mode: 'all'): void;
}

interface RenameTimer {
	target: EventTarget | null;
	running: boolean;
	elapsed: number;
	timeoutId: ReturnType<typeof setTimeout> | null;
	add(): void;
	remove(): void;
}

interface FileBrowserLinks {
	browser?: {
		display?: string;
		backupFolders?: unknown[];
		update?(): void;
		restoreDisplay?(): void;
	};
	nav?: unknown;
	body?: unknown;
	[key: string]: unknown;
}

interface FolderElements extends Array<FolderElement | undefined> {
	versionId: number;
	count: number;
	start: number;
	end: number;
	head: HTMLElement | null;
	foot: HTMLElement | null;
}

type FileNavPaneElement = HTMLElement & {
	textBox?: TextBoxElement;
	load?: (...folders: FileItem[]) => void;
	update?: () => void;
	resize?: () => void;
	updateHeadAndFoot?: () => void;
	updateOnResize?: (element: FolderElement) => void;
	select?: (...files: FileItem[]) => void;
	unselect?: () => void;
	selectRelative?: (direction: 'up' | 'down') => void;
	scrollToSelection?: (mode?: string) => void;
	getSelections?: () => unknown[];
	rename?: (file: FileItem) => void;
	cancelRenaming?: () => void;
	clearElements?: (start: number) => void;
	clear?: () => HTMLElement;
	elements?: FolderElements;
	links?: FileBrowserLinks;
}

interface Props {
	links: FileBrowserLinks;
	directoryApi?: {
		sortFiles(dir: FolderItemList): void;
		getFolder(path: string): unknown;
		update(): void | Promise<boolean>;
		assets: unknown;
		inoMap: Record<string, unknown>;
	};
	fileSystem?: {
		path(p: string): string;
		rename(oldPath: string, newPath: string): Promise<unknown>;
		existsSync(p: string): boolean;
	};
	pathUtil?: { dirname(p: string): string };
	menuState?: () => string;
	createTextBox?: () => TextBoxElement | null;
}

const props = withDefaults(defineProps<Props>(), {
	directoryApi: () => ({
		sortFiles: () => {},
		getFolder: () => null,
		update: () => {},
		assets: null,
		inoMap: {}
	}),
	fileSystem: () => ({
		path: (p: string) => p,
		rename: () => Promise.resolve(),
		existsSync: () => false
	}),
	pathUtil: () => ({ dirname: () => '' }),
	menuState: () => '',
	createTextBox: () => null
});

const el = ref<HTMLElement>();

const timer: RenameTimer = {
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

let timerCallback: () => void = () => {};

let elements: FolderElements;
let selections: FileItem[] = [];
let pressing: ((event: PointerEvent) => void) | null = null;
let selectEventEnabled = false;
let textBox: TextBoxElement | undefined;
let dirchangeHandler: (event: Event) => void;
let resizeObserver: ResizeObserver | null = null;

function listenDraggingScrollbarEvent() {
	const node = el.value!;
	node.addEventListener('pointerdown', (event: PointerEvent) => {
		if (event.button === 0 && event.target === node) {
			const nodeRect = rect(node);
			if (event.offsetX >= nodeRect.width) {
				node.setPointerCapture(event.pointerId);
			}
		}
	});
}

function load(...folders: FileItem[]): void {
	select(...folders);
	for (const ancestor of core.collectAncestorFolders(folders)) {
		ancestor.getContext(el.value!).expanded = true;
	}
	update();
	const { browser } = props.links;
	browser?.update?.();
}

function update(): void {
	const els = elements;
	els.start = -1;
	els.count = 0;

	const parentNode = el.value!.parentNode as HTMLElement & {
		directory?: FolderItemList & { subfolders?: FolderItemList };
	};
	const { directory } = parentNode;
	if (directory) {
		createItems(directory.subfolders ?? directory, 0);
	}

	clearElements(els.count);
	resize();
}

function resize(): void {
	commonListResize(el.value! as unknown as CommonListLike);
}

function updateHeadAndFoot(): void {
	commonListUpdateHeadAndFoot(el.value! as unknown as CommonListLike);
}

function updateOnResize(element: FolderElement): void {
	const data = elementDataOf<FolderElementData>(element);
	if (data.changed) {
		data.changed = false;
		updateFolderElement(element);
	}
}

function createItems(dir: FolderItemList, indent: number): void {
	if (dir.sorted === undefined) {
		dir.sorted = true;
		props.directoryApi?.sortFiles(dir);
	}
	const els = elements;
	const length = dir.length;
	for (let i = 0; i < length; i++) {
		const file = dir[i];
		els[els.count++] = createFolderElement(file, indent);
		const context = file.getContext(el.value!);
		if (context.expanded && file.subfolders) {
			createItems(file.subfolders, indent + 1);
		}
	}
}

function createFolderElement(file: FileItem, indent: number): FolderElement {
	const context = file.getContext(el.value!);
	let element = context.element;
	if (element === undefined) {
		element = document.createElement('div') as unknown as FolderElement;
		addClass(element, 'file-nav-item');
		element.file = file;
		element.context = context;
		context.element = element;

		const { selections: sels } = { selections };
		if (sels.length !== 0 && sels.includes(file)) {
			addClass(element, 'selected');
		}
	}
	const data = elementDataOf<FolderElementData>(element);
	data.indent = indent;
	data.changed = true;
	return element;
}

function updateFolderElement(element: FolderElement): void {
	const { file, context } = element;
	// P4b：`folderMark`/`markVisible` 不再是元素上的隐式属性，改成显式元素数据
	const data = elementDataOf<FolderElementData>(element);
	if (!data.textNode) {
		const folderMark = renderElement(h('span', { class: 'folder-mark' }));
		element.appendChild(folderMark);

		const fileIcon = renderElement(h('span', { class: ['file-nav-icon', 'icon-folder'] }));
		element.appendChild(fileIcon);

		const textNode = document.createTextNode(file.name);
		element.appendChild(textNode);

		element.draggable = true;
		data.expanded = false;
		data.markVisible = true;
		element.textIndent = 0;
		data.folderMark = folderMark;
		element.fileIcon = fileIcon;
		data.textNode = textNode;
	}

	const { markVisible, expanded } = core.computeFolderExpansionState(file, context.expanded);
	if (data.markVisible !== markVisible) {
		data.markVisible = markVisible;
		data.folderMark!.style.visibility = markVisible ? 'inherit' : 'hidden';
	}

	if (data.expanded !== expanded) {
		data.expanded = expanded;
		switch (expanded) {
			case true:
				addClass(data.folderMark!, 'expanded');
				addClass(element.fileIcon!, 'expanded');
				break;
			case false:
				removeClass(data.folderMark!, 'expanded');
				removeClass(element.fileIcon!, 'expanded');
				break;
		}
	}

	const textIndent = core.computeTextIndent(data.indent);
	if (element.textIndent !== textIndent) {
		element.textIndent = textIndent;
		element.style.textIndent = `${textIndent}px`;
	}
}

function select(...files: FileItem[]): void {
	unselect();
	selections = files;
	for (const file of files) {
		const context = file.getContext(el.value!);
		const element = context.element;
		if (element !== undefined) {
			addClass(element, 'selected');
		}
	}
	if (selectEventEnabled) {
		const select = createPayloadEvent('select', {} as { value: FileItem[] });
		select.value = files;
		el.value!.dispatchEvent(select);
	}
}

function unselect(): void {
	const files = selections;
	if (files.length !== 0) {
		textBox?.input?.blur?.();
		for (const file of files) {
			const context = file.getContext(el.value!);
			const element = context.element;
			if (element !== undefined) {
				removeClass(element, 'selected');
			}
		}
		selections = [];
	}
}

function selectRelative(direction: 'up' | 'down'): void {
	const els = elements;
	const count = els.count;
	if (count > 0) {
		const { selections: sels } = { selections };
		const indices: number[] = [];
		for (const file of sels) {
			indices.push(els.indexOf(file.getContext(el.value!).element));
		}
		const index = core.computeRelativeSelectionIndex(direction, count, indices);
		const file = els[index]?.file;
		if (!(sels.length === 1 && sels[0] === file)) {
			select(file!);
		}
		scrollToSelection();
	}
}

function scrollToSelection(mode: string = 'active'): void {
	const { selections: sels } = { selections };
	const node = el.value as HTMLElement & { innerHeight: number };
	if (sels.length === 1 && hasScrollBar(node)) {
		const selection = sels[0];
		const els = elements;
		const count = els.count;
		for (let i = 0; i < count; i++) {
			if (els[i]!.file === selection) {
				const scrollTop = core.computeScrollTop(mode, i, node.scrollTop, node.innerHeight);
				if (scrollTop === null) {
					return;
				}
				if (node.scrollTop !== scrollTop) {
					node.scrollTop = scrollTop;
				}
				break;
			}
		}
	}
}

function getSelections(): unknown[] {
	const { browser } = props.links;
	return core.resolveSelections(browser!.display, selections, browser!.backupFolders!);
}

function rename(file: FileItem): void {
	const node = el.value!;
	if (
		document.activeElement === node &&
		file !== props.directoryApi?.assets &&
		!textBox?.parentNode
	) {
		const context = file.getContext(node);
		const element = context.element;
		if (element && element.parentNode) {
			elementDataOf<FolderElementData>(element).textNode!.nodeValue = '';
			element.appendChild(textBox!);
			textBox!.write(file.name);
			textBox!.getFocus('all');
			textBox!.fitContent();
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

function clearElements(start: number): void {
	core.clearFolderElements(elements, start);
}

function clear(): HTMLElement {
	unselect();
	const node = el.value!;
	node.textContent = '';
	clearElements(0);
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	updateHeadAndFoot();
	return node;
}

function keydown(event: KeyboardEvent): void {
	const node = el.value!;
	if ((event as KeyboardEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey) {
		switch (event.code) {
			case 'ArrowUp':
				node.scrollTop -= 20;
				break;
			case 'ArrowDown':
				node.scrollTop += 20;
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
			case 'ArrowRight': {
				event.preventDefault();
				const files = selections;
				if (files.length === 1) {
					const file = files[0];
					if (file.subfolders.length !== 0) {
						const context = file.getContext(node);
						context.expanded = !context.expanded;
						update();
					}
				}
				break;
			}
			case 'ArrowUp':
				event.preventDefault();
				selectRelative('up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				selectRelative('down');
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
	const node = el.value!;
	cancelRenaming();
	switch (event.button) {
		case 0:
		case 2: {
			let element = event.target as HTMLElement;
			if (hasClass(element, 'folder-mark')) {
				event.preventDefault();
				if (event.button === 0) {
					const file = (element.parentNode as FolderElement).file;
					const context = file.getContext(node);
					context.expanded = !context.expanded;
					update();
				}
			} else {
				if (hasClass(element, 'file-nav-icon')) {
					element = element.parentNode as HTMLElement;
				}
				if (hasClass(element, 'file-nav-item')) {
					const sels = selections;
					const length = sels.length;
					if (
						(event as PointerEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey &&
						length !== 0
					) {
						const files = Array.from(sels);
						if (!sels.includes((element as FolderElement).file)) {
							files.push((element as FolderElement).file);
							select(...files);
						} else if (length > 1) {
							const file = (element as FolderElement).file;
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
						const indices: number[] = [];
						for (const file of sels) {
							indices.push(els.indexOf(file.getContext(node).element));
						}
						const { start, end } = core.computeShiftSelectionRange(
							els.indexOf(element as FolderElement),
							indices
						);
						if (start !== -1) {
							const slice = els.slice(start, end + 1);
							select(...slice.map((element) => element!.file));
							return;
						}
					}
					if (!hasClass(element, 'selected')) {
						select((element as FolderElement).file);
					} else if (event.button === 0) {
						if (length > 1) {
							const pointerup = (event: PointerEvent) => {
								if (pressing === pointerup) {
									pressing = null;
									if (element.contains(event.target as Node)) {
										select((element as FolderElement).file);
									}
								}
							};
							pressing = pointerup;
							window.addEventListener('pointerup', pointerup, { once: true });
						} else if (
							props.menuState?.() === 'closed' &&
							document.activeElement === node &&
							event.clientX >
								rect((element as HTMLElement & { fileIcon: HTMLElement }).fileIcon)
									.right
						) {
							timer.target = event.target;
						}
					}
				}
			}
			break;
		}
	}
}

function pointerup(event: PointerEvent): void {
	const node = el.value!;
	switch (event.button) {
		case 0:
			if (document.activeElement === node && timer.target === event.target) {
				timer.running = true;
				timer.elapsed = 0;
				timer.add();
			}
			break;
	}
}

function doubleclick(event: Event): void {
	const node = el.value!;
	let element = event.target as HTMLElement;
	if (hasClass(element, 'file-nav-icon')) {
		element = element.parentNode as HTMLElement;
	}
	if (hasClass(element, 'file-nav-item')) {
		cancelRenaming();
		const folder = (element as FolderElement).file;
		if (folder.subfolders.length !== 0) {
			const context = folder.getContext(node);
			context.expanded = !context.expanded;
			update();
		}
	}
}

function listSelect(_event: Event): void {
	const { browser } = props.links;
	browser?.restoreDisplay?.();
	browser?.update?.();
}

function dirchange(_event: Event): void {
	const paths = core.resolveFolderPaths(getSelections(), props.directoryApi!.inoMap);
	const folders: unknown[] = paths.map((path) => props.directoryApi?.getFolder(path));
	const { browser } = props.links;
	switch (browser!.display) {
		case 'normal':
			unselect();
			load(...(folders as FileItem[]));
			break;
		case 'search':
			update();
			break;
	}
}

function createTextBox(): TextBoxElement {
	const tb = props.createTextBox?.();
	if (!tb) return tb!;
	tb.setMaxLength(64);
	addClass(tb, 'file-nav-text-box');
	addClass(tb.input, 'file-nav-text-box-input');

	tb.addEventListener('keydown', function (this: HTMLElement, event: KeyboardEvent) {
		event.stopPropagation();
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
			case 'Escape': {
				const item = this.parentNode as HTMLElement & { parentNode: HTMLElement };
				const nav = item.parentNode;
				tb.input.blur();
				nav.focus();
				break;
			}
		}
	});

	tb.addEventListener('beforeinput', function (event: InputEvent) {
		if (event.inputType === 'insertText' && typeof event.data === 'string') {
			if (core.isForbiddenFileNameChar(event.data)) {
				event.preventDefault();
				event.stopPropagation();
			}
		}
	});

	tb.addEventListener('input', function (this: TextBoxElement) {
		this.fitContent();
	});

	tb.addEventListener('select', function (event: Event) {
		event.stopPropagation();
	});

	tb.input.addEventListener('blur', function () {
		const item = tb.parentNode as HTMLElement & { file: FileItem; textNode: Text };
		const file = item.file;
		const name = tb.read().trim();
		tb.remove();
		if (name && name !== file.name) {
			const dir = props.pathUtil?.dirname(file.path) ?? '';
			const path = props.fileSystem!.path(`${dir}/${name}`);
			if (!props.fileSystem!.existsSync(path)) {
				return props
					.fileSystem!.rename(props.fileSystem!.path(file.path), path)
					.then(() => props.directoryApi?.update() as Promise<boolean>)
					.then((changed: boolean) => {
						if (!changed) {
							throw new Error();
						}
					})
				.catch((_error: unknown) => {
					elementDataOf<{ textNode: Text }>(item).textNode.nodeValue = file.name;
				});
			}
		}
		elementDataOf<{ textNode: Text }>(item).textNode.nodeValue = file.name;
	});

	return tb;
}

onMounted(() => {
	const node = el.value as FileNavPaneElement;
	timerCallback = () => {
		const files = selections;
		if (files.length === 1) {
			const file = files[0];
			const target = timer.target;
			const context = file.getContext(node);
			const element = context.element;
			if (element && element.contains(target as Node)) {
				rename(file);
			}
		}
		timer.target = null;
		timer.running = false;
	};

	elements = [] as unknown as FolderElements;
	elements.versionId = 0;
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	elements.head = null;
	elements.foot = null;

	textBox = createTextBox();
	node.textBox = textBox;
	listenDraggingScrollbarEvent();

	node.addEventListener('scroll', resize);
	node.addEventListener('keydown', keydown as EventListener);
	node.addEventListener('pointerdown', pointerdown as EventListener);
	node.addEventListener('pointerup', pointerup as EventListener);
	attachDoubleclick(node, doubleclick);
	node.addEventListener('select', listSelect);
	selectEventEnabled = true;

	if (typeof ResizeObserver !== 'undefined') {
		resizeObserver = new ResizeObserver(() => {
			if (node.clientHeight > 0 && elements.count > 0) {
				resize();
			}
		});
		resizeObserver.observe(node);
	}

	dirchangeHandler = dirchange.bind(undefined);
	window.addEventListener('dirchange', dirchangeHandler);

	attachApi(node, {
		load,
		update,
		resize,
		updateHeadAndFoot,
		updateOnResize,
		select,
		unselect,
		selectRelative,
		scrollToSelection,
		getSelections,
		rename,
		cancelRenaming,
		clearElements,
		clear
	});
	Object.defineProperty(node, 'selections', {
		get: () => selections,
		configurable: true
	});
	// 拖拽流程（`YMFileBrowser.dragstart`）会把待定的按下回调置空以取消这次点击选中的副作用；
	// legacy 里 `pressing` 是元素属性，换源后成了闭包变量 —— 不暴露就没有接收方。
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
});

onBeforeUnmount(() => {
	window.removeEventListener('dirchange', dirchangeHandler);
	resizeObserver?.disconnect?.();
});

defineExpose({ load, update, select, unselect, clear, getSelections, el });
</script>

<style module>
:global(:where(.file-nav-pane)) {
	position: absolute;
	width: 18%;
	height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
	border-right: var(--nav-bar-border);
}

:global(:where(.file-nav-item)) {
	display: block;
	height: 20px;
	line-height: 20px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.file-nav-item:hover)) {
	background-color: var(--list-item-background-hover);
}

:global(:where(.file-nav-item.drop-target)) {
	background-color: var(--drop-target-background);
}

:global(:where(.file-nav-pane:focus > .file-nav-item.selected)) {
	color: white;
	background-color: var(--selected-background);
}

:global(:where(.file-nav-pane:not(:focus) > .file-nav-item.selected)) {
	background-color: var(--selected-background-blur);
}

:global(:where(.file-nav-icon)) {
	display: inline-block;
	vertical-align: top;
	margin: 2px 2px 2px 0;
	width: 16px;
	height: 16px;
}

:global(:where(:focus > .selected > .file-nav-icon.icon-folder)) {
	background-color: white;
}

:global(:where(.file-nav-icon.icon-folder)) {
	background-color: var(--folder-icon-color);
	-webkit-mask-image: url(../../../Images/folder_folded.png);
	mask-image: url(../../../Images/folder_folded.png);
	-webkit-mask-size: 100%;
	mask-size: 100%;
}

:global(:where(.file-nav-icon.icon-folder.expanded)) {
	background-color: var(--folder-icon-color);
	-webkit-mask-image: url(../../../Images/folder_expanded.png);
	mask-image: url(../../../Images/folder_expanded.png);
	-webkit-mask-size: 100%;
	mask-size: 100%;
}

:global(:where(.file-nav-text-box)) {
	display: inline-block;
	position: absolute;
	text-indent: 0;
	border-color: var(--input-border-color) !important;
}

:global(:where(.file-nav-text-box-input)) {
	position: static;
	padding: 2px;
	text-align: inherit;
	vertical-align: top;
	color: var(--text-color-rename);
}
</style>
