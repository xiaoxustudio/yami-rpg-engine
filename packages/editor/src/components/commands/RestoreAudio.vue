<template>
<WindowFrame id="restoreAudio" @confirm="onConfirm">
	<template #title><TitleBar>Restore Audio<div class="close" /></TitleBar></template>
	
		<div class="grid-box"> <div class="text">Type</div><SelectBox id="restoreAudio-type" /> </div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.restoreAudio?.save?.();
};

</script>
