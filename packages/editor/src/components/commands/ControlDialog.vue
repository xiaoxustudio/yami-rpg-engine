<template>
	<WindowFrame id="controlDialog" @confirm="onConfirm">
		<template #title><TitleBar>Control Dialog<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="controlDialog-element" type="element" />
				<div class="text">Operation</div><SelectBox id="controlDialog-operation" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.controlDialog?.save?.();
};

</script>
