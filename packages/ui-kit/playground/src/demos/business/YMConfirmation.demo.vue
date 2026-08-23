<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMConfirmation } from '@ui-kit';


type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const lastChoice = ref(-1);

const onConfirm = (index: number) => {
	lastChoice.value = index;
	closeDialog('confirmation');
};

</script>

<template>
	<section class="demo">
		<h2>YMConfirmation</h2>
		<p class="desc">确认窗口：最多 3 个按钮，屏幕居中，点击按钮通过 confirm(index) 回调。</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('confirmation')">Open Confirmation</YMButton>
			<span class="hint">last choice: {{ lastChoice }}</span>
		</div>
		<YMConfirmation
			message="Are you sure you want to delete this item?"
			:items="[{ label: 'Delete' }, { label: 'Cancel' }, { label: 'Details' }]"
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
