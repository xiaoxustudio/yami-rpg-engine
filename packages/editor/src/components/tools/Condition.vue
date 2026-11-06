<template>
	<WindowFrame id="condition" @confirm="onConfirm" scrollable>
		<template #title
			><TitleBar
				>{{ t('components.condition.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="grid-box">
			<div class="text">{{ t('components.condition-type.label') }}</div>
			<SelectBox
				:label="t('components.condition-type.label')"
				id="condition-type"
				v-tip="t('components.condition-type.tip')"
				ref="typeRef"
				v-focus
				v-model="form.type"
				@write="onTypeWrite"
			/>
			<div class="text">{{ t('components.condition-key.label') }}</div>
			<CustomBox
				id="condition-key"
				v-tip="t('components.condition-key.tip')"
				ref="keyRef"
				v-focus
				type="global-variable"
				filter="all"
				v-model="form.key"
			/>
			<div class="text">{{ t('components.condition-boolean-operation.label') }}</div>
			<SelectBox
				:label="t('components.condition-boolean-operation.label')"
				id="condition-boolean-operation"
				v-tip="t('components.condition-boolean-operation.tip')"
				ref="booleanOperationRef"
				v-model="form.booleanOperation"
			/>
			<div class="text">{{ t('components.condition-boolean-value.label') }}</div>
			<SelectBox
				:label="t('components.condition-boolean-value.label')"
				id="condition-boolean-value"
				v-tip="t('components.condition-boolean-value.tip')"
				ref="booleanValueRef"
				v-model="form.booleanValue"
			/>
			<div class="text">{{ t('components.condition-number-operation.label') }}</div>
			<SelectBox
				:label="t('components.condition-number-operation.label')"
				id="condition-number-operation"
				v-tip="t('components.condition-number-operation.tip')"
				ref="numberOperationRef"
				v-model="form.numberOperation"
			/>
			<div class="text">{{ t('components.condition-number-value.label') }}</div>
			<NumberBox
				:label="t('components.condition-number-value.label')"
				id="condition-number-value"
				v-tip="t('components.condition-number-value.tip')"
				ref="numberValueRef"
				min="-1000000000"
				max="1000000000"
				decimals="10"
				v-model="form.numberValue"
			/>
			<div class="text">{{ t('components.condition-string-operation.label') }}</div>
			<SelectBox
				:label="t('components.condition-string-operation.label')"
				id="condition-string-operation"
				v-tip="t('components.condition-string-operation.tip')"
				ref="stringOperationRef"
				v-model="form.stringOperation"
			/>
			<div class="text">{{ t('components.condition-string-value.label') }}</div>
			<TextArea
				:label="t('components.condition-string-value.label')"
				id="condition-string-value"
				v-tip="t('components.condition-string-value.tip')"
				ref="stringValueRef"
				v-model="form.stringValue"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import type { YamiElement } from '@app/types/element-api';
import { useI18n } from 'vue-i18n';
import {
	provideCondition,
	resetCondition,
	type ConditionApi
} from '@app/composables/condition-bridge';
import { controlRoot, toControl } from '@app/composables/control-refs';
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

/** 8 个条件控件：模板 ref 就位后经桥交出（逻辑名 → 控件）。 */
const typeRef = ref<InstanceType<typeof SelectBox> | null>(null);
const keyRef = ref<InstanceType<typeof CustomBox> | null>(null);
const booleanOperationRef = ref<InstanceType<typeof SelectBox> | null>(null);
const booleanValueRef = ref<InstanceType<typeof SelectBox> | null>(null);
const numberOperationRef = ref<InstanceType<typeof SelectBox> | null>(null);
const numberValueRef = ref<InstanceType<typeof NumberBox> | null>(null);
const stringOperationRef = ref<InstanceType<typeof SelectBox> | null>(null);
const stringValueRef = ref<InstanceType<typeof TextArea> | null>(null);

const controlsOf = (): Record<string, unknown> => ({
	type: typeRef.value,
	key: keyRef.value,
	booleanOperation: booleanOperationRef.value,
	booleanValue: booleanValueRef.value,
	numberOperation: numberOperationRef.value,
	numberValue: numberValueRef.value,
	stringOperation: stringOperationRef.value,
	stringValue: stringValueRef.value
});

const bridgeApi: ConditionApi = {
	control: (name) => toControl(controlsOf()[name] ?? null),
	relateGroups: (groups) => {
		const type = typeRef.value;
		if (!type) return;
		// `relate()` 的目标是 DOM 语义：用 controlRoot 取根元素
		type.enableHiddenMode?.();
		(type as unknown as { relate?: (list: unknown[]) => void }).relate?.(
			groups.map((group) => ({
				case: group.case,
				targets: group.targets.map((name) =>
					controlRoot(toControl(controlsOf()[name] ?? null))
				)
			}))
		);
	}
};

onMounted(() => {
	provideCondition(bridgeApi);
	onUnmounted(() => resetCondition(bridgeApi));
});
</script>

<style>
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
