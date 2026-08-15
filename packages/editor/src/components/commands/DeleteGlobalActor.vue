<template>
<WindowFrame id="deleteGlobalActor">
	<template #title><TitleBar>Delete Global Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div
			><CustomBox id="deleteGlobalActor-actorId" type="file" filter="actor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
