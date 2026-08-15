<template>
	<WindowFrame id="setTerrain" @confirm="onConfirm">
		<template #title><TitleBar>Set Terrain<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Position</div><CustomBox id="setTerrain-position" type="position" />
				<div class="text">Terrain</div><SelectBox id="setTerrain-terrain" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setTerrain?.save?.();
};

</script>
