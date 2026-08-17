<template>
	<WindowFrame id="setTerrain" @confirm="onConfirm">
		<template #title><TitleBar>Set Terrain<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Position</div><CustomBox id="setTerrain-position" type="position" @input="onPosition" />
				<div class="text">Terrain</div><SelectBox id="setTerrain-terrain" v-model="form.terrain" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useSetTerrainCommandSchema } from '@app/composables/commands/useSetTerrainCommandSchema';
import { $ } from '@app/legacy/util/dom.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { form, save } = useSetTerrainCommandSchema();

const onPosition = (value: unknown) => {
	form.position = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#setTerrain-terrain')?.loadItems?.([
		{ name: 'Land', value: 'land' },
		{ name: 'Water', value: 'water' },
		{ name: 'Wall', value: 'wall' }
	]);
});

</script>
