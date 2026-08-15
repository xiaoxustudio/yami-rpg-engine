<template>
	<WindowFrame id="webSocketConnect" @confirm="onConfirm">
		<template #title><TitleBar>webSocketConnect<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">URL</div><StringVar id="webSocketConnect-url" /> <div class="text">ID</div
				><StringVar id="webSocketConnect-id" /> <div class="text">Protocols</div
				><StringVar id="webSocketConnect-protocols" /> <div class="text">OnOpen</div
				><CustomBox id="webSocketConnect-onOpen" type="file" filter="event" />
				<div class="text">OnMessage</div
				><CustomBox id="webSocketConnect-onMessage" type="file" filter="event" />
				<div class="text">OnError</div
				><CustomBox id="webSocketConnect-onError" type="file" filter="event" />
				<div class="text">OnClose</div
				><CustomBox id="webSocketConnect-onClose" type="file" filter="event" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';


const onConfirm = () => {
	Command?.cases?.webSocketConnect?.save?.();
};

</script>
