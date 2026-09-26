<template>
	<WindowFrame id="loadScene" :ref="registryRef(fieldEls, 'loadScene')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.loadScene-sceneId.label') }}</div>
			<FileVar
				id="loadScene-sceneId"
				:ref="registryRef(fieldEls, 'loadScene-sceneId')"
				v-tip="t('components.loadScene-sceneId.tip')"
				v-focus
				type="file"
				filter="scene"
				v-model="form.sceneId"
			/>
			<div class="text">{{ t('components.loadScene-transfer.label') }}</div>
			<SelectBox
				id="loadScene-transfer"
				v-tip="t('components.loadScene-transfer.tip')"
				:ref="registryRef(fieldEls, 'loadScene-transfer')"
				v-model="form.transfer"
			/>
			<div class="text">{{ t('components.loadScene-x.label') }}</div>
			<NumberVar
				id="loadScene-x"
				v-tip="t('components.loadScene-x.tip')"
				:ref="registryRef(fieldEls, 'loadScene-x')"
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
				:ref="registryRef(fieldEls, 'loadScene-y')"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// 本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadSceneCommandSchema } from '@app/composables/commands/useLoadSceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useLoadSceneCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('loadScene-transfer', [true, false], (items) =>
		fieldEls.get('loadScene-transfer')?.loadItems?.(items)
	);
	fieldEls
		.get('loadScene-transfer')
		?.enableHiddenMode?.()
		?.relate?.([
			{ case: true, targets: [fieldEls.get('loadScene-x'), fieldEls.get('loadScene-y')] }
		]);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
