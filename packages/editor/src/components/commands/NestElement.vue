<template>
	<WindowFrame id="nestElement" @confirm="onConfirm">
		<template #title><TitleBar>Nest Element<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Parent Element</div
				><CustomBox id="nestElement-parent" type="element" @input="onParent" />
				<div class="text">Child Element</div
				><CustomBox id="nestElement-child" type="element" @input="onChild" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useNestElementCommandSchema } from '@app/composables/commands/useNestElementCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useNestElementCommandSchema();

const onParent = (value: unknown) => {
	form.parent = value;
};

const onChild = (value: unknown) => {
	form.child = value;
};

const onConfirm = () => {
	save();
};

</script>
