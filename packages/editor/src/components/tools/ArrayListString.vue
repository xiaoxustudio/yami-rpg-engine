<template>
	<YMArrayListString
		v-model="form.value"
		:title="t('components.arrayList-string.title')"
		@confirm="arrayWindow.confirmString"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import { YMArrayListString } from '@ui-kit';

const { t } = useI18n();

const arrayWindow = useArrayWindow();
const form = arrayWindow.stringForm;
</script>
