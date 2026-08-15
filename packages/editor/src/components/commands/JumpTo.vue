<template>
<WindowFrame id="jumpTo" @confirm="onConfirm">
	<template #title><TitleBar>Jump to<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="jumpTo-operation" />
			<div class="text">Label Name</div><TextBox id="jumpTo-label" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.jumpTo?.save?.();
};

</script>
