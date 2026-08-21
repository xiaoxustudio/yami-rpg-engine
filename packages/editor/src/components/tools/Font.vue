<template>
	<WindowFrame ref="frame" id="font" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.font.title') }}<div class="close"></div></TitleBar></template>
		
			<div class="grid-box"> <div class="text">{{ t('components.font-font.label') }}</div><TextBox id="font-font" :model-value="form.font" /> </div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FontForm } from '@app/tools/text-capture.ts';
import { Selection } from '@app/tools/text-capture.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const form = reactive<FontForm>({
	font: ''
});

const setForm = (data: Partial<FontForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = document.getElementById(id) as
			| (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): FontForm => {
	const data = { ...form } as FontForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = document.getElementById(id) as
			| (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof FontForm> = {
	'font-font': 'font'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

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
