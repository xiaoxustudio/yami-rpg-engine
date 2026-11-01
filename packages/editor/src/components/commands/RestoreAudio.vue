<template>
	<WindowFrame id="restoreAudio" @confirm="onConfirm">
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
				ref="restoreAudioTypeBox"
				v-focus
				v-model="form.type"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRestoreAudioCommandSchema } from '@app/composables/commands/useRestoreAudioCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

// 控件用模板 ref（组件 defineExpose），不再注册进 ElementRegistry。
const restoreAudioTypeBox = ref<InstanceType<typeof SelectBox> | null>(null);

const { t } = useI18n();

const { form, save } = useRestoreAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	restoreAudioTypeBox.value?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
});
</script>

<style>
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
