<template>
<WindowFrame id="removeTarget" @confirm="onConfirm">
	<template #title><TitleBar>Remove Target<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="removeTarget-actor" type="actor" @input="onActor" /><div class="text">Target</div><CustomBox id="removeTarget-target" type="actor" @input="onTarget" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { useRemoveTargetCommandSchema } from '@app/composables/commands/useRemoveTargetCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useRemoveTargetCommandSchema();

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
