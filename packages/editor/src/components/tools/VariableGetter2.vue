<template>
	<WindowFrame ref="frame" id="variableGetter2" @confirm="onConfirm" scrollable>
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
				:ref="controlRef('variableGetter2-type')"
				v-tip="t('components.variableGetter2-type.tip')"
			/>
			<div class="text">{{ t('components.variableGetter2-element.label') }}</div>
			<CustomBox
				id="variableGetter2-element"
				:ref="controlRef('variableGetter2-element')"
				v-tip="t('components.variableGetter2-element.tip')"
				type="element"
			/>
			<div class="text">{{ t('components.variableGetter2-common-key.label') }}</div>
			<TextBox
				:label="t('components.variableGetter2-common-key.label')"
				id="variableGetter2-common-key"
				:ref="controlRef('variableGetter2-common-key')"
				v-tip="t('components.variableGetter2-common-key.tip')"
			/>
			<div class="text">{{ t('components.variableGetter2-preset-key.label') }}</div>
			<SelectBox
				:label="t('components.variableGetter2-preset-key.label')"
				id="variableGetter2-preset-key"
				:ref="controlRef('variableGetter2-preset-key')"
				v-tip="t('components.variableGetter2-preset-key.tip')"
			/>
			<div class="text">{{ t('components.variableGetter2-global-key.label') }}</div>
			<CustomBox
				id="variableGetter2-global-key"
				:ref="controlRef('variableGetter2-global-key')"
				v-tip="t('components.variableGetter2-global-key.tip')"
				type="global-variable"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import {
	provideVariableGetterControls,
	useVariableGetterWindow
} from '@app/composables/useVariableGetterWindow';
import { useControlRefs } from '@app/composables/control-refs';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'variableGetter2-common-key'
	| 'variableGetter2-element'
	| 'variableGetter2-global-key'
	| 'variableGetter2-preset-key'
	| 'variableGetter2-type';

const { controls, controlRef } = useControlRefs<Id>();

const { t } = useI18n();

const variableGetter = useVariableGetterWindow();

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	VariableGetter?.confirm2?.(new Event('click'));
};

onMounted(() => {
	// 这扇窗口的 `setForm` / `getForm` 早就没消费方（表单由单例直接写控件），因此只交控件表
	provideVariableGetterControls('variableGetter2', () => controls);
	const el = frame.value?.root;
	if (el) {
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
