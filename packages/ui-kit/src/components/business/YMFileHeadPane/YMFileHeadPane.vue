<template>
	<div class="file-head-pane" ref="el" @pointerdown="pointerdown">
		<div class="file-head-address" ref="addressEl" @pointerdown="addressPointerdown">
			<AddressPart v-for="node in addressNodes" :key="node.id" :node="node" />
		</div>
		<div
			class="item upper-level-directory"
			name="back"
			hotkey="Escape/MouseBackButton"
			@click="backButtonClick"
		>
			{{ '\uf0a8' }}
		</div>
		<YMTextBox
			ref="searcherEl"
			class="file-head-searcher"
			name="search"
			:data-v-ref="''"
		></YMTextBox>
		<YMSliderBox
			ref="viewEl"
			class="file-head-view"
			name="view"
			hotkey="Ctrl+Wheel"
			:data-v-ref="''"
			@input="viewInput"
		></YMSliderBox>
	</div>
</template>

<script setup lang="ts">
import { defineComponent, h, type PropType, onMounted, ref } from 'vue';
import { addClass, hasClass, rect, removeClass, focusWithOptions } from '../../../utils/dom';
import { elementDataOf } from '../../../utils/element-data';
import YMTextBox from '../../basic/YMTextBox/YMTextBox.vue';
import YMSliderBox from '../../basic/YMSliderBox/YMSliderBox.vue';
import { createFileHeadPaneCore, type AddressNode, type FileItem } from './file-head-pane-core';
import { useEventListener } from '../../../composables/useEventListener';

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

type FileHeadElement = HTMLElement & {
	links?: FileBrowserLinks;
	updateAddress?: () => void;
	view?: HTMLElement & { input: HTMLInputElement; activeWheel: boolean; read(): number };
	searcher?: HTMLElement & { input: HTMLInputElement; addCloseButton(): void };
	address?: HTMLElement;
};

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
const addressEl = ref<HTMLElement>();
const searcherEl = ref<{
	root: HTMLElement & { input: HTMLInputElement; addCloseButton(): void };
	input: HTMLInputElement;
} | null>(null);
const viewEl = ref<{
	root: HTMLElement & { input: HTMLInputElement; activeWheel: boolean; read(): number };
	input: HTMLInputElement;
	read(): number;
} | null>(null);

const core = createFileHeadPaneCore();

const addressNodes = ref<AddressNode[]>([]);
let addressSeq = 0;

/** 地址栏元素（folder / arrow）在按下、抬起两处共用的元素形状。 */
type AddressElement = HTMLElement & {
	disabled: boolean;
	file: FileItem;
	folders: FileItem[];
	target: FileItem;
	rect(): DOMRect;
	hasClass(cls: string): boolean;
	addClass(cls: string): void;
	removeClass(cls: string): void;
};

/** 地址栏元素按下后，等待「抬起」的那一个元素；非 `null` 时 window 上挂着一次性 `pointerup`。 */
const addressPointerupTarget = ref<AddressElement | null>(null);

/**
 * 地址栏元素的「抬起」处理。
 *
 * 原先由 `addressPointerdown` 经本组件自定义的
 * `listenWindow('pointerup', fn, { once: true })` 注册，再用一个 `windowListeners` 数组 +
 * `onBeforeUnmount` 循环手工回收 —— 那正是 `useEventListener` 已经负责的事，故一并撤掉。
 *
 * ⚠️ 原监听是 `{ once: true }`（一次点击只处理一次抬起），所以处理器**无论是否命中都要清空目标**：
 * 一次性监听已被消费，`enabled` 必须回到假；否则 target 一直非 null，下一次点击时
 * `enabled` 没有 假→真 的变化，监听不会再被注册。
 */
const onAddressPointerup = (event: Event): void => {
	const element = addressPointerupTarget.value;
	addressPointerupTarget.value = null;
	if (!element) return;
	const pointer = event as PointerEvent;
	if (pointer.button !== 0 || element !== pointer.target) return;
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
			const addressData = elementDataOf<{
				folders?: FileItem[];
				target?: FileItem;
			}>(element);
			const folders = addressData.folders ?? [];
			const target = addressData.target;
			const elementRect = rect(element);
			const length = Math.min(folders.length, MAX_MENU_ITEMS);
			const menuItems = Array.from<MenuItem>({ length });
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
};

useEventListener(window, 'pointerup', onAddressPointerup, {
	enabled: () => addressPointerupTarget.value !== null,
	native: { once: true }
});

const AddressPart = defineComponent({
	props: {
		node: { type: Object as PropType<AddressNode>, required: true }
	},
	setup(props) {
		const root = ref<HTMLElement | null>(null);
		onMounted(() => {
			const element = root.value as {
				file?: FileItem;
				disabled?: boolean;
			};
			if (!element) return;
			element.file = props.node.file;
			const data = elementDataOf<{ folders?: FileItem[]; target?: FileItem }>(element);
			data.folders = props.node.folders;
			data.target = props.node.target;
			element.disabled = props.node.disabled === true;
		});
		return () =>
			h('file-head-address-' + props.node.type, { ref: root }, props.node.text ?? '');
	}
});

function updateAddress() {
	const { browser, nav, body } = props.links;
	addressNodes.value = core.buildAddressNodes({
		display: browser.display,
		selections: nav.selections,
		isFolderItem: props.isFolderItem,
		nextId: () => ++addressSeq,
		searchCount: body.elements.count
	});
}

