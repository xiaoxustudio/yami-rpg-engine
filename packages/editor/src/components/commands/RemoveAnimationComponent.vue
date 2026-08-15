<template>
<WindowFrame id="removeAnimationComponent" @confirm="onConfirm">
	<template #title><TitleBar>Remove Animation Component<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="removeAnimationComponent-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="removeAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><div class="text">Motion</div><SelectBox id="removeAnimationComponent-motion" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const onWrite = (value: unknown) => {
	Command?.cases?.removeAnimationComponent?.writeHandler?.({ value });
};


const onConfirm = () => {
	Command?.cases?.removeAnimationComponent?.save?.();
};

</script>
