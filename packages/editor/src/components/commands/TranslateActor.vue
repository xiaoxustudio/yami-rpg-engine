<template>
<WindowFrame id="translateActor" @confirm="onConfirm">
	<template #title><TitleBar>Translate Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="translateActor-actor" type="actor" />
			<div class="text">Angle</div><CustomBox id="translateActor-angle" type="angle" />
			<div class="text">Distance</div
			><NumberVar
				id="translateActor-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 />
			<div class="text">Easing</div><SelectBox id="translateActor-easingId" name="easing" />
			<div class="text">Duration</div
			><NumberVar
				id="translateActor-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 />
			<div class="text">Wait</div><SelectBox id="translateActor-wait" name="wait" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.translateActor?.save?.();
};

</script>
