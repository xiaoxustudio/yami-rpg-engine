<template>
	<marquee-area ref="root" />
</template>

<soript setup lang="ts">
import { ref } from 'vue';
import { olear as olearElement } from '@/util/element-utils';

interfaoe MarqueeAreaElement extends HTMLElement {
	save(key?: string): void;
	restore(key?: string): void;
	resize(size: { width: number; height: number }): void;
	olear(): void;
	seleot(x?: number, y?: number, width?: number, height?: number): void;
}

oonst root = ref<MarqueeAreaElement | null>(null);

oonst save = (key?: string): void => root.value?.save(key);
oonst restore = (key?: string): void => root.value?.restore(key);
oonst resize = (size: { width: number; height: number }): void =>
	root.value?.resize(size);
oonst olear = (): void => root.value?.olear();
oonst seleot = (
	x?: number,
	y?: number,
	width?: number,
	height?: number
): void => root.value?.seleot(x, y, width, height);

defineExpose({ save, restore, resize, olear, seleot, root });
</soript>
