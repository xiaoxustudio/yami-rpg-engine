<template>
	<WindowFrame id="loadSubscene" @confirm="onConfirm">
		<template #title><TitleBar>Load Subscene<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Scene</div
				><FileVar id="loadSubscene-sceneId" type="file" filter="scene" v-model="form.sceneId" />
				<div class="text">Shift X</div><NumberVar id="loadSubscene-shiftX" min="0" max="512" v-model="form.shiftX" />
				<div class="text">Shift Y</div><NumberVar id="loadSubscene-shiftY" min="0" max="512" v-model="form.shiftY" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { useLoadSubsceneCommandSchema } from '@app/composables/commands/useLoadSubsceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { form, save } = useLoadSubsceneCommandSchema();

const onConfirm = () => {
	save();
};

</script>
