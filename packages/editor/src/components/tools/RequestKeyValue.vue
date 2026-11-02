<template>
	<YMRequestKeyValue
		:ref="controlRef('request-keyValue')"
		:key-label="t('components.request-keyValue-key.label')"
		:value-label="t('components.request-keyValue-value.label')"
		:title="t('components.request-keyValue.title')"
		v-model:key-value="requestKeyValueForm.key"
		v-model:value="requestKeyValueForm.value"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
	RequestkeyValueBind,
	requestKeyValueForm
} from '@app/composables/commands/useRequestURLCommandSchema';
import { YMRequestKeyValue } from '@ui-kit';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'request-keyValue';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const onConfirm = (): void => {
	RequestkeyValueBind?.confirm?.();
};
</script>
