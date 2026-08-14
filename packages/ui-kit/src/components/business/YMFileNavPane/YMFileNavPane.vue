<template>
	<div class="file-nav-pane" ref="el" tabindex="-1"></div>
</template>

<script setup lang="ts">
import { h, render, ref, onMounted, onBeforeUnmount } from 'vue';
import { addClass, hasClass, hasScrollBar, rect, removeClass, attachDoubleclick } from '../../../utils/dom';
import {
	commonListResize,
	commonListUpdateHeadAndFoot,
	type CommonListLike
} from '../../../utils/common-list';
import { attachApi } from '../../../utils/attach-api';

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

interface FolderElement extends HTMLElement {
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

interface FileNavPaneElement extends HTMLElement {
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
	directoryApi: () => ({ sortFiles: () => {}, getFolder: () => null, update: () => {}, assets: null, inoMap: {} }),
	fileSystem: () => ({ path: (p: string) => p, rename: () => Promise.resolve(), existsSync: () => false }),
	pathUtil: () => ({ dirname: () => '' }),
	menuState: () => '',
	createTextBox: () => null
});

const el = ref<HTMLElement>();

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

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
	for (let folder of folders) {
		while ((folder = folder.parent as FileItem)) {
			folder.getContext(el.value!).expanded = true;
		}
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
	if (element.changed) {
		element.changed = false;
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
		element = document.createElement('file-nav-item') as unknown as FolderElement;
		element.file = file;
		element.context = context;
		context.element = element;

		const { selections: sels } = { selections };
		if (sels.length !== 0 && sels.includes(file)) {
			addClass(element, 'selected');
		}
	}
	element.indent = indent;
	element.changed = true;
	return element;
}

function updateFolderElement(element: FolderElement): void {
	const { file, context } = element;
	if (!element.textNode) {
		const folderMark = renderElement(h('folder-mark'));
		element.appendChild(folderMark);

		const fileIcon = renderElement(h('file-nav-icon', { class: 'icon-folder' }));
		element.appendChild(fileIcon);

		const textNode = document.createTextNode(file.name);
		element.appendChild(textNode);

		element.draggable = true;
		element.expanded = false;
		element.markVisible = true;
		element.textIndent = 0;
		element.folderMark = folderMark;
		element.fileIcon = fileIcon;
		element.textNode = textNode;
	}

	const markVisible = file.subfolders.length !== 0;
	if (element.markVisible !== markVisible) {
		element.markVisible = markVisible;
		element.folderMark!.style.visibility = markVisible ? 'inherit' : 'hidden';
	}

	const expanded = markVisible && context.expanded;
	if (element.expanded !== expanded) {
		element.expanded = expanded;
		switch (expanded) {
			case true:
				addClass(element.folderMark!, 'expanded');
				addClass(element.fileIcon!, 'expanded');
				break;
			case false:
				removeClass(element.folderMark!, 'expanded');
				removeClass(element.fileIcon!, 'expanded');
				break;
		}
	}

	const textIndent = element.indent * 12;
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
		const select = new Event('select') as Event & { value: FileItem[] };
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
		let index: number;
		let start = Infinity;
		let end = -Infinity;
		const last = count - 1;
		const { selections: sels } = { selections };
		for (const file of sels) {
			const { element } = file.getContext(el.value!);
			const idx = els.indexOf(element);
			if (idx !== -1) {
				start = Math.min(start, idx);
				end = Math.max(end, idx);
			}
		}
		switch (direction) {
			case 'up':
				index = clamp(start - 1, 0, last);
				break;
			case 'down':
				index = clamp(end + 1, 0, last);
				break;
		}
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
				let scrollTop: number;
				switch (mode) {
					case 'active':
						scrollTop = clamp(node.scrollTop, i * 20 + 20 - node.innerHeight, i * 20);
						break;
					case 'middle':
						scrollTop = Math.round((i * 20 + 10 - node.innerHeight / 2) / 20) * 20;
						break;
					default:
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
	switch (browser!.display) {
		case 'normal':
			return selections;
		case 'search':
			return browser!.backupFolders!;
	}
	return [];
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
			element.textNode!.nodeValue = '';
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
			if (element.tagName === 'FOLDER-MARK') {
				event.preventDefault();
				if (event.button === 0) {
					const file = (element.parentNode as FolderElement).file;
					const context = file.getContext(node);
					context.expanded = !context.expanded;
					update();
				}
			} else {
				if (element.tagName === 'FILE-NAV-ICON') {
					element = element.parentNode as HTMLElement;
				}
				if (element.tagName === 'FILE-NAV-ITEM') {
					const sels = selections;
					const length = sels.length;
					if ((event as PointerEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey && length !== 0) {
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
						let start = els.indexOf(element as FolderElement);
						let end = start;
						for (const file of sels) {
							const { element } = file.getContext(node);
							const index = els.indexOf(element);
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
							event.clientX > rect((element as HTMLElement & { fileIcon: HTMLElement }).fileIcon).right
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
	if (element.tagName === 'FILE-NAV-ICON') {
		element = element.parentNode as HTMLElement;
	}
	if (element.tagName === 'FILE-NAV-ITEM') {
		cancelRenaming();
		const folder = (element as FolderElement).file;
		if (folder.subfolders.length !== 0) {
			const context = folder.getContext(node);
			context.expanded = !context.expanded;
			update();
		}
	}
}

function listSelect(event: Event): void {
	const { browser } = props.links;
	browser?.restoreDisplay?.();
	browser?.update?.();
}

function dirchange(event: Event): void {
	const node = el.value!;
	const folders: unknown[] = [];
	const { inoMap } = props.directoryApi!;
	for (const folder of getSelections()) {
		const { ino } = (folder as FileItem).stats;
		const { path } = (inoMap[ino as string] || folder) as FileItem;
		folders.push(props.directoryApi?.getFolder(path));
	}
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
			const regexp = /[\\/:*?"<>|]/;
			if (regexp.test(event.data)) {
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
				return props.fileSystem!.rename(props.fileSystem!.path(file.path), path)
					.then(() => props.directoryApi?.update() as Promise<boolean>)
					.then((changed: boolean) => {
						if (!changed) {
							throw new Error();
						}
					})
					.catch((error: unknown) => {
						item.textNode.nodeValue = file.name;
					});
			}
		}
		item.textNode.nodeValue = file.name;
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
