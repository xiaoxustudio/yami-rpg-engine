<template>
	<WindowFrame id="webSocketClose" @confirm="onConfirm">
		<template #title><TitleBar>webSocketClose<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">ID</div><StringVar id="webSocketClose-id" /> <div class="text">Code</div
				><NumberBox id="webSocketClose-code" min="1000" max="4999" />
				<div class="text">Reason</div><StringVar id="webSocketClose-reason" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import StringVar from '@app/components/common/StringVar.vue';


const onConfirm = () => {
	Command?.cases?.webSocketClose?.save?.();
};

</script>
