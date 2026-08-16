<template>
	<WindowFrame id="moveElement" @confirm="onConfirm">
		<template #title><TitleBar>Move Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="moveElement-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="moveElement-properties" />
				<div class="text">Easing</div><SelectBox id="moveElement-easingId" name="easing" v-model="form.easingId" />
				<div class="text">Duration</div
				><NumberBox
					id="moveElement-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
					v-model="form.duration"
				/>
				<div class="text">Wait</div><SelectBox id="moveElement-wait" name="wait" v-model="form.wait" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useMoveElementCommandSchema } from '@app/composables/commands/useMoveElementCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { TransformProperty } from '@/command/move-element-property-window.ts';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useMoveElementCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

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
