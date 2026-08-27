<template>
	<YMZoom
		v-model="form.factor"
		:title="t('components.zoom.title')"
		:label="t('components.zoom-factor.label')"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useZoomWindow } from '@app/composables/useZoomWindow';
import { YMZoom } from '@ui-kit';

const { t } = useI18n();

const zoom = useZoomWindow();
const form = zoom.form;

const onConfirm = () => {
	zoom.confirm();
};
</script>
