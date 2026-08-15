<template>
<WindowFrame id="showChoices" @confirm="onConfirm">
	<template #title><TitleBar>Show Choices<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Choices</div><ParamList id="showChoices-choices" />
			<div class="text">Parameters</div><TextBox id="showChoices-parameters" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';


const onConfirm = () => {
	Command?.cases?.showChoices?.save?.();
};

</script>
