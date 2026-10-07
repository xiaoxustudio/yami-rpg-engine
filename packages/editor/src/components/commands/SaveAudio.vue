<template>
	<WindowFrame id="saveAudio" :ref="registryRef(fieldEls, 'saveAudio')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.saveAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.saveAudio-type.label') }}</div>
			<SelectBox
				:label="t('components.saveAudio-type.label')"
				id="saveAudio-type"
				v-tip="t('components.saveAudio-type.tip')"
				:ref="registryRef(fieldEls, 'saveAudio-type')"
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
import { useSaveAudioCommandSchema } from '@app/composables/commands/useSaveAudioCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSaveAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('saveAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
});
</script>

<style>
#saveAudio {
	width: 324px;
	height: 98px;
}

#saveAudio-confirm {
	right: 108px;
	bottom: 10px;
}

#saveAudio-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
