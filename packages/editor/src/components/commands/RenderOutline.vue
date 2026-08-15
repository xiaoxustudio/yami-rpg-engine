<template>
<WindowFrame id="renderOutline" @confirm="onConfirm">
	<template #title><TitleBar>Render Outline<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="renderOutline-operation" /><div class="text">Actor</div><CustomBox id="renderOutline-actor" type="actor" /><div class="text">Color</div><ColorBox id="renderOutline-color" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.renderOutline?.save?.();
};

</script>
