<script setup lang="ts">
import { ref } from 'vue';
import { YMLoadingOverlay, YMButton } from '@ui-kit';
const loadingRef = ref<InstanceType<typeof YMLoadingOverlay> | null>(null);
const visible = ref(false);
const overlayText = ref('Loading...');
const counter = ref(0);

const toggleProp = (): void => {
	visible.value = !visible.value;
};

const showByApi = (): void => {
	counter.value++;
	overlayText.value = `Loading... (call #${counter.value})`;
	loadingRef.value?.show();
	setTimeout(() => loadingRef.value?.hide(), 1200);
};
</script>

<template>
	<section>
		<h2>YMLoadingOverlay</h2>
		<p class="desc">全屏遮罩加载层；支持 visible prop 与 show/hide 命令式调用。</p>
		<div class="row">
			<YMButton size="sm" variant="primary" @click="toggleProp">Toggle via :visible</YMButton>
			<YMButton size="sm" @click="showByApi">Show via API</YMButton>
			<span class="hint">visible: {{ visible }}</span>
		</div>
		<YMLoadingOverlay ref="loadingRef" :visible="visible" :text="overlayText" />
	</section>
</template>

<style scoped>
.hint {
	color: var(--ym-color-text-unit);
	font-size: var(--ym-font-size-sm);
}
</style>
