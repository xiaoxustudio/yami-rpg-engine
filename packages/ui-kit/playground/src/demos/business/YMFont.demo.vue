<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMFont } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const fontValue = ref('');

const onConfirm = () => {
	closeDialog('font');
};
</script>

<template>
	<section class="demo">
		<h2>YMFont</h2>
		<p class="desc">
			字体输入窗口：id 可配置（默认 font），文本输入 v-model 绑定，确认触发 confirm。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('font')">Open Font</YMButton>
			<span class="hint">value: {{ fontValue }}</span>
		</div>
		<YMFont id="font" v-model="fontValue" label="Font" title="Font" @confirm="onConfirm" />
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
