<template>
<WindowFrame id="comment">
	<template #title><TitleBar>Comment<div class="close" /></TitleBar></template>
	
		<TextArea id="comment-comment" />
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextArea from '@app/components/common/TextArea.vue';


</script>
