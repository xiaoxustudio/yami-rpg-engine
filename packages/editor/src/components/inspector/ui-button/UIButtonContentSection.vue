<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiButton-text-properties-grid.label') || 'Text Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiButton-text-properties-grid">
			<div class="text">{{ t('components.uiButton-direction.label') || 'Direction' }}</div>
			<SelectBox
				id="uiButton-direction"
				v-tip="t('components.uiButton-direction.tip')"
				ref="elDirection"
				v-model="form.direction"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiButton-align-box.label') || 'Align' }}</div>
			<div class="flex-box" id="uiButton-align-box">
				<RadioBox
					id="uiButton-align-left"
					v-tip="t('components.uiButton-align-left.tip')"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-center"
					v-tip="t('components.uiButton-align-center.tip')"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-right"
					v-tip="t('components.uiButton-align-right.tip')"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-top"
					v-tip="t('components.uiButton-align-top.tip')"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-middle"
					v-tip="t('components.uiButton-align-middle.tip')"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-bottom"
					v-tip="t('components.uiButton-align-bottom.tip')"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
			</div>
			<div class="text">{{ t('components.uiButton-content.label') || 'Content' }}</div>
			<TextBox
				id="uiButton-content"
				:ref="registryRef(inspectorEls, 'uiButton-content')"
				v-tip="t('components.uiButton-content.tip')"
				v-model="form.content"
				@input="onParamInput"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></TextBox>
			<div class="text">{{ t('components.uiButton-size-box.label') || 'Size' }}</div>
			<div
				class="flex-box"
				id="uiButton-size-box"
				v-tip="t('components.uiButton-size-box.tip')"
			>
				<SliderBox
					id="uiButton-size-slider"
					ref="elSizeSlider"
					v-model="form.size"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-size"
					ref="elSize"
					v-model="form.size"
					@input="onParamInput"
					min="10"
					max="400"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiButton-letterSpacing-box.label') || 'Letter Spacing' }}
			</div>
			<div
				class="flex-box"
				id="uiButton-letterSpacing-box"
				v-tip="t('components.uiButton-letterSpacing-box.tip')"
			>
				<SliderBox
					id="uiButton-letterSpacing-slider"
					ref="elLetterSpacingSlider"
					v-model="form.letterSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiButton-letterSpacing"
					ref="elLetterSpacing"
					v-model="form.letterSpacing"
					@input="onParamInput"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiButton-textPadding-box.label') || 'Padding' }}
			</div>
			<div
				class="flex-box"
				id="uiButton-textPadding-box"
				v-tip="t('components.uiButton-textPadding-box.tip')"
			>
				<SliderBox
					id="uiButton-textPadding-slider"
					ref="elTextPaddingSlider"
					v-model="form.textPadding"
					min="0"
					max="40"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-textPadding"
					ref="elTextPadding"
					v-model="form.textPadding"
					@input="onParamInput"
					min="0"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-font.label') || 'Font' }}</div>
			<TextBox
				id="uiButton-font"
				:placeholder="t('components.uiButton-font.placeholder')"
				:ref="registryRef(inspectorEls, 'uiButton-font')"
				v-tip="t('components.uiButton-font.tip')"
				v-model="form.font"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.uiButton-typeface.label') || 'Typeface' }}</div>
			<SelectBox
				id="uiButton-typeface"
				v-tip="t('components.uiButton-typeface.tip')"
				ref="elTypeface"
				v-model="form.typeface"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiButton-textEffect-type.label') || 'Effect' }}</div>
			<SelectBox
				id="uiButton-textEffect-type"
				v-tip="t('components.uiButton-textEffect-type.tip')"
				ref="elTextEffectType"
				v-model="form.textEffect.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.uiButton-textEffect-shadowOffsetX.label') || 'Shadow X' }}
			</div>
			<NumberBox
				id="uiButton-textEffect-shadowOffsetX"
				v-tip="t('components.uiButton-textEffect-shadowOffsetX.tip')"
				ref="elShadowOffsetX"
				v-model="form.textEffect.shadowOffsetX"
				@input="onParamInput"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.uiButton-textEffect-shadowOffsetY.label') || 'Shadow Y' }}
			</div>
			<NumberBox
				id="uiButton-textEffect-shadowOffsetY"
				v-tip="t('components.uiButton-textEffect-shadowOffsetY.tip')"
				ref="elShadowOffsetY"
				v-model="form.textEffect.shadowOffsetY"
				@input="onParamInput"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.uiButton-textEffect-strokeWidth.label') || 'Stroke Width' }}
			</div>
			<NumberBox
				id="uiButton-textEffect-strokeWidth"
				v-tip="t('components.uiButton-textEffect-strokeWidth.tip')"
				ref="elStrokeWidth"
				v-model="form.textEffect.strokeWidth"
				@input="onParamInput"
				min="1"
				max="20"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.uiButton-textEffect-color.label') || 'Effect Color' }}
			</div>
			<ColorBox
				id="uiButton-textEffect-color"
				v-tip="t('components.uiButton-textEffect-color.tip')"
				ref="elEffectColor"
				v-model="form.textEffect.color"
				@input="onParamInput"
			></ColorBox>
			<div class="text">
				{{ t('components.uiButton-normalColor.label') || 'Normal Color' }}
			</div>
			<ColorBox
				id="uiButton-normalColor"
				:ref="registryRef(inspectorEls, 'uiButton-normalColor')"
				v-tip="t('components.uiButton-normalColor.tip')"
				v-model="form.normalColor"
				@input="onParamInput"
			></ColorBox>
			<div class="text">{{ t('components.uiButton-hoverColor.label') || 'Hover Color' }}</div>
			<ColorBox
				id="uiButton-hoverColor"
				:ref="registryRef(inspectorEls, 'uiButton-hoverColor')"
				v-tip="t('components.uiButton-hoverColor.tip')"
				v-model="form.hoverColor"
				@input="onParamInput"
			></ColorBox>
			<div class="text">
				{{ t('components.uiButton-activeColor.label') || 'Active Color' }}
			</div>
			<ColorBox
				id="uiButton-activeColor"
				:ref="registryRef(inspectorEls, 'uiButton-activeColor')"
				v-tip="t('components.uiButton-activeColor.tip')"
				v-model="form.activeColor"
				@input="onParamInput"
			></ColorBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { uiButtonContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiButtonContextKey)!;

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const loadItems = (el: InstanceType<typeof SelectBox> | null, items: unknown[]) => {
	el?.loadItems(items);
};

