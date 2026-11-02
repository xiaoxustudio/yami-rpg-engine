<template>
	<YMArrayListNumber
		:ref="controlRef('arrayList-number')"
		v-model="form.value"
		:title="t('components.arrayList-number.title')"
		@confirm="arrayWindow.confirmNumber"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import { YMArrayListNumber } from '@ui-kit';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'arrayList-number';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const arrayWindow = useArrayWindow();
const form = arrayWindow.numberForm;
</script>
