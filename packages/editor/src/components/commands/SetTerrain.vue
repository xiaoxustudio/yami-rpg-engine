<template>
	<WindowFrame id="setTerrain" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.setTerrain.title') }}<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Position</div><CustomBox id="setTerrain-position" type="position" @input="onPosition" />
				<div class="text">Terrain</div><SelectBox id="setTerrain-terrain" v-model="form.terrain" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTerrainCommandSchema } from '@app/composables/commands/useSetTerrainCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

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
