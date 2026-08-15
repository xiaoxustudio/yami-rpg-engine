<template>
<WindowFrame id="break">
	<template #title><TitleBar>Break<div class="close" /></TitleBar></template>
	
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useLocalStore } from '@app/stores/local';


</script>
