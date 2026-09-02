<script setup lang="ts">
import {
	computed,
	getCurrentInstance,
	onBeforeUnmount,
	onMounted,
	ref,
	shallowRef,
	type ComponentInternalInstance
} from 'vue';
import { getListConfig } from '../../../utils/list-config';
import {
	createTreeListApi,
	flattenTreeRows,
	treeListPrototype,
	type TreeRenderController,
	type TreeRow
} from './tree-api';
import type { TreeItem } from './tree-core';

interface Props {
	id?: string;
	padded?: boolean;
	renderNodeExtras?: (item: unknown, container: HTMLElement) => void;
	renderNodeIcon?: (item: unknown, container: HTMLElement) => void;
}

type TreeListRootElement = HTMLElement & {
	resize: EventListener;
	keydown: EventListener;
	pointerdown: EventListener;
	pointerup: EventListener;
	dragstart: EventListener;
	dragend: EventListener;
	dataChange: EventListener;
};

type TreeListHost = HTMLElement & {
	data?: TreeItem[] | null;
	display?: string;
	searchResults?: TreeItem[];
	selections?: TreeItem[];
	root?: TreeItem | null;
	padded?: boolean;
	parseName?: (item: TreeItem) => string;
	createIcon?: (item: TreeItem) => HTMLElement;
	createText?: (item: TreeItem) => Text;
	renderNodeExtras?: (item: unknown, container: HTMLElement) => void;
	renderNodeIcon?: (item: unknown, container: HTMLElement) => void;
};

interface TreeListElements {
	length: number;
	count: number;
	start: number;
	end: number;
	head: unknown;
	foot: unknown;
	versionId: number;
	[index: number]: unknown;
}

interface RowItem {
	item?: TreeItem;
	element?: RowElement;
	textNode?: Text | null;
	folderMark?: HTMLElement | null;
	nodeIcon?: HTMLElement | null;
	extras?: HTMLElement | null;
	indent?: number;
	textIndent?: number;
	expanded?: boolean;
	markVisible?: boolean;
	changed?: boolean;
}

type RowElement = HTMLElement & RowItem;

const props = withDefaults(defineProps<Props>(), {
	padded: false
});

const instance = getCurrentInstance() as ComponentInternalInstance | null;
const root = ref<HTMLElement | null>(null);
const windowRows = shallowRef<TreeRow[]>([]);
const topGap = ref(0);
const bottomGap = ref(0);
const hasIconContainer = computed(() => typeof props.renderNodeIcon === 'function');
const hasExtrasContainer = computed(() => typeof props.renderNodeExtras === 'function');

let host: TreeListHost | null = null;
let allRows: TreeRow[] = [];
let rowStart = 0;
let rowEnd = 0;
let epoch = 0;
const createdElements = new WeakSet<HTMLElement>();
const filledElements = new WeakSet<HTMLElement>();

const flushRender = (): void => {
	if (instance?.isMounted) {
		const update = (instance as { update?: () => void }).update;
		if (typeof update === 'function') {
			update();
		}
	}
};

const rebuildRows = (): void => {
	const list = host;
	if (!list) return;
	const base = flattenTreeRows(list);
	allRows = [];
	for (const row of base) {
		allRows.push({ ...row, key: `${epoch}:${row.key}` });
	}
};

const measureWindow = (): void => {
	const list = host;
	if (!list) return;
	const scrollTop = list.scrollTop || 0;
	const clientHeight = list.clientHeight || 0;
	const total = allRows.length;
	if (total === 0 || clientHeight <= 0) {
		rowStart = 0;
		rowEnd = 0;
	} else {
		rowStart = Math.min(Math.floor(scrollTop / 20), total - 1);
		const length = Math.ceil(clientHeight / 20) + 1;
		rowEnd = Math.min(rowStart + length, total);
	}
	topGap.value = rowStart * 20;
	bottomGap.value = (total - rowEnd) * 20 + (list.padded ? 20 : 0);
};

const present = (): void => {
	windowRows.value = allRows.slice(rowStart, rowEnd);
	flushRender();
};

const bindRow = (row: TreeRow, value: unknown): void => {
	if (!host) return;
	const item = row.item as RowItem;
	if (value instanceof HTMLElement) {
		const element = value as RowElement;
		if (item.element !== element) {
			Object.defineProperty(item, 'element', {
				configurable: true,
				value: element
			});
		}
		element.item = row.item;
		element.indent = row.indent;
		element.textIndent = row.textIndent;
		element.expanded = row.expanded;
		element.markVisible = row.hasMark && row.markVisible;
		element.changed = true;
	} else {
		const element = item.element;
		if (element instanceof HTMLElement && !element.isConnected) {
			delete item.element;
		}
	}
};

