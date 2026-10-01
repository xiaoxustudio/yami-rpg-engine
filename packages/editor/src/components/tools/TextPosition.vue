<template>
	<!-- 设置文字位置 -->
	<WindowFrame id="textPosition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.textPosition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.textPosition-axis.label') }}</div>
			<SelectBox
				id="textPosition-axis"
				v-tip="t('components.textPosition-axis.tip')"
				:ref="registryRef(textCaptureEls, 'textPosition-axis')"
				v-model="form.axis"
			/>
			<div class="text">{{ t('components.textPosition-operation.label') }}</div>
			<SelectBox
				id="textPosition-operation"
				v-tip="t('components.textPosition-operation.tip')"
				:ref="registryRef(textCaptureEls, 'textPosition-operation')"
				v-model="form.operation"
			/>
			<div class="text">{{ t('components.textPosition-value.label') }}</div>
			<NumberBox
				:label="t('components.textPosition-value.label')"
				id="textPosition-value"
				v-tip="t('components.textPosition-value.tip')"
				min="-1000"
				max="1000"
				unit="px"
				v-model="form.value"
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
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = useTextCaptureWindow().textPosition.form;

const onConfirm = () => {
	Selection?.textPosition?.confirm?.(new Event('click'));
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#textPosition {
	width: 324px;
	height: 146px;
}

#textPosition-confirm {
	right: 108px;
	bottom: 10px;
}

#textPosition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
