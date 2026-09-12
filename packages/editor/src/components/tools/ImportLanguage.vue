<template>
	<WindowFrame id="importLanguage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.importLanguage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.importLanguage-language.label') }}</div>
			<SelectBox id="importLanguage-language"
				v-tip="t('components.importLanguage-language.tip')"
				:ref="registryRef(localEls, 'importLanguage-language')" v-focus />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { ImportLanguage } from '@app/local/import-language-window.ts';
import { onMounted } from 'vue';
import { localEls } from '@app/local/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// P5b 批次 4：importLanguage-confirm 由 WindowFrame 生成，改由 @confirm 驱动
const onConfirm = () => {
	ImportLanguage?.confirm?.(new Event('click'));
};

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/dialogs.css 迁入组件（选择器为全局 id，不能用 scoped） */
#importLanguage {
	width: 324px;
	height: 98px;
}

#importLanguage-confirm {
	right: 108px;
	bottom: 10px;
}

#importLanguage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

