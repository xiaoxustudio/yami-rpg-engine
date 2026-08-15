<template>
<WindowFrame id="setPartyMember" @confirm="onConfirm">
	<template #title><TitleBar>Set Party Member<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Operation</div><SelectBox id="setPartyMember-operation" /><div class="text">Global Actor</div
			><CustomBox id="setPartyMember-actor" type="actor" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setPartyMember?.save?.();
};

</script>
