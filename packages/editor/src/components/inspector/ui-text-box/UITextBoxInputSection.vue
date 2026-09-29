<template>
	<div class="text">{{ t('components.uiTextBox-type.label') || 'Type' }}</div>
	<SelectBox
		ref="elType"
		id="uiTextBox-type"
		v-tip="t('components.uiTextBox-type.tip')"
		v-model="form.type"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiTextBox-align.label') || 'Align' }}</div>
	<SelectBox
		ref="elAlign"
		id="uiTextBox-align"
		v-tip="t('components.uiTextBox-align.tip')"
		v-model="form.align"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiTextBox-text.label') || 'Text' }}</div>
	<TextBox
		ref="elText"
		id="uiTextBox-text"
		v-tip="t('components.uiTextBox-text.tip')"
		v-model="form.text"
		@input="onParamInput"
	></TextBox>
	<div class="text">{{ t('components.uiTextBox-maxLength.label') || 'Max Length' }}</div>
	<NumberBox
		ref="elMaxLength"
		id="uiTextBox-maxLength"
		v-tip="t('components.uiTextBox-maxLength.tip')"
		v-model="form.maxLength"
		min="1"
		max="100"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiTextBox-number.label') || 'Number' }}</div>
	<NumberBox
		ref="elNumber"
		id="uiTextBox-number"
		v-tip="t('components.uiTextBox-number.tip')"
		v-model="form.number"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiTextBox-min.label') || 'Min' }}</div>
	<NumberBox
		ref="elMin"
		id="uiTextBox-min"
		v-tip="t('components.uiTextBox-min.tip')"
		v-model="form.min"
		min="-1000000000"
		max="1000000000"
		decimals="10"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiTextBox-max.label') || 'Max' }}</div>
	<NumberBox
		ref="elMax"
		id="uiTextBox-max"
		v-tip="t('components.uiTextBox-max.tip')"
		v-model="form.max"
		min="-1000000000"
		max="1000000000"
		decimals="10"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiTextBox-decimals.label') || 'Decimal Places' }}
	</div>
	<NumberBox
		ref="elDecimals"
		id="uiTextBox-decimals"
		v-tip="t('components.uiTextBox-decimals.tip')"
		v-model="form.decimals"
		min="0"
		max="10"
		@input="onParamInput"
	></NumberBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiTextBoxContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiTextBoxContextKey)!;

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elAlign = ref<InstanceType<typeof SelectBox> | null>(null);
const elText = ref<InstanceType<typeof TextBox> | null>(null);
const elMaxLength = ref<InstanceType<typeof NumberBox> | null>(null);
const elNumber = ref<InstanceType<typeof NumberBox> | null>(null);
const elMin = ref<InstanceType<typeof NumberBox> | null>(null);
const elMax = ref<InstanceType<typeof NumberBox> | null>(null);
const elDecimals = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiTextBox-type', elType.value);
	registerElement(inspectorEls, 'uiTextBox-align', elAlign.value);
	registerElement(inspectorEls, 'uiTextBox-text', elText.value);
	registerElement(inspectorEls, 'uiTextBox-maxLength', elMaxLength.value);
	registerElement(inspectorEls, 'uiTextBox-min', elMin.value);
	registerElement(inspectorEls, 'uiTextBox-max', elMax.value);
	registerElement(inspectorEls, 'uiTextBox-decimals', elDecimals.value);
	registerElement(inspectorEls, 'uiTextBox-number', elNumber.value);
	elType.value?.loadItems([
		{
			name: t('components.uiTextBox-type.options.text.name'),
			tip: t('components.uiTextBox-type.options.text.tip'),
			value: 'text'
		},
		{
			name: t('components.uiTextBox-type.options.number.name'),
			tip: t('components.uiTextBox-type.options.number.tip'),
			value: 'number'
		}
	]);
	elAlign.value?.loadItems([
		{
			name: t('components.uiTextBox-align.options.left.name'),
			tip: t('components.uiTextBox-align.options.left.tip'),
			value: 'left'
		},
		{
			name: t('components.uiTextBox-align.options.center.name'),
			tip: t('components.uiTextBox-align.options.center.tip'),
			value: 'center'
		},
		{
			name: t('components.uiTextBox-align.options.right.name'),
			tip: t('components.uiTextBox-align.options.right.tip'),
			value: 'right'
		}
	]);
	elType.value?.enableHiddenMode();
	elType.value?.relate([
		{
			case: 'text',
			targets: [elText.value?.root ?? null, elMaxLength.value?.root ?? null]
		},
		{
			case: 'number',
			targets: [
				elNumber.value?.root ?? null,
				elMin.value?.root ?? null,
				elMax.value?.root ?? null,
				elDecimals.value?.root ?? null
			]
		}
	]);
});
</script>
