<template>
<WindowFrame id="createGlobalActor" @confirm="onConfirm">
	<template #title><TitleBar>Create Global Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="createGlobalActor-actorId" type="file" filter="actor" /><div class="text">Team</div><SelectBox id="createGlobalActor-teamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.createGlobalActor?.save?.();
};

</script>
