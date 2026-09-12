<template>
	<WindowFrame id="loadScene" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.loadScene.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Scene</div>
			<FileVar id="loadScene-sceneId" v-focus type="file" filter="scene" v-model="form.sceneId" />
			<div class="text">Transfer Player</div>
			<SelectBox id="loadScene-transfer"
				:ref="registryRef(fieldEls, 'loadScene-transfer')" v-model="form.transfer" />
			<div class="text">X</div>
			<NumberVar
				id="loadScene-x"
				:ref="registryRef(fieldEls, 'loadScene-x')"
				min="0"
				max="512"
				step="0.5"
				decimals="4"
				v-model="form.x"
			/>
			<div class="text">Y</div>
			<NumberVar
				id="loadScene-y"
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
import { createElementRegistry, registryRef } from '@app/utils/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
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
	fieldEls.get('loadScene-transfer')?.loadItems?.([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);
	fieldEls.get('loadScene-transfer')
		?.enableHiddenMode?.()
		?.relate?.([{ case: true, targets: [fieldEls.get('loadScene-x'), fieldEls.get('loadScene-y')] }]);
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
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
