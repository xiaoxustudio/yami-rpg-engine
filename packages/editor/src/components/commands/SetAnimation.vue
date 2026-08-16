<template>
	<WindowFrame id="setAnimation" @confirm="onConfirm">
		<template #title><TitleBar>Set Animation<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setAnimation-element" type="element" @input="onElement" />
				<div class="text">Properties</div><ParamList id="setAnimation-properties" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetAnimationCommandSchema } from '@app/composables/commands/useSetAnimationCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { AnimationProperty } from '@/command/set-animation-property-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save } = useSetAnimationCommandSchema();

const onElement = (value: unknown) => {
	form.element = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setAnimation-properties')?.bind?.(AnimationProperty);
	$('#setAnimation')?.on?.('closed', () => {
		clear($('#setAnimation-properties'));
	});
});

</script>
