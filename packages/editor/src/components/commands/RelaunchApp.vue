<template>
	<WindowFrame id="relaunchApp">
		<template #title><TitleBar>Relaunch App<div class="close" /></TitleBar></template>
		
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import '@app/legacy/module/command/relaunchApp.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useLocalStore } from '@app/stores/local';


</script>
