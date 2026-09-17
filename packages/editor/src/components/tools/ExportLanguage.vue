<template>
	<WindowFrame ref="frame" id="exportLanguage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.exportLanguage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.exportLanguage-first.label') }}</div>
			<SelectBox id="exportLanguage-first"
				v-tip="t('components.exportLanguage-first.tip')"
				:ref="registryRef(localEls, 'exportLanguage-first')" v-model="form.first" />
			<div class="text">{{ t('components.exportLanguage-second.label') }}</div>
			<SelectBox id="exportLanguage-second"
				v-tip="t('components.exportLanguage-second.tip')"
				:ref="registryRef(localEls, 'exportLanguage-second')" v-model="form.second" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { ExportLanguage } from '@app/local/export-language-window.ts';
import { composableEls } from '@app/composables/element-registry';

// P5b 批次 4：exportLanguage-confirm 由 WindowFrame 生成，改由 @confirm 驱动
const onConfirm = () => {
	ExportLanguage?.confirm?.(new Event('click'));
};
import { onMounted, reactive, ref } from 'vue';
import { localEls } from '@app/local/element-registry';
import { registryRef, registerElement } from '@app/utils/element-registry';
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
		const control = composableEls.get(id) as
		unknown as 	unknown as | (HTMLElement & { write?: (value: unknown) => void })
			| null;
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): ExportLanguageForm => {
	const data = { ...form } as ExportLanguageForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = composableEls.get(id) as
		unknown as 	unknown as | (HTMLElement & { read?: () => unknown })
			| null;
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	registerElement(localEls, 'exportLanguage', frame.value);
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
	}
});
</script>

<style>
/* 窗口样式迁移：由 Project/css/dialogs.css 迁入组件（选择器为全局 id，不能用 scoped） */
#exportLanguage {
	width: 324px;
	height: 122px;
}

#exportLanguage-confirm {
	right: 108px;
	bottom: 10px;
}

#exportLanguage-cancel {
	right: 10px;
	bottom: 10px;
}
</style>

