<template>
	<WindowFrame id="controlDialog" @confirm="onConfirm">
		<template #title><TitleBar>Control Dialog<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="controlDialog-element" type="element" @input="onElement" />
				<div class="text">Operation</div><SelectBox id="controlDialog-operation" v-model="form.operation" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useControlDialogCommandSchema } from '@app/composables/commands/useControlDialogCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useControlDialogCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#controlDialog-operation')?.loadItems?.([
		{ name: 'Pause Printing', value: 'pause' },
		{ name: 'Continue Printing', value: 'continue' },
		{ name: 'Print Immediately', value: 'print-immediately' },
		{ name: 'Print Next Page', value: 'print-next-page' }
	]);
});

</script>
