<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import {
	createCommandListApi,
	type CommandListApiOptions,
	type CommandRowDescriptor
} from './command-api';

interface Props {
	id?: string;
	options?: CommandListApiOptions | null;
}

interface CommandListRootElement extends HTMLElement {
	resize: EventListener;
	listFocus: EventListener;
	listBlur: EventListener;
	keydown: EventListener;
	pointerdown: EventListener;
	pointerup: EventListener;
	windowVariableChange: EventListener;
	getRowModel: () => { rows: CommandRowDescriptor[] };
	bindRowElement: (element: HTMLElement, index: number) => void;
}

const props = withDefaults(defineProps<Props>(), {
	options: null
});

const root = ref<HTMLElement | null>(null);

/**
 * M3-5b′（命令列表换源）：模板渲染可见行。
 * 行来源是 **api 自己的行模型**（`getRowModel`）——不是派生层：`parse` 的 `break`/`script`/`children`
 * 会决定实际行集合，只有 api 知道（见 `YMCommandList.derive-boundary.spec.ts`）。
 */
const rows = shallowRef<CommandRowDescriptor[]>([]);

function refreshRows(): void {
	const el = root.value as CommandListRootElement | null;
	if (!el?.getRowModel) return;
	rows.value = el.getRowModel().rows;
	// **重要**：行元素在 key 不变时被 Vue 复用（`:ref` 不会再触发），而内容可能已经变了
	// （重写数据、更换 `updateCommandElement` 覆写等）。旧实现靠 `resize()` 里的
	// `updateOnResize(element)` 兜这件事；换源后在这里**同步**补一次：
	// 按序重绑当前已渲染的行（同步执行 ⇒ 不会与 Vue 的渲染调度互相触发）。
	const rendered = el.querySelectorAll('.command-item');
	rows.value.forEach((row, i) => {
		const element = rendered[i];
		if (element instanceof HTMLElement) el.bindRowElement(element, row.index);
	});
	// 再补一拍：首帧时行还没渲染出来（`rendered` 为空），等 Vue 挂完再按序重绑一次，
	// 让"跨行"的判定（缩进线的 line-start/line-end）拿到完整的邻居行。
	void nextTick().then(() => {
		const node = root.value as CommandListRootElement | null;
		if (!node?.bindRowElement) return;
		const list = node.querySelectorAll('.command-item');
		rows.value.forEach((row, i) => {
			const element = list[i];
			if (element instanceof HTMLElement) node.bindRowElement(element, row.index);
		});
		// 行都挂好了，再让上层做跨行处理（折叠线分类；editor 的 eslints 覆盖这个钩子）
		(node as unknown as { updateLineClasses?: () => void }).updateLineClasses?.();
	});
}

/** `:ref` 回写桥：把模板挂出的行交给 api（挂数据 + fold 把手 + 既有的 updateCommandElement） */
function bindRow(row: CommandRowDescriptor, target: unknown): void {
	const el = root.value as CommandListRootElement | null;
	if (!(target instanceof HTMLElement) || !el?.bindRowElement) return;
	el.bindRowElement(target, row.index);
}

defineExpose({
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	createCommandListApi(el, props.options ?? {});
	// api 初始化时就挂好了自己的 scroll→resize 监听；这里在其后再补一拍刷新行模型
	el.addEventListener('update', refreshRows);
	el.addEventListener('scroll', refreshRows);
	refreshRows();
});

onBeforeUnmount(() => {
	const el = root.value as CommandListRootElement | null;
	if (!el) return;
	el.removeEventListener('update', refreshRows);
	el.removeEventListener('scroll', refreshRows);
	el.removeEventListener('scroll', el.resize);
	el.removeEventListener('focus', el.listFocus);
	el.removeEventListener('blur', el.listBlur);
	el.removeEventListener('keydown', el.keydown);
	el.removeEventListener('pointerdown', el.pointerdown);
	el.removeEventListener('pointerup', el.pointerup);
	window.removeEventListener('variablechange', el.windowVariableChange);
});
</script>

