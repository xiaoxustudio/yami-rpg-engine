<template>
	<YMMenuList ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMMenuList, type MenuItem, type MenuOptions } from '@ui-kit';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	popup(options: MenuOptions, items: MenuItem[]): void;
	computeMenuWidth(): void;
	close(): void;
	clear(): HTMLElement | undefined;
	createItem(item: MenuItem): HTMLElement | undefined;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	popupSubmenu(delay: number): void;
	closeSubmenu(delay: number): void;
	root: HTMLElement | null;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const popup = (options: MenuOptions, items: MenuItem[]): void => ym.value?.popup(options, items);
const computeMenuWidth = (): void => ym.value?.computeMenuWidth();
const close = (): void => ym.value?.close();
const clear = (): HTMLElement | undefined => ym.value?.clear();
const createItem = (item: MenuItem): HTMLElement | undefined => ym.value?.createItem(item);
const select = (element: HTMLElement): void => ym.value?.select(element);
const unselect = (): void => ym.value?.unselect();
const reselect = (offset: number): void => ym.value?.reselect(offset);
const popupSubmenu = (delay: number): void => ym.value?.popupSubmenu(delay);
const closeSubmenu = (delay: number): void => ym.value?.closeSubmenu(delay);

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
	(el as any).popup = popup;
	(el as any).computeMenuWidth = computeMenuWidth;
	(el as any).close = close;
	(el as any).clear = clear;
	(el as any).createItem = createItem;
	(el as any).select = select;
	(el as any).unselect = unselect;
	(el as any).reselect = reselect;
	(el as any).popupSubmenu = popupSubmenu;
	(el as any).closeSubmenu = closeSubmenu;
});
</script>
