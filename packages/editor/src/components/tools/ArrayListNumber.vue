<template>
	<YMArrayListNumber
		:ref="registryRef(windowShellEls, 'arrayList-number')"
		v-model="form.value"
		:title="t('components.arrayList-number.title')"
		@confirm="arrayWindow.confirmNumber"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import { registryRef } from '@app/utils/element-registry';
import { windowShellEls } from '@app/tools/window-object.ts';
import { YMArrayListNumber } from '@ui-kit';

const { t } = useI18n();

const arrayWindow = useArrayWindow();
const form = arrayWindow.numberForm;
</script>
