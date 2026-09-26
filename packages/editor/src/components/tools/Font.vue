<template>
	<YMFont
		id="font"
		:ref="registryRef(textCaptureEls, 'font')"
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
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { YMFont } from '@ui-kit';

const { t } = useI18n();

const form = useTextCaptureWindow().font.form;

const onConfirm = () => {
	Selection?.font?.confirm?.(new Event('click'));
};
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
