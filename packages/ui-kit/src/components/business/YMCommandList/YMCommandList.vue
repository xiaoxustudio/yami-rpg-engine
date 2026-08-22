<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createCommandListApi, type CommandListApiOptions } from './command-api';

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
}

const props = withDefaults(defineProps<Props>(), {
	options: null
});

const root = ref<HTMLElement | null>(null);

defineExpose({
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	createCommandListApi(el, props.options ?? {});
});

onBeforeUnmount(() => {
	const el = root.value as CommandListRootElement | null;
	if (!el) return;
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
	<div ref="root" class="command-list" :id="props.id" />
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

:global(:where(.command-item.header .command-line:last-of-type)) {
	top: 18px;
}

:global(:where(.command-item.item .command-line:last-of-type)) {
	visibility: hidden;
}

:global(:where(.command-item.footer .command-line:last-of-type)) {
	bottom: 10px;
	width: 6px;
	border-bottom: 1px solid var(--command-line-color);
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

:global(:where(.command-item > span)) {
	pointer-events: none;
}

:global(:where(.command-text)),
:global(:where(.command-mark-minor)) {
	display: inline;
}

:global(:where(.command-item.item .command-mark-major:before)) {
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

:global(:where(.command-item:hover)) {
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
