<template>
	<YMSetKey
		:ref="controlRef('setKey')"
		v-model="form.key"
		:title="t('components.setKey.title')"
		:label="t('components.setKey-key.label')"
		v-tip="t('components.setKey-key.tip')"
		@confirm="setKey.confirm"
		@closed="setKey.onWindowClosed"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetKeyWindow } from '@app/composables/useSetKeyWindow';
import { YMSetKey } from '@ui-kit';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id = 'setKey';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const setKey = useSetKeyWindow();
const form = setKey.form;
</script>
