<template>
	<WindowFrame id="waitForVideo" @confirm="onConfirm">
		<template #title><TitleBar>Wait For Video<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="waitForVideo-element" type="element" @input="onElement" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useWaitForVideoCommandSchema } from '@app/composables/commands/useWaitForVideoCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useWaitForVideoCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

</script>
