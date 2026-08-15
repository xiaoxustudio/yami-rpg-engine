<template>
	<WindowFrame id="switchCollisionSystem" @confirm="onConfirm">
		<template #title><TitleBar>Switch Collision System<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="switchCollisionSystem-operation" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.switchCollisionSystem?.save?.();
};

</script>
