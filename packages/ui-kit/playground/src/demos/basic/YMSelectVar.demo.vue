<script setup lang="ts">
import { ref } from 'vue';
import { YMSelectVar, YMButton } from '@ui-kit';
interface SelectItem {
	value: unknown;
	name?: string;
	tip?: string;
}

const selectRef = ref<InstanceType<typeof YMSelectVar> | null>(null);
const selectValue = ref('fire');
const readValue = ref('fire');

const baseItems: SelectItem[] = [
	{ value: 'fire', name: 'Fire' },
	{ value: 'water', name: 'Water' },
	{ value: 'earth', name: 'Earth' },
	{ value: 'air', name: 'Air' }
];

const varKey = (value: unknown): string =>
	value && typeof value === 'object'
		? String((value as { key?: string }).key ?? '')
		: String(value ?? '') || '未选择变量';

const read = (): void => {
	readValue.value = String(selectRef.value?.read());
};

const switchMode = (): void => {
	selectRef.value?.switch();
	read();
};

const useVariable = (): void => {
	selectRef.value?.write({ type: 'local', key: 'element' });
	read();
};

const loadMore = (): void => {
	selectRef.value?.loadItems([...baseItems, { value: 'light', name: 'Light' }, { value: 'dark', name: 'Dark' }]);
	read();
};

const resetConstant = (): void => {
	selectRef.value?.write('water');
	read();
};
</script>

<template>
	<section>
		<h2>YMSelectVar</h2>
		<p class="desc">枚举变量下拉框；常量/变量模式，支持 items 与 loadItems 动态加载。</p>
		<div class="row">
			<div class="field">
				<YMSelectVar ref="selectRef" v-model="selectValue" :items="baseItems">
					<template #variable="{ value }">
						<div class="var-cell">
							<span class="var-key">{{ varKey(value) }}</span>
							<YMButton size="sm" @click="useVariable">use "element"</YMButton>
						</div>
					</template>
				</YMSelectVar>
			</div>
		</div>
		<div class="row">
			<YMButton size="sm" @click="switchMode">Switch Mode</YMButton>
			<YMButton size="sm" @click="useVariable">Write Variable</YMButton>
			<YMButton size="sm" @click="loadMore">Load More Items</YMButton>
			<YMButton size="sm" @click="resetConstant">Write "water"</YMButton>
			<YMButton size="sm" @click="read">Read</YMButton>
			<span class="hint">v-model: {{ selectValue }} | read: {{ readValue }}</span>
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
