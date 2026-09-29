<template>
	<div class="text">{{ t('components.uiDialogBox-content.label') || 'Content' }}</div>
	<TextArea
		id="uiDialogBox-content"
		:ref="registryRef(inspectorEls, 'uiDialogBox-content')"
		v-tip="t('components.uiDialogBox-content.tip')"
		:model-value="form.content"
		menu="tag-localization"
		@input="onParamInput"
	></TextArea>
	<div class="text">
		{{ t('components.uiDialogBox-interval.label') || 'Print Interval' }}
	</div>
	<NumberBox
		id="uiDialogBox-interval"
		:ref="registryRef(inspectorEls, 'uiDialogBox-interval')"
		v-tip="t('components.uiDialogBox-interval.tip')"
		v-model="form.interval"
		min="0"
		max="100"
		decimals="4"
		unit="ms"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiDialogBox-size-box.label') || 'Size' }}</div>
	<div
		class="flex-box"
		id="uiDialogBox-size-box"
		v-tip="t('components.uiDialogBox-size-box.tip')"
	>
		<SliderBox
			ref="elSizeSlider"
			id="uiDialogBox-size-slider"
			min="12"
			max="52"
			step="2"
		></SliderBox>
		<NumberBox
			ref="elSize"
			id="uiDialogBox-size"
			v-model="form.size"
			min="10"
			max="400"
			step="1"
			unit="px"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">
		{{ t('components.uiDialogBox-lineSpacing-box.label') || 'Line Spacing' }}
	</div>
	<div
		class="flex-box"
		id="uiDialogBox-lineSpacing-box"
		v-tip="t('components.uiDialogBox-lineSpacing-box.tip')"
	>
		<SliderBox
			ref="elLineSpacingSlider"
			id="uiDialogBox-lineSpacing-slider"
			min="0"
			max="20"
			step="1"
		></SliderBox>
		<NumberBox
			ref="elLineSpacing"
			id="uiDialogBox-lineSpacing"
			v-model="form.lineSpacing"
			min="-10"
			max="100"
			step="1"
			unit="px"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">
		{{ t('components.uiDialogBox-letterSpacing-box.label') || 'Letter Spacing' }}
	</div>
	<div
		class="flex-box"
		id="uiDialogBox-letterSpacing-box"
		v-tip="t('components.uiDialogBox-letterSpacing-box.tip')"
	>
		<SliderBox
			ref="elLetterSpacingSlider"
			id="uiDialogBox-letterSpacing-slider"
			min="0"
			max="20"
			step="1"
		></SliderBox>
		<NumberBox
			ref="elLetterSpacing"
			id="uiDialogBox-letterSpacing"
			v-model="form.letterSpacing"
			min="-10"
			max="100"
			step="1"
			unit="px"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">{{ t('components.uiDialogBox-color.label') || 'Color' }}</div>
	<ColorBox
		id="uiDialogBox-color"
		:ref="registryRef(inspectorEls, 'uiDialogBox-color')"
		v-tip="t('components.uiDialogBox-color.tip')"
		v-model="form.color"
		@input="onParamInput"
	></ColorBox>
	<div class="text">{{ t('components.uiDialogBox-font.label') || 'Font' }}</div>
	<TextBox
		id="uiDialogBox-font"
		:placeholder="t('components.uiDialogBox-font.placeholder')"
		:ref="registryRef(inspectorEls, 'uiDialogBox-font')"
		v-tip="t('components.uiDialogBox-font.tip')"
		v-model="form.font"
		@input="onParamInput"
	></TextBox>
	<div class="text">{{ t('components.uiDialogBox-typeface.label') || 'Typeface' }}</div>
	<SelectBox
		ref="elTypeface"
		id="uiDialogBox-typeface"
		v-tip="t('components.uiDialogBox-typeface.tip')"
		v-model="form.typeface"
		@input="onParamInput"
	></SelectBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiDialogBoxContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiDialogBoxContextKey)!;

const synchronize = (
	slider: InstanceType<typeof SliderBox> | null,
	input: InstanceType<typeof NumberBox> | null
) => {
	const el = input?.root ?? null;
	if (!el) return;
	slider?.synchronize(
		el as HTMLElement & {
			write(value: number | string): void;
			input: HTMLInputElement;
		}
	);
};

const elTypeface = ref<InstanceType<typeof SelectBox> | null>(null);
const elSizeSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elSize = ref<InstanceType<typeof NumberBox> | null>(null);
const elLineSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLineSpacing = ref<InstanceType<typeof NumberBox> | null>(null);
const elLetterSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLetterSpacing = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiDialogBox-size', elSize.value);
	registerElement(inspectorEls, 'uiDialogBox-lineSpacing', elLineSpacing.value);
	registerElement(inspectorEls, 'uiDialogBox-letterSpacing', elLetterSpacing.value);
	registerElement(inspectorEls, 'uiDialogBox-typeface', elTypeface.value);
	registerElement(inspectorEls, 'uiDialogBox-size-slider', elSizeSlider.value);
	registerElement(inspectorEls, 'uiDialogBox-lineSpacing-slider', elLineSpacingSlider.value);
	registerElement(inspectorEls, 'uiDialogBox-letterSpacing-slider', elLetterSpacingSlider.value);
	elTypeface.value?.loadItems([
		{
			name: t('components.uiDialogBox-typeface.options.regular.name'),
			tip: t('components.uiDialogBox-typeface.options.regular.tip'),
			value: 'regular'
		},
		{
			name: t('components.uiDialogBox-typeface.options.bold.name'),
			tip: t('components.uiDialogBox-typeface.options.bold.tip'),
			value: 'bold'
		},
		{
			name: t('components.uiDialogBox-typeface.options.italic.name'),
			tip: t('components.uiDialogBox-typeface.options.italic.tip'),
			value: 'italic'
		},
		{
			name: t('components.uiDialogBox-typeface.options.bold-italic.name'),
			tip: t('components.uiDialogBox-typeface.options.bold-italic.tip'),
			value: 'bold-italic'
		}
	]);
	synchronize(elSizeSlider.value, elSize.value);
	synchronize(elLineSpacingSlider.value, elLineSpacing.value);
	synchronize(elLetterSpacingSlider.value, elLetterSpacing.value);
});
</script>
