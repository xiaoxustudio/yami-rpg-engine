<template>
	<WindowFrame id="setCursor">
		<template #title><TitleBar>Set Cursor<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Image</div
				><CustomBox id="setCursor-image" type="file" filter="image" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';


</script>
