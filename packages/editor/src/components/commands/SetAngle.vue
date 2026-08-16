<template>
<WindowFrame id="setAngle" @confirm="onConfirm">
	<template #title><TitleBar>Set Angle<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setAngle-actor" type="actor" @input="onActor" /><div class="text">Angle</div><CustomBox id="setAngle-angle" type="angle" @input="onAngle" /><div class="text">Easing</div><SelectBox id="setAngle-easingId" name="easing" v-model="form.easingId" /><div class="text">Duration</div
			><NumberVar
				id="setAngle-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			 /><div class="text">Wait</div><SelectBox id="setAngle-wait" name="wait" v-model="form.wait" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetAngleCommandSchema } from '@app/composables/commands/useSetAngleCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetAngleCommandSchema();

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
	$('#setAngle-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#setAngle')?.on?.('open', () => {
		$('#setAngle-easingId')?.loadItems?.(Data.createEasingItems!());
	});
	$('#setAngle')?.on?.('closed', () => {
		clear($('#setAngle-easingId'));
	});
});

</script>
