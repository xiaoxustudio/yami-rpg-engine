<template>
	<WindowFrame id="activateScene" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.activateScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.activateScene-pointer.label') }}</div>
			<SelectBox
				ref="pointerBox"
				:label="t('components.activateScene-pointer.label')"
				id="activateScene-pointer"
				v-tip="t('components.activateScene-pointer.tip')"
				v-focus
				v-model="form.pointer"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { useActivateSceneCommandSchema } from '@app/composables/commands/useActivateSceneCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useActivateSceneCommandSchema();

// 控件用模板 ref（组件 defineExpose），不再注册进 ElementRegistry。
// 本窗口的两个 id 都没有跨文件的全局消费方（见 scripts/contract-inventory.mjs）。
const pointerBox = ref<InstanceType<typeof SelectBox> | null>(null);

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('activateScene-pointer', [0, 1], (items) =>
		pointerBox.value?.loadItems?.(items)
	);
});
</script>

<style>
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
