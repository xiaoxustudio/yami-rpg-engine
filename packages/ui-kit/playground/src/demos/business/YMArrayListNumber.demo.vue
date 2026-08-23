<script setup lang="ts">
import { ref } from 'vue';
import { YMArrayListNumber, YMButton } from '@ui-kit';


type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const arrayValue = ref(0);

const onConfirm = () => {
	closeDialog('arrayList-number');
};

</script>

<template>
	<section class="demo">
		<h2>YMArrayListNumber</h2>
		<p class="desc">数组数值编辑窗口：范围 -1e9 ~ 1e9（10 位小数），v-model 绑定，确认触发 confirm。</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('arrayList-number')">Open Number Editor</YMButton>
			<span class="hint">value: {{ arrayValue }}</span>
		</div>
		<YMArrayListNumber v-model="arrayValue" title="Edit Number" @confirm="onConfirm" @closed="() => {}" />
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
