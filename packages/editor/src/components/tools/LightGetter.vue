<template>
	<WindowFrame ref="frame" id="lightGetter" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.lightGetter.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.lightGetter-type.label') }}</div>
			<SelectBox
				:label="t('components.lightGetter-type.label')"
				id="lightGetter-type"
				ref="typeBox"
				v-tip="t('components.lightGetter-type.tip')"
			/>
			<div class="text">{{ t('components.lightGetter-presetId.label') }}</div>
			<CustomBox
				id="lightGetter-presetId"
				ref="presetIdBox"
				v-tip="t('components.lightGetter-presetId.tip')"
				type="preset-object"
				filter="light"
			/>
			<div class="text">{{ t('components.lightGetter-variable.label') }}</div>
			<CustomBox
				id="lightGetter-variable"
				ref="variableBox"
				v-tip="t('components.lightGetter-variable.tip')"
				type="variable"
				filter="object"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { getFormFields, setFormFields } from '@app/composables/form-fields';
import { useI18n } from 'vue-i18n';
import { LightGetter } from '@app/commands/accessors/preset-accessor-factory.ts';
import {
	useLightGetterWindow,
	type PresetGetterForm
} from '@app/composables/usePresetGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { presetGetterBridge } from '@app/composables/preset-getter-bridge';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const lightGetter = useLightGetterWindow();
const form = lightGetter.form;

/** 表单读写直接读模板 ref，不经过注册表（与 ExportLanguage 同口径）。 */
const controlOf = (
	id: string
): { read?: () => unknown; write?: (value: unknown) => void } | null =>
	id === 'lightGetter-type'
		? typeBox.value
		: id === 'lightGetter-presetId'
			? presetIdBox.value
			: id === 'lightGetter-variable'
				? variableBox.value
				: null;

const setForm = (data: Partial<PresetGetterForm>): void =>
	setFormFields<PresetGetterForm>(form, data, FIELD_BY_ID, controlOf);

const getForm = (): PresetGetterForm =>
	getFormFields<PresetGetterForm>(form, FIELD_BY_ID, controlOf);

const FIELD_BY_ID: Record<string, keyof PresetGetterForm> = {
	'lightGetter-type': 'type',
	'lightGetter-presetId': 'presetId',
	'lightGetter-variable': 'variable'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

// 控件用模板 ref（组件 defineExpose），不再注册进 ElementRegistry。
const typeBox = ref<InstanceType<typeof SelectBox> | null>(null);
const presetIdBox = ref<InstanceType<typeof CustomBox> | null>(null);
const variableBox = ref<InstanceType<typeof CustomBox> | null>(null);

const onConfirm = () => {
	LightGetter?.confirm?.(new Event('click'));
};

onMounted(() => {
	// 表单桥走模块（presetGetterBridge），元素上不再挂业务方法。
	// 控件元素按模板 ref 交给 composable：它不再按 id 去注册表取裸元素
	lightGetter.initialize?.({
		type: typeBox.value?.root ?? null,
		presetId: presetIdBox.value?.root ?? null,
		variable: variableBox.value?.root ?? null
	});
	const api = { setForm, getForm };
	const bridge = presetGetterBridge('lightGetter');
	bridge?.provide(api);
	const el = frame.value?.root;
	if (el) {
		on(el, 'closed', () => lightGetter.onWindowClosed());
	}
	onUnmounted(() => bridge?.reset(api));
});
</script>

<style>
#lightGetter {
	width: 324px;
	height: 122px;
}

#lightGetter-confirm {
	right: 108px;
	bottom: 10px;
}

#lightGetter-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
