<template>
	<WindowFrame id="loadScene" @confirm="onConfirm">
		<template #title><TitleBar>Load Scene<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Scene</div
				><FileVar id="loadScene-sceneId" type="file" filter="scene" v-model="form.sceneId" />
				<div class="text">Transfer Player</div><SelectBox id="loadScene-transfer" v-model="form.transfer" />
				<div class="text">X</div
				><NumberVar id="loadScene-x" min="0" max="512" step="0.5" decimals="4" v-model="form.x" />
				<div class="text">Y</div
				><NumberVar id="loadScene-y" min="0" max="512" step="0.5" decimals="4" v-model="form.y" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useLoadSceneCommandSchema } from '@app/composables/commands/useLoadSceneCommandSchema';
import { $ } from '@/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useLoadSceneCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#loadScene-transfer')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	$('#loadScene-transfer')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [$('#loadScene-x'), $('#loadScene-y')] }]);
});

</script>
