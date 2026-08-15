<template>
<WindowFrame id="changeActorPortrait" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Portrait<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorPortrait-actor" type="actor" /><div class="text">Mode</div><SelectBox id="changeActorPortrait-mode" /><div class="text">Portrait</div
			><CustomBox id="changeActorPortrait-portrait" type="file" filter="image" /><div class="text">Clip</div
			><CustomBox
				id="changeActorPortrait-clip"
				type="clip"
				image="changeActorPortrait-portrait"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.changeActorPortrait?.save?.();
};

</script>
