<template>
	<YMFont
		id="font"
				:ref="registryRef(textCaptureEls, 'font')"
		:model-value="form.font"
		:label="t('components.font-font.label')"
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
/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
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

