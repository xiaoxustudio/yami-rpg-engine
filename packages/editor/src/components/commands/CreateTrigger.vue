<template>
	<WindowFrame id="createTrigger" @confirm="onConfirm">
		<template #title><TitleBar>Create Trigger<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Trigger</div
				><FileVar id="createTrigger-triggerId" type="file" filter="trigger" />
				<div class="text">Caster</div><CustomBox id="createTrigger-caster" type="actor" />
				<div class="text">Origin</div><CustomBox id="createTrigger-origin" type="position" />
				<div class="text">Angle</div><CustomBox id="createTrigger-angle" type="angle" />
				<div class="text">Distance</div
				><NumberVar
					id="createTrigger-distance"
					min="-512"
					max="512"
					decimals="4"
					unit="tile"
				 />
				<div class="text">Scale</div
				><NumberVar
					id="createTrigger-scale"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
				<div class="text">Global Speed</div
				><NumberVar
					id="createTrigger-timeScale"
					min="0.1"
					max="10"
					step="0.1"
					decimals="4"
				 />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';


const onConfirm = () => {
	Command?.cases?.createTrigger?.save?.();
};

</script>
