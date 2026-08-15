<template>
<WindowFrame id="registerEvent" @confirm="onConfirm">
	<template #title><TitleBar>Register Event<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Target</div
			><SelectBox id="registerEvent-target" @write="onTargetWrite" /> <div class="text">Actor</div
			><CustomBox id="registerEvent-actor" type="actor" /> <div class="text">Element</div
			><CustomBox id="registerEvent-element" type="element" />
			<div class="text">Operation</div
			><SelectBox id="registerEvent-operation" @write="onOperationWrite" />
			<div class="text">Type</div><SelectBox id="registerEvent-type" @write="onTypeWrite" /> <div class="text">Priority</div
			><CheckBox id="registerEvent-priority" class="standard large" />
			<div class="text">Namespace</div
			><CheckBox id="registerEvent-namespace" class="standard large" />
			<div class="text">Tag Name</div><StringVar id="registerEvent-tag" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';


const onTargetWrite = (value: unknown) => {
	Command?.cases?.registerEvent?.targetWrite?.({ value });
};
const onOperationWrite = () => {
	Command?.cases?.registerEvent?.operationWrite?.();
};
const onTypeWrite = () => {
	Command?.cases?.registerEvent?.typeWrite?.();
};

const onConfirm = () => {
	Command?.cases?.registerEvent?.save?.();
};

</script>
