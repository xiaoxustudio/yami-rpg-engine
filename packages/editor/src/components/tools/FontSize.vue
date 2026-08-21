<template>
	<YMFontSize
		ref="frame"
		id="fontSize"
		:model-value="form.size"
		:label="t('components.fontSize-size.label')"
		:title="t('components.fontSize.title')"
		@update:model-value="form.size = $event"
		@confirm="onConfirm"
	/>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FontSizeForm } from '@app/tools/text-capture.ts';
import { Selection } from '@app/tools/text-capture.ts';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import { YMFontSize } from '@ui-kit';

const { t } = useI18n();

const form = reactive<FontSizeForm>({
	size: 12
});

const setForm = (data: Partial<FontSizeForm>): void => {
	Object.assign(form, data);
};

const getForm = (): FontSizeForm => {
	return { ...form } as FontSizeForm;
};

const frame = ref<{ root: HTMLElement | null } | null>(null);

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Selection?.fontSize?.confirm?.();
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
