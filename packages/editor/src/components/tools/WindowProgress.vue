<template>
	<WindowFrame id="windowProgress" no-buttons>
		<template #title><TitleBar>进度</TitleBar></template>

		<div class="flex-box" id="windowProgress-flex">
			<div class="text" id="windowProgress-info" ref="infoRef" />
			<div class="box" id="windowProgress-box" :ref="bind('box')">
				<div id="windowProgress-bar" :ref="bind('bar')" />
			</div>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { windowProgressNodes } from '@app/composables/page-shell-nodes';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import {
	provideWindowProgress,
	resetWindowProgress,
	type WindowProgressApi
} from '@app/composables/title-window-bridges';

const infoRef = ref<HTMLElement | null>(null);

const { bind } = windowProgressNodes.scoped();

const bridgeApi: WindowProgressApi = {
	setInfo: (text) => {
		if (infoRef.value) infoRef.value.textContent = text;
	}
};

onMounted(() => {
	provideWindowProgress(bridgeApi);
	onUnmounted(() => resetWindowProgress(bridgeApi));
});
</script>

<style>
#windowProgress {
	width: 380px;
	height: 116px;
}

#windowProgress-flex {
	margin: 10px;
	flex-direction: column;
}

#windowProgress-box {
	display: block;
	height: 20px;
	background-color: var(--input-background);
	border: var(--input-border);
	border-radius: 2px;
	overflow: hidden;
}

#windowProgress-bar {
	display: block;
	width: 100%;
	height: 100%;
	background-color: var(--selected-background);
}
</style>
