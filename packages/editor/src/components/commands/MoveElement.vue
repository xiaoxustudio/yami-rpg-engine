<template>
	<WindowFrame id="moveElement" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.moveElement.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Element</div>
			<CustomBox id="moveElement-element" v-focus type="element" v-model="form.element" />
			<div class="text">Properties</div>
			<ParamList id="moveElement-properties" v-focus v-model="form.properties" />
			<div class="text">Easing</div>
			<SelectBox id="moveElement-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div>
			<NumberBox
				id="moveElement-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="duration"
			/>
			<div class="text">Wait</div>
			<SelectBox id="moveElement-wait" name="wait" v-model="form.wait" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveElementCommandSchema } from '@app/composables/commands/useMoveElementCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { TransformProperty } from '@app/commands/property-window/move-element-property-window.ts';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveElementCommandSchema();

const duration = computed({
	get: () => form.duration as number | string,
	set: (value) => {
		form.duration = value;
	}
});

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#moveElement-properties')?.bind?.(TransformProperty);
	$('#moveElement-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#moveElement')?.on?.('open', () => {
		$('#moveElement-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#moveElement')?.on?.('closed', () => {
		clear($('#moveElement-properties'));
		clear($('#moveElement-easingId'));
	});
});
</script>
