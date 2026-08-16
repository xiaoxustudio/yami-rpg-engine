<template>
<WindowFrame id="changeActorMotion" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Motion<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorMotion-actor" type="actor" @input="onActor" /><div class="text">Type</div><SelectBox id="changeActorMotion-type" v-model="form.type" /><div class="text">Motion</div
			><CustomBox id="changeActorMotion-motion" type="enum-string" @input="onMotion" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useChangeActorMotionCommandSchema } from '@app/composables/commands/useChangeActorMotionCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useChangeActorMotionCommandSchema();

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
	$('#changeActorMotion-type')?.loadItems?.([
		{ name: 'Idle', value: 'idle' },
		{ name: 'Move', value: 'move' }
	]);
});

</script>
