<template>
	<WindowFrame
		id="setZoomFactor"
		:ref="registryRef(fieldEls, 'setZoomFactor')"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.setZoomFactor.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.setZoomFactor-zoom.label') }}</div>
			<NumberVar
				id="setZoomFactor-zoom"
				:ref="registryRef(fieldEls, 'setZoomFactor-zoom')"
				v-tip="t('components.setZoomFactor-zoom.tip')"
				v-focus
				min="1"
				max="8"
				step="0.1"
				decimals="4"
				v-model="form.zoom"
			/>
			<div class="text">{{ t('components.setZoomFactor-easingId.label') }}</div>
			<SelectBox
				id="setZoomFactor-easingId"
				:ref="registryRef(fieldEls, 'setZoomFactor-easingId')"
				name="easing"
				v-model="form.easingId"
			/>
			<div class="text">{{ t('components.setZoomFactor-duration.label') }}</div>
			<NumberVar
				id="setZoomFactor-duration"
				:ref="registryRef(fieldEls, 'setZoomFactor-duration')"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
				v-model="form.duration"
			/>
			<div class="text">{{ t('components.setZoomFactor-wait.label') }}</div>
			<SelectBox
				id="setZoomFactor-wait"
				:ref="registryRef(fieldEls, 'setZoomFactor-wait')"
				name="wait"
				v-model="form.wait"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { createElementRegistry, registryRef } from '@app/utils/element-registry';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry(composableEls);
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSetZoomFactorCommandSchema } from '@app/composables/commands/useSetZoomFactorCommandSchema';
import { Data } from '@app/data/data-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, save } = useSetZoomFactorCommandSchema();

const onConfirm = () => {
	save();
};

onMounted(() => {
	useLocalizedOptions('setZoomFactor-wait', [true, false], (items) =>
		fieldEls.get('setZoomFactor-wait')?.loadItems?.(items)
	);
	fieldEls.get('setZoomFactor')?.on?.('open', () => {
		fieldEls.get('setZoomFactor-easingId')?.loadItems?.(Data.createEasingItems!());
	});
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#setZoomFactor {
	width: 324px;
	height: 170px;
}

#setZoomFactor-confirm {
	right: 108px;
	bottom: 10px;
}

#setZoomFactor-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
