<template>
	<WindowFrame id="setTriggerAngle" @confirm="onConfirm">
		<template #title><TitleBar>Set Trigger Angle<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Trigger</div
				><CustomBox id="setTriggerAngle-trigger" type="trigger" @input="onTrigger" /> <div class="text">Angle</div
				><CustomBox id="setTriggerAngle-angle" type="angle" @input="onAngle" />
			</div>
		
	</WindowFrame>
	
</template>

<script setup lang="ts">

import { useSetTriggerAngleCommandSchema } from '@app/composables/commands/useSetTriggerAngleCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useSetTriggerAngleCommandSchema();

const onTrigger = (value: unknown) => {
	form.trigger = value;
};

const onAngle = (value: unknown) => {
	form.angle = value;
};

const onConfirm = () => {
	save();
};

</script>
