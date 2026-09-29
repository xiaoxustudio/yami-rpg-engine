<template>
	<div class="text">{{ t('components.uiText-direction.label') || 'Direction' }}</div>
	<SelectBox
		ref="elDirection"
		id="uiText-direction"
		v-tip="t('components.uiText-direction.tip')"
		v-model="form.direction"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiText-align-box.label') || 'Align' }}</div>
	<div class="flex-box" id="uiText-align-box">
		<RadioBox
			id="uiText-align-left"
			v-tip="t('components.uiText-align-left.tip')"
			name="uiText-horizontalAlign"
			class="uiText-align"
			value="left"
			tabindex="0"
			><div class="text">&#xf036;</div></RadioBox
		>
		<RadioBox
			id="uiText-align-center"
			v-tip="t('components.uiText-align-center.tip')"
			name="uiText-horizontalAlign"
			class="uiText-align"
			value="center"
			tabindex="0"
			><div class="text">&#xf037;</div></RadioBox
		>
		<RadioBox
			id="uiText-align-right"
			v-tip="t('components.uiText-align-right.tip')"
			name="uiText-horizontalAlign"
			class="uiText-align"
			value="right"
			tabindex="0"
			><div class="text">&#xf038;</div></RadioBox
		>
		<RadioBox
			id="uiText-align-top"
			v-tip="t('components.uiText-align-top.tip')"
			name="uiText-verticalAlign"
			class="uiText-align rotated"
			value="top"
			tabindex="0"
			><div class="text">&#xf036;</div></RadioBox
		>
		<RadioBox
			id="uiText-align-middle"
			v-tip="t('components.uiText-align-middle.tip')"
			name="uiText-verticalAlign"
			class="uiText-align rotated"
			value="middle"
			tabindex="0"
			><div class="text">&#xf037;</div></RadioBox
		>
		<RadioBox
			id="uiText-align-bottom"
			v-tip="t('components.uiText-align-bottom.tip')"
			name="uiText-verticalAlign"
			class="uiText-align rotated"
			value="bottom"
			tabindex="0"
			><div class="text">&#xf038;</div></RadioBox
		>
	</div>
	<div class="text">{{ t('components.uiText-content.label') || 'Content' }}</div>
	<TextArea
		id="uiText-content"
		:ref="registryRef(inspectorEls, 'uiText-content')"
		v-tip="t('components.uiText-content.tip')"
		v-model="form.content"
		menu="tag-global-var tag-dynamic-global-var tag-localization"
		@input="onParamInput"
	></TextArea>
	<div class="text">{{ t('components.uiText-size-box.label') || 'Size' }}</div>
	<div class="flex-box" id="uiText-size-box" v-tip="t('components.uiText-size-box.tip')">
		<SliderBox
			ref="elSizeSlider"
			id="uiText-size-slider"
			v-model="form.size"
			min="12"
			max="52"
			step="2"
		></SliderBox>
		<NumberBox
			ref="elSize"
			id="uiText-size"
			v-model="form.size"
			min="10"
			max="400"
			step="1"
			unit="px"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">
		{{ t('components.uiText-lineSpacing-box.label') || 'Line Spacing' }}
	</div>
	<div
		class="flex-box"
		id="uiText-lineSpacing-box"
		v-tip="t('components.uiText-lineSpacing-box.tip')"
	>
		<SliderBox
			ref="elLineSpacingSlider"
			id="uiText-lineSpacing-slider"
			v-model="form.lineSpacing"
			min="0"
			max="20"
			step="1"
		></SliderBox>
		<NumberBox
			ref="elLineSpacing"
			id="uiText-lineSpacing"
			v-model="form.lineSpacing"
			min="-10"
			max="100"
			step="1"
			unit="px"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">
		{{ t('components.uiText-letterSpacing-box.label') || 'Letter Spacing' }}
	</div>
	<div
		class="flex-box"
		id="uiText-letterSpacing-box"
		v-tip="t('components.uiText-letterSpacing-box.tip')"
	>
		<SliderBox
			ref="elLetterSpacingSlider"
			id="uiText-letterSpacing-slider"
			v-model="form.letterSpacing"
			min="0"
			max="20"
			step="1"
		></SliderBox>
		<NumberBox
			ref="elLetterSpacing"
			id="uiText-letterSpacing"
			v-model="form.letterSpacing"
			min="-10"
			max="100"
			step="1"
			unit="px"
			@input="onParamInput"
		></NumberBox>
	</div>
	<div class="text">{{ t('components.uiText-color.label') || 'Color' }}</div>
	<ColorBox
		id="uiText-color"
		:ref="registryRef(inspectorEls, 'uiText-color')"
		v-tip="t('components.uiText-color.tip')"
		v-model="form.color"
		@input="onParamInput"
	></ColorBox>
	<div class="text">{{ t('components.uiText-font.label') || 'Font' }}</div>
	<TextBox
		id="uiText-font"
		:placeholder="t('components.uiText-font.placeholder')"
		:ref="registryRef(inspectorEls, 'uiText-font')"
		v-tip="t('components.uiText-font.tip')"
		v-model="form.font"
		@input="onParamInput"
	></TextBox>
	<div class="text">{{ t('components.uiText-typeface.label') || 'Typeface' }}</div>
	<SelectBox
		ref="elTypeface"
		id="uiText-typeface"
		v-tip="t('components.uiText-typeface.tip')"
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
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { uiTextContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiTextContextKey)!;

