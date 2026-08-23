<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { YMFilterBox, YMSliderBox, YMButton } from '@ui-kit';

const red = ref(128);
const green = ref(128);
const blue = ref(128);
const gray = ref(0);

const ym = ref<{
	write(tint: [number, number, number, number]): void;
	clear(): void;
} | null>(null);

const applyTint = (): void => {
	ym.value?.write([red.value, green.value, blue.value, gray.value]);
};

watch([red, green, blue, gray], applyTint);

onMounted(applyTint);
</script>

<template>
	<section class="demo">
		<h2>YMFilterBox</h2>
		<div class="row">
			<YMFilterBox ref="ym" :width="240" :height="120" />
			<div class="controls">
				<div class="control">
					<span class="label">Red</span>
					<YMSliderBox v-model="red" :min="-255" :max="255" :step="8" active-wheel />
				</div>
				<div class="control">
					<span class="label">Green</span>
					<YMSliderBox v-model="green" :min="-255" :max="255" :step="8" active-wheel />
				</div>
				<div class="control">
					<span class="label">Blue</span>
					<YMSliderBox v-model="blue" :min="-255" :max="255" :step="8" active-wheel />
				</div>
				<div class="control">
					<span class="label">Gray</span>
					<YMSliderBox v-model="gray" :min="0" :max="255" :step="8" active-wheel />
				</div>
				<YMButton size="sm" @click="ym?.clear()">清除画布</YMButton>
			</div>
		</div>
		<p class="hint">tint: [{{ red }}, {{ green }}, {{ blue }}, {{ gray }}]</p>
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
	align-items: flex-start;
	gap: var(--ym-space-3);
	flex-wrap: wrap;
}

.controls {
	display: flex;
	flex-direction: column;
	gap: var(--ym-space-2);
	width: 280px;
}

.control {
	display: flex;
	align-items: center;
	gap: var(--ym-space-2);
}

.control :deep(.slider-box) {
	flex: 1;
}

.label {
	width: 44px;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
