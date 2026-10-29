<template>
	<YMFont
		id="font"
		:ref="fontRef"
		:model-value="form.font"
		:label="t('components.font-font.label')"
		v-tip="t('components.font-font.tip')"
		:title="t('components.font.title')"
		@update:model-value="form.font = $event"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { registryRef } from '@app/utils/element-registry';
import { Selection, textCaptureEls } from '@app/tools/text-capture.ts';
import { windowShellEls } from '@app/tools/window-object.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { YMFont } from '@ui-kit';

const { t } = useI18n();

const form = useTextCaptureWindow().font.form;

// 同一个根元素要进两个注册表：`textCaptureEls` 是文本标记初始化的就绪门，
// `windowShellEls` 是 `Window.open('font')` 的窗口查找表（ui-kit 窗口不会自己登记）。
const captureRef = registryRef(textCaptureEls, 'font');
const shellRef = registryRef(windowShellEls, 'font');
const fontRef = (el: unknown): void => {
	captureRef(el);
	shellRef(el);
};

const onConfirm = () => {
	Selection?.font?.confirm?.(new Event('click'));
};
</script>

<style>
#font {
	width: 324px;
	height: 98px;
}

#font-confirm {
	right: 108px;
	bottom: 10px;
}

#font-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
