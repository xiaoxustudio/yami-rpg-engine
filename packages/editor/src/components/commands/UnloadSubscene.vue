<template>
	<WindowFrame id="unloadSubscene">
		<template #title><TitleBar>Unload Subscene<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Scene</div
				><FileVar id="unloadSubscene-sceneId" type="file" filter="scene" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';


</script>
