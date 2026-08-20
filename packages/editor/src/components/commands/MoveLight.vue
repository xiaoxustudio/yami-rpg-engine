<template>
	<WindowFrame id="moveLight" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.moveLight.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Light</div><CustomBox id="moveLight-light" type="light" @input="onLight" />
				<div class="text">Properties</div><ParamList id="moveLight-properties" />
				<div class="text">Easing</div><SelectBox id="moveLight-easingId" name="easing" v-model="form.easingId" />
				<div class="text">Duration</div
				><NumberBox
					id="moveLight-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				 />
				<div class="text">Wait</div><SelectBox id="moveLight-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMoveLightCommandSchema } from '@app/composables/commands/useMoveLightCommandSchema';
import { $ } from '@app/utils/dom';
import { clear } from '@app/utils/element-utils';
import { LightProperty } from '@app/commands/property-window/move-light-property-window.ts';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useMoveLightCommandSchema();

const onLight = (value: unknown) => {
	form.light = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#moveLight-properties')?.bind?.(LightProperty);
	$('#moveLight-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#moveLight')?.on?.('open', () => {
		$('#moveLight-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#moveLight')?.on?.('closed', () => {
		clear($('#moveLight-properties'));
		clear($('#moveLight-easingId'));
	});
});

</script>
