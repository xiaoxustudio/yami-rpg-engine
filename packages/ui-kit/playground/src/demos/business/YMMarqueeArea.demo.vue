<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMButton, YMMarqueeArea } from '@ui-kit';

interface MarqueeApi {
	root: HTMLElement | null;
	select(x?: number, y?: number, width?: number, height?: number): void;
	clear(): void;
	save(key?: string): void;
	restore(key?: string): void;
	resize(size?: { width: number; height: number }): void;
}

const marqueeRef = ref<MarqueeApi | null>(null);

const stageRef = ref<HTMLElement | null>(null);
const info = ref('');

let dragging = false;
let origin = { x: 0, y: 0 };

const stagePoint = (event: PointerEvent) => {
	const rect = stageRef.value?.getBoundingClientRect();
	if (!rect) return { x: 0, y: 0 };
	return {
		x: Math.round(event.clientX - rect.left),
		y: Math.round(event.clientY - rect.top)
	};
};

const onPointerDown = (event: PointerEvent) => {
	if (event.button !== 0) return;
	const { x, y } = stagePoint(event);
	dragging = true;
	origin = { x, y };
	marqueeRef.value?.select(x, y, 0, 0);
	info.value = `select (${x}, ${y})`;
};

const onPointerMove = (event: PointerEvent) => {
	if (!dragging) return;
	const { x, y } = stagePoint(event);
	const left = Math.min(origin.x, x);
	const top = Math.min(origin.y, y);
	const width = Math.abs(x - origin.x);
	const height = Math.abs(y - origin.y);
	marqueeRef.value?.select(left, top, width, height);
	info.value = `select (${left}, ${top}) ${width}x${height}`;
};

const onPointerUp = () => {
	if (!dragging) return;
	dragging = false;
};

const preset = () => {
	marqueeRef.value?.select(24, 24, 140, 96);
	info.value = 'preset 140x96';
};

const save = () => {
	marqueeRef.value?.save('marquee-1');
	info.value = 'saved as marquee-1';
};

const restore = () => {
	marqueeRef.value?.restore('marquee-1');
	info.value = 'restored marquee-1';
};

const clear = () => {
	marqueeRef.value?.clear();
	info.value = 'cleared';
};

const resize = () => {
	marqueeRef.value?.resize({ width: 300, height: 180 });
	info.value = 'resized to 300x180';
};

onMounted(() => {
	marqueeRef.value?.resize({ width: 300, height: 180 });
});
</script>

<template>
	<section class="demo">
		<h2>YMMarqueeArea</h2>
		<p class="desc">框选区域：在舞台上按住拖动即可框选，支持 select / save / restore / resize / clear。</p>
		<div class="row">
			<YMButton variant="primary" @click="preset">Select Preset</YMButton>
			<YMButton @click="save">Save</YMButton>
			<YMButton @click="restore">Restore</YMButton>
			<YMButton @click="clear">Clear</YMButton>
			<YMButton @click="resize">Resize</YMButton>
			<span class="hint">{{ info }}</span>
		</div>
		<div
			ref="stageRef"
			class="stage"
			@pointerdown="onPointerDown"
			@pointermove="onPointerMove"
			@pointerup="onPointerUp"
		>
			<YMMarqueeArea ref="marqueeRef" id="marquee-demo" />
		</div>
	</section>
</template>

<style scoped>
.demo {
	margin-bottom: 24px;
}

.row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 12px;
	margin: 8px 0;
}

.hint {
	color: var(--ym-color-text);
	opacity: 0.8;
	font-size: 0.9em;
}

.stage {
	position: relative;
	width: 300px;
	height: 180px;
	background: var(--ym-color-surface);
	border: 1px dashed var(--ym-color-border);
	user-select: none;
	touch-action: none;
}

.stage :deep(.marquee-area) {
	width: 100%;
	height: 100%;
}

.stage :deep(.marquee-area > .selection) {
	border: 1px solid var(--ym-color-primary);
	background: color-mix(in srgb, var(--ym-color-primary) 25%, transparent);
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
