<template>
	<div class="file-head-pane" ref="el">
		<div class="file-head-address" ref="addressEl"></div>
		<div ref="backEl" class="item upper-level-directory" name="back" hotkey="Escape/MouseBackButton">{{ '\uf0a8' }}</div>
		<TextBox ref="searcherEl" class="file-head-searcher" name="search"></TextBox>
		<SliderBox ref="viewEl" class="file-head-view" name="view" hotkey="Ctrl+Wheel"></SliderBox>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { addClass, clear, hasClass, rect, removeClass } from '@/util/element-utils';
import { Menu } from '@/components/menu-list.ts';
import { FolderItem } from '@/file/folder-item.ts';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const props = defineProps<{
	links: {
		browser: any;
		nav: any;
		body: any;
	};
}>();

const el = ref<HTMLElement>();
const addressEl = ref<HTMLElement & { clear(): HTMLElement; appendChild(n: Node): any }>();
const backEl = ref<HTMLElement & { addClass(c: string): void; name: string }>();
const searcherEl = ref<{ root: HTMLElement & { input: HTMLInputElement; addCloseButton(): void }; input: HTMLInputElement }>();
const viewEl = ref<{ root: HTMLElement & { input: HTMLInputElement; activeWheel: boolean; read(): number } }>();

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
					const elFolder = document.createElement('file-head-address-folder') as HTMLElement & { file: any; textContent: string };
					elFolder.file = folder;
					elFolder.textContent = folder.name;
					nodes.push(elFolder);
					const { parent } = folder;
					if (parent instanceof FolderItem) {
						const elArrow = document.createElement('file-head-address-arrow') as HTMLElement & { folders: any[]; target: any };
						elArrow.folders = parent.subfolders;
						elArrow.target = folder;
						nodes.push(elArrow);
						folder = parent;
					} else {
						break;
					}
				}
				(nodes[0] as any).disabled = true;
				for (const node of nodes.reverse()) {
					address.appendChild(node);
				}
			} else if (folders.length > 1) {
				const length = folders.length;
				for (let i = 0; i < length; i++) {
					const folder = folders[i];
					const elFolder = document.createElement('file-head-address-folder') as HTMLElement & { file: any; textContent: string };
					elFolder.file = folder;
					elFolder.textContent = folder.name;
					address.appendChild(elFolder);
					if (folders[i + 1]) {
						const elLink = document.createElement('file-head-address-link') as HTMLElement & { textContent: string };
						elLink.textContent = '&';
						address.appendChild(elLink);
					}
				}
			}
			break;
		case 'search': {
			const elText = document.createElement('file-head-address-text') as HTMLElement & { textContent: string };
			elText.textContent = `${body.elements.count} 个文件`;
			address.appendChild(elText);
			break;
		}
	}
}

function pointerdown(event: any) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		const { content } = props.links.body;
		if (document.activeElement !== content) {
			content.focus();
		}
	}
}

function addressPointerdown(event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement & {
				disabled: boolean;
				file: any;
				folders: any[];
				target: any;
				rect(): DOMRect;
				hasClass(cls: string): boolean;
				addClass(cls: string): void;
				removeClass(cls: string): void;
			};
			if (element.parentNode === el.value) {
				if (hasClass(element, 'active')) {
					return;
				}
				window.addEventListener(
					'pointerup',
					(event: PointerEvent) => {
						if (event.button === 0 && element === event.target) {
							const head = el.value!;
							const nav = (head as any).links.nav;
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
									const click = function (this: any) {
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
									Menu.popup(
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

function backButtonClick(event: any) {
	const { browser } = props.links;
	browser.backToParentFolder();
}

function searcherInput(event: any) {
	if (event.inputType !== 'insertCompositionText') {
		const text = searcherEl.value!.input.value;
		props.links.browser.searchFiles(text);
	}
}

function viewFocus(event: any) {
	props.links.body.content.focus();
}

function viewInput(event: any) {
	props.links.body.setViewIndex(viewEl.value!.read());
}

onMounted(() => {
	const root = el.value!;
	(root as any).links = props.links;
	(root as any).updateAddress = updateAddress;
	(root as any).view = viewEl.value!.root;
	(root as any).searcher = searcherEl.value!.root;
	(root as any).address = addressEl.value;
	root.addEventListener('pointerdown', pointerdown as any);
	searcherEl.value!.root.addCloseButton();
	searcherEl.value!.root.addEventListener('input', searcherInput as any);
	searcherEl.value!.root.addEventListener('compositionend', searcherInput as any);
	viewEl.value!.root.input.max = '4';
	viewEl.value!.root.activeWheel = true;
	viewEl.value!.root.addEventListener('focus', viewFocus as any);
	viewEl.value!.root.addEventListener('input', viewInput as any);
	addressEl.value!.addEventListener('pointerdown', addressPointerdown as any);
	backEl.value!.addEventListener('click', backButtonClick as any);
});

defineExpose({ updateAddress, el });
</script>
