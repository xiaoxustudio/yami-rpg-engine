<template>
	<YMRename
		v-model="form.name"
		:title="t('components.rename.title')"
		:label="t('components.rename-name.label')"
		v-tip="t('components.rename-name.tip')"
		@confirm="onConfirm"
		@closed="rename.onWindowClosed"
	/>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRenameWindow } from '@app/composables/useRenameWindow';
import { YMRename } from '@ui-kit';

const { t } = useI18n();

const rename = useRenameWindow();
const form = rename.form;

const onConfirm = (): void => {
	rename.confirm();
};
</script>
