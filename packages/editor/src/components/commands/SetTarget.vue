<template>
<WindowFrame id="setTarget">
	<template #title><TitleBar>Set Target<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setTarget-actor" type="actor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
