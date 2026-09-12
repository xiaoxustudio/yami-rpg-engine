<template>
	<WindowFrame id="copyProgress" no-buttons>
		<template #title
			><TitleBar>{{ t('components.copyProgress.title') }}</TitleBar></template
		>

		<div class="flex-box" id="copyProgress-flex">
			<div class="text">{{ t('components.copyProgress-box.label') }}</div>
			<div class="box" id="copyProgress-box">
				<div class="box" id="copyProgress-bar"
				:ref="registryRef(titleEls, 'copyProgress-bar')" />
			</div>
			<div class="text" id="copyProgress-info"
				:ref="registryRef(titleEls, 'copyProgress-info')" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { titleEls } from '@app/title/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
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

