<template>
	<WindowFrame id="playAudio" :ref="registryRef(fieldEls, 'playAudio')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.playAudio-type.label') }}</div>
			<SelectBox
				id="playAudio-type"
				v-tip="t('components.playAudio-type.tip')"
				:ref="registryRef(fieldEls, 'playAudio-type')"
				v-focus
				v-model="form.type"
			/>
			<div class="text">{{ t('components.playAudio-audio.label') }}</div>
			<CustomBox
				id="playAudio-audio"
				:ref="registryRef(fieldEls, 'playAudio-audio')"
				v-tip="t('components.playAudio-audio.tip')"
				v-focus
				type="file"
				filter="audio"
				v-model="form.audio"
			/>
			<div class="text">{{ t('components.playAudio-volume.label') }}</div>
			<NumberBox
				:label="t('components.playAudio-volume.label')"
				id="playAudio-volume"
				:ref="registryRef(fieldEls, 'playAudio-volume')"
				v-tip="t('components.playAudio-volume.tip')"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="volume"
			/>
			<div class="text">{{ t('components.playAudio-location.label') }}</div>
			<CustomBox
				id="playAudio-location"
				v-tip="t('components.playAudio-location.tip')"
				:ref="registryRef(fieldEls, 'playAudio-location')"
				type="position"
				v-model="form.location"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayAudioCommandSchema } from '@app/composables/commands/usePlayAudioCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = usePlayAudioCommandSchema();

const volume = computed({
	get: () => form.volume as number | string,
	set: (value) => {
		form.volume = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('playAudio-type', ['bgm', 'bgs', 'cv', 'se', 'se-attenuated'], (items) =>
		fieldEls.get('playAudio-type')?.loadItems?.(items)
	);
	fieldEls
		.get('playAudio-type')
		?.enableHiddenMode?.()
		?.relate?.([{ case: 'se-attenuated', targets: [fieldEls.get('playAudio-location')] }]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#playAudio {
	width: 324px;
	height: 170px;
}

#playAudio-confirm {
	right: 108px;
	bottom: 10px;
}

#playAudio-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
