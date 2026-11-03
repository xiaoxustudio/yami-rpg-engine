<template>
	<WindowFrame id="copyProgress" no-buttons>
		<template #title
			><TitleBar>{{ t('components.copyProgress.title') }}</TitleBar></template
		>

		<div class="flex-box" id="copyProgress-flex">
			<div class="text">{{ t('components.copyProgress-box.label') }}</div>
			<div class="box" id="copyProgress-box">
				<div class="box" id="copyProgress-bar" :style="{ width: `${percent}%` }" />
			</div>
			<div class="text" id="copyProgress-info">{{ info }}</div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import {
	provideCopyProgressBridge,
	resetCopyProgressBridge,
	type CopyProgressBridge
} from '@app/composables/copy-progress-bridge';

const { t } = useI18n();

/** 进度由窗口自己渲染：单例只递百分比与文案。 */
const percent = ref(0);
const info = ref('');

const bridgeApi: CopyProgressBridge = {
	reset: () => {
		percent.value = 0;
		info.value = '';
	},
	update: (value, text) => {
		percent.value = value;
		info.value = text;
	}
};

onMounted(() => {
	provideCopyProgressBridge(bridgeApi);
	onUnmounted(() => resetCopyProgressBridge(bridgeApi));
});
</script>

<style>
#copyProgress {
	width: 380px;
	height: 116px;
}

#copyProgress-flex {
	margin: 10px;
	flex-direction: column;
}

#copyProgress-box {
	display: block;
	height: 20px;
	background-color: var(--input-background);
	border: var(--input-border);
	border-radius: 2px;
	overflow: hidden;
}

#copyProgress-bar {
	display: block;
	width: 100%;
	height: 100%;
	background-color: var(--selected-background);
}
</style>
