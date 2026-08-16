<template>
<WindowFrame id="translateActor" @confirm="onConfirm">
	<template #title><TitleBar>Translate Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="translateActor-actor" type="actor" @input="onActor" />
			<div class="text">Angle</div><CustomBox id="translateActor-angle" type="angle" @input="onAngle" />
			<div class="text">Distance</div
			><NumberVar
				id="translateActor-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
				v-model="form.distance"
			 />
			<div class="text">Easing</div><SelectBox id="translateActor-easingId" name="easing" v-model="form.easingId" />
			<div class="text">Duration</div
			><NumberVar
				id="translateActor-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			 />
			<div class="text">Wait</div><SelectBox id="translateActor-wait" name="wait" v-model="form.wait" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useTranslateActorCommandSchema } from '@app/composables/commands/useTranslateActorCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useTranslateActorCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onAngle = (value: unknown) => {
	form.angle = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#translateActor-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#translateActor')?.on?.('open', () => {
		$('#translateActor-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#translateActor')?.on?.('closed', () => {
		clear($('#translateActor-easingId'));
	});
});

</script>
