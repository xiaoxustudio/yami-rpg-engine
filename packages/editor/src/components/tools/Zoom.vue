<template>
	<YMZoom
		:ref="controlRef('zoom')"
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
import { YMZoom } from '@ui-kit';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'zoom';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const zoom = useZoomWindow();
const form = zoom.form;

const onConfirm = () => {
	zoom.confirm();
};
</script>
