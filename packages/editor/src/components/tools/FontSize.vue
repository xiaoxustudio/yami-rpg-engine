<template>
	<YMFontSize
		id="fontSize"
		:ref="controlRef('fontSize')"
		:model-value="form.size"
		:label="t('components.fontSize-size.label')"
		v-tip="t('components.fontSize-size.tip')"
		:title="t('components.fontSize.title')"
		@update:model-value="form.size = $event"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Selection } from '@app/tools/text-capture.ts';
import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { YMFontSize } from '@ui-kit';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'fontSize';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const form = useTextCaptureWindow().fontSize.form;

const onConfirm = () => {
	Selection?.fontSize?.confirm?.(new Event('click'));
};
</script>

<style>
#fontSize {
	width: 324px;
	height: 98px;
}

#fontSize-confirm {
	right: 108px;
	bottom: 10px;
}

#fontSize-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
