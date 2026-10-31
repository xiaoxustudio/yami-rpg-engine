<template>
	<WindowFrame id="exportLanguage" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.exportLanguage.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.exportLanguage-first.label') }}</div>
			<SelectBox
				ref="firstBox"
				:label="t('components.exportLanguage-first.label')"
				id="exportLanguage-first"
				v-tip="t('components.exportLanguage-first.tip')"
				v-model="form.first"
			/>
			<div class="text">{{ t('components.exportLanguage-second.label') }}</div>
			<SelectBox
				ref="secondBox"
				:label="t('components.exportLanguage-second.label')"
				id="exportLanguage-second"
				v-tip="t('components.exportLanguage-second.tip')"
				v-model="form.second"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { ExportLanguage } from '@app/local/export-language-window.ts';
import { getFormFields, setFormFields } from '@app/composables/form-fields';

const onConfirm = () => {
	ExportLanguage?.confirm?.(new Event('click'));
};
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ExportLanguageForm } from '@app/local/export-language-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import {
	provideExportLanguageBridge,
	resetExportLanguageBridge
} from '@app/composables/export-language-bridge';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const form = reactive<ExportLanguageForm>({ first: '', second: '' });

const FIELD_BY_ID: Record<string, keyof ExportLanguageForm> = {
	'exportLanguage-first': 'first',
	'exportLanguage-second': 'second'
};

// 控件用**模板 ref**（组件 defineExpose）而不是 registryRef 注册进 ElementRegistry：
// 这是元素契约迁移的样板 —— 组件内部按 ref 调用，单例经桥调用。
const firstBox = ref<InstanceType<typeof SelectBox> | null>(null);
const secondBox = ref<InstanceType<typeof SelectBox> | null>(null);

/**
 * 控件解析器：`setFormFields` / `getFormFields` 默认会去 `composableEls` 按 id 找元素，
 * 这里改成**直接读模板 ref** —— 表单读写不再经过任何注册表。
 */
const controlOf = (
	id: string
): { read?: () => unknown; write?: (value: unknown) => void } | null => {
	if (id === 'exportLanguage-first') return firstBox.value;
	if (id === 'exportLanguage-second') return secondBox.value;
	return null;
};

const setForm = (data: Partial<ExportLanguageForm>): void =>
	setFormFields<ExportLanguageForm>(form, data, FIELD_BY_ID, controlOf);

const getForm = (): ExportLanguageForm =>
	getFormFields<ExportLanguageForm>(form, FIELD_BY_ID, controlOf);

/** 控件级能力：由窗口自己灌候选项，单例不再按 id 找元素。 */
const loadItems = (first: unknown[], second: unknown[]): void => {
	firstBox.value?.loadItems(first);
	secondBox.value?.loadItems(second);
};

onMounted(() => {
	// 表单/控件桥走模块而不是元素属性：元素契约收尾后 el 上不该再挂业务方法。
	const api = { setForm, getForm, loadItems };
	provideExportLanguageBridge(api);
	onUnmounted(() => resetExportLanguageBridge(api));
});
</script>

<style>
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
