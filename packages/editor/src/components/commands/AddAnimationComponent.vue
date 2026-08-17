<template>
<WindowFrame id="addAnimationComponent" @confirm="onConfirm">
	<template #title><TitleBar>Add Animation Component<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="addAnimationComponent-actor" type="actor" @input="onActor" /><div class="text">Animation</div
			><CustomBox
				id="addAnimationComponent-animationId"
				type="file"
				filter="animation"
				@write="onWrite"
			 /><div class="text">Motion</div><SelectBox id="addAnimationComponent-motion" v-model="form.motion" /><div class="text">Rotatable</div><SelectBox id="addAnimationComponent-rotatable" v-model="form.rotatable" /><div class="text">Sync Angle</div><SelectBox id="addAnimationComponent-syncAngle" v-model="form.syncAngle" /><div class="text">Priority</div
			><NumberBox id="addAnimationComponent-priority" min="-100" max="100" v-model="form.priority" /><div class="text">Offset Y</div
			><NumberBox
				id="addAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
				v-model="form.offsetY"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useAddAnimationComponentCommandSchema } from '@app/composables/commands/useAddAnimationComponentCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save, writeHandler } = useAddAnimationComponentCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onWrite = (value: unknown) => {
	writeHandler({ value: value as string });
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#addAnimationComponent-rotatable')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#addAnimationComponent-syncAngle')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});

</script>
