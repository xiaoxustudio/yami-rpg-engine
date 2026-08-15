<template>
	<WindowFrame id="setProgressBar" @confirm="onConfirm">
		<template #title><TitleBar>Set Progress Bar<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setProgressBar-element" type="element" />
				<div class="text">Properties</div><ParamList id="setProgressBar-properties" />
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
	Command?.cases?.setProgressBar?.save?.();
};

</script>
