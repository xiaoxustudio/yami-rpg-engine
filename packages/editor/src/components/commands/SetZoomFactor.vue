<template>
	<WindowFrame id="setZoomFactor" @confirm="onConfirm">
		<template #title><TitleBar>Set Zoom Factor<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Zoom Factor</div
				><NumberVar
					id="setZoomFactor-zoom"
					min="1"
					max="8"
					step="0.1"
					decimals="4"
				 />
				<div class="text">Easing</div><SelectBox id="setZoomFactor-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberVar
					id="setZoomFactor-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<div class="text">Wait</div><SelectBox id="setZoomFactor-wait" name="wait" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setZoomFactor?.save?.();
};

</script>
