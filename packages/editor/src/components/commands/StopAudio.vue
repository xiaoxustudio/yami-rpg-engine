<template>
	<WindowFrame id="stopAudio" :ref="registryRef(fieldEls, 'stopAudio')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.stopAudio-type.label') }}</div>
			<SelectBox
				:label="t('components.stopAudio-type.label')"
				id="stopAudio-type"
				v-tip="t('components.stopAudio-type.tip')"
				:ref="registryRef(fieldEls, 'stopAudio-type')"
				v-focus
				v-model="form.type"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStopAudioCommandSchema } from '@app/composables/commands/useStopAudioCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useStopAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('stopAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' },
		{ name: 'ALL', value: 'all' }
	]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#stopAudio {
	width: 324px;
	height: 98px;
}

#stopAudio-confirm {
	right: 108px;
	bottom: 10px;
}

#stopAudio-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
