<template>
<WindowFrame id="setMovementSpeed" @confirm="onConfirm">
	<template #title><TitleBar>Set Movement Speed<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setMovementSpeed-actor" type="actor" /><div class="text">Property</div><SelectBox id="setMovementSpeed-property" /><div class="text">Base Speed</div
			><NumberVar
				id="setMovementSpeed-base"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
			 /><div class="text">Speed Factor</div
			><NumberVar id="setMovementSpeed-factor" min="0" max="4" decimals="4" /></div>
	
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
	Command?.cases?.setMovementSpeed?.save?.();
};

</script>
