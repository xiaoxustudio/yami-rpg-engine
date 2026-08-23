<script setup lang="ts">
import { ref } from 'vue';
import { YMNumberVar, YMButton } from '@ui-kit';
const numberRef = ref<InstanceType<typeof YMNumberVar> | null>(null);
const number = ref(25);
const readValue = ref('25');

const varKey = (value: unknown): string =>
	value && typeof value === 'object'
		? String((value as { key?: string }).key ?? '')
		: String(value ?? '') || '未选择变量';

const read = (): void => {
	readValue.value = String(numberRef.value?.read());
};

const switchMode = (): void => {
	numberRef.value?.switch();
	read();
};

const useVariable = (): void => {
	numberRef.value?.write({ type: 'local', key: 'hp' });
	read();
};

const resetConstant = (): void => {
	numberRef.value?.write(42);
	read();
};
</script>

<template>
	<section>
		<h2>YMNumberVar</h2>
		<p class="desc">数值变量输入框；常量/变量模式，点击左侧前缀或按 / 切换。</p>
		<div class="row">
			<div class="field">
				<YMNumberVar
					ref="numberRef"
					v-model="number"
					:min="0"
					:max="100"
					:step="1"
					:decimals="0"
					unit="%"
				>
					<template #variable="{ value }">
						<div class="var-cell">
							<span class="var-key">{{ varKey(value) }}</span>
							<YMButton size="sm" @click="useVariable">use "hp"</YMButton>
						</div>
					</template>
				</YMNumberVar>
			</div>
		</div>
		<div class="row">
			<YMButton size="sm" @click="switchMode">Switch Mode</YMButton>
			<YMButton size="sm" @click="useVariable">Write Variable</YMButton>
			<YMButton size="sm" @click="resetConstant">Write 42</YMButton>
			<YMButton size="sm" @click="read">Read</YMButton>
			<span class="hint">v-model: {{ number }} | read: {{ readValue }}</span>
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
