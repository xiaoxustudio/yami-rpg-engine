<template>
	<div class="marquee-area" ref="root">
		<div class="selection" ref="selection" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { MarqueeSaveMap } from '@/types/marquee-area.ts';

const state = reactive({
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	scaleX: 1,
	scaleY: 1,
	visible: false,
	saveData: {} as MarqueeSaveMap
});

const root = ref<HTMLElement | null>(null);
const selection = ref<HTMLElement | null>(null);

const save = (key: string = 'default'): void => {
	state.saveData[key] = {
		x: state.x,
		y: state.y,
		width: state.width,
		height: state.height,
		scaleX: state.scaleX,
		scaleY: state.scaleY
	};
};

const restore = (key: string = 'default'): void => {
	const data = state.saveData[key];
	if (data) {
		state.x = data.x;
		state.y = data.y;
		state.width = data.width;
		state.height = data.height;
		state.scaleX = data.scaleX;
		state.scaleY = data.scaleY;
		state.saveData[key] = null;
	}
};

const resize = (size?: { width: number; height: number }): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	element.style.width = `${size?.width ?? state.width}px`;
	element.style.height = `${size?.height ?? state.height}px`;
};

const clear = (): void => {
	if (state.visible) {
		state.visible = false;
		const element = selection.value;
		if (element) {
			element.style.display = 'none';
		}
	}
};

const select = (
	x?: number,
	y?: number,
	width?: number,
	height?: number
): void => {
	state.x = x ?? state.x;
	state.y = y ?? state.y;
	state.width = width ?? state.width;
	state.height = height ?? state.height;
	state.visible = true;

	const element = selection.value;
	if (element) {
		element.style.left = `${state.x * state.scaleX}px`;
		element.style.top = `${state.y * state.scaleY}px`;
		element.style.width = `${state.width * state.scaleX}px`;
		element.style.height = `${state.height * state.scaleY}px`;
		element.style.display = 'block';
	}
};

onMounted(() => {
	const element = root.value as any;
	if (!element) {
		return;
	}
	element.save = save;
	element.restore = restore;
	element.resize = resize;
	element.clear = clear;
	element.select = select;
	element.selection = selection.value;
	for (const key of ['x', 'y', 'width', 'height', 'scaleX', 'scaleY', 'visible', 'saveData'] as const) {
		Object.defineProperty(element, key, {
			get: () => (state as any)[key],
			set: (value: any) => {
				(state as any)[key] = value;
			},
			configurable: true
		});
	}
	const selectionElement = selection.value;
	if (selectionElement) {
		selectionElement.style.display = 'none';
	}
});

defineExpose({ save, restore, resize, clear, select, root });
</script>

<style scoped>
.marquee-area {
	display: block;
	position: absolute;
	overflow: hidden;
}
</style>
