<script setup lang="ts">
import { ref } from 'vue';
import { YMFileVar, YMButton } from '@ui-kit';
const fileRef = ref<InstanceType<typeof YMFileVar> | null>(null);
const filePath = ref('data/maps/map001.json');
const readValue = ref('data/maps/map001.json');

const varKey = (value: unknown): string =>
	value && typeof value === 'object'
		? String((value as { key?: string }).key ?? '')
		: String(value ?? '') || '未选择变量';

const read = (): void => {
	readValue.value = String(fileRef.value?.read());
};

const switchMode = (): void => {
	fileRef.value?.switch();
	read();
};

const useVariable = (): void => {
	fileRef.value?.write({ type: 'local', key: 'mapFile' });
	read();
};

const resetConstant = (): void => {
	fileRef.value?.write('data/maps/map002.json');
	read();
};
</script>

<template>
	<section>
		<h2>YMFileVar</h2>
		<p class="desc">
			文件变量输入框；通过 #file / #variable 插槽自定义展示，支持 v-model 绑定。
		</p>
		<div class="row">
			<div class="field">
				<YMFileVar ref="fileRef" v-model="filePath">
					<template #file="fileSlot">
						<div class="file-cell">
							<input
								class="file-input"
								:value="fileSlot.value"
								@input="fileSlot.onInput(($event.target as HTMLInputElement).value)"
							/>
							<span class="file-icon">…</span>
						</div>
					</template>
					<template #variable="{ value }">
						<div class="var-cell">
							<span class="var-key">{{ varKey(value) }}</span>
							<YMButton size="sm" @click="useVariable">use "mapFile"</YMButton>
						</div>
					</template>
				</YMFileVar>
			</div>
		</div>
		<div class="row">
			<YMButton size="sm" @click="switchMode">Switch Mode</YMButton>
			<YMButton size="sm" @click="useVariable">Write Variable</YMButton>
			<YMButton size="sm" @click="resetConstant">Write File</YMButton>
			<YMButton size="sm" @click="read">Read</YMButton>
			<span class="hint">v-model: {{ filePath }} | read: {{ readValue }}</span>
		</div>
	</section>
</template>

<style scoped>
.field {
	width: 320px;
}

.file-cell {
	display: flex;
	align-items: center;
	height: 20px;
	background-color: var(--ym-color-input-bg);
	border-top: var(--ym-dpx-1) solid var(--ym-color-input-border);
	border-left: var(--ym-dpx-1) solid var(--ym-color-input-border);
	border-right: var(--ym-dpx-1) solid var(--ym-color-input-border);
	border-bottom: var(--ym-dpx-1) solid var(--ym-color-input-border);
	border-radius: var(--ym-radius-sm);
}

.file-input {
	flex: 1;
	min-width: 0;
	padding: 0 var(--ym-space-2);
	height: 100%;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text);
	background: transparent;
	border: none;
	outline: none;
}

.file-icon {
	padding: 0 var(--ym-space-2);
	color: var(--ym-color-text-unit);
	cursor: pointer;
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
