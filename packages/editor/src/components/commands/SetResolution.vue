<template>
	<WindowFrame id="setResolution" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.setResolution.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">Width</div>
			<NumberVar
				id="setResolution-width"
				v-focus
				min="240"
				max="7680"
				unit="px"
				v-model="form.width"
			/>
			<div class="text">Height</div>
			<NumberVar
				id="setResolution-height"
				min="240"
				max="7680"
				unit="px"
				v-model="form.height"
			/>
			<div class="text">Scene Scale</div>
			<NumberVar
				id="setResolution-sceneScale"
				min="0.5"
				max="4"
				decimals="10"
				v-model="form.sceneScale"
			/>
			<div class="text">UI Scale</div>
			<NumberVar
				id="setResolution-uiScale"
				min="0.5"
				max="4"
				decimals="10"
				v-model="form.uiScale"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetResolutionCommandSchema } from '@app/composables/commands/useSetResolutionCommandSchema';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const { t } = useI18n();

const { form, save } = useSetResolutionCommandSchema();

const onConfirm = () => {
	save();
};
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setResolution {
	width: 324px;
	height: 170px;
}

#setResolution-confirm {
	right: 108px;
	bottom: 10px;
}

#setResolution-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
