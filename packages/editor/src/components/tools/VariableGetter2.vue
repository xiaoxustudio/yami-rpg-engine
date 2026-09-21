<template>
	<!-- 变量访问器窗口2 -->
	<WindowFrame ref="frame" id="variableGetter2" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.variableGetter2.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.variableGetter2-type.label') }}</div>
			<SelectBox id="variableGetter2-type"
				:ref="registryRef(composableEls, 'variableGetter2-type')"
				v-tip="t('components.variableGetter2-type.tip')" />
			<div class="text">{{ t('components.variableGetter2-element.label') }}</div>
			<CustomBox id="variableGetter2-element"
				:ref="registryRef(composableEls, 'variableGetter2-element')"
				v-tip="t('components.variableGetter2-element.tip')" type="element" />
			<div class="text">{{ t('components.variableGetter2-common-key.label') }}</div>
			<TextBox id="variableGetter2-common-key"
				:ref="registryRef(composableEls, 'variableGetter2-common-key')"
				v-tip="t('components.variableGetter2-common-key.tip')" />
			<div class="text">{{ t('components.variableGetter2-preset-key.label') }}</div>
			<SelectBox id="variableGetter2-preset-key"
				:ref="registryRef(composableEls, 'variableGetter2-preset-key')"
				v-tip="t('components.variableGetter2-preset-key.tip')" />
			<div class="text">{{ t('components.variableGetter2-global-key.label') }}</div>
			<CustomBox id="variableGetter2-global-key"
				:ref="registryRef(composableEls, 'variableGetter2-global-key')"
				v-tip="t('components.variableGetter2-global-key.tip')" type="global-variable" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { registryElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import {
	useVariableGetterWindow,
	type VariableGetterForm
} from '@app/composables/useVariableGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { attachElementApi } from '@app/utils/attach-element-api';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const variableGetter = useVariableGetterWindow();
const form = variableGetter.form;

const setForm = (data: Partial<VariableGetterForm>): void => {
	Object.assign(form, data);
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		if (!(field in data)) continue;
		const control = registryElement<HTMLElement & { write?: (value: unknown) => void }>(
			composableEls,
			id
		);
		if (control && typeof control.write === 'function') {
			control.write(data[field] as never);
		}
	}
};

const getForm = (): VariableGetterForm => {
	const data = { ...form } as VariableGetterForm;
	for (const [id, field] of Object.entries(FIELD_BY_ID)) {
		const control = registryElement<HTMLElement & { read?: () => unknown }>(
			composableEls,
			id
		);
		if (control && typeof control.read === 'function') {
			data[field] = control.read() as never;
		}
	}
	return data;
};

const FIELD_BY_ID: Record<string, keyof VariableGetterForm> = {
	'variableGetter2-type': 'type',
	'variableGetter2-element': 'element',
	'variableGetter2-common-key': 'commonKey',
	'variableGetter2-preset-key': 'presetKey',
	'variableGetter2-global-key': 'globalKey'
};

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	VariableGetter?.confirm2?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		attachElementApi(el, { setForm, getForm });
		on(el, 'closed', () => variableGetter.onWindow2Closed());
	}
});
</script>

<style>
/* 窗口样式试点：由 Project/css/command.css 迁入组件（选择器为全局 id，不能用 scoped） */
#variableGetter2 {
	width: 324px;
	height: 146px;
}

#variableGetter2-confirm {
	right: 108px;
	bottom: 10px;
}

#variableGetter2-cancel {
	right: 10px;
	bottom: 10px;
}

</style>
