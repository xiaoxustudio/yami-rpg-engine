<template>
	<WindowFrame ref="frame" id="exportLanguage">
		<template #title
			><TitleBar
				>{{ t('components.exportLanguage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.exportLanguage-first.label') }}</div>
			<SelectBox id="exportLanguage-first" v-model="form.first" />
			<div class="text">{{ t('components.exportLanguage-second.label') }}</div>
			<SelectBox id="exportLanguage-second" v-model="form.second" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExportLanguageForm } from '@app/local/export-language-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = reactive<ExportLanguageForm>({ first: '', second: '' });

const FIELD_BY_ID: Record<string, keyof ExportLanguageForm> = {
	'exportLanguage-first': 'first',
	'exportLanguage-second': 'second'
};

const setForm = (data: Partial<ExportLanguageForm>): void => {
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

const getForm = (): ExportLanguageForm => {
	const data = { ...form } as ExportLanguageForm;
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

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>
