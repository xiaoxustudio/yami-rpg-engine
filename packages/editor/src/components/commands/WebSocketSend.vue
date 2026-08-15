<template>
	<WindowFrame id="webSocketSend" @confirm="onConfirm">
		<template #title><TitleBar>webSocketSend<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">ID</div><StringVar id="webSocketSend-id" /> <div class="text">Data</div
				><StringVar id="webSocketSend-data" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import StringVar from '@app/components/common/StringVar.vue';


const onConfirm = () => {
	Command?.cases?.webSocketSend?.save?.();
};

</script>
