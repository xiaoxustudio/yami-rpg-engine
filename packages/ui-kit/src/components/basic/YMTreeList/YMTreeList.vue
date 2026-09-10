<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, shallowRef, watch } from 'vue';
import { createTreeListApi } from './tree-api';
import type { TreeRenderRow, TreeRenderState } from './tree-render';

interface Props {
	id?: string;
	padded?: boolean;
	renderNodeExtras?: (item: unknown, container: HTMLElement) => void;
	renderNodeIcon?: (item: unknown, container: HTMLElement) => void;
}

interface TreeListRootElement extends HTMLElement {
	resize: EventListener;
	keydown: EventListener;
	pointerdown: EventListener;
	pointerup: EventListener;
	dragstart: EventListener;
	dragend: EventListener;
	dataChange: EventListener;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

const props = withDefaults(defineProps<Props>(), {
	padded: false
});

const root = ref<HTMLElement | null>(null);
const state = shallowRef<TreeRenderState | null>(null);
// 合成单行的注册表覆盖（文本/class）；无覆盖时直接复用派生行对象
const withRegistryOverrides = (current: TreeRenderState, row: TreeRenderRow): TreeRenderRow => {
	const override = current.textOverrides.get(row.item);
	const classes = current.itemClasses.get(row.item);
	if (override === undefined && classes === undefined) return row;
	const next = { ...row };
	if (override !== undefined) next.name = override;
	if (classes !== undefined) next.extraClasses = Array.from(classes);
	return next;
};

// 窗口行：以 version 为依赖合成「显示文本覆盖 + 业务注册 class」，
// 使 setItemText/setItemClass 这类只 bump 版本的变更即时反映（避免整体重派生 O(n²)）。
const windowRows = computed<TreeRenderRow[]>(() => {
	const current = state.value;
	if (current === null) return [];
	void current.version.value;
	return current.rows.value
		.slice(current.start.value, current.end.value)
		.map((row) => withRegistryOverrides(current, row));
});

const listOf = (): TreeListRootElement | null => (root.value as TreeListRootElement | null) ?? null;

// 行 class：受控状态（选中/展开/拖拽提示）+ 业务注册 class（itemClasses）
const rowClasses = (row: TreeRenderRow): unknown[] => [
	row.selected ? 'selected' : '',
	row.expanded ? 'expanded' : '',
	row.hint ? 'hint' : '',
	...row.extraClasses
];

const onRowRef = (item: unknown, el: unknown): void => {
	listOf()?.bindRow?.(item, el);
};

const onIconRef = (item: unknown, el: unknown): void => {
	if (el instanceof HTMLElement) listOf()?.bindNodeIcon?.(item, el);
};

const onExtrasRef = (item: unknown, el: unknown): void => {
	if (el instanceof HTMLElement) listOf()?.bindNodeExtras?.(item, el);
};

onMounted(() => {
	const el = root.value;
	if (!el) return;
	if (props.padded) el.setAttribute('padded', '');
	createTreeListApi(el, {
		renderNodeExtras: props.renderNodeExtras,
		renderNodeIcon: props.renderNodeIcon
	});
	const list = el as TreeListRootElement;
	state.value = (list.renderState as TreeRenderState | undefined) ?? null;
	if (state.value !== null) {
		// 行集合变化后刷新派生内容（updaters / extras / icon 回调）
		watch(windowRows, () => {
			void nextTick(() => list.applyRowUpdaters?.());
		});
		void nextTick(() => list.applyRowUpdaters?.());
	}
});

// patch 之后：elements shim 与派生内容（updaters/extras/icon）都以真实绑定结果为准
onUpdated(() => {
	const list = listOf();
	if (list?.renderState === undefined) return;
	list.syncElementsShim?.();
	list.applyRowUpdaters?.();
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
	<div ref="root" class="tree-list" :id="props.id" tabindex="0">
		<template v-if="state !== null">
			<div class="scroll-spacer top" :style="{ height: state.start.value * 20 + 'px' }" />
			<div
				v-for="row in windowRows"
				:key="row.key"
				:ref="(el) => onRowRef(row.item, el)"
				class="node-item"
				:class="rowClasses(row)"
				:style="{ textIndent: row.textIndent + 'px' }"
				draggable="true"
			>
				<span
					v-if="row.hasChildrenMark"
					class="folder-mark"
					:class="{ expanded: row.expanded }"
					:style="{ visibility: row.markVisible ? 'inherit' : 'hidden' }"
				/>
				<span
					:class="props.renderNodeIcon ? 'tree-node-icon' : 'tree-node-icon-placeholder'"
					:ref="(el) => onIconRef(row.item, el)"
				/>
				<span class="node-text">{{ row.name }}</span>
				<div
					v-if="props.renderNodeExtras"
					class="tree-node-extras"
					:ref="(el) => onExtrasRef(row.item, el)"
				/>
			</div>
			<div
				class="scroll-spacer bottom"
				:style="{ height: (state.rows.value.length - state.end.value) * 20 + 'px' }"
			/>
		</template>
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
