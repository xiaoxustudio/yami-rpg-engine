<template>
	<WindowFrame
		id="activateScene"
		:ref="registryRef(fieldEls, 'activateScene')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.activateScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.activateScene-pointer.label') }}</div>
			<SelectBox
				:label="t('components.activateScene-pointer.label')"
				id="activateScene-pointer"
				v-tip="t('components.activateScene-pointer.tip')"
				:ref="registryRef(fieldEls, 'activateScene-pointer')"
				v-focus
				v-model="form.pointer"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useActivateSceneCommandSchema } from '@app/composables/commands/useActivateSceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useActivateSceneCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('activateScene-pointer', [0, 1], (items) =>
		fieldEls.get('activateScene-pointer')?.loadItems?.(items)
	);
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#activateScene {
	width: 324px;
	height: 98px;
}

#activateScene-confirm {
	right: 108px;
	bottom: 10px;
}

#activateScene-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
