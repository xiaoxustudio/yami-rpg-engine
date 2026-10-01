<template>
	<WindowFrame id="condition" @confirm="onConfirm">
		<template #title
			><TitleBar
				>{{ t('components.condition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.condition-type.label') }}</div>
			<SelectBox
				id="condition-type"
				v-tip="t('components.condition-type.tip')"
				:ref="registryRef(conditionEls, 'condition-type')"
				v-focus
				v-model="form.type"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.condition-key.label') }}</div>
			<CustomBox
				id="condition-key"
				v-tip="t('components.condition-key.tip')"
				:ref="registryRef(conditionEls, 'condition-key')"
				v-focus
				type="global-variable"
				filter="all"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.condition-boolean-operation.label') }}</div>
			<SelectBox
				id="condition-boolean-operation"
				v-tip="t('components.condition-boolean-operation.tip')"
				:ref="registryRef(conditionEls, 'condition-boolean-operation')"
				v-model="form.booleanOperation"
			/>
			<div class="text">{{ t('components.condition-boolean-value.label') }}</div>
			<SelectBox
				id="condition-boolean-value"
				v-tip="t('components.condition-boolean-value.tip')"
				:ref="registryRef(conditionEls, 'condition-boolean-value')"
				v-model="form.booleanValue"
			/>
			<div class="text">{{ t('components.condition-number-operation.label') }}</div>
			<SelectBox
				id="condition-number-operation"
				v-tip="t('components.condition-number-operation.tip')"
				:ref="registryRef(conditionEls, 'condition-number-operation')"
				v-model="form.numberOperation"
			/>
			<div class="text">{{ t('components.condition-number-value.label') }}</div>
			<NumberBox
				:label="t('components.condition-number-value.label')"
				id="condition-number-value"
				v-tip="t('components.condition-number-value.tip')"
				:ref="registryRef(conditionEls, 'condition-number-value')"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.condition-string-operation.label') }}</div>
			<SelectBox
				id="condition-string-operation"
				v-tip="t('components.condition-string-operation.tip')"
				:ref="registryRef(conditionEls, 'condition-string-operation')"
				v-model="form.stringOperation"
			/>
			<div class="text">{{ t('components.condition-string-value.label') }}</div>
			<TextArea
				:label="t('components.condition-string-value.label')"
				id="condition-string-value"
				v-tip="t('components.condition-string-value.tip')"
				:ref="registryRef(conditionEls, 'condition-string-value')"
				v-model="form.stringValue"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import type { YamiElement } from '@app/types/element-api';
import { conditionEls } from '@app/tools/condition-list';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { ConditionListInterface, form } from '@app/tools/condition-list.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextArea from '@app/components/common/TextArea.vue';

const { t } = useI18n();

const onTypeWrite = (value: unknown) => {
	ConditionListInterface?.typeWrite?.({ value } as Event & { value: string });
};
const onConfirm = () => {
	(ConditionListInterface?.target as YamiElement | undefined)?.save?.();
};

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#condition {
	width: 324px;
	height: 194px;
}

#condition-string-value {
	height: 44px;
}

#condition-confirm {
	right: 108px;
	bottom: 10px;
}

#condition-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