function pointerdown(event: PointerEvent) {
	if (!(event.target instanceof HTMLInputElement)) {
		event.preventDefault();
		const { content } = props.links.body;
		if (document.activeElement !== content) {
			focusWithOptions(content, { preventScroll: true });
		}
	}
}

function addressPointerdown(event: PointerEvent) {
	switch (event.button) {
		case 0: {
			const element = event.target as AddressElement;
			if (element.parentNode === addressEl.value) {
				if (hasClass(element, 'active')) {
					return;
				}
				addressPointerupTarget.value = element;
			}
			break;
		}
	}
}

function backButtonClick(_event: Event) {
	const { browser } = props.links;
	browser.backToParentFolder();
}

function searcherInput(event: Event) {
	if ((event as InputEvent).inputType !== 'insertCompositionText') {
		const text = searcherEl.value?.input?.value ?? '';
		props.links.browser.searchFiles(text);
	}
}

/**
 * 视图滑块的 `input`。载体是 `YMSliderBox` 的 **Vue emit**（模板 `@input`），
 * 不再对 `viewEl.value.root` 挂原生监听。取值仍走 `read()`，与原先一致。
 * 参数是 emit 带上来的值，本函数不用它（故收 `unknown`）。
 */
function viewInput(_value?: unknown) {
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
	searcherEl.value?.root?.addCloseButton?.();
	// ⚠️ 这两条**必须留在原生监听**上，不能换成模板 `@input` / `@compositionend`（2026-10 定论）：
	// `searcherInput` 读的是 `(event as InputEvent).inputType`（要跳过 `insertCompositionText`），
	// 而 `YMTextBox` 的 `input` emit 带的是**值**（string），不是 InputEvent；
	// 它也没有 `compositionend` emit。要迁得先给 `YMTextBox` 加一条"原始事件"新契约。
	searcherEl.value?.root?.addEventListener?.('input', searcherInput);
	searcherEl.value?.root?.addEventListener?.('compositionend', searcherInput);
	const viewRoot = viewEl.value?.root;
	const viewInputEl = (viewEl.value?.input ?? viewRoot?.querySelector('input')) as
		| HTMLInputElement
		| null
		| undefined;
	if (viewRoot) {
		const sliderMemberKeys = ['read', 'write', 'updateFiller', 'bar', 'filler'] as const;
		type SliderViewMember = (typeof sliderMemberKeys)[number];
		const viewApi = viewEl.value as Partial<Record<SliderViewMember, unknown>>;
		for (const key of sliderMemberKeys) {
			if (viewApi?.[key] !== undefined) {
				(viewRoot as Partial<Record<SliderViewMember, unknown>>)[key] = viewApi[key];
			}
		}
		if (viewInputEl) {
			viewRoot.input = viewInputEl;
			viewInputEl.max = '4';
		}
	}
});

defineExpose({ updateAddress, el });
</script>

<style module>
:global(:where(.file-head-pane)) {
	display: flex;
	position: absolute;
	flex: 1 0 auto;
	top: 0;
	left: 18%;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

:global(:where(.file-head-address)) {
	flex: 1 0 0;
	margin: 2px 0;
	height: 20px;
	line-height: 20px;
	font-weight: bold;
	font-family: var(--font-family-bold);
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-indent: 2px;
}

:global(.file-head-address::before) {
	content: '';
	position: absolute;
	margin-left: -3px;
	width: 0;
	height: 20px;
	border-left: var(--nav-bar-border);
}

:global(:where(file-head-address-folder)) {
	display: inline-block;
	vertical-align: top;
	padding: 0 2px;
	text-indent: 0;
}

:global(:where(file-head-address-arrow)) {
	display: inline-block;
	vertical-align: top;
	width: 20px;
	height: 20px;
	text-indent: 0;
	border-color: var(--folder-mark-color);
}

:global(:where(file-head-address-link)) {
	display: inline-block;
	vertical-align: top;
	text-align: center;
	width: 20px;
	height: 20px;
	text-indent: 0;
	color: var(--folder-mark-color);
}

:global(:where(file-head-address-text)) {
	display: block;
	padding: 0 2px;
	width: 100%;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(file-head-address-folder.drop-target)) {
	background-color: var(--drop-target-background);
}

:global(:where(file-head-address-folder:hover, file-head-address-arrow:hover)) {
	background-color: var(--list-item-background-hover);
}

:global(
	:where(
		file-head-address-folder:active,
		file-head-address-arrow:active,
		file-head-address-arrow.active
	)
) {
	color: white;
	border-color: white;
	background-color: var(--selected-background);
}

:global(file-head-address-arrow::before) {
	content: '';
	display: block;
	position: absolute;
	margin: 6px 7px;
	border-top: 4px solid transparent;
	border-bottom: 4px solid transparent;
	border-left-width: 6px;
	border-left-style: solid;
	border-left-color: inherit;
}

:global(:where(.upper-level-directory)) {
	flex: 0 0 auto;
	margin: 2px 0 2px 2px;
	width: 20px;
	height: 20px;
	line-height: 20px;
	text-align: center;
	font-size: 1.2em;
	font-family: var(--font-family-symbol);
}

:global(:where(.upper-level-directory:hover)) {
	background-color: var(--list-item-background-hover);
}

:global(:where(.upper-level-directory:active)) {
	color: white;
	background-color: var(--selected-background);
}

:global(:where(.file-head-searcher)) {
	flex: 0 1 auto;
	margin: 2px;
	width: 300px;
}

:global(:where(.file-head-view)) {
	flex: 0 1 80px;
	margin: 2px 4px 2px 2px;
}
</style>
