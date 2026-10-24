<template>
	<YMSetKey
		:ref="registryRef(windowShellEls, 'setKey')"
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
import { registryRef } from '@app/utils/element-registry';
import { windowShellEls } from '@app/tools/window-object.ts';
import { YMSetKey } from '@ui-kit';

const { t } = useI18n();

const setKey = useSetKeyWindow();
const form = setKey.form;
</script>
