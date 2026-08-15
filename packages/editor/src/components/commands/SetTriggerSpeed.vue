<template>
	<WindowFrame id="setTriggerSpeed">
		<template #title><TitleBar>Set Trigger Speed<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Trigger</div
				><CustomBox id="setTriggerSpeed-trigger" type="trigger" /> <div class="text">Speed</div
				><NumberVar
					id="setTriggerSpeed-speed"
					min="0"
					max="512"
					decimals="4"
					unit="t/s"
				 />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';


</script>
