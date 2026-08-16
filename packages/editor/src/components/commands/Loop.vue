<template>
<WindowFrame id="loop" @confirm="onConfirm">
	<template #title><TitleBar>Loop<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Mode</div><SelectBox id="loop-mode" v-model="form.mode" /> <div class="text">Conditions</div
			><ParamList id="loop-conditions" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useLoopCommandSchema } from '@app/composables/commands/useLoopCommandSchema';
import { $ } from '@/util/dom.ts';
import { clear } from '@/util/element-utils';
import { IfCondition } from '@/command/conditional-condition-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const { form, save, reset } = useLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#loop-conditions')?.bind?.(IfCondition);
	$('#loop-mode')?.loadItems?.([
		{ name: 'Meet All', value: 'all' },
		{ name: 'Meet Any', value: 'any' }
	]);
	$('#loop')?.on?.('closed', () => {
		reset();
		clear($('#loop-conditions'));
	});
});

</script>
