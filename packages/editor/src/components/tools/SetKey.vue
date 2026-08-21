<template>
	<YMSetKey v-model="form.key" :title="t('components.setKey.title')" :label="t('components.setKey-key.label')" @confirm="setKey.confirm" @closed="setKey.onWindowClosed" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSetKeyWindow } from '@app/composables/useSetKeyWindow';
import { YMSetKey } from '@ui-kit';

const { t } = useI18n();

const setKey = useSetKeyWindow();
const form = setKey.form;
</script>
