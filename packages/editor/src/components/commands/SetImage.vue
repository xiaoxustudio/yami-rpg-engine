<template>
	<WindowFrame id="setImage" @confirm="onConfirm">
		<template #title><TitleBar>Set Image<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setImage-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setImage-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetImageCommandSchema } from '@app/composables/commands/useSetImageCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { ImageProperty } from '@/command/set-image-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetImageCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setImage-properties')?.bind?.(ImageProperty);
	$('#setImage')?.on?.('closed', () => {
		clear($('#setImage-properties'));
	});
});

</script>
