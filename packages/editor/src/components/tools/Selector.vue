<template>
	<WindowFrame id="selector" mode="center">
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
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileBrowser from '../file-browser/FileBrowser.vue';

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
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

