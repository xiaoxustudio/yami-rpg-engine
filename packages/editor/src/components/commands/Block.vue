<template>
<WindowFrame id="block">
	<template #title><TitleBar>Block<div class="close" /></TitleBar></template>
	
		<TextBox id="block-note" />
		<CheckBox id="block-asynchronous" class="standard"
			><div class="text" id="block-asynchronous-label">Asynchronous</div></CheckBox
		>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';


</script>
