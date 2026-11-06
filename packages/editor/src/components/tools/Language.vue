<template>
	<WindowFrame id="language" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.language.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.language-name.label') }}</div>
			<SelectBox
				:label="t('components.language-name.label')"
				id="language-name"
				ref="nameRef"
				v-tip="t('components.language-name.tip')"
				v-focus
			/>
			<div class="text">{{ t('components.language-font.label') }}</div>
			<CustomBox
				id="language-font"
				ref="fontRef"
				v-tip="t('components.language-font.tip')"
				type="file"
				filter="font"
			/>
			<div class="text">{{ t('components.language-scale.label') }}</div>
			<NumberBox
				:label="t('components.language-scale.label')"
				id="language-scale"
				ref="scaleRef"
				v-tip="t('components.language-scale.tip')"
				min="0.5"
				max="2"
				decimals="10"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideLanguage,
	resetLanguage,
	type LanguageApi
} from '@app/composables/language-window-bridge';
import { useProjectSettingsWindow } from '@app/composables/useProjectSettingsWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const settings = useProjectSettingsWindow();

const onConfirm = () => {
	settings.languages.confirm();
};

const nameRef = ref<InstanceType<typeof SelectBox> | null>(null);
const fontRef = ref<InstanceType<typeof CustomBox> | null>(null);
const scaleRef = ref<InstanceType<typeof NumberBox> | null>(null);

const bridgeApi: LanguageApi = {
	loadNameItems: (items) => {
		nameRef.value?.loadItems?.(items);
	},
	setLanguage: ({ name, font, scale }) => {
		nameRef.value?.write2?.(name);
		fontRef.value?.write?.(font);
		scaleRef.value?.write?.(scale);
	},
	getLanguage: () => ({
		name: (nameRef.value?.read?.() as string) ?? '',
		font: (fontRef.value?.read?.() as string) ?? '',
		scale: (scaleRef.value?.read?.() as number) ?? 1
	})
};

onMounted(() => {
	provideLanguage(bridgeApi);
	onUnmounted(() => resetLanguage(bridgeApi));
});
</script>

<style>
#language {
	width: 324px;
	height: 146px;
}

#language-confirm {
	right: 108px;
	bottom: 10px;
}

#language-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
