<template>
	<WindowFrame
		id="restoreAudio"
		:ref="registryRef(fieldEls, 'restoreAudio')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.restoreAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.restoreAudio-type.label') }}</div>
			<SelectBox
				:label="t('components.restoreAudio-type.label')"
				id="restoreAudio-type"
				v-tip="t('components.restoreAudio-type.tip')"
				:ref="registryRef(fieldEls, 'restoreAudio-type')"
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
import { useRestoreAudioCommandSchema } from '@app/composables/commands/useRestoreAudioCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useRestoreAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('restoreAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#restoreAudio {
	width: 324px;
	height: 98px;
}

#restoreAudio-confirm {
	right: 108px;
	bottom: 10px;
}

#restoreAudio-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
