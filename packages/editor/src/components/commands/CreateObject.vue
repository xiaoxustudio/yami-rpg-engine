<template>
	<WindowFrame id="createObject">
		<template #title><TitleBar>Create Object<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Object</div
				><CustomBox id="createObject-presetId" type="preset-object" filter="any" />
				<div class="text">Position</div
				><CustomBox id="createObject-position" type="position" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