const fillInternals = (element: RowElement, row: TreeRow): void => {
	const list = host;
	if (!list) return;
	if (element.textNode === undefined || element.textNode === null) {
		const textHolder = Array.from(element.querySelectorAll('.node-text'))[0] as
			| HTMLElement
			| undefined;
		if (textHolder) {
			const textNode =
				typeof list.createText === 'function'
					? list.createText(row.item)
					: document.createTextNode(String(row.item.name ?? ''));
			textHolder.appendChild(textNode as unknown as Node);
			element.textNode = textNode;
		}
	}
	if (element.folderMark === undefined) {
		element.folderMark =
			(Array.from(element.querySelectorAll('.folder-mark'))[0] as HTMLElement) ?? null;
	}
	if (element.nodeIcon === undefined) {
		const selector = typeof list.renderNodeIcon === 'function' ? '.tree-node-icon' : '.node-icon';
		element.nodeIcon =
			(Array.from(element.querySelectorAll(selector))[0] as HTMLElement) ?? null;
	}
	if (element.extras === undefined) {
		element.extras =
			typeof list.renderNodeExtras === 'function'
				? (Array.from(element.querySelectorAll('.tree-node-extras'))[0] as HTMLElement)
				: null;
	}
	element.item = row.item;
	if (
		typeof list.renderNodeIcon !== 'function' &&
		typeof list.createIcon === 'function' &&
		list.createIcon !== treeListPrototype.createIcon
	) {
		const icon = list.createIcon(row.item);
		if (icon instanceof HTMLElement && element.nodeIcon instanceof HTMLElement) {
			element.nodeIcon.className = icon.className;
		}
	}
};

const contentPass = (refreshAll: boolean): void => {
	const list = host;
	if (!list) return;
	const config = getListConfig(list);
	for (const row of windowRows.value) {
		const element = (row.item as RowItem).element;
		if (!(element instanceof HTMLElement)) continue;
		const fresh = !filledElements.has(element);
		if (fresh) {
			filledElements.add(element);
			fillInternals(element as RowElement, row);
		}
		if (!fresh && !refreshAll) continue;
		if (fresh && !createdElements.has(element)) {
			createdElements.add(element);
			for (const creator of config.creators) {
				creator(row.item);
			}
		}
		if (fresh || refreshAll) {
			for (const updater of config.updaters) {
				updater(row.item);
			}
			const extras = (element as RowElement).extras;
			if (extras instanceof HTMLElement && typeof list.renderNodeExtras === 'function') {
				list.renderNodeExtras(row.item, extras);
			}
			const icon = (element as RowElement).nodeIcon;
			if (icon instanceof HTMLElement && typeof list.renderNodeIcon === 'function') {
				list.renderNodeIcon(row.item, icon);
			}
		}
	}
};

const syncElements = (): void => {
	const list = host;
	if (!list) return;
	const elements = (list as unknown as { elements?: TreeListElements }).elements;
	if (!elements) return;
	elements.length = 0;
	elements.count = allRows.length;
	elements.start = rowStart;
	elements.end = rowEnd;
	elements.head = null;
	elements.foot = null;
	elements.versionId++;
	for (let i = 0; i < allRows.length; i++) {
		const element = (allRows[i].item as RowItem).element;
		if (element instanceof HTMLElement) {
			elements[i] = element;
		} else {
			elements[i] = { item: allRows[i].item };
		}
	}
};

const updateAll = (): void => {
	if (!host) return;
	rebuildRows();
	measureWindow();
	present();
	contentPass(true);
	syncElements();
};

const resizeWindow = (): void => {
	if (!host) return;
	measureWindow();
	present();
	contentPass(false);
	syncElements();
};

const repaint = (): void => {
	if (!host) return;
	windowRows.value = windowRows.value.slice();
	flushRender();
};

const clearAll = (): void => {
	allRows = [];
	rowStart = 0;
	rowEnd = 0;
	topGap.value = 0;
	bottomGap.value = 0;
	present();
	if (host) syncElements();
};

const refreshAll = (): void => {
	epoch++;
	updateAll();
};

