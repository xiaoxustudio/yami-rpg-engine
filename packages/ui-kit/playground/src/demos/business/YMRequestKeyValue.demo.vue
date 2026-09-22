<script setup lang="ts">
import { ref } from 'vue';
import { YMButton, YMRequestKeyValue } from '@ui-kit';

type FrameElement = HTMLElement & { open?(): void; close?(): boolean };

const openDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.open?.();
const closeDialog = (id: string) => (document.getElementById(id) as FrameElement | null)?.close?.();
const keyValue = ref('server');
const value = ref('localhost');

const onConfirm = () => {
	closeDialog('request-keyValue');
};
</script>

<template>
	<section class="demo">
		<h2>YMRequestKeyValue</h2>
		<p class="desc">
			键值请求窗口：key/value 两个字符串输入，v-model:key-value / v-model:value 绑定。
		</p>
		<div class="row">
			<YMButton variant="primary" @click="openDialog('request-keyValue')"
				>Open Request KeyValue</YMButton
			>
			<span class="hint">{{ keyValue }} = {{ value }}</span>
		</div>
		<YMRequestKeyValue
			v-model:key-value="keyValue"
			v-model:value="value"
			key-label="Key"
			value-label="Value"
			title="Request Key Value"
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
