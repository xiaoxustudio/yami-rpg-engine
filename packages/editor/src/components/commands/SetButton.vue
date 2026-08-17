<template>
	<WindowFrame id="setButton" @confirm="onConfirm">
		<template #title><TitleBar>Set Button<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setButton-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setButton-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetButtonCommandSchema } from '@app/composables/commands/useSetButtonCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { ButtonProperty } from '@app/legacy/command/set-button-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetButtonCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setButton-properties')?.bind?.(ButtonProperty);
	$('#setButton')?.on?.('closed', () => {
		clear($('#setButton-properties'));
	});
});

</script>
