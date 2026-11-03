<template>
	<WindowFrame id="setLanguage" :ref="controlRef('setLanguage')" @confirm="onConfirm">
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
				:ref="controlRef('setLanguage-language')"
				v-tip="t('components.setLanguage-language.tip')"
				v-model="form.language"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetLanguageCommandSchema } from '@app/composables/commands/useSetLanguageCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';
import {
	provideSetLanguageBridge,
	resetSetLanguageBridge,
	type SetLanguageBridge
} from '@app/composables/set-language-bridge';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setLanguage-language' | 'setLanguage';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetLanguageCommandSchema();

const onConfirm = () => {
	save();
};

/** 控件级能力：schema 载入时要灌语言候选项并回写选中值。 */
const bridgeApi: SetLanguageBridge = {
	loadItems: (items) => {
		controls['setLanguage-language']?.loadItems?.(items);
	},
	setLanguage: (value) => {
		controls['setLanguage-language']?.write?.(value);
	},
	focus: () => {
		controls['setLanguage-language']?.getFocus?.();
	}
};

onMounted(() => {
	provideSetLanguageBridge(bridgeApi);
	onUnmounted(() => resetSetLanguageBridge(bridgeApi));
});
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
