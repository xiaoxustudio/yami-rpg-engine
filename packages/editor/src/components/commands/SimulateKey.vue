<template>
	<WindowFrame id="simulateKey" @confirm="onConfirm">
		<template #title><TitleBar>Simulate Key<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="simulateKey-operation" v-model="form.operation" />
				<div class="text">Key Code</div><KeyboardBox id="simulateKey-keycode" @input="onKeycode" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSimulateKeyCommandSchema } from '@app/composables/useSimulateKeyCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSimulateKeyCommandSchema();

const onKeycode = (value: number) => {
	form.keycode = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#simulateKey-operation')?.loadItems?.([
		{ name: 'Click', value: 'click' },
		{ name: 'Press', value: 'press' },
		{ name: 'Release', value: 'release' }
	]);
});

</script>
