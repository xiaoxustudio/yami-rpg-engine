<template>
	<WindowFrame id="tintScreen" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.tintScreen.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box" id="tintScreen-grid-box">
				<div class="text">Tint - Red</div
				><NumberBox id="tintScreen-tint-0" min="-255" max="255" step="5" v-model="form['tint-0']" />
				<div class="text">Tint - Green</div
				><NumberBox id="tintScreen-tint-1" min="-255" max="255" step="5" v-model="form['tint-1']" />
				<div class="text">Tint - Blue</div
				><NumberBox id="tintScreen-tint-2" min="-255" max="255" step="5" v-model="form['tint-2']" />
				<div class="text">Tint - Grayscale</div
				><NumberBox id="tintScreen-tint-3" min="0" max="255" step="5" v-model="form['tint-3']" />
				<div class="text">Easing</div><SelectBox id="tintScreen-easingId" name="easing" v-model="form.easingId" />
				<div class="text">Duration</div
				><NumberBox
					id="tintScreen-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				 />
				<div class="text">Wait</div><SelectBox id="tintScreen-wait" name="wait" v-model="form.wait" />
			</div>
			<FilterBox id="tintScreen-filter" width="96" height="160" />
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTintScreenCommandSchema } from '@app/composables/commands/useTintScreenCommandSchema';
import { $ } from '@app/utils/dom';
import { clear, write } from '@app/utils/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FilterBox from '@app/components/common/FilterBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useTintScreenCommandSchema();

const onConfirm = () => {
	save();
};

watch(
	[
		() => form['tint-0'],
		() => form['tint-1'],
		() => form['tint-2'],
		() => form['tint-3']
	],
	([red, green, blue, gray]) => {
		write($('#tintScreen-filter'), [red, green, blue, gray]);
	}
);

onMounted(() => {
	$('#tintScreen-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#tintScreen')?.on?.('open', () => {
		$('#tintScreen-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#tintScreen')?.on?.('closed', () => {
		clear($('#tintScreen-easingId'));
		clear($('#tintScreen-filter'));
	});
});

</script>
