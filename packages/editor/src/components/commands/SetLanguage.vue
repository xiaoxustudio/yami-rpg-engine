<template>
	<WindowFrame id="setLanguage">
		<template #title><TitleBar>Set Language<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Language</div><SelectBox id="setLanguage-language" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


</script>
