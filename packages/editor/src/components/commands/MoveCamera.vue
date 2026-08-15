<template>
	<WindowFrame id="moveCamera" @confirm="onConfirm">
		<template #title><TitleBar>Move Camera<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Mode</div><SelectBox id="moveCamera-mode" /> <div class="text">Position</div
				><CustomBox id="moveCamera-position" type="position" /> <div class="text">Actor</div
				><CustomBox id="moveCamera-actor" type="actor" /> <div class="text">Easing</div
				><SelectBox id="moveCamera-easingId" name="easing" /> <div class="text">Duration</div
				><NumberBox
					id="moveCamera-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				 />
				<div class="text">Wait</div><SelectBox id="moveCamera-wait" name="wait" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.moveCamera?.save?.();
};

</script>
