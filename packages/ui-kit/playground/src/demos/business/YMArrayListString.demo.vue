<script setup lang="ts">
import { ref } from 'vue';
import { YMArrayListString, YMButton } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const arrayValue = ref('');

const onConfirm = () => {
	closeDialog('arrayList-string');
};
</script>

<template>
	<section class="demo">
		<h2>YMArrayListString</h2>
		<p class="desc">
			数组字符串编辑窗口：多行文本输入（每行一项），v-model 绑定，确认触发 confirm。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('arrayList-string')"
				>Open String Editor</YMButton
			>
			<span class="hint">value: {{ arrayValue }}</span>
		</div>
		<YMArrayListString
			v-model="arrayValue"
			title="Edit Strings"
			@confirm="onConfirm"
			@closed="() => {}"
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
