<template>
	<YMArrayListString
		:ref="controlRef('arrayList-string')"
		v-model="form.value"
		:title="t('components.arrayList-string.title')"
		@confirm="arrayWindow.confirmString"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useArrayWindow } from '@app/composables/useArrayWindow';
import { YMArrayListString } from '@ui-kit';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'arrayList-string';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const arrayWindow = useArrayWindow();
const form = arrayWindow.stringForm;
</script>
