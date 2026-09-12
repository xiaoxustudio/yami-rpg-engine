<template>
	<WindowFrame id="activateScene"
				:ref="registryRef(fieldEls, 'activateScene')" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.activateScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.activateScene-pointer.label') }}</div>
			<SelectBox id="activateScene-pointer"
				v-tip="t('components.activateScene-pointer.tip')"
				:ref="registryRef(fieldEls, 'activateScene-pointer')" v-focus v-model="form.pointer" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
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
	fieldEls.get('activateScene-pointer')?.loadItems?.([
		{ name: 'Scene A', value: 0 },
		{ name: 'Scene B', value: 1 }
	]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
