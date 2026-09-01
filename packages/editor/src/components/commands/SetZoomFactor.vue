<template>
	<WindowFrame id="setZoomFactor" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setZoomFactor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Zoom Factor</div>
			<NumberVar
				id="setZoomFactor-zoom"
				v-focus
				min="1"
				max="8"
				step="0.1"
				decimals="4"
				v-model="form.zoom"
			/>
			<div class="text">Easing</div>
			<SelectBox id="setZoomFactor-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberVar
				id="setZoomFactor-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="setZoomFactor-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetZoomFactorCommandSchema } from '@app/composables/commands/useSetZoomFactorCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetZoomFactorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setZoomFactor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setZoomFactor')?.on?.('open', () => {
		$('#setZoomFactor-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setZoomFactor')?.on?.('closed', () => {
		clear($('#setZoomFactor-easingId'));
	});
});
</script>
