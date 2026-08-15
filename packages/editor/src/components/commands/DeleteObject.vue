<template>
	<WindowFrame id="deleteObject">
		<template #title><TitleBar>Delete Object<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Object</div><CustomBox id="deleteObject-object" type="object" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
