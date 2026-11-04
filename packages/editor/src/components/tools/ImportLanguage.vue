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
				:ref="controlRef('importLanguage-language')"
				v-focus
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { ImportLanguage } from '@app/local/import-language-window.ts';
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideImportLanguageBridge,
	resetImportLanguageBridge,
	type ImportLanguageBridge
} from '@app/composables/import-language-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'importLanguage-language';

const { controls, controlRef } = useControlRefs<Id>();

const onConfirm = () => {
	ImportLanguage?.confirm?.(new Event('click'));
};

const { t } = useI18n();

/** 控件级能力：schema 载入/保存要用，但 schema 不该知道控件 id。 */
const bridgeApi: ImportLanguageBridge = {
	loadItems: (items) => {
		controls['importLanguage-language']?.loadItems?.(items);
	},
	setLanguage: (value) => {
		controls['importLanguage-language']?.write?.(value);
	},
	getLanguage: () => {
		return controls['importLanguage-language']?.read?.();
	}
};

onMounted(() => {
	provideImportLanguageBridge(bridgeApi);
	onUnmounted(() => resetImportLanguageBridge(bridgeApi));
});
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
