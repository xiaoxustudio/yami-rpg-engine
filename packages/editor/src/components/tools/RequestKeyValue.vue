<template>
	<YMRequestKeyValue
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
import { RequestkeyValueBind, requestKeyValueForm } from '@app/composables/commands/useRequestURLCommandSchema';
import { YMRequestKeyValue } from '@ui-kit';

const { t } = useI18n();

const onConfirm = (): void => {
	RequestkeyValueBind?.confirm?.();
};
</script>
