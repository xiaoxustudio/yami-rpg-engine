<template>
	<WindowFrame id="saveAudio" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.saveAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="saveAudio-type" v-focus v-model="form.type" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSaveAudioCommandSchema } from '@app/composables/commands/useSaveAudioCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSaveAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#saveAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
