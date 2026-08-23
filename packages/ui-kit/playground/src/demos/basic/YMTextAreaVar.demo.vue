<script setup lang="ts">
import { ref } from 'vue';
import { YMTextAreaVar, YMButton } from '@ui-kit';
const areaRef = ref<InstanceType<typeof YMTextAreaVar> | null>(null);
const text = ref('Line 1\nLine 2\nLine 3');
const readValue = ref('Line 1\nLine 2\nLine 3');

const varKey = (value: unknown): string =>
	value && typeof value === 'object'
		? String((value as { key?: string }).key ?? '')
		: String(value ?? '') || '未选择变量';

const read = (): void => {
	readValue.value = String(areaRef.value?.read());
};

const switchMode = (): void => {
	areaRef.value?.switch();
	read();
};

const useVariable = (): void => {
	areaRef.value?.write({ type: 'local', key: 'description' });
	read();
};

const resetConstant = (): void => {
	areaRef.value?.write('Multi-line text');
	read();
};
</script>

<template>
	<section>
		<h2>YMTextAreaVar</h2>
		<p class="desc">多行文本变量输入框；常量/变量模式，支持 v-model 绑定。</p>
		<div class="row">
			<div class="field">
				<YMTextAreaVar ref="areaRef" v-model="text">
					<template #variable="{ value }">
						<div class="var-cell">
							<span class="var-key">{{ varKey(value) }}</span>
							<YMButton size="sm" @click="useVariable">use "description"</YMButton>
						</div>
					</template>
				</YMTextAreaVar>
			</div>
		</div>
		<div class="row">
			<YMButton size="sm" @click="switchMode">Switch Mode</YMButton>
			<YMButton size="sm" @click="useVariable">Write Variable</YMButton>
			<YMButton size="sm" @click="resetConstant">Write String</YMButton>
			<YMButton size="sm" @click="read">Read</YMButton>
			<span class="hint">read: "{{ readValue }}"</span>
		</div>
	</section>
</template>

<style scoped>
.field {
	width: 320px;
	height: 96px;
}

.field :deep(.text-area-var) {
	height: 100%;
}

.var-cell {
	display: flex;
	align-items: center;
	gap: var(--ym-space-2);
	min-height: 20px;
}

.var-key {
	color: var(--ym-color-text);
	font-size: var(--ym-font-size-sm);
}
</style>
