<template>
	<WindowFrame id="changePassableTerrain" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.changePassableTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Actor</div>
			<CustomBox id="changePassableTerrain-actor"
				v-tip="t('components.changePassableTerrain-actor.tip')" v-focus type="actor" v-model="form.actor" />
			<div class="text">Passable Terrain</div>
			<SelectBox id="changePassableTerrain-passage"
				v-tip="t('components.changePassableTerrain-passage.tip')"
				:ref="registryRef(fieldEls, 'changePassableTerrain-passage')" v-model="form.passage" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChangePassableTerrainCommandSchema } from '@app/composables/commands/useChangePassableTerrainCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useChangePassableTerrainCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	fieldEls.get('changePassableTerrain-passage')?.loadItems?.([
		{ name: t('command.changePassableTerrain.land') || 'Land', value: 'land' },
		{ name: t('command.changePassableTerrain.water') || 'Water', value: 'water' },
		{
			name: t('command.changePassableTerrain.unrestricted') || 'Unrestricted',
			value: 'unrestricted'
		}
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#changePassableTerrain {
	width: 324px;
	height: 122px;
}

#changePassableTerrain-confirm {
	right: 108px;
	bottom: 10px;
}

#changePassableTerrain-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