<template>
	<div ref="root" class="command-list" :id="props.id">
		<!-- M3-5b′：可见行由模板渲染；`:key` 用行模型的稳定 key，行内内容仍由 api 的
		     `updateCommandElement`（经 `:ref` 回写桥）生成 ⇒ 编辑器侧 eslints 的缩进线与标记照旧 -->
		<div
			v-for="row in rows"
			:key="row.key"
			:ref="(el) => bindRow(row, el)"
			class="command-item"
			:class="{ selected: row.selected, disabled: row.disabled }"
			:style="{ marginTop: `${row.marginTop}px`, marginBottom: `${row.marginBottom}px` }"
		/>
	</div>
</template>

<style module>
:global(:where(.command-list)) {
	display: block;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	font-family: var(--font-family-mono);
	user-select: none;
}

:global(:where(.command-item)) {
	display: block;
	position: relative;
	padding-left: 56px;
	padding-right: 8px;
	height: 20px;
	line-height: 20px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.command-item.selected)) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}

:global(:where(.command-line.hover)) {
	border-left-color: var(--command-line-hover-color);
	border-bottom-color: var(--command-line-hover-color) !important;
}

:global(:where(.command-line)) {
	position: absolute;
	height: 100%;
	pointer-events: none;
	left: 47px;
}

:global(:where(.command-item .command-line)) {
	border-left: 1px solid var(--command-line-color);
}

:global(:where(.command-line.line-start)) {
	top: 18px;
}

:global(:where(.command-line.line-end)) {
	bottom: 10px;
	width: 6px;
	border-bottom: 1px solid var(--command-line-color);
}

:global(:where(.command-line.line-hide)) {
	visibility: hidden;
}

:global(:where(.command-item.header .command-mark-major)) {
	visibility: hidden;
}

:global(:where(.command-item.option .command-mark-major)) {
	visibility: hidden;
}

:global(:where(.command-item.footer .command-mark-major)) {
	visibility: hidden;
}

:global(:where(.command-item > span:not(.command-fold))) {
	pointer-events: none;
}

:global(:where(.command-fold)) {
	pointer-events: auto;
}

:global(:where(.command-text)),
:global(:where(.command-mark-minor)) {
	display: inline;
}

:global(:where(.command-item.item .command-mark-major))::before {
	content: '>';
}

:global(:where(.command-item.disabled.selected > .command-text:not(.transparent))) {
	pointer-events: auto;
	color: var(--text-color-accelerator-selected) !important;
}

:global(:where(.command-item.disabled > .command-mark-major)),
:global(:where(.command-item.disabled > .command-mark-minor)),
:global(:where(.command-item.disabled > .command-fold)),
:global(:where(.command-item.disabled > .command-text:not(.transparent))),
:global(:where(.command-item.disabled > .text)) {
	color: var(--command-color-mark-minor);
}

:global(:where(.command-item:not(.selected):hover)) {
	background-color: var(--list-item-background-hover);
}

:global(:where(.command-item > .transparent)) {
	color: transparent;
	text-shadow: none;
}

:global(:where(.command-item:not(.selected) > .element)) {
	color: var(--command-color-element);
}

:global(:where(.command-item:not(.selected) > .gray)) {
	color: var(--command-color-gray);
}

:global(:where(.command-item:not(.selected) > .text)) {
	color: var(--command-color-text);
}

:global(:where(.command-item:not(.selected) > .variable)) {
	color: var(--command-color-variable);
}

:global(:where(.command-item:not(.selected) > .flow)) {
	color: var(--command-color-flow);
}

:global(:where(.command-item:not(.selected) > .label)) {
	color: var(--command-color-label);
}

:global(:where(.command-item:not(.selected) > .comment)) {
	color: var(--command-color-comment);
}

:global(:where(.command-item:not(.selected) > .wait)) {
	color: var(--command-color-wait);
}

:global(:where(.command-item:not(.selected) > .object)) {
	color: var(--command-color-object);
}

:global(:where(.command-item:not(.selected) > .audio)) {
	color: var(--command-color-audio);
}

:global(:where(.command-item:not(.selected) > .actor)) {
	color: var(--command-color-actor);
}

:global(:where(.command-item:not(.selected) > .skill)) {
	color: var(--command-color-skill);
}

:global(:where(.command-item:not(.selected) > .inventory)) {
	color: var(--command-color-inventory);
}

:global(:where(.command-item:not(.selected) > .scene)) {
	color: var(--command-color-scene);
}

