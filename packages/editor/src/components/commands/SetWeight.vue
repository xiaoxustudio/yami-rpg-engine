<template>
<WindowFrame id="setWeight">
	<template #title><TitleBar>Set Weight<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setWeight-actor" type="actor" /><div class="text">Weight</div
			><NumberVar id="setWeight-weight" min="0" max="8" step="0.1" decimals="4" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';


</script>
