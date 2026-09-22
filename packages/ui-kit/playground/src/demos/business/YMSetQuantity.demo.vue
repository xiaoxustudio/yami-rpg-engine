<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMSetQuantity } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const setQuantityValue = ref(1);

const onConfirm = () => {
	closeDialog('setQuantity');
};
</script>

<template>
	<section class="demo">
		<h2>YMSetQuantity</h2>
		<p class="desc">
			数量设置窗口：数值输入框（min 1，max 可配）v-model 绑定，确认触发 confirm。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('setQuantity')"
				>Open Set Quantity</YMButton
			>
			<span class="hint">value: {{ setQuantityValue }}</span>
		</div>
		<YMSetQuantity
			v-model="setQuantityValue"
			:max="99"
			label="Quantity"
			title="Set Quantity"
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
