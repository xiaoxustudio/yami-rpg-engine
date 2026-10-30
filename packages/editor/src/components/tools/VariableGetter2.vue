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
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { useVariableGetterWindow } from '@app/composables/useVariableGetterWindow';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const variableGetter = useVariableGetterWindow();

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

const onConfirm = () => {
	VariableGetter?.confirm2?.(new Event('click'));
};

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		// 这里原来还挂了 `attachElementApi(el, { setForm, getForm })`，但全仓没有任何
		// 消费方：变量取值窗口的表单是由 `useVariableGetterWindow` 直接写控件的。
		// 元素契约收尾要求元素上不挂业务方法，这份死挂载因此直接删除（非"迁移"）。
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
