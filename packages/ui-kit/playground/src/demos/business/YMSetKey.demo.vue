<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMSetKey } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const setKeyValue = ref('');

const onConfirm = () => {
	closeDialog('setKey');
};
</script>

<template>
	<section class="demo">
		<h2>YMSetKey</h2>
		<p class="desc">按键设置窗口：文本输入 v-model 绑定，确认触发 confirm。</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('setKey')">Open Set Key</YMButton>
			<span class="hint">value: {{ setKeyValue }}</span>
		</div>
		<YMSetKey
			v-model="setKeyValue"
			label="Key"
			title="Set Key"
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
