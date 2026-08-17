<template>
	<YMFileHeadPane
		ref="ym"
		:links="props.links"
		:menu-popup="menuPopup"
		:is-folder-item="isFolderItem"
	/>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMFileHeadPane, type MenuItem, type MenuOptions } from '@ui-kit';
import { Menu } from '@app/legacy/components/menu-list.ts';
import { FolderItem } from '@app/legacy/file/folder-item.ts';
import { FileBrowserLinks } from '@app/legacy/types/file-browser-links.ts';

interface Props {
	links: FileBrowserLinks;
}

const props = defineProps<Props>();

const menuPopup = (options: MenuOptions, items: MenuItem[]): void => Menu.popup(options, items);
const isFolderItem = (obj: unknown): boolean => obj instanceof FolderItem;

const ym = ref<{
	el: HTMLElement | null;
	updateAddress(): void;
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const updateAddress = (): void => ym.value?.updateAddress();

defineExpose({ updateAddress, el });
</script>
