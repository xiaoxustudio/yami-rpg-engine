<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMZoom } from '@ui-kit';


type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const zoomValue = ref(1);

const onConfirm = () => {
	closeDialog('zoom');
};

</script>

<template>
	<section class="demo">
		<h2>YMZoom</h2>
		<p class="desc">缩放窗口：数值输入框（0.6666 ~ 2，4 位小数）v-model 绑定，确认触发 confirm。</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('zoom')">Open Zoom</YMButton>
			<span class="hint">value: {{ zoomValue }}</span>
		</div>
		<YMZoom v-model="zoomValue" label="Factor" title="Zoom" @confirm="onConfirm" />
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

.desc {
	color: var(--ym-color-text);
	opacity: 0.7;
	font-size: 0.9em;
	margin: 4px 0;
}
</style>
