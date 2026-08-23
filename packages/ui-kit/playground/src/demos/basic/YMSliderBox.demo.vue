<script setup lang="ts">
import { ref } from 'vue';
import { YMSliderBox, YMNumberBox } from '@ui-kit';

const volume = ref(60);
const syncValue = ref(25);
const wheel = ref(50);
</script>

<template>
	<section class="demo">
		<h2>YMSliderBox</h2>
		<div class="row">
			<div class="slider">
				<YMSliderBox v-model="volume" :min="0" :max="100" :step="1" />
			</div>
			<span class="hint">音量: {{ volume }}</span>
		</div>
		<div class="row">
			<div class="slider">
				<YMSliderBox v-model="syncValue" :min="0" :max="100" :step="1" />
			</div>
			<div class="num">
				<YMNumberBox v-model="syncValue" :min="0" :max="100" :step="1" />
			</div>
			<span class="hint">滑块与数字框双向同步: {{ syncValue }}</span>
		</div>
		<div class="row">
			<div class="slider">
				<YMSliderBox v-model="wheel" :min="0" :max="100" :step="5" active-wheel />
			</div>
			<span class="hint">active-wheel / step 5: {{ wheel }}</span>
		</div>
		<div class="row">
			<div class="slider">
				<YMSliderBox :model-value="40" :min="0" :max="100" disabled />
			</div>
			<span class="hint">disabled</span>
		</div>
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

.slider {
	width: 240px;
}

.num {
	width: 100px;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
