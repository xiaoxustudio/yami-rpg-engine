<template>
<WindowFrame id="deleteActor">
	<template #title><TitleBar>Delete Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="deleteActor-actor" type="actor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
