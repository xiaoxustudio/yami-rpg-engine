<template>
	<WindowFrame
		id="changePassableTerrain"
		:ref="registryRef(fieldEls, 'changePassableTerrain')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.changePassableTerrain.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.changePassableTerrain-actor.label') }}</div>
			<CustomBox
				id="changePassableTerrain-actor"
				:ref="registryRef(fieldEls, 'changePassableTerrain-actor')"
				v-tip="t('components.changePassableTerrain-actor.tip')"
				v-focus
				type="actor"
				v-model="form.actor"
			/>
			<div class="text">{{ t('components.changePassableTerrain-passage.label') }}</div>
			<SelectBox
				:label="t('components.changePassableTerrain-passage.label')"
				id="changePassableTerrain-passage"
				v-tip="t('components.changePassableTerrain-passage.tip')"
				:ref="registryRef(fieldEls, 'changePassableTerrain-passage')"
				v-model="form.passage"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
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
	useLocalizedOptions(
		'changePassableTerrain-passage',
		['land', 'water', 'unrestricted'],
		(items) => fieldEls.get('changePassableTerrain-passage')?.loadItems?.(items),
		{
			land: 'command.changePassableTerrain.land',
			water: 'command.changePassableTerrain.water',
			unrestricted: 'command.changePassableTerrain.unrestricted'
		}
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
