<template>
<WindowFrame id="changeActorSprite" @confirm="onConfirm">
	<template #title><TitleBar>Change Actor Sprite<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorSprite-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="changeActorSprite-animationId"
				type="file"
				filter="animation"
			 /><div class="text">Sprite Name</div><SelectBox id="changeActorSprite-spriteId" /><div class="text">Sprite</div
			><CustomBox id="changeActorSprite-image" type="file" filter="image" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const onWrite = (value: unknown) => {
	Command?.cases?.changeActorSprite?.writeHandler?.({ value });
};


const onConfirm = () => {
	Command?.cases?.changeActorSprite?.save?.();
};

</script>
