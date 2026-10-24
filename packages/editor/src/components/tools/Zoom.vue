<template>
	<YMZoom
		:ref="registryRef(windowShellEls, 'zoom')"
		v-model="form.factor"
		:title="t('components.zoom.title')"
		:label="t('components.zoom-factor.label')"
		v-tip="t('components.zoom-factor.tip')"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useZoomWindow } from '@app/composables/useZoomWindow';
import { registryRef } from '@app/utils/element-registry';
import { windowShellEls } from '@app/tools/window-object.ts';
import { YMZoom } from '@ui-kit';

const { t } = useI18n();

const zoom = useZoomWindow();
const form = zoom.form;

const onConfirm = () => {
	zoom.confirm();
};
</script>
