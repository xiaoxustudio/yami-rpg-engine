<template>
<WindowFrame id="getMultipleActors" @confirm="onConfirm">
	<template #title><TitleBar>Get Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Write to List</div
			><CustomBox
				id="getMultipleActors-variable"
				type="variable"
				filter="object"
			 /><div class="text">Position</div
			><CustomBox id="getMultipleActors-position" type="position" /><div class="text">Area</div><SelectBox id="getMultipleActors-area" /><div class="text">Width</div
			><NumberVar
				id="getMultipleActors-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><div class="text">Height</div
			><NumberVar
				id="getMultipleActors-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><div class="text">Radius</div
			><NumberVar
				id="getMultipleActors-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><div class="text">Selector</div><SelectBox id="getMultipleActors-selector" /><div class="text">Team</div><SelectVar id="getMultipleActors-teamId" /><div class="text">Activation</div><SelectBox id="getMultipleActors-activation" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.getMultipleActors?.save?.();
};

</script>
