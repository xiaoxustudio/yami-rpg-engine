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
				v-model="form.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiTextBox-align.label') || 'Align' }}</div>
			<SelectBox
				ref="elAlign"
				id="uiTextBox-align"
				v-model="form.align"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiTextBox-text.label') || 'Text' }}</div>
			<TextBox
				ref="elText"
				id="uiTextBox-text"
				v-model="form.text"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.uiTextBox-maxLength.label') || 'Max Length' }}</div>
			<NumberBox
				ref="elMaxLength"
				id="uiTextBox-maxLength"
				v-model="form.maxLength"
				min="1"
				max="100"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-number.label') || 'Number' }}</div>
			<NumberBox
				ref="elNumber"
				id="uiTextBox-number"
				v-model="form.number"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-min.label') || 'Min' }}</div>
			<NumberBox
				ref="elMin"
				id="uiTextBox-min"
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
				v-model="form.decimals"
				min="0"
				max="10"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-padding.label') || 'Padding' }}</div>
			<NumberBox
				id="uiTextBox-padding"
				v-model="form.padding"
				min="0"
				max="100"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-size.label') || 'Size' }}</div>
			<NumberBox
				id="uiTextBox-size"
				v-model="form.size"
				min="10"
				max="400"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiTextBox-font.label') || 'Font' }}</div>
			<TextBox id="uiTextBox-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiTextBox-color.label') || 'Text Color' }}</div>
			<ColorBox id="uiTextBox-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">
				{{ t('components.uiTextBox-selectionColor.label') || 'Selection Color' }}
			</div>
			<ColorBox
				id="uiTextBox-selectionColor"
				v-model="form.selectionColor"
				@input="onParamInput"
			></ColorBox>
			<div class="text">
				{{ t('components.uiTextBox-selectionBgColor.label') || 'Selection Bg Color' }}
			</div>
			<ColorBox
				id="uiTextBox-selectionBgColor"
				v-model="form.selectionBgColor"
				@input="onParamInput"
			></ColorBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUITextBoxPage } from '@app/composables/useUITextBoxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
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
	onParamInputEvent(value as unknown as Event);
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
	const uiTextBox = Inspector.uiTextBox;
	if (!uiTextBox) return;

	elType.value?.loadItems([
		{ name: 'Text', value: 'text' },
		{ name: 'Number', value: 'number' }
	]);
	elAlign.value?.loadItems([
		{ name: 'Left', value: 'left' },
		{ name: 'Center', value: 'center' },
		{ name: 'Right', value: 'right' }
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

	const elements = document.querySelectorAll(`#uiTextBox-type, #uiTextBox-align, #uiTextBox-text,
    #uiTextBox-maxLength, #uiTextBox-number, #uiTextBox-min, #uiTextBox-max,
    #uiTextBox-decimals, #uiTextBox-padding, #uiTextBox-size, #uiTextBox-font,
    #uiTextBox-color, #uiTextBox-selectionColor, #uiTextBox-selectionBgColor`);
	bindInput(elements, uiTextBox, UI);

	const el = document.getElementById('uiTextBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
