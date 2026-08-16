<template>
	<WindowFrame id="deleteVariable" @confirm="onConfirm">
		<template #title><TitleBar>Delete Variable<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="deleteVariable-variable"
					type="variable"
					filter="deletable"
					@input="onVariable"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useDeleteVariableCommandSchema } from '@app/composables/commands/useDeleteVariableCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const { form, save } = useDeleteVariableCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onConfirm = () => {
	save();
};

</script>
