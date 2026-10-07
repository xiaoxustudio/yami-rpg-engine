<template>
	<WindowFrame ref="frame" id="variableGetter2" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.variableGetter2.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.variableGetter2-type.label') }}</div>
			<SelectBox
				:label="t('components.variableGetter2-type.label')"
				id="variableGetter2-type"
				:ref="registryRef(composableEls, 'variableGetter2-type')"
				v-tip="t('components.variableGetter2-type.tip')"
			/>
			<div class="text">{{ t('components.variableGetter2-element.label') }}</div>
			<CustomBox
				id="variableGetter2-element"
				:ref="registryRef(composableEls, 'variableGetter2-element')"
				v-tip="t('components.variableGetter2-element.tip')"
				type="element"
			/>
			<div class="text">{{ t('components.variableGetter2-common-key.label') }}</div>
			<TextBox
				:label="t('components.variableGetter2-common-key.label')"
				id="variableGetter2-common-key"
				:ref="registryRef(composableEls, 'variableGetter2-common-key')"
				v-tip="t('components.variableGetter2-common-key.tip')"
			/>
			<div class="text">{{ t('components.variableGetter2-preset-key.label') }}</div>
			<SelectBox
				:label="t('components.variableGetter2-preset-key.label')"
				id="variableGetter2-preset-key"
				:ref="registryRef(composableEls, 'variableGetter2-preset-key')"
				v-tip="t('components.variableGetter2-preset-key.tip')"
			/>
			<div class="text">{{ t('components.variableGetter2-global-key.label') }}</div>
			<CustomBox
				id="variableGetter2-global-key"
				:ref="registryRef(composableEls, 'variableGetter2-global-key')"
				v-tip="t('components.variableGetter2-global-key.tip')"
				type="global-variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { getFormFields, setFormFields } from '@app/composables/form-fields';
import { registryRef } from '@app/utils/element-registry';
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

const setForm = (data: Partial<VariableGetterForm>): void =>
	setFormFields<VariableGetterForm>(form, data, FIELD_BY_ID);

const getForm = (): VariableGetterForm => getFormFields<VariableGetterForm>(form, FIELD_BY_ID);

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
