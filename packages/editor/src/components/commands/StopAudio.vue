<template>
	<WindowFrame id="stopAudio" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.stopAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="stopAudio-type" v-model="form.type" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStopAudioCommandSchema } from '@app/composables/commands/useStopAudioCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useStopAudioCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#stopAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' },
		{ name: 'ALL', value: 'all' }
	]);
});
</script>
