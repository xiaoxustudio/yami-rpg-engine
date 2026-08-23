<script setup lang="ts">
import { ref } from 'vue';
import { YMDragAndDropHint, YMButton, type DragAndDropHintCoords } from '@ui-kit';

interface HintApi {
	set(coords: DragAndDropHintCoords): void;
	measure(item: HTMLElement): DragAndDropHintCoords;
	moveUp(): void;
	moveDown(): void;
}

const hintRef = ref<HintApi | null>(null);

const items = ref([
	{ name: 'Map001', path: '/project/Map001' },
	{ name: 'Map002', path: '/project/Map002' },
	{ name: 'Map003', path: '/project/Map003' },
	{ name: 'Map004', path: '/project/Map004' },
	{ name: 'Map005', path: '/project/Map005' }
]);

const info = ref('drag an item to reorder');

let dragIndex: number | null = null;
let dragging = false;

const resetHint = () => {
	hintRef.value?.set({ left: 0, top: 0, width: 0, height: 0 });
};

const onDragStart = (event: DragEvent, index: number) => {
	dragIndex = index;
	dragging = true;
	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = 'move';
	}
	hintRef.value?.moveUp();
	info.value = `dragging ${items.value[index].name}`;
};

const onDragOver = (event: DragEvent, index: number) => {
	event.preventDefault();
	if (dragIndex === null || !dragging) return;
	if (event.dataTransfer) {
		event.dataTransfer.dropEffect = 'move';
	}
	const item = event.currentTarget as HTMLElement;
	const coords = hintRef.value?.measure(item);
	if (!coords) return;
	const rect = item.getBoundingClientRect();
	const before = event.clientX < rect.left + rect.width / 2;
	const current = items.value[dragIndex];
	if (index === dragIndex && before) {
		resetHint();
		return;
	}
	if (before) {
		coords.width = 2;
	} else {
		coords.left += coords.width - 2;
		coords.width = 2;
	}
	hintRef.value?.set(coords);
};

const onDrop = (event: DragEvent, index: number) => {
	event.preventDefault();
	if (dragIndex === null) return;
	const arr = [...items.value];
	const [moved] = arr.splice(dragIndex, 1);
	const target = index > dragIndex ? index - 1 : index;
	arr.splice(target, 0, moved);
	items.value = arr;
	info.value = `moved ${moved.name} to #${target}`;
	dragIndex = null;
	dragging = false;
	resetHint();
	hintRef.value?.moveDown();
};

const onDragEnd = () => {
	dragIndex = null;
	dragging = false;
	resetHint();
	hintRef.value?.moveDown();
};

const reset = () => {
	items.value = [
		{ name: 'Map001', path: '/project/Map001' },
		{ name: 'Map002', path: '/project/Map002' },
		{ name: 'Map003', path: '/project/Map003' },
		{ name: 'Map004', path: '/project/Map004' },
		{ name: 'Map005', path: '/project/Map005' }
	];
	info.value = 'reset';
};
</script>

<template>
	<section class="demo">
		<h2>YMDragAndDropHint</h2>
		<p class="desc">拖放指示条：拖动列表项时 measure/set 定位提示条，moveUp/moveDown 控制层级。</p>
		<div class="row">
			<YMButton variant="primary" @click="reset">Reset List</YMButton>
			<span class="hint">{{ info }}</span>
		</div>
		<div class="list">
			<YMDragAndDropHint ref="hintRef" id="drag-hint-demo" class="list-hint" />
			<div
				v-for="(item, index) in items"
				:key="item.path"
				class="item"
				draggable="true"
				@dragstart="(event) => onDragStart(event as DragEvent, index)"
				@dragover="(event) => onDragOver(event as DragEvent, index)"
				@drop="(event) => onDrop(event as DragEvent, index)"
				@dragend="onDragEnd"
			>
				<span class="name">{{ item.name }}</span>
				<span class="path">{{ item.path }}</span>
			</div>
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

.list {
	position: relative;
	width: 100%;
	max-width: 480px;
	border: 1px solid var(--ym-color-border);
	background: var(--ym-color-surface);
}

.list-hint {
	position: absolute;
	left: 0;
	top: 0;
	width: 2px;
	height: 28px;
	background: var(--ym-color-primary);
}

.item {
	display: flex;
	justify-content: space-between;
	gap: 12px;
	height: 28px;
	line-height: 28px;
	padding: 0 10px;
	cursor: grab;
	color: var(--ym-color-text);
}

.item:hover {
	background: var(--ym-color-surface-hover);
}

.name {
	font-family: var(--ym-font-mono);
}

.path {
	opacity: 0.6;
	font-size: 0.85em;
}

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
