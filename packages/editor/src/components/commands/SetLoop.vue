<template>
<WindowFrame id="setLoop" @confirm="onConfirm">
	<template #title><TitleBar>Set Loop<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="setLoop-type" v-model="form.type" /> <div class="text">Loop</div
			><SelectBox id="setLoop-loop" v-model="form.loop" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetLoopCommandSchema } from '@app/composables/commands/useSetLoopCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetLoopCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setLoop-type')?.loadItems?.([
		{ name: 'BGM', value: 'bgm' },
		{ name: 'BGS', value: 'bgs' },
		{ name: 'CV', value: 'cv' }
	]);
	$('#setLoop-loop')?.loadItems?.([
		{ name: 'Once', value: false },
		{ name: 'Loop', value: true }
	]);
});

</script>
