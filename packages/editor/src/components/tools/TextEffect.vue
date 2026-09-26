<template>
	<!-- 设置文字效果 -->
	<WindowFrame id="textEffect" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.textEffect.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.textEffect-type.label') }}</div>
			<SelectBox
				id="textEffect-type"
				v-tip="t('components.textEffect-type.tip')"
				:ref="registryRef(textCaptureEls, 'textEffect-type')"
				v-model="form.type"
			/>
			<div class="text">{{ t('components.textEffect-shadowOffsetX.label') }}</div>
			<NumberBox
				id="textEffect-shadowOffsetX"
				v-tip="t('components.textEffect-shadowOffsetX.tip')"
				:ref="registryRef(textCaptureEls, 'textEffect-shadowOffsetX')"
				min="-9"
				max="9"
				unit="px"
				v-model="form.shadowOffsetX"
			/>
			<div class="text">{{ t('components.textEffect-shadowOffsetY.label') }}</div>
			<NumberBox
				id="textEffect-shadowOffsetY"
				v-tip="t('components.textEffect-shadowOffsetY.tip')"
				:ref="registryRef(textCaptureEls, 'textEffect-shadowOffsetY')"
				min="-9"
				max="9"
				unit="px"
				v-model="form.shadowOffsetY"
			/>
			<div class="text">{{ t('components.textEffect-strokeWidth.label') }}</div>
			<NumberBox
				id="textEffect-strokeWidth"
				v-tip="t('components.textEffect-strokeWidth.tip')"
				:ref="registryRef(textCaptureEls, 'textEffect-strokeWidth')"
				min="1"
				max="20"
				unit="px"
				v-model="form.strokeWidth"
			/>
			<div class="text">{{ t('components.textEffect-color.label') }}</div>
			<ColorBox
				id="textEffect-color"
				v-tip="t('components.textEffect-color.tip')"
				:ref="registryRef(textCaptureEls, 'textEffect-color')"
				v-model="form.color"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { registryRef } from '@app/utils/element-registry';
import { Selection, textCaptureEls } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().textEffect.form;

const onConfirm = () => {
	Selection?.textEffect?.confirm?.(new Event('click'));
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#textEffect {
	width: 324px;
	height: 170px;
}

#textEffect-confirm {
	right: 108px;
	bottom: 10px;
}

#textEffect-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
