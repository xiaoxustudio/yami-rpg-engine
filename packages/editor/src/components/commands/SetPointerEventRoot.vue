<template>
	<WindowFrame id="setPointerEventRoot" @confirm="onConfirm">
		<template #title><TitleBar>Set Pointer Event Root<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="setPointerEventRoot-operation" v-model="form.operation" />
				<div class="text">Element</div
				><CustomBox id="setPointerEventRoot-element" type="element" @input="onElement" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetPointerEventRootCommandSchema } from '@app/composables/commands/useSetPointerEventRootCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetPointerEventRootCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setPointerEventRoot-operation')?.loadItems?.([
		{ name: 'Add Root Element', value: 'add' },
		{ name: 'Remove Root Element', value: 'remove' },
		{ name: 'Remove The Latest Root Element', value: 'remove-latest' },
		{ name: 'Reset', value: 'reset' }
	]);
	$('#setPointerEventRoot-operation')
		?.enableHiddenMode?.()
		?.relate?.([
			{
				case: ['add', 'remove'],
				targets: [$('#setPointerEventRoot-element')]
			}
		]);
});

</script>
