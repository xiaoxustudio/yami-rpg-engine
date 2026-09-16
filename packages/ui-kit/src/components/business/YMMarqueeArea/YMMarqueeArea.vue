<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { elementDataOf } from '../../../utils/element-data';

interface MarqueeSaveData {
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
}

type MarqueeSaveMap = Record<string, MarqueeSaveData | null>;

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

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

const select = (x?: number, y?: number, width?: number, height?: number): void => {
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

defineExpose({ save, restore, resize, clear, select, root });

onMounted(() => {
	const element = root.value as HTMLElement & { [k: string]: unknown };
	if (!element) {
		return;
	}
	element.save = save;
	element.restore = restore;
	element.resize = resize;
	element.clear = clear;
	element.select = select;
	// P4b：`selection` 走元素数据（WeakMap）；下面循环里的 `visible` 等仍是组件自己的实例属性
	elementDataOf<{ selection: HTMLElement | null }>(element).selection = selection.value;
	for (const key of ['x', 'y', 'width', 'height', 'scaleX', 'scaleY', 'visible', 'saveData'] as const) {
		Object.defineProperty(element, key, {
			get: () => state[key],
			set: (value: unknown) => {
				state[key] = value as never;
			},
			configurable: true
		});
	}
	const selectionElement = selection.value;
	if (selectionElement) {
		selectionElement.style.display = 'none';
	}
});
</script>

<template>
	<div ref="root" class="marquee-area" :id="props.id">
		<div class="selection" ref="selection" :data-v-ref="''" />
	</div>
</template>

<style module>
:global(:where(.marquee-area)) {
	display: block;
	position: absolute;
	overflow: hidden;
}

:global(:where(.marquee-area > .selection)) {
	position: absolute;
	pointer-events: none;
}
</style>