const controller: TreeRenderController = {
	update: updateAll,
	resize: resizeWindow,
	clear: clearAll,
	refresh: refreshAll,
	select: repaint,
	unselect: repaint
};

const rowClass = (row: TreeRow): Record<string, boolean> => {
	const selections = host?.selections;
	return {
		selected: selections ? selections.includes(row.item) : false
	};
};

onMounted(() => {
	const el = root.value;
	if (!el) return;
	const list = el as TreeListHost;
	host = list;
	if (props.padded) list.setAttribute('padded', '');
	createTreeListApi(list, {
		renderNodeExtras: props.renderNodeExtras,
		renderNodeIcon: props.renderNodeIcon
	});
	Object.defineProperty(list, '__ymTreeController', {
		configurable: true,
		value: controller
	});
});

onBeforeUnmount(() => {
	const el = root.value as TreeListRootElement | null;
	if (!el) return;
	el.removeEventListener('scroll', el.resize);
	el.removeEventListener('keydown', el.keydown);
	el.removeEventListener('pointerdown', el.pointerdown);
	el.removeEventListener('pointerup', el.pointerup);
	el.removeEventListener('dragstart', el.dragstart);
	el.removeEventListener('dragend', el.dragend);
	el.removeEventListener('change', el.dataChange);
});
</script>

<template>
	<div ref="root" class="tree-list" :id="props.id">
		<div class="tree-scroll-spacer" :style="{ height: topGap + 'px' }" />
		<div
			v-for="row in windowRows"
			:key="row.key"
			:ref="(el: unknown) => bindRow(row, el)"
			class="node-item"
			:class="rowClass(row)"
			:style="{ textIndent: row.textIndent + 'px' }"
			draggable="true"
		>
			<span v-if="row.hasMark && row.markVisible" class="folder-mark" :class="{ expanded: row.expanded }" />
			<span v-if="hasIconContainer" class="tree-node-icon" />
			<span
				v-else
				class="node-icon"
				:class="{
					'icon-folder': row.item.class === 'folder',
					'icon-file': row.item.class !== 'folder',
					expanded: row.item.class === 'folder' && row.expanded
				}"
			/>
			<span class="node-text" />
			<span v-if="hasExtrasContainer" class="tree-node-extras" />
		</div>
		<div class="tree-scroll-spacer" :style="{ height: bottomGap + 'px' }" />
	</div>
</template>

<style module>
:global(.tree-list) {
	display: block;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	user-select: none;
}

:global(.node-item) {
	display: block;
	position: relative;
	padding-right: 32px;
	height: 20px;
	line-height: 20px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(.node-item.selected) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}

:global(.node-text) {
	pointer-events: none;
}

:global(.tree-scroll-spacer) {
	display: block;
	height: 0;
}

:global(.folder-mark) {
	display: inline-block;
	vertical-align: top;
	width: 16px;
	height: 20px;
}

:global(.node-icon) {
	display: inline-block;
	vertical-align: top;
	margin: 2px 2px 2px 0;
	width: 16px;
	height: 16px;
	line-height: 16px;
	font-size: 14px;
	font-family: var(--font-family-symbol);
	text-indent: 0;
	text-align: center;
	pointer-events: none;
}

:global(:where(.tree-node-icon)) {
	display: inline-block;
	vertical-align: top;
	width: 16px;
	height: 20px;
	margin: 0 2px 0 0;
	text-indent: 0;
	pointer-events: none;
}

:global(:where(.tree-node-extras)) {
	display: contents;
}

:global(:where(.drag-and-drop-hint)) {
	position: absolute;
	pointer-events: none;
	z-index: 0;
}

:global(.tree-list:not(.dragging) > .node-item:hover) {
	background-color: var(--list-item-background-hover);
}

:global(.tree-list:focus > .node-item.selected) {
	color: white;
	background-color: var(--selected-background);
}

:global(.tree-list:not(:focus) > .node-item.selected) {
	background-color: var(--selected-background-blur);
}

:global(.node-item.highlight) {
	color: var(--toolbar-item-color-highlight) !important;
}

:global(.node-item.hint) {
	color: var(--text-color-inverse);
}

:global(.node-item.plain) {
	padding: 0 10px;
}

:global(.node-item.weak) {
	color: var(--text-color-variable-init);
}

:global(.node-item.weak.selected) {
	color: var(--text-color-accelerator-selected) !important;
}

:global(.node-item.weak > .node-icon) {
	opacity: 0.3;
}

