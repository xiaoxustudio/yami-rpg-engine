<template>
<WindowFrame id="transferGlobalActor">
	<template #title><TitleBar>Transfer Global Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="transferGlobalActor-actor" type="actor" />
			<div class="text">Position</div
			><CustomBox id="transferGlobalActor-position" type="position" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
