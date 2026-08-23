<script setup lang="ts">
import { ref } from 'vue';
import { YMStringVar, YMButton } from '@ui-kit';
const stringRef = ref<InstanceType<typeof YMStringVar> | null>(null);
const text = ref('Hello world');
const readValue = ref('Hello world');

const varKey = (value: unknown): string =>
	value && typeof value === 'object'
		? String((value as { key?: string }).key ?? '')
		: String(value ?? '') || '未选择变量';

const read = (): void => {
	readValue.value = String(stringRef.value?.read());
};

const switchMode = (): void => {
	stringRef.value?.switch();
	read();
};

const useVariable = (): void => {
	stringRef.value?.write({ type: 'local', key: 'name' });
	read();
};

const resetConstant = (): void => {
	stringRef.value?.write('Adventurer');
	read();
};
</script>

<template>
	<section>
		<h2>YMStringVar</h2>
		<p class="desc">字符串变量输入框；常量/变量模式，支持 v-model 绑定。</p>
		<div class="row">
			<div class="field">
				<YMStringVar ref="stringRef" v-model="text">
					<template #variable="{ value }">
						<div class="var-cell">
							<span class="var-key">{{ varKey(value) }}</span>
							<YMButton size="sm" @click="useVariable">use "name"</YMButton>
						</div>
					</template>
				</YMStringVar>
			</div>
		</div>
		<div class="row">
			<YMButton size="sm" @click="switchMode">Switch Mode</YMButton>
			<YMButton size="sm" @click="useVariable">Write Variable</YMButton>
			<YMButton size="sm" @click="resetConstant">Write String</YMButton>
			<YMButton size="sm" @click="read">Read</YMButton>
			<span class="hint">v-model: "{{ text }}" | read: "{{ readValue }}"</span>
		</div>
	</section>
</template>

<style scoped>
.field {
	width: 240px;
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
