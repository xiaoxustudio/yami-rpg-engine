<template>
	<WindowFrame id="setLanguage" :ref="registryRef(fieldEls, 'setLanguage')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setLanguage.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setLanguage-language.label') }}</div>
			<SelectBox
				:label="t('components.setLanguage-language.label')"
				id="setLanguage-language"
				:ref="registryRef(fieldEls, 'setLanguage-language')"
				v-tip="t('components.setLanguage-language.tip')"
				v-model="form.language"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { composableEls } from '@app/composables/element-registry';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { useSetLanguageCommandSchema } from '@app/composables/commands/useSetLanguageCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const fieldEls = createElementRegistry(composableEls);

const { form, save } = useSetLanguageCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
#setLanguage {
	width: 324px;
	height: 98px;
}

#setLanguage-confirm {
	right: 108px;
	bottom: 10px;
}

#setLanguage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
