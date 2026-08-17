<template>
	<WindowFrame id="setNumber" @confirm="onConfirm">
		<template #title><TitleBar>Set Number<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setNumber-variable"
					type="variable"
					filter="writable-number"
					@input="onVariable"
				/>
				<div class="text">Expression</div><ParamList id="setNumber-operands" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSetNumberCommandSchema } from '@app/composables/commands/useSetNumberCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { NumberOperand } from '@app/legacy/command/set-value-operand-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetNumberCommandSchema();

const onVariable = (value: unknown) => {
	form.variable = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setNumber-operands')?.bind?.(NumberOperand);
	$('#setNumber')?.on?.('closed', (event: Event) => {
		clear($('#setNumber-operands'));
	});
});
</script>
