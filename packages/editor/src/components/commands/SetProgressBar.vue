<template>
	<WindowFrame id="setProgressBar" @confirm="onConfirm">
		<template #title><TitleBar>Set Progress Bar<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setProgressBar-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setProgressBar-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetProgressBarCommandSchema } from '@app/composables/commands/useSetProgressBarCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { ProgressBarProperty } from '@app/legacy/command/set-progress-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetProgressBarCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setProgressBar-properties')?.bind?.(ProgressBarProperty);
	$('#setProgressBar')?.on?.('closed', () => {
		clear($('#setProgressBar-properties'));
	});
});

</script>
