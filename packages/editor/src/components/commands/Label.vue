<template>
<WindowFrame id="label">
	<template #title><TitleBar>Label<div class="close" /></TitleBar></template>
	
		<div class="grid-box"> <div class="text">Label Name</div><TextBox id="label-name" /> </div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';


</script>
