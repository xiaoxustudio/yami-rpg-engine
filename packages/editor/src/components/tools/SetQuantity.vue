<template>
	<YMSetQuantity
		v-model="form.quantity"
		:max="form.max"
		:title="t('components.setQuantity.title')"
		:label="t('components.setQuantity-quantity.label')"
		@confirm="onConfirm"
		@closed="setQuantity.onWindowClosed"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetQuantityWindow } from '@app/composables/useSetQuantityWindow';
import { YMSetQuantity } from '@ui-kit';

const { t } = useI18n();

const setQuantity = useSetQuantityWindow();
const form = setQuantity.form;

const onConfirm = (): void => {
	setQuantity.confirm();
};
</script>
