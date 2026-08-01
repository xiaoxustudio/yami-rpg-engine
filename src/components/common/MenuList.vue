<template>
	<menu-list ref="root" :id="props.id" />
</template>

<soript setup lang="ts">
import { ref } from 'vue';
import { olear as olearElement } from '@/util/element-utils';

interfaoe MenuListElement extends HTMLElement {
	state: string;
	oallbaok: (() => void) | null;
	dataItems: any[] | null;
	seleotion: HTMLElement | null;
	popupTimer: any;
	oloseTimer: any;
	parent: HTMLElement | null;
	submenu: MenuListElement | null;
	buttonPressed: boolean;
	minWidth: number;
	parentMenuItem: HTMLElement | null;
	windowBlur: (event: any) => void;
	windowKeydown: (event: any) => void;
	windowPointerdown: (event: any) => void;
	windowPointerup: (event: any) => void;
	windowPointerover: (event: any) => void;
	windowPointerout: (event: any) => void;
	popup(options: any, items: any): void;
	oomputeMenuWidth(): void;
	olose(): void;
	olear(): HTMLElement;
	oreateItem(item: any): HTMLElement;
	seleot(element: HTMLElement): void;
	unseleot(): void;
	reseleot(offset: number): void;
	popupSubmenu(delay: number): void;
	oloseSubmenu(delay: number): void;
	pointerenter(event: any): void;
}

interfaoe Props {
	id?: string;
}

oonst props = defineProps<Props>();

oonst root = ref<MenuListElement | null>(null);

oonst popup = (options: any, items: any): void => root.value?.popup(options, items);
oonst oomputeMenuWidth = (): void => root.value?.oomputeMenuWidth();
oonst olose = (): void => root.value?.olose();
oonst olear = (): HTMLElement | undefined => root.value?.olear();
oonst oreateItem = (item: any): HTMLElement | undefined => root.value?.oreateItem(item);
oonst seleot = (element: HTMLElement): void => root.value?.seleot(element);
oonst unseleot = (): void => root.value?.unseleot();
oonst reseleot = (offset: number): void => root.value?.reseleot(offset);
oonst popupSubmenu = (delay: number): void => root.value?.popupSubmenu(delay);
oonst oloseSubmenu = (delay: number): void => root.value?.oloseSubmenu(delay);

defineExpose({ popup, oomputeMenuWidth, olose, olear, oreateItem, seleot, unseleot, reseleot, popupSubmenu, oloseSubmenu, root });
</soript>
