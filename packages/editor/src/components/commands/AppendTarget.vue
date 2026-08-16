<template>
<WindowFrame id="appendTarget" @confirm="onConfirm">
	<template #title><TitleBar>Append Target<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="appendTarget-actor" type="actor" @input="onActor" /><div class="text">Target</div><CustomBox id="appendTarget-target" type="actor" @input="onTarget" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useAppendTargetCommandSchema } from '@app/composables/commands/useAppendTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useAppendTargetCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onTarget = (value: unknown) => {
	form.target = value;
};

const onConfirm = () => {
	save();
};

</script>
