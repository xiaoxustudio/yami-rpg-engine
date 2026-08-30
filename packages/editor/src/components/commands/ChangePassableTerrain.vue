<template>
	<WindowFrame id="changePassableTerrain" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changePassableTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changePassableTerrain-actor" type="actor" @input="onActor" />
			<div class="text">Passable Terrain</div>
			<SelectBox id="changePassableTerrain-passage" v-model="form.passage" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangePassableTerrainCommandSchema } from '@app/composables/commands/useChangePassableTerrainCommandSchema';
import { $ } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangePassableTerrainCommandSchema();

const onActor = (value: unknown) => {
	form.actor = value;
};

const onConfirm = () => {
	save();
};

onMounted(() => {
	$('#changePassableTerrain-passage')?.loadItems?.([
		{ name: t('command.changePassableTerrain.land') || 'Land', value: 'land' },
		{ name: t('command.changePassableTerrain.water') || 'Water', value: 'water' },
		{
			name: t('command.changePassableTerrain.unrestricted') || 'Unrestricted',
			value: 'unrestricted'
		}
	]);
});
</script>
