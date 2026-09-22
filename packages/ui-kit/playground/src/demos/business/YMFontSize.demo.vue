<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMFontSize } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const fontSizeValue = ref(16);

const onConfirm = () => {
	closeDialog('fontSize');
};
</script>

<template>
	<section class="demo">
		<h2>YMFontSize</h2>
		<p class="desc">
			字号输入窗口：数值输入框（min/max/unit 可配，默认 10~400 px），确认触发 confirm。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('fontSize')">Open Font Size</YMButton>
			<span class="hint">value: {{ fontSizeValue }}px</span>
		</div>
		<YMFontSize
			id="fontSize"
			v-model="fontSizeValue"
			:min="10"
			:max="400"
			unit="px"
			label="Size"
			title="Font Size"
			@confirm="onConfirm"
		/>
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