:global(:where(.command-item:not(.selected) > .network)) {
	color: var(--command-color-network);
}

:global(:where(.command-item:not(.selected) > .system)) {
	color: var(--command-color-system);
}

:global(:where(.command-item:not(.selected) > .custom)) {
	color: var(--command-color-custom);
}

:global(:where(.command-item:not(.disabled) > .invalid)),
:global(:where(.command-item:not(.disabled) > .error)) {
	text-decoration: underline wavy var(--command-color-invalid-wave);
}

:global(:where(.command-item:not(.selected) > .normal)) {
	color: var(--text-color);
}

:global(:where(.command-item:not(.selected) > .global-var)) {
	color: var(--command-color-global-var);
}

:global(:where(.command-item:not(.selected) > .identifier)) {
	color: var(--command-color-identifier);
}

:global(:where(.command-item:not(.selected) > .identifier.no-ref)) {
	color: var(--command-color-identifier-no-ref);
}

:global(:where(.command-item:not(.selected) > .delimiter)) {
	color: var(--command-color-delimiter);
}

:global(:where(.command-item:not(.selected) > .operator)) {
	color: var(--command-color-operator);
}

:global(:where(.command-item:not(.selected) > .boolean)) {
	color: var(--command-color-boolean);
}

:global(:where(.command-item:not(.selected) > .number)) {
	color: var(--command-color-number);
}

:global(:where(.command-item:not(.selected) > .string)) {
	color: var(--command-color-string);
}

:global(:where(.command-item:not(.selected) > .file)) {
	color: var(--command-color-file);
}

:global(:where(.command-item:not(.selected) > .preset)) {
	color: var(--command-color-preset);
}

:global(:where(.command-item:not(.selected) > .weak)) {
	color: var(--command-color-weak);
}

:global(:where(.command-list.alt > .command-item.global-event)) {
	background-color: var(--command-global-event-link-background);
	cursor: pointer;
}

:global(:where(.command-list.alt > .command-item.global-event > .file)) {
	font-weight: bold;
	color: var(--command-color-audio) !important;
}

:global(:where(.command-fold)) {
	position: absolute;
	margin: 3px 0;
	left: 40px;
	width: 14px;
	height: 14px;
	line-height: 12px;
	text-indent: 0;
	text-align: center;
	background-color: var(--input-background);
	border: var(--command-gutter-border);
	border-style: solid;
	left: auto;
	margin-left: -16px;
}

:global(:where(.command-item.selected > .command-fold)) {
	background-color: transparent;
	border-color: rgba(255, 255, 255, 0.1);
}

:global(:where(.command-fold:hover)) {
	background-color: var(--command-fold-background-hover) !important;
	border-color: var(--command-fold-background-hover);
}

:global(:where(.command-fold:active)) {
	background-color: var(--command-fold-background-active) !important;
	border-color: var(--command-fold-background-active);
}

:global(:where(.command-mark-major)) {
	letter-spacing: 2px;
	position: absolute;
	text-indent: 0px;
	width: 0px;
	margin-left: -12px;
}

:global(:where(.command-mark-minor)) {
	letter-spacing: 2px;
	color: var(--command-color-mark-minor);
}

:global(:where(.command-item.selected > .command-mark-minor)) {
	color: var(--command-color-mark-minor-selected);
}

:global(:where(.command-text-identifier)) {
	transition-property: background-color;
	transition-duration: 0.2s;
	transition-delay: 0.2s;
}

:global(:where(.command-text-highlight.boolean-type)) {
	background-color: var(--command-text-background-highlight-boolean) !important;
}

:global(:where(.command-text-highlight.number-type)) {
	background-color: var(--command-text-background-highlight-number) !important;
}

:global(:where(.command-text-highlight.string-type)) {
	background-color: var(--command-text-background-highlight-string) !important;
}

:global(:where(.command-text-highlight.object-type)) {
	background-color: var(--command-text-background-highlight-object) !important;
}

:global(:where(.command-text-highlight.any-type)) {
	background-color: var(--command-text-background-highlight-any) !important;
}

:global(:where(.field-set > .command-list)) {
	position: absolute;
	padding: 10px 0;
	width: 100%;
	height: 100%;
}
</style>
