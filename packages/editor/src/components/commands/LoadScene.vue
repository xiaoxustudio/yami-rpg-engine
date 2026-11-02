<template>
	<WindowFrame id="loadScene" :ref="controlRef('loadScene')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.loadScene-sceneId.label') }}</div>
			<FileVar
				id="loadScene-sceneId"
				:ref="controlRef('loadScene-sceneId')"
				v-tip="t('components.loadScene-sceneId.tip')"
				v-focus
				type="file"
				filter="scene"
				v-model="form.sceneId"
			/>
			<div class="text">{{ t('components.loadScene-transfer.label') }}</div>
			<SelectBox
				:label="t('components.loadScene-transfer.label')"
				id="loadScene-transfer"
				v-tip="t('components.loadScene-transfer.tip')"
				:ref="controlRef('loadScene-transfer')"
				v-model="form.transfer"
			/>
			<div class="text">{{ t('components.loadScene-x.label') }}</div>
			<NumberVar
				id="loadScene-x"
				v-tip="t('components.loadScene-x.tip')"
				:ref="controlRef('loadScene-x')"
				min="0"
				max="512"
				step="0.5"
				decimals="4"
				v-model="form.x"
			/>
			<div class="text">{{ t('components.loadScene-y.label') }}</div>
			<NumberVar
				id="loadScene-y"
				v-tip="t('components.loadScene-y.tip')"
				:ref="controlRef('loadScene-y')"
				min="0"
				max="512"
				step="0.5"
				decimals="4"
				v-model="form.y"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';

import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadSceneCommandSchema } from '@app/composables/commands/useLoadSceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { controlRoot, useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'loadScene' | 'loadScene-sceneId' | 'loadScene-transfer' | 'loadScene-x' | 'loadScene-y';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const { form, save } = useLoadSceneCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('loadScene-transfer', [true, false], (items) =>
		controls['loadScene-transfer']?.loadItems?.(items)
	);
	controls['loadScene-transfer']?.enableHiddenMode?.();
	controls['loadScene-transfer']?.relate?.([
		{
			case: true,
			targets: [controlRoot(controls['loadScene-x']), controlRoot(controls['loadScene-y'])]
		}
	]);
});
</script>

<style>
#loadScene {
	width: 324px;
	height: 170px;
}

#loadScene-confirm {
	right: 108px;
	bottom: 10px;
}

#loadScene-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
