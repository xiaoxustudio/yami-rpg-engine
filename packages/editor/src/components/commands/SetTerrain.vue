<template>
	<WindowFrame id="setTerrain" :ref="controlRef('setTerrain')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setTerrain-position.label') }}</div>
			<CustomBox
				id="setTerrain-position"
				:ref="controlRef('setTerrain-position')"
				v-tip="t('components.setTerrain-position.tip')"
				v-focus
				type="position"
				v-model="form.position"
			/>
			<div class="text">{{ t('components.setTerrain-terrain.label') }}</div>
			<SelectBox
				:label="t('components.setTerrain-terrain.label')"
				id="setTerrain-terrain"
				v-tip="t('components.setTerrain-terrain.tip')"
				:ref="controlRef('setTerrain-terrain')"
				v-model="form.terrain"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetTerrainCommandSchema } from '@app/composables/commands/useSetTerrainCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setTerrain' | 'setTerrain-position' | 'setTerrain-terrain';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useSetTerrainCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setTerrain-terrain', ['land', 'water', 'wall'], (items) =>
		controls['setTerrain-terrain']?.loadItems?.(items)
	);
});
</script>

<style>
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
