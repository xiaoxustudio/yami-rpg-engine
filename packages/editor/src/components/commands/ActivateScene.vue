<template>
	<WindowFrame id="activateScene" @confirm="onConfirm">
		<template #title><TitleBar>Activate Scene<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Scene</div><SelectBox id="activateScene-pointer" v-model="form.pointer" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useActivateSceneCommandSchema } from '@app/composables/commands/useActivateSceneCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useActivateSceneCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#activateScene-pointer')?.loadItems?.([
		{ name: 'Scene A', value: 0 },
		{ name: 'Scene B', value: 1 }
	]);
});

</script>
