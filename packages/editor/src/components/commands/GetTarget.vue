<template>
<WindowFrame id="getTarget" @confirm="onConfirm">
	<template #title><TitleBar>Get Target<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="getTarget-actor" type="actor" /><div class="text">Selector</div><SelectBox id="getTarget-selector" /><div class="text">Condition</div><SelectBox id="getTarget-condition" /><div class="text">Attribute</div><SelectBox id="getTarget-attribute" /><div class="text">Attribute 2</div><SelectBox id="getTarget-divisor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.getTarget?.save?.();
};

</script>
