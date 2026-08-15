<template>
<WindowFrame id="setActive" @confirm="onConfirm">
	<template #title><TitleBar>Set Active<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="setActive-actor" type="actor" /><div class="text">State</div><SelectBox id="setActive-active" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setActive?.save?.();
};

</script>
