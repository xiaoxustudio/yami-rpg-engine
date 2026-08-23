<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMKeyboardBox, YMButton } from '@ui-kit';

const keyCode = ref(0);
const lastInput = ref(0);

const ym = ref<{
	read(): number;
	write(code: number): void;
	inputCode(code: number): void;
	on(type: string, listener: (event: Event) => void): void;
} | null>(null);

onMounted(() => {
	ym.value?.on('input', (event) => {
		const value = (event as Event & { value?: unknown }).value;
		if (typeof value === 'number') {
			keyCode.value = value;
			lastInput.value = value;
		}
	});
	ym.value?.on('change', () => {
		keyCode.value = ym.value?.read() ?? 0;
	});
});
</script>

<template>
	<section class="demo">
		<h2>YMKeyboardBox</h2>
		<div class="row">
			<div class="box">
				<YMKeyboardBox ref="ym" />
			</div>
			<YMButton size="sm" @click="ym?.inputCode(32)">设为空格</YMButton>
			<YMButton size="sm" @click="ym?.inputCode(13)">设为回车</YMButton>
			<YMButton size="sm" @click="ym?.inputCode(0)">清除</YMButton>
		</div>
		<p class="hint">
			点击输入框后按下任意键捕获 keyCode (Backspace 清除), 当前: {{ keyCode }} | 最近 input:
			{{ lastInput }}
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
	width: 200px;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
