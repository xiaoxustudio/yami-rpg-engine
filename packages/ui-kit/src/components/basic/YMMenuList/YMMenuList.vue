<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createMenuApi, type MenuApi, type MenuItem, type MenuOptions } from './menu-api';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

let menu: MenuApi | null = null;

const popup = (options: MenuOptions, items: MenuItem[]): void => menu?.popup(options, items);
const computeMenuWidth = (): void => menu?.computeMenuWidth();
const close = (): void => menu?.close();
const clear = (): HTMLElement | undefined => menu?.clear();
const createItem = (item: MenuItem): HTMLElement | undefined => menu?.createItem(item);
const select = (element: HTMLElement): void => menu?.select(element);
const unselect = (): void => menu?.unselect();
const reselect = (offset: number): void => menu?.reselect(offset);
const popupSubmenu = (delay: number): void => menu?.popupSubmenu(delay);
const closeSubmenu = (delay: number): void => menu?.closeSubmenu(delay);

defineExpose({
	popup,
	computeMenuWidth,
	close,
	clear,
	createItem,
	select,
	unselect,
	reselect,
	popupSubmenu,
	closeSubmenu,
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	menu = createMenuApi(el);
});

onBeforeUnmount(() => {
	menu?.close();
	menu = null;
});
</script>

<template>
	<div ref="root" class="menu-list" :id="props.id" />
</template>

<style module>
:global(:where(.menu-list)) {
	display: block;
	position: fixed;
	padding: 4px 0;
	line-height: 16px;
	background-color: var(--ym-color-popup-bg);
	outline: 1px solid var(--ym-color-border);
	overflow: hidden;
	pointer-events: auto;
}

:global(:where(.menu-item)) {
	display: block;
	position: relative;
	margin: 0;
	padding: 4px 0;
	height: 24px;
	pointer-events: auto;
}

:global(:where(.menu-item.selected)) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}

:global(:where(.menu-item.disabled)) {
	color: var(--ym-color-text-disabled);
	background-color: transparent;
}

:global(:where(.menu-checked)) {
	position: absolute;
	left: 4px;
	width: 16px;
	height: 16px;
	text-align: center;
	font-size: 1.2em;
	font-weight: bold;
	pointer-events: none;
}

:global(:where(.menu-label)) {
	position: absolute;
	left: 24px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	pointer-events: none;
}

:global(:where(.menu-accelerator)) {
	position: absolute;
	right: 24px;
	pointer-events: none;
}

:global(:where(.selected > .menu-accelerator)) {
	color: var(--ym-color-text-accelerator-selected);
}

:global(:where(.menu-sub-mark)) {
	position: absolute;
	right: 10px;
	pointer-events: none;
}

:global(:where(.menu-separator)) {
	display: block;
	position: relative;
	margin: 4px 0;
	left: 10px;
	width: calc(100% - 20px);
	height: 1px;
	background-color: var(--ym-color-border);
	border: none;
	pointer-events: none;
}
</style>
