<template>
<WindowFrame id="playAudio" @confirm="onConfirm">
	<template #title><TitleBar>Play Audio<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="playAudio-type" /> <div class="text">Audio</div
			><CustomBox id="playAudio-audio" type="file" filter="audio" />
			<div class="text">Volume</div
			><NumberBox id="playAudio-volume" min="0" max="1" step="0.1" decimals="4" />
			<div class="text">Sound Location</div
			><CustomBox id="playAudio-location" type="position" />
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
	Command?.cases?.playAudio?.save?.();
};

</script>
