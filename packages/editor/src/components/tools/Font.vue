<template>
	<YMFont
		id="font"
		:model-value="form.font"
		:label="t('components.font-font.label')"
		:title="t('components.font.title')"
		@update:model-value="form.font = $event"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { YMFont } from '@ui-kit';

const { t } = useI18n();

const form = useTextCaptureWindow().font.form;

const onConfirm = () => {
	Selection?.font?.confirm?.(new Event('click'));
};
</script>
