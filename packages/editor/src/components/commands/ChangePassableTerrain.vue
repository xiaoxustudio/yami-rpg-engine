<template>
<WindowFrame id="changePassableTerrain" @confirm="onConfirm">
	<template #title><TitleBar>Change Passable Terrain<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="changePassableTerrain-actor" type="actor" /><div class="text">Passable Terrain</div
			><SelectBox id="changePassableTerrain-passage" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.changePassableTerrain?.save?.();
};

</script>
