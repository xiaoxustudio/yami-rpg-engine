<template>
	<div class="text">{{ t('components.uiTextBox-type.label') || 'Type' }}</div>
	<SelectBox
		:label="t('components.uiTextBox-type.label') || 'Type'"
		ref="elType"
		id="uiTextBox-type"
		v-tip="t('components.uiTextBox-type.tip')"
		v-model="form.type"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiTextBox-align.label') || 'Align' }}</div>
	<SelectBox
		:label="t('components.uiTextBox-align.label') || 'Align'"
		ref="elAlign"
		id="uiTextBox-align"
		v-tip="t('components.uiTextBox-align.tip')"
		v-model="form.align"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiTextBox-text.label') || 'Text' }}</div>
	<TextBox
		:label="t('components.uiTextBox-text.label') || 'Text'"
		ref="elText"
		id="uiTextBox-text"
		v-tip="t('components.uiTextBox-text.tip')"
		v-model="form.text"
		@input="onParamInput"
	></TextBox>
	<div class="text">{{ t('components.uiTextBox-maxLength.label') || 'Max Length' }}</div>
	<NumberBox
		:label="t('components.uiTextBox-maxLength.label') || 'Max Length'"
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
		:label="t('components.uiTextBox-number.label') || 'Number'"
		ref="elNumber"
		id="uiTextBox-number"
		v-tip="t('components.uiTextBox-number.tip')"
		v-model="form.number"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiTextBox-min.label') || 'Min' }}</div>
	<NumberBox
		:label="t('components.uiTextBox-min.label') || 'Min'"
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
		:label="t('components.uiTextBox-max.label') || 'Max'"
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
		:label="t('components.uiTextBox-decimals.label') || 'Decimal Places'"
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
import { inject, onMounted, ref, onUnmounted } from 'vue';
import { uiTextBoxPageNodes } from '@app/composables/inspector-page-nodes';
import { useI18n } from 'vue-i18n';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiTextBoxContextKey } from './context.ts';

const { t } = useI18n();

const { dispose } = uiTextBoxPageNodes.scoped();
onUnmounted(dispose);
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
	uiTextBoxPageNodes.set('type', elType.value?.root ?? null);
	uiTextBoxPageNodes.set('align', elAlign.value?.root ?? null);
	uiTextBoxPageNodes.set('text', elText.value?.root ?? null);
	uiTextBoxPageNodes.set('maxLength', elMaxLength.value?.root ?? null);
	uiTextBoxPageNodes.set('min', elMin.value?.root ?? null);
	uiTextBoxPageNodes.set('max', elMax.value?.root ?? null);
	uiTextBoxPageNodes.set('decimals', elDecimals.value?.root ?? null);
	uiTextBoxPageNodes.set('number', elNumber.value?.root ?? null);
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
