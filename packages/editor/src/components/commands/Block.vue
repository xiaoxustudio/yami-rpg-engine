<template>
<WindowFrame id="block" @confirm="onConfirm">
	<template #title><TitleBar>Block<div class="close" /></TitleBar></template>
	
		<TextBox id="block-note" v-model="form.note" />
		<CheckBox id="block-asynchronous" class="standard" v-model="form.asynchronous"
			><div class="text" id="block-asynchronous-label">Asynchronous</div></CheckBox
		>
	
</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useBlockCommandSchema } from '@app/composables/commands/useBlockCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { form, save, reset } = useBlockCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#block')?.on?.('closed', () => {
		reset();
	});
});

</script>
