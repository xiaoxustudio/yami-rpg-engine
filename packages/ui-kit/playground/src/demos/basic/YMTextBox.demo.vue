<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMTextBox, YMButton } from '@ui-kit';

const text = ref('你好，YAMI');
const inputCount = ref(0);
const focused = ref(false);
const lastChange = ref('');

const textBox = ref<{
	getFocus(mode: string | null): HTMLInputElement | undefined;
	setPlaceholder(placeholder: string): void;
	addCloseButton(): void;
	deleteInputContent(): void;
} | null>(null);

onMounted(() => {
	textBox.value?.setPlaceholder('请输入…');
	textBox.value?.addCloseButton();
});

const onInput = () => {
	inputCount.value++;
};

const onChange = (value: string) => {
	lastChange.value = value;
};
</script>

<template>
	<section class="demo">
		<h2>YMTextBox</h2>
		<div class="row">
			<div class="box">
				<YMTextBox
					ref="textBox"
					v-model="text"
					@input="onInput"
					@change="onChange"
					@focus="focused = true"
					@blur="focused = false"
				/>
			</div>
			<div class="box">
				<YMTextBox :model-value="'只读示例'" disabled />
			</div>
		</div>
		<div class="row">
			<YMButton size="sm" @click="textBox?.getFocus('all')">全选聚焦</YMButton>
			<YMButton size="sm" @click="textBox?.getFocus('end')">聚焦到末尾</YMButton>
			<YMButton size="sm" @click="textBox?.deleteInputContent()">清空内容</YMButton>
		</div>
		<p class="hint">
			value: {{ text }} | input 次数: {{ inputCount }} | change: {{ lastChange }} | focus:
			{{ focused }}
		</p>
	</section>
</template>

<style scoped>
.demo {
	display: flex;
	flex-direction: column;
	gap: var(--ym-space-3);
	padding: var(--ym-space-4);
	background: var(--ym-color-surface);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-md);
}

.row {
	display: flex;
	align-items: center;
	gap: var(--ym-space-3);
	flex-wrap: wrap;
}

.box {
	width: 220px;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
