<template>
	<WindowFrame id="setFocus" @confirm="onConfirm">
		<template #title><TitleBar>Set Focus<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="setFocus-operation" />
				<div class="text">Element</div><CustomBox id="setFocus-element" type="element" />
				<div class="text">Mode</div><SelectBox id="setFocus-mode" /> <div class="text">Cancelable</div
				><CheckBox id="setFocus-cancelable" class="standard large" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onConfirm = () => {
	Command?.cases?.setFocus?.save?.();
};

</script>
