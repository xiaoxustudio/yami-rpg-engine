<template>
	<YMFontSize
		id="fontSize"
		:model-value="form.size"
		:label="t('components.fontSize-size.label')"
		:title="t('components.fontSize.title')"
		@update:model-value="form.size = $event"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { YMFontSize } from '@ui-kit';

const { t } = useI18n();

const form = useTextCaptureWindow().fontSize.form;

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.fontSize?.confirm?.();
};
</script>
