<template>
<WindowFrame id="discardTargets" @confirm="onConfirm">
	<template #title><TitleBar>Discard Targets<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="discardTargets-actor" type="actor" /><div class="text">Selector</div><SelectBox id="discardTargets-selector" /><div class="text">Distance</div
			><NumberVar
				id="discardTargets-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /></div>
	
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
	Command?.cases?.discardTargets?.save?.();
};

</script>
