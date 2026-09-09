<template>
	<WindowFrame id="setTerrain" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Position</div>
			<CustomBox id="setTerrain-position" v-focus type="position" v-model="form.position" />
			<div class="text">Terrain</div>
			<SelectBox id="setTerrain-terrain" v-model="form.terrain" />
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

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setTerrain {
	width: 324px;
	height: 122px;
}

#setTerrain-confirm {
	right: 108px;
	bottom: 10px;
}

#setTerrain-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
