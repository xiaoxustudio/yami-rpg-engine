<template>
<WindowFrame id="wait">
	<template #title><TitleBar>Wait<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Duration</div
			><NumberVar id="wait-duration" min="1" max="3600000" unit="ms" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';


</script>
