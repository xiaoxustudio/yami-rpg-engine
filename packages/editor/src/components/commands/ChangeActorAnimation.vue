<template>
<WindowFrame id="changeActorAnimation">
	<template #title><TitleBar>Change Actor Animation<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorAnimation-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="changeActorAnimation-animationId"
				type="file"
				filter="animation"
			 /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
