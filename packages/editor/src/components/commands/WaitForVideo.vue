<template>
	<WindowFrame id="waitForVideo">
		<template #title><TitleBar>Wait For Video<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="waitForVideo-element" type="element" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
