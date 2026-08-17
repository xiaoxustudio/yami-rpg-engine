<template>
	<WindowFrame id="setText" @confirm="onConfirm">
		<template #title><TitleBar>Set Text<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setText-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setText-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetTextCommandSchema } from '@app/composables/commands/useSetTextCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import { clear } from '@app/legacy/util/element-utils';
import { TextProperty } from '@app/legacy/command/set-text-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetTextCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setText-properties')?.bind?.(TextProperty);
	$('#setText')?.on?.('closed', () => {
		clear($('#setText-properties'));
	});
});

</script>
