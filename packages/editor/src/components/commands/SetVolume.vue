<template>
	<WindowFrame id="setVolume" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setVolume.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Type</div>
			<SelectBox id="setVolume-type" v-focus v-model="form.type" />
			<div class="text">Volume</div>
			<NumberVar
				id="setVolume-volume"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
				v-model="form.volume"
			/>
			<div class="text">Easing</div>
			<SelectBox id="setVolume-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="setVolume-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="setVolume-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetVolumeCommandSchema } from '@app/composables/useSetVolumeCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetVolumeCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setVolume-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' },
		{ name: 'SE', value: 'se' }
	]);
	$('#setVolume-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setVolume')?.on?.('open', () => {
		$('#setVolume-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setVolume')?.on?.('closed', () => {
		clear($('#setVolume-easingId'));
	});
});
</script>
