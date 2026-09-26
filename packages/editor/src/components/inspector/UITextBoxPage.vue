<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiTextBox-properties-grid.label') || 'TextBox Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiTextBox-properties-grid">
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
			<div class="text">{{ t('components.uiTextBox-padding.label') || 'Padding' }}</div>
			<NumberBox
				id="uiTextBox-padding"
				:ref="registryRef(inspectorEls, 'uiTextBox-padding')"
				v-tip="t('components.uiTextBox-padding.tip')"
				v-model="form.padding"
				min="0"
				max="100"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-size.label') || 'Size' }}</div>
			<NumberBox
				id="uiTextBox-size"
				:ref="registryRef(inspectorEls, 'uiTextBox-size')"
				v-tip="t('components.uiTextBox-size.tip')"
				v-model="form.size"
				min="10"
				max="400"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-font.label') || 'Font' }}</div>
			<TextBox
				id="uiTextBox-font"
				:placeholder="t('components.uiTextBox-font.placeholder')"
				:ref="registryRef(inspectorEls, 'uiTextBox-font')"
				v-tip="t('components.uiTextBox-font.tip')"
				v-model="form.font"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.uiTextBox-color.label') || 'Text Color' }}</div>
			<ColorBox
				id="uiTextBox-color"
				:ref="registryRef(inspectorEls, 'uiTextBox-color')"
				v-tip="t('components.uiTextBox-color.tip')"
				v-model="form.color"
				@input="onParamInput"
			></ColorBox>
			<div class="text">
				{{ t('components.uiTextBox-selectionColor.label') || 'Selection Color' }}
			</div>
			<ColorBox
				id="uiTextBox-selectionColor"
				:ref="registryRef(inspectorEls, 'uiTextBox-selectionColor')"
				v-tip="t('components.uiTextBox-selectionColor.tip')"
				v-model="form.selectionColor"
				@input="onParamInput"
			></ColorBox>
			<div class="text">
				{{ t('components.uiTextBox-selectionBgColor.label') || 'Selection Bg Color' }}
			</div>
			<ColorBox
				id="uiTextBox-selectionBgColor"
				:ref="registryRef(inspectorEls, 'uiTextBox-selectionBgColor')"
				v-tip="t('components.uiTextBox-selectionBgColor.tip')"
				v-model="form.selectionBgColor"
				@input="onParamInput"
			></ColorBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryElements, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { getUIStore } from '@app/stores/ui';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUITextBoxPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elAlign = ref<InstanceType<typeof SelectBox> | null>(null);
const elText = ref<InstanceType<typeof TextBox> | null>(null);
const elMaxLength = ref<InstanceType<typeof NumberBox> | null>(null);
const elNumber = ref<InstanceType<typeof NumberBox> | null>(null);
const elMin = ref<InstanceType<typeof NumberBox> | null>(null);
const elMax = ref<InstanceType<typeof NumberBox> | null>(null);
const elDecimals = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	// 以下控件的 :ref 槽位已被具名 ref 占用 → 命令式登记（页面内批量绑定焦点/滑杆用）
	registerElement(inspectorEls, 'uiTextBox-type', elType.value);
	registerElement(inspectorEls, 'uiTextBox-align', elAlign.value);
	registerElement(inspectorEls, 'uiTextBox-text', elText.value);
	registerElement(inspectorEls, 'uiTextBox-maxLength', elMaxLength.value);
	registerElement(inspectorEls, 'uiTextBox-min', elMin.value);
	registerElement(inspectorEls, 'uiTextBox-max', elMax.value);
	registerElement(inspectorEls, 'uiTextBox-decimals', elDecimals.value);
	registerElement(inspectorEls, 'uiTextBox-number', elNumber.value);
	const uiTextBox = Inspector.uiTextBox;
	if (!uiTextBox) return;

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

	const elements = registryElements(inspectorEls, [
		'uiTextBox-type',
		'uiTextBox-align',
		'uiTextBox-text',
		'uiTextBox-maxLength',
		'uiTextBox-number',
		'uiTextBox-min',
		'uiTextBox-max',
		'uiTextBox-decimals',
		'uiTextBox-padding',
		'uiTextBox-size',
		'uiTextBox-font',
		'uiTextBox-color',
		'uiTextBox-selectionColor',
		'uiTextBox-selectionBgColor'
	]);
	bindInput(elements, getUIStore(), uiTextBox);

	const el = inspectorEls.get('uiTextBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
