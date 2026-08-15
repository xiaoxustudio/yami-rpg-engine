<template>
	<WindowFrame id="nestElement">
		<template #title><TitleBar>Nest Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Parent Element</div
				><CustomBox id="nestElement-parent" type="element" />
				<div class="text">Child Element</div
				><CustomBox id="nestElement-child" type="element" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
