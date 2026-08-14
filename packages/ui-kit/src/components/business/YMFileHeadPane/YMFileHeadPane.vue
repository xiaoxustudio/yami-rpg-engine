<template>
	<div class="file-head-pane" ref="el">
		<div class="file-head-address" ref="addressEl"></div>
		<div ref="backEl" class="item upper-level-directory" name="back" hotkey="Escape/MouseBackButton">{{ '\uf0a8' }}</div>
		<YMTextBox ref="searcherEl" class="file-head-searcher" name="search"></YMTextBox>
		<YMSliderBox ref="viewEl" class="file-head-view" name="view" hotkey="Ctrl+Wheel"></YMSliderBox>
	</div>
</template>

<script setup lang="ts">
import { h, render, ref, onMounted } from 'vue';
import { addClass, hasClass, rect, removeClass } from '../../../utils/dom';
import YMTextBox from '../../basic/YMTextBox/YMTextBox.vue';
import YMSliderBox from '../../basic/YMSliderBox/YMSliderBox.vue';

const renderElement = (vnode: ReturnType<typeof h>): HTMLElement => {
	const host = document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
};

interface FileItem {
	name: string;
	parent?: FileItem;
	subfolders: FileItem[];
}

interface MenuOptions {
	x: number;
	y: number;
	close(): void;
}

interface MenuItem {
	label: string;
	checked?: boolean;
	folder?: FileItem;
	click?: (this: MenuItem) => void;
	enabled?: boolean;
}

interface FileBrowserLinks {
	browser: {
		display?: string;
		backToParentFolder(): void;
		searchFiles(kw: string): void;
	};
	nav: {
		selections: FileItem[];
		load(...files: unknown[]): void;
		scrollToSelection(mode: string): void;
	};
	body: {
		content: HTMLElement;
		elements: { count: number };
		setViewIndex(index: number): void;
	};
	[key: string]: unknown;
}

interface FileHeadElement extends HTMLElement {
	links?: FileBrowserLinks;
	updateAddress?: () => void;
	view?: HTMLElement & { input: HTMLInputElement; activeWheel: boolean; read(): number };
	searcher?: HTMLElement & { input: HTMLInputElement; addCloseButton(): void };
	address?: HTMLElement & { clear(): HTMLElement; appendChild(n: Node): Node };
}

interface Props {
	links: FileBrowserLinks;
	menuPopup?: (options: MenuOptions, items: MenuItem[]) => void;
	isFolderItem?: (obj: unknown) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
	menuPopup: () => {},
	isFolderItem: () => false
});

const el = ref<HTMLElement>();
const addressEl = ref<HTMLElement & { clear(): HTMLElement; appendChild(n: Node): Node }>();
const backEl = ref<HTMLElement & { addClass(c: string): void; name: string }>();
const searcherEl = ref<{
	root: HTMLElement & { input: HTMLInputElement; addCloseButton(): void };
	input: HTMLInputElement;
} | null>(null);
const viewEl = ref<{
	root: HTMLElement & { input: HTMLInputElement; activeWheel: boolean; read(): number };
	input: HTMLInputElement;
	read(): number;
} | null>(null);

const clear = (el: HTMLElement): HTMLElement => {
	if (!el) return el;
	el.textContent = '';
	return el;
};

function updateAddress() {
	const { browser, nav, body } = props.links;
	const folders = nav.selections;
	const address = clear(addressEl.value!);
	switch (browser.display) {
		case 'normal':
			if (folders.length === 1) {
				let folder = folders[0];
				const nodes: HTMLElement[] = [];
				while (true) {
					const elFolder = renderElement(h('file-head-address-folder')) as HTMLElement & { file: FileItem; textContent: string };
					Object.defineProperty(elFolder, 'file', {
						configurable: true,
						get: () => folder
					});
					elFolder.textContent = folder.name;
					nodes.push(elFolder);
					const { parent } = folder;
					if (props.isFolderItem(parent)) {
						const elArrow = renderElement(h('file-head-address-arrow')) as HTMLElement & { folders: FileItem[]; target: FileItem };
						Object.defineProperty(elArrow, 'folders', {
							configurable: true,
							get: () => parent!.subfolders
						});
						Object.defineProperty(elArrow, 'target', {
							configurable: true,
							get: () => folder
						});
						nodes.push(elArrow);
						folder = parent!;
					} else {
						break;
					}
				}
				(nodes[0] as HTMLElement & { disabled?: boolean }).disabled = true;
				for (const node of nodes.reverse()) {
					address.appendChild(node);
				}
			} else if (folders.length > 1) {
				const length = folders.length;
				for (let i = 0; i < length; i++) {
					const folder = folders[i];
					const elFolder = renderElement(h('file-head-address-folder')) as HTMLElement & { file: FileItem; textContent: string };
					Object.defineProperty(elFolder, 'file', {
						configurable: true,
						get: () => folder
					});
					elFolder.textContent = folder.name;
					address.appendChild(elFolder);
					if (folders[i + 1]) {
						const elLink = renderElement(h('file-head-address-link')) as HTMLElement & { textContent: string };
						elLink.textContent = '&';
						address.appendChild(elLink);
					}
				}
			}
			break;
		case 'search': {
			const elText = renderElement(h('file-head-address-text')) as HTMLElement & { textContent: string };
			elText.textContent = `${body.elements.count} 个文件`;
			address.appendChild(elText);
			break;
		}
	}
}

