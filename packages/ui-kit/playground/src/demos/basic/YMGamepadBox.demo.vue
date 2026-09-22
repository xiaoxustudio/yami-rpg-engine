<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { YMGamepadBox, YMButton } from '@ui-kit';

const button = ref<number | null>(null);

const ym = ref<{
	root: HTMLElement | null;
	read(): number | null;
	write(button: number): void;
} | null>(null);

onMounted(() => {
	ym.value?.root?.addEventListener('change', () => {
		button.value = ym.value?.read() ?? null;
	});
});
</script>

<template>
	<section class="demo">
		<h2>YMGamepadBox</h2>
		<div class="row">
			<div class="box">
				<YMGamepadBox ref="ym" />
			</div>
			<YMButton size="sm" @click="ym?.write(0)">设为 A</YMButton>
			<YMButton size="sm" @click="ym?.write(1)">设为 B</YMButton>
		</div>
		<p class="hint">
			聚焦输入框后按下手柄按键捕获, Backspace 清除。当前:
			{{ button === null ? '未设置' : button }}
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
