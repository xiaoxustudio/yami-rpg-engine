<template>
	<WindowFrame
		id="selector"
		:ref="registryRef(storesEls, 'selector')"
		mode="center"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.selector.title') }}
				<div class="maximize"></div>
				<div class="close"></div> </TitleBar
		></template>

		<div class="file-browser" id="selector-browser">
			<FileBrowser bridge="selector" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { getSelectorStore } from '@app/stores/selector.ts';
import { onMounted } from 'vue';
import { storesEls } from '@app/stores/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileBrowser from '../file-browser/FileBrowser.vue';

const onConfirm = () => {
	getSelectorStore().confirm?.();
};

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#selector {
	width: 1200px;
	height: 700px;
}

#selector-browser {
	top: 24px;
	bottom: 40px;
	width: 100%;
	background-color: var(--selector-browser-background);
	border-top: var(--selector-browser-border);
	border-bottom: var(--selector-browser-border);
}

#selector-confirm {
	right: 108px;
	bottom: 10px;
}

#selector-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
