<template>
<WindowFrame id="playActorAnimation" @confirm="onConfirm">
	<template #title><TitleBar>Play Actor Animation<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="playActorAnimation-actor" type="actor" @input="onActor" /><div class="text">Motion</div
			><CustomBox id="playActorAnimation-motion" type="enum-string" @input="onMotion" /><div class="text">Speed</div
			><NumberVar
				id="playActorAnimation-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
				v-model="form.speed"
			 /><div class="text">Wait</div><SelectBox id="playActorAnimation-wait" name="wait" v-model="form.wait" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { usePlayActorAnimationCommandSchema } from '@app/composables/commands/usePlayActorAnimationCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = usePlayActorAnimationCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onMotion = (value: unknown) => {
	form.motion = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#playActorAnimation-wait')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
});

</script>
