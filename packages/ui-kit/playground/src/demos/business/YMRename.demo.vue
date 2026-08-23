<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMRename } from '@ui-kit';


type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const renameValue = ref('untitled');

const onConfirm = () => {
	closeDialog('rename');
};

</script>

<template>
	<section class="demo">
		<h2>YMRename</h2>
		<p class="desc">重命名窗口：文本输入框通过 v-model 双向绑定，确认后触发 confirm。</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('rename')">Open Rename</YMButton>
			<span class="hint">value: {{ renameValue }}</span>
		</div>
		<YMRename v-model="renameValue" label="Name" title="Rename" @confirm="onConfirm" @closed="() => {}" />
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
