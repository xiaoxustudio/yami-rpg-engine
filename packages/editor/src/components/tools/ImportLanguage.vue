<template>
	<WindowFrame id="importLanguage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.importLanguage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.importLanguage-language.label') }}</div>
			<SelectBox
				:label="t('components.importLanguage-language.label')"
				id="importLanguage-language"
				v-tip="t('components.importLanguage-language.tip')"
				:ref="registryRef(localEls, 'importLanguage-language')"
				v-focus
			/>
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

const onConfirm = () => {
	ImportLanguage?.confirm?.(new Event('click'));
};

const { t } = useI18n();

onMounted(() => {});
</script>

<style>
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