const relate = (
	el: InstanceType<typeof SelectBox> | null,
	config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
) => {
	if (el) {
		el.enableHiddenMode();
		el.relate(config);
	}
};

const synchronize = (
	slider: InstanceType<typeof SliderBox> | null,
	input: InstanceType<typeof NumberBox> | null
) => {
	slider?.synchronize(input?.root as SyncTarget);
};

const elDirection = ref<InstanceType<typeof SelectBox> | null>(null);
const elSizeSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elSize = ref<InstanceType<typeof NumberBox> | null>(null);
const elLetterSpacingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elLetterSpacing = ref<InstanceType<typeof NumberBox> | null>(null);
const elTextPaddingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTextPadding = ref<InstanceType<typeof NumberBox> | null>(null);
const elTypeface = ref<InstanceType<typeof SelectBox> | null>(null);
const elTextEffectType = ref<InstanceType<typeof SelectBox> | null>(null);
const elShadowOffsetX = ref<InstanceType<typeof NumberBox> | null>(null);
const elShadowOffsetY = ref<InstanceType<typeof NumberBox> | null>(null);
const elStrokeWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elEffectColor = ref<InstanceType<typeof ColorBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiButton-direction', elDirection.value);
	registerElement(inspectorEls, 'uiButton-size', elSize.value);
	registerElement(inspectorEls, 'uiButton-letterSpacing', elLetterSpacing.value);
	registerElement(inspectorEls, 'uiButton-textPadding', elTextPadding.value);
	registerElement(inspectorEls, 'uiButton-typeface', elTypeface.value);
	registerElement(inspectorEls, 'uiButton-textEffect-type', elTextEffectType.value);
	registerElement(inspectorEls, 'uiButton-textEffect-shadowOffsetX', elShadowOffsetX.value);
	registerElement(inspectorEls, 'uiButton-textEffect-shadowOffsetY', elShadowOffsetY.value);
	registerElement(inspectorEls, 'uiButton-textEffect-strokeWidth', elStrokeWidth.value);
	registerElement(inspectorEls, 'uiButton-textEffect-color', elEffectColor.value);
	registerElement(inspectorEls, 'uiButton-size-slider', elSizeSlider.value);
	registerElement(inspectorEls, 'uiButton-letterSpacing-slider', elLetterSpacingSlider.value);
	registerElement(inspectorEls, 'uiButton-textPadding-slider', elTextPaddingSlider.value);
	loadItems(elDirection.value, [
		{ name: 'Horizontal', value: 'horizontal-tb' },
		{ name: 'Vertical', value: 'vertical-lr' }
	]);
	loadItems(elTypeface.value, [
		{ name: 'Regular', value: 'regular' },
		{ name: 'Bold', value: 'bold' },
		{ name: 'Italic', value: 'italic' },
		{ name: 'Bold Italic', value: 'bold-italic' }
	]);
	loadItems(elTextEffectType.value, [
		{ name: 'None', value: 'none' },
		{ name: 'Shadow', value: 'shadow' },
		{ name: 'Stroke', value: 'stroke' },
		{ name: 'Outline', value: 'outline' }
	]);
	relate(elTextEffectType.value, [
		{
			case: 'shadow',
			targets: [
				elShadowOffsetX.value?.root ?? null,
				elShadowOffsetY.value?.root ?? null,
				elEffectColor.value?.root ?? null
			]
		},
		{
			case: 'stroke',
			targets: [elStrokeWidth.value?.root ?? null, elEffectColor.value?.root ?? null]
		},
		{ case: 'outline', targets: [elEffectColor.value?.root ?? null] }
	]);
	synchronize(elSizeSlider.value, elSize.value);
	synchronize(elLetterSpacingSlider.value, elLetterSpacing.value);
	synchronize(elTextPaddingSlider.value, elTextPadding.value);
});
</script>