:global(.folder-mark::before) {
	content: '';
	display: block;
	position: absolute;
	margin: 5px 4px;
	border-top: 5px solid transparent;
	border-bottom: 5px solid transparent;
	border-left: 8px solid var(--folder-mark-color);
}

:global(.folder-mark.expanded::before) {
	margin: 6px 3px;
	border-left: 5px solid transparent;
	border-right: 5px solid transparent;
	border-top: 8px solid var(--folder-mark-color);
	border-bottom: none;
}

:global(:focus > .selected > .node-icon.icon-folder),
:global(:focus > .selected > .node-icon.icon-ui-image),
:global(:focus > .selected > .node-icon.icon-ui-text),
:global(:focus > .selected > .node-icon.icon-ui-textbox),
:global(:focus > .selected > .node-icon.icon-ui-dialogbox),
:global(:focus > .selected > .node-icon.icon-ui-progressbar),
:global(:focus > .selected > .node-icon.icon-ui-video),
:global(:focus > .selected > .node-icon.icon-ui-window),
:global(:focus > .selected > .node-icon.icon-ui-container),
:global(:focus > .selected > .node-icon.icon-ui-reference) {
	background-color: white;
}

:global(.node-icon.icon-boolean),
:global(.node-icon.icon-number),
:global(.node-icon.icon-string),
:global(.node-icon.icon-object),
:global(.node-icon.icon-any),
:global(.node-icon.icon-label) {
	margin: 6px 6px 6px 4px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

:global(.node-icon.icon-boolean) {
	background-color: var(--variable-color-boolean);
}

:global(.node-icon.icon-number) {
	background-color: var(--variable-color-number);
}

:global(.node-icon.icon-string) {
	background-color: var(--variable-color-string);
}

:global(.node-icon.icon-object) {
	background-color: var(--variable-color-object);
}

:global(.node-icon.icon-any) {
	background-color: var(--variable-color-any);
}

:global(.node-icon.icon-label) {
	background-color: var(--command-color-label);
}

:global(.node-icon.icon-note) {
	position: absolute;
	margin: 2px;
	right: 0;
	width: 16px;
	height: 16px;
	line-height: 16px;
	color: var(--text-color-variable-init);
}

:global(.selected > .node-icon.icon-note) {
	color: var(--text-color-accelerator-selected);
}

:global(:where(.icon-command)) {
	margin: 6px 6px 6px 4px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

:global(:where(.icon-command.message)),
:global(:where(.icon-command.ui)) {
	background-color: var(--command-color-element);
}

:global(:where(.icon-command.message-comment)) {
	background-color: var(--command-color-comment);
}

:global(:where(.icon-command.variable)) {
	background-color: var(--command-color-variable);
}

:global(:where(.icon-command.flow)) {
	background-color: var(--command-color-flow);
}

:global(:where(.icon-command.flow-label)) {
	background-color: var(--command-color-label);
}

:global(:where(.icon-command.flow-wait)) {
	background-color: var(--command-color-wait);
}

:global(:where(.icon-command.object)) {
	background-color: var(--command-color-object);
}

:global(:where(.icon-command.audio)) {
	background-color: var(--command-color-audio);
}

:global(:where(.icon-command.actor)) {
	background-color: var(--command-color-actor);
}

:global(:where(.icon-command.skill)) {
	background-color: var(--command-color-skill);
}

:global(:where(.icon-command.inventory)) {
	background-color: var(--command-color-inventory);
}

:global(:where(.icon-command.scene)) {
	background-color: var(--command-color-scene);
}

:global(:where(.icon-command.network)) {
	background-color: var(--command-color-network);
}

:global(:where(.icon-command.system)) {
	background-color: var(--command-color-system);
}

:global(:where(.icon-command.system-javascript)) {
	background-color: var(--command-color-text);
}

:global(:where(.icon-command.custom)) {
	background-color: var(--command-color-custom);
}

:global(.node-icon.icon-folder) {
	background-color: var(--folder-icon-color);
	-webkit-mask-image: url(../../../Images/folder_folded.png);
	mask-image: url(../../../Images/folder_folded.png);
	-webkit-mask-size: 100%;
	mask-size: 100%;
}

:global(.node-icon.icon-folder.expanded) {
	-webkit-mask-image: url(../../../Images/folder_expanded.png);
	mask-image: url(../../../Images/folder_expanded.png);
	-webkit-mask-size: 100%;
	mask-size: 100%;
}

:global(.node-icon.icon-particle-image) {
	margin: 3px 3px 3px 1px;
	width: 14px;
	height: 14px;
	image-rendering: auto !important;
}

:global(:where(.icon-file)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/file_common.png);
	mask-image: url(../../../Images/file_common.png);
	-webkit-mask-size: 100%;
	mask-size: 100%;
}

:global(.tree-node-extras .node-icon.icon-conditional),
:global(.tree-node-extras .node-icon.icon-eventEnabled),
:global(.tree-node-extras .node-icon.icon-scriptEnabled),
:global(.tree-node-extras .node-icon.icon-loop) {
	margin: 3px -2px 3px 4px;
	width: 14px;
	height: 14px;
	line-height: 14px;
	font-size: 10px;
	font-weight: bold;
	font-family: Arial, var(--font-family-symbol);
	background-color: var(--node-bubble-background);
	border-radius: 25%;
}

:global(:where(.icon-conditional)) {
	color: var(--icon-conditional-color);
}

:global(:where(.icon-eventEnabled)) {
	color: var(--icon-eventEnabled-color);
}

:global(:where(.icon-scriptEnabled)) {
	color: var(--icon-scriptEnabled-color);
}

:global(:where(.icon-loop)) {
	color: var(--icon-loop-color);
}

:global(:where(.icon-scene-region)) {
	margin: 4px 4px 4px 2px;
	width: 12px;
	height: 12px;
	border: var(--node-icon-border);
}

:global(:where(.icon-scene-parallax)) {
	margin: 3px 3px 3px 1px;
	width: 14px;
	height: 14px;
	background-size: 100%;
	background-position: center;
	background-repeat: no-repeat;
	background-color: var(--parallax-icon-background);
}

:global(:where(.icon-ui-image)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 0;
	mask-position: 0 0;
}

:global(:where(.icon-ui-text)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -100%;
	mask-position: 0 -100%;
}

:global(:where(.icon-ui-textbox)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -200%;
	mask-position: 0 -200%;
}

:global(:where(.icon-ui-dialogbox)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -300%;
	mask-position: 0 -300%;
}

:global(:where(.icon-ui-progressbar)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -400%;
	mask-position: 0 -400%;
}

:global(:where(.icon-ui-button)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -500%;
	mask-position: 0 -500%;
}

:global(:where(.icon-ui-animation)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -600%;
	mask-position: 0 -600%;
}

:global(:where(.icon-ui-video)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -700%;
	mask-position: 0 -700%;
}

:global(:where(.icon-ui-window)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -800%;
	mask-position: 0 -800%;
}

:global(:where(.icon-ui-container)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -900%;
	mask-position: 0 -900%;
}

:global(:where(.icon-ui-reference)) {
	background-color: var(--file-icon-color);
	-webkit-mask-image: url(../../../Images/ui_components.png);
	mask-image: url(../../../Images/ui_components.png);
	-webkit-mask-size: 100% 1100%;
	mask-size: 100% 1100%;
	-webkit-mask-position: 0 -1000%;
	mask-position: 0 -1000%;
}

:global(:where(.icon-ui-reference-active)) {
	background-color: var(--reference-icon-color) !important;
}

:global(:where(.icon-ui-set-as-prefab)) {
	background-color: var(--prefab-icon-color) !important;
}

:global(.visibility-icon) {
	position: absolute;
	right: 16px;
	width: 16px;
	height: 20px;
	text-indent: 2px;
	font-family: var(--font-family-symbol);
	color: var(--node-icon-color);
}

:global(.lock-icon) {
	position: absolute;
	right: 0;
	width: 16px;
	height: 20px;
	text-indent: 2px;
	font-family: var(--font-family-symbol);
	color: var(--node-icon-color);
}

:global(:where(.node-icon-highlight)) {
	color: var(--node-icon-color-highlight);
}

:global(.visibility-icon:hover),
:global(.lock-icon:hover) {
	color: var(--text-color);
}

:global(:where(.node-list-text-box)) {
	display: inline-block;
	position: absolute;
	text-indent: 0;
	border-color: var(--input-border-color) !important;
}

:global(:where(.node-list-text-box-input)) {
	position: static;
	padding: 2px;
	text-align: inherit;
	vertical-align: top;
	color: var(--text-color-rename);
}

:global(.field-set > .tree-list) {
	position: absolute;
	padding: 10px 0;
	width: 100%;
	height: 100%;
}
</style>
