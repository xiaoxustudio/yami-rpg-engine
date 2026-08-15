<template>
	<WindowFrame id="setGameSpeed" @confirm="onConfirm">
		<template #title><TitleBar>Set Game Speed<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Speed</div
				><NumberVar
					id="setGameSpeed-speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				/>
				<div class="text">Easing</div><SelectBox id="setGameSpeed-easingId" name="easing" />
				<div class="text">Duration</div
				><NumberVar
					id="setGameSpeed-duration"
					name="duration"
					min="0"
					max="3600000"
					unit="ms"
				/>
				<div class="text">Wait</div><SelectBox id="setGameSpeed-wait" name="wait" />
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
	Command?.cases?.setGameSpeed?.save?.();
};

</script>
