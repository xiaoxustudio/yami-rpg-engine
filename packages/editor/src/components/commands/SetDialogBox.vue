<template>
	<WindowFrame id="setDialogBox" @confirm="onConfirm">
		<template #title><TitleBar>Set Dialog Box<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setDialogBox-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setDialogBox-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetDialogBoxCommandSchema } from '@app/composables/commands/useSetDialogBoxCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { DialogBoxProperty } from '@/command/set-dialog-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetDialogBoxCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setDialogBox-properties')?.bind?.(DialogBoxProperty);
	$('#setDialogBox')?.on?.('closed', () => {
		clear($('#setDialogBox-properties'));
	});
});

</script>
