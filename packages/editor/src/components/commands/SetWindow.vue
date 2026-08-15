<template>
	<WindowFrame id="setWindow" @confirm="onConfirm">
		<template #title><TitleBar>Set Window<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setWindow-element" type="element" />
				<div class="text">Properties</div><ParamList id="setWindow-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';


const onConfirm = () => {
	Command?.cases?.setWindow?.save?.();
};

</script>
