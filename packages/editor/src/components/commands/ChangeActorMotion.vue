<template>
<WindowFrame id="changeActorMotion" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Motion<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorMotion-actor" type="actor" /><div class="text">Type</div><SelectBox id="changeActorMotion-type" /><div class="text">Motion</div
			><CustomBox id="changeActorMotion-motion" type="enum-string" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.changeActorMotion?.save?.();
};

</script>
