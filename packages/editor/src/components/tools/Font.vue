<template>
	<YMFont
		ref="frame"
		id="font"
		:model-value="form.font"
		:label="t('components.font-font.label')"
		:title="t('components.font.title')"
		@update:model-value="form.font = $event"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FontForm } from '@app/tools/text-capture.ts';
import { Selection } from '@app/tools/text-capture.ts';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import { YMFont } from '@ui-kit';

const { t } = useI18n();

const form = reactive<FontForm>({
	font: ''
});

const setForm = (data: Partial<FontForm>): void => {
	Object.assign(form, data);
};

const getForm = (): FontForm => {
	return { ...form } as FontForm;
};

const frame = ref<{ root: HTMLElement | null } | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.font?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
