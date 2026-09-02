<template>
	<WindowFrame id="playAudio" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.playAudio.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="playAudio-type" v-focus v-model="form.type" />
			<div class="text">Audio</div>
			<CustomBox
				id="playAudio-audio"
				v-focus
				type="file"
				filter="audio"
				v-model="form.audio"
			/>
			<div class="text">Volume</div>
			<NumberBox
				id="playAudio-volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="volume"
			/>
			<div class="text">Sound Location</div>
			<CustomBox id="playAudio-location" type="position" v-model="form.location" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlayAudioCommandSchema } from '@app/composables/commands/usePlayAudioCommandSchema';
import { $ } from '@app/utils/dom';
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
	$('#playAudio-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' },
		{ name: 'SE - Attenuated', value: 'se-attenuated' }
	]);
	$('#playAudio-type')
		?.enableHiddenMode?.()
		?.relate?.([{ case: 'se-attenuated', targets: [$('#playAudio-location')] }]);
});
</script>
