<template>
	<WindowFrame id="setTextBox" @confirm="onConfirm">
		<template #title><TitleBar>Set Text Box<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setTextBox-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setTextBox-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetTextBoxCommandSchema } from '@app/composables/commands/useSetTextBoxCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { TextBoxProperty } from '@app/legacy/command/set-textbox-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetTextBoxCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setTextBox-properties')?.bind?.(TextBoxProperty);
	$('#setTextBox')?.on?.('closed', () => {
		clear($('#setTextBox-properties'));
	});
});

</script>