function pointerdown(event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		const { content } = props.links.body;
		if (document.activeElement !== content) {
			content.focus({ preventScroll: true });
		}
	}
}

function addressPointerdown(event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement & {
				disabled: boolean;
				file: FileItem;
				folders: FileItem[];
				target: FileItem;
				rect(): DOMRect;
				hasClass(cls: string): boolean;
				addClass(cls: string): void;
				removeClass(cls: string): void;
			};
			if (element.parentNode === addressEl.value) {
				if (hasClass(element, 'active')) {
					return;
				}
				window.addEventListener(
					'pointerup',
					(event: PointerEvent) => {
						if (event.button === 0 && element === event.target) {
							const head = el.value as FileHeadElement;
							const nav = head.links!.nav;
							switch (element.tagName) {
								case 'FILE-HEAD-ADDRESS-FOLDER':
									if (!element.disabled) {
										nav.load(element.file);
										nav.scrollToSelection('middle');
									}
									break;
								case 'FILE-HEAD-ADDRESS-ARROW': {
									const MAX_MENU_ITEMS = 32;
									const { folders, target } = element;
									const elementRect = rect(element);
									const length = Math.min(folders.length, MAX_MENU_ITEMS);
									const menuItems = new Array(length);
									const click = function (this: MenuItem) {
										nav.load(this.folder);
										nav.scrollToSelection('middle');
									};
									for (let i = 0; i < length; i++) {
										const folder = folders[i];
										menuItems[i] = {
											label: folder.name,
											checked: folder === target,
											folder: folder,
											click: click
										};
									}
									if (folders.length > MAX_MENU_ITEMS) {
										menuItems.push({
											label: '...',
											enabled: false
										});
									}
									addClass(element, 'active');
									props.menuPopup(
										{
											x: elementRect.left,
											y: elementRect.bottom,
											close: () => {
												removeClass(element, 'active');
											}
										},
										menuItems
									);
									break;
								}
							}
						}
					},
					{ once: true }
				);
			}
			break;
		}
	}
}

function backButtonClick(event: Event) {
	const { browser } = props.links;
	browser.backToParentFolder();
}

function searcherInput(event: Event) {
	if ((event as InputEvent).inputType !== 'insertCompositionText') {
		const text = searcherEl.value?.input?.value ?? '';
		props.links.browser.searchFiles(text);
	}
}

function viewFocus(event: Event) {
	props.links.body.content.focus({ preventScroll: true });
}

function viewInput(event: Event) {
	const value = viewEl.value?.read?.();
	if (value !== undefined) {
		props.links.body.setViewIndex(value);
	}
}

onMounted(() => {
	const root = el.value as FileHeadElement;
	Object.defineProperty(root, 'links', {
		configurable: true,
		get: () => props.links,
		set: () => {}
	});
	root.updateAddress = updateAddress;
	root.view = viewEl.value!.root;
	root.searcher = searcherEl.value!.root;
	root.address = addressEl.value;
	root.addEventListener('pointerdown', pointerdown);
	searcherEl.value?.root?.addCloseButton?.();
	searcherEl.value?.root?.addEventListener?.('input', searcherInput);
	searcherEl.value?.root?.addEventListener?.('compositionend', searcherInput);
	const viewRoot = viewEl.value?.root;
	const viewInputEl = viewEl.value?.input ?? viewRoot?.querySelector('input');
	if (viewRoot) {
		const viewApi = viewEl.value as unknown as Record<string, any>;
		for (const key of ['read', 'write', 'updateFiller', 'bar', 'filler']) {
			if (viewApi?.[key] !== undefined) {
				(viewRoot as unknown as Record<string, any>)[key] = viewApi[key];
			}
		}
		if (viewInputEl) {
			viewRoot.input = viewInputEl;
			viewInputEl.max = '4';
		}
		viewRoot.activeWheel = true;
		viewRoot.addEventListener('focus', viewFocus);
		viewRoot.addEventListener('input', viewInput);
	}
	addressEl.value?.addEventListener?.('pointerdown', addressPointerdown as EventListener);
	backEl.value?.addEventListener?.('click', backButtonClick);
});

defineExpose({ updateAddress, el });
</script>