const elDirection = ref<InstanceType<typeof SelectBox> | null>(null);
const elTypeface = ref<InstanceType<typeof SelectBox> | null>(null);
const elSizeSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elSize = ref<InstanceType<typeof NumberBox> | null>(null);
const elLineSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLineSpacing = ref<InstanceType<typeof NumberBox> | null>(null);
const elLetterSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLetterSpacing = ref<InstanceType<typeof NumberBox> | null>(null);

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

onMounted(() => {
	registerElement(inspectorEls, 'uiText-direction', elDirection.value);
	registerElement(inspectorEls, 'uiText-size', elSize.value);
	registerElement(inspectorEls, 'uiText-lineSpacing', elLineSpacing.value);
	registerElement(inspectorEls, 'uiText-letterSpacing', elLetterSpacing.value);
	registerElement(inspectorEls, 'uiText-typeface', elTypeface.value);
	registerElement(inspectorEls, 'uiText-size-slider', elSizeSlider.value);
	registerElement(inspectorEls, 'uiText-lineSpacing-slider', elLineSpacingSlider.value);
	registerElement(inspectorEls, 'uiText-letterSpacing-slider', elLetterSpacingSlider.value);
	elDirection.value?.loadItems([
		{
			name: t('components.uiText-direction.options.horizontal-tb.name'),
			tip: t('components.uiText-direction.options.horizontal-tb.tip'),
			value: 'horizontal-tb'
		},
		{
			name: t('components.uiText-direction.options.vertical-lr.name'),
			tip: t('components.uiText-direction.options.vertical-lr.tip'),
			value: 'vertical-lr'
		},
		{
			name: t('components.uiText-direction.options.vertical-rl.name'),
			tip: t('components.uiText-direction.options.vertical-rl.tip'),
			value: 'vertical-rl'
		}
	]);
	elTypeface.value?.loadItems([
		{
			name: t('components.uiText-typeface.options.regular.name'),
			tip: t('components.uiText-typeface.options.regular.tip'),
			value: 'regular'
		},
		{
			name: t('components.uiText-typeface.options.bold.name'),
			tip: t('components.uiText-typeface.options.bold.tip'),
			value: 'bold'
		},
		{
			name: t('components.uiText-typeface.options.italic.name'),
			tip: t('components.uiText-typeface.options.italic.tip'),
			value: 'italic'
		},
		{
			name: t('components.uiText-typeface.options.bold-italic.name'),
			tip: t('components.uiText-typeface.options.bold-italic.tip'),
			value: 'bold-italic'
		}
	]);
	synchronize(elSizeSlider.value, elSize.value);
	synchronize(elLineSpacingSlider.value, elLineSpacing.value);
	synchronize(elLetterSpacingSlider.value, elLetterSpacing.value);
});
</script>
