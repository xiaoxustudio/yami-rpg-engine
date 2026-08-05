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
import { YMFileHeadPane } from '@ui-kit';
import { Menu } from '@/components/menu-list.ts';
import { FolderItem } from '@/file/folder-item.ts';

interface Props {
	links: {
		browser: any;
		nav: any;
		body: any;
	};
}

const props = defineProps<Props>();

const menuPopup = (options: any, items: any[]): void => Menu.popup(options, items);
const isFolderItem = (obj: any): boolean => obj instanceof FolderItem;

const ym = ref<{
	el: HTMLElement | null;
	updateAddress(): void;
} | null>(null);

const el = computed<HTMLElement | null>(() => ym.value?.el ?? null);
const updateAddress = (): void => ym.value?.updateAddress();

defineExpose({ updateAddress, el });
</script>
