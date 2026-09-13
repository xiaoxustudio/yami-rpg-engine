<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiButton-image-properties-grid.label') || 'Image Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiButton-image-properties-grid">
			<div class="text">{{ t('components.uiButton-display.label') || 'Display' }}</div>
			<SelectBox
				id="uiButton-display"
				v-tip="t('components.uiButton-display.tip')"
				ref="elDisplay"
				v-model="form.display"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.uiButton-normalImage.label') || 'Normal Image' }}
			</div>
			<CustomBox
				id="uiButton-normalImage"
				:ref="registryRef(inspectorEls, 'uiButton-normalImage')"
				v-tip="t('components.uiButton-normalImage.tip')"
				:model-value="form.normalImage"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-normalClip.label') || 'Normal Clip' }}</div>
			<CustomBox
				id="uiButton-normalClip"
				v-tip="t('components.uiButton-normalClip.tip')"
				ref="elNormalClip"
				:model-value="form.normalClip"
				@input="onParamInput"
				type="clip"
				image="uiButton-normalImage"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-hoverImage.label') || 'Hover Image' }}</div>
			<CustomBox
				id="uiButton-hoverImage"
				:ref="registryRef(inspectorEls, 'uiButton-hoverImage')"
				v-tip="t('components.uiButton-hoverImage.tip')"
				:model-value="form.hoverImage"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-hoverClip.label') || 'Hover Clip' }}</div>
			<CustomBox
				id="uiButton-hoverClip"
				v-tip="t('components.uiButton-hoverClip.tip')"
				ref="elHoverClip"
				:model-value="form.hoverClip"
				@input="onParamInput"
				type="clip"
				image="uiButton-hoverImage"
			></CustomBox>
			<div class="text">
				{{ t('components.uiButton-activeImage.label') || 'Active Image' }}
			</div>
			<CustomBox
				id="uiButton-activeImage"
				:ref="registryRef(inspectorEls, 'uiButton-activeImage')"
				v-tip="t('components.uiButton-activeImage.tip')"
				:model-value="form.activeImage"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-activeClip.label') || 'Active Clip' }}</div>
			<CustomBox
				id="uiButton-activeClip"
				v-tip="t('components.uiButton-activeClip.tip')"
				ref="elActiveClip"
				:model-value="form.activeClip"
				@input="onParamInput"
				type="clip"
				image="uiButton-activeImage"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-flip.label') || 'Flip' }}</div>
			<SelectBox id="uiButton-flip"
				v-tip="t('components.uiButton-flip.tip')" ref="elFlip" v-model="form.flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-border.label') || 'Border' }}</div>
			<NumberBox
				id="uiButton-border"
				v-tip="t('components.uiButton-border.tip')"
				ref="elBorder"
				v-model="form.border"
				@input="onParamInput"
				min="1"
				max="100"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.uiButton-imagePadding-box.label') || 'Padding' }}
			</div>
			<div class="flex-box" id="uiButton-imagePadding-box"
				v-tip="t('components.uiButton-imagePadding-box.tip')">
				<SliderBox
				id="uiButton-imagePadding-slider"
				ref="elImagePaddingSlider"
				v-model="form.imagePadding"
					min="0"
					max="20"
				></SliderBox>
				<NumberBox
					id="uiButton-imagePadding"
					ref="elImagePadding"
					v-model="form.imagePadding"
					@input="onParamInput"
					min="0"
					max="100"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiButton-imageOpacity-box.label') || 'Opacity' }}
			</div>
			<div class="flex-box" id="uiButton-imageOpacity-box"
				v-tip="t('components.uiButton-imageOpacity-box.tip')">
				<SliderBox
				id="uiButton-imageOpacity-slider"
				ref="elImageOpacitySlider"
				v-model="form.imageOpacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="uiButton-imageOpacity"
					ref="elImageOpacity"
					v-model="form.imageOpacity"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-imageEffect.label') || 'Effect' }}</div>
			<SelectBox
				id="uiButton-imageEffect"
				v-tip="t('components.uiButton-imageEffect.tip')"
				ref="elImageEffect"
				v-model="form.imageEffect"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.uiButton-normalTint-box.label') || 'Normal Tint' }}
			</div>
			<div id="uiButton-normalTint-box"
				v-tip="t('components.uiButton-normalTint-box.tip')" ref="elNormalTintBox" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="uiButton-normalTint-0"
				:ref="registryRef(inspectorEls, 'uiButton-normalTint-0')"
					v-model="form.normalTint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-1"
				:ref="registryRef(inspectorEls, 'uiButton-normalTint-1')"
					v-model="form.normalTint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-2"
				:ref="registryRef(inspectorEls, 'uiButton-normalTint-2')"
					v-model="form.normalTint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-3"
				:ref="registryRef(inspectorEls, 'uiButton-normalTint-3')"
					v-model="form.normalTint[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiButton-hoverTint-box.label') || 'Hover Tint' }}
			</div>
			<div id="uiButton-hoverTint-box"
				v-tip="t('components.uiButton-hoverTint-box.tip')" ref="elHoverTintBox" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="uiButton-hoverTint-0"
				:ref="registryRef(inspectorEls, 'uiButton-hoverTint-0')"
					v-model="form.hoverTint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-1"
				:ref="registryRef(inspectorEls, 'uiButton-hoverTint-1')"
					v-model="form.hoverTint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-2"
				:ref="registryRef(inspectorEls, 'uiButton-hoverTint-2')"
					v-model="form.hoverTint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-3"
				:ref="registryRef(inspectorEls, 'uiButton-hoverTint-3')"
					v-model="form.hoverTint[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiButton-activeTint-box.label') || 'Active Tint' }}
			</div>
			<div id="uiButton-activeTint-box"
				v-tip="t('components.uiButton-activeTint-box.tip')" ref="elActiveTintBox" class="box uiElement-grid-box with-4-columns">
				<NumberBox
					id="uiButton-activeTint-0"
				:ref="registryRef(inspectorEls, 'uiButton-activeTint-0')"
					v-model="form.activeTint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-1"
				:ref="registryRef(inspectorEls, 'uiButton-activeTint-1')"
					v-model="form.activeTint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-2"
				:ref="registryRef(inspectorEls, 'uiButton-activeTint-2')"
					v-model="form.activeTint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-3"
				:ref="registryRef(inspectorEls, 'uiButton-activeTint-3')"
					v-model="form.activeTint[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
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
			<div class="flex-box" id="uiButton-size-box"
				v-tip="t('components.uiButton-size-box.tip')">
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
			<div class="flex-box" id="uiButton-letterSpacing-box"
				v-tip="t('components.uiButton-letterSpacing-box.tip')">
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
			<div class="flex-box" id="uiButton-textPadding-box"
				v-tip="t('components.uiButton-textPadding-box.tip')">
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
			<TextBox id="uiButton-font"
			:placeholder="t('components.uiButton-font.placeholder')"
				:ref="registryRef(inspectorEls, 'uiButton-font')"
				v-tip="t('components.uiButton-font.tip')" v-model="form.font" @input="onParamInput"></TextBox>
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
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiButton-sound-effects-grid.label') || 'Sound Effects'
		}}</DetailSummary>
		<div class="detail-grid" id="uiButton-sound-effects-grid">
			<div class="text">{{ t('components.uiButton-hoverSound.label') || 'Hover SE' }}</div>
			<CustomBox
				id="uiButton-hoverSound"
				:ref="registryRef(inspectorEls, 'uiButton-hoverSound')"
				v-tip="t('components.uiButton-hoverSound.tip')"
				:model-value="form.hoverSound"
				@input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-clickSound.label') || 'Click SE' }}</div>
			<CustomBox
				id="uiButton-clickSound"
				:ref="registryRef(inspectorEls, 'uiButton-clickSound')"
				v-tip="t('components.uiButton-clickSound.tip')"
				:model-value="form.clickSound"
				@input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { registryElements, registerElement, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useUIButtonPage } from '@app/composables/useUIButtonPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useUIButtonPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elDisplay = ref<InstanceType<typeof SelectBox> | null>(null);
const elFlip = ref<InstanceType<typeof SelectBox> | null>(null);
const elNormalClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elHoverClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elActiveClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elBorder = ref<InstanceType<typeof NumberBox> | null>(null);
const elImagePaddingSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elImagePadding = ref<InstanceType<typeof NumberBox> | null>(null);
const elImageOpacitySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elImageOpacity = ref<InstanceType<typeof NumberBox> | null>(null);
const elImageEffect = ref<InstanceType<typeof SelectBox> | null>(null);
const elNormalTintBox = ref<HTMLElement | null>(null);
const elHoverTintBox = ref<HTMLElement | null>(null);
const elActiveTintBox = ref<HTMLElement | null>(null);
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

onMounted(() => {
	// P1b：以下控件的 :ref 槽位已被具名 ref 占用 → 命令式登记（页面内批量绑定焦点/滑杆用）
	registerElement(inspectorEls, 'uiButton-display', elDisplay.value);
	registerElement(inspectorEls, 'uiButton-normalClip', elNormalClip.value);
	registerElement(inspectorEls, 'uiButton-hoverClip', elHoverClip.value);
	registerElement(inspectorEls, 'uiButton-activeClip', elActiveClip.value);
	registerElement(inspectorEls, 'uiButton-flip', elFlip.value);
	registerElement(inspectorEls, 'uiButton-border', elBorder.value);
	registerElement(inspectorEls, 'uiButton-imagePadding', elImagePadding.value);
	registerElement(inspectorEls, 'uiButton-imageOpacity', elImageOpacity.value);
	registerElement(inspectorEls, 'uiButton-imageEffect', elImageEffect.value);
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
	registerElement(inspectorEls, 'uiButton-imagePadding-slider', elImagePaddingSlider.value);
	registerElement(inspectorEls, 'uiButton-imageOpacity-slider', elImageOpacitySlider.value);
	registerElement(inspectorEls, 'uiButton-size-slider', elSizeSlider.value);
	registerElement(inspectorEls, 'uiButton-letterSpacing-slider', elLetterSpacingSlider.value);
	registerElement(inspectorEls, 'uiButton-textPadding-slider', elTextPaddingSlider.value);
	const uiButton = Inspector.uiButton;
	if (!uiButton) return;

	loadItems(elDisplay.value, [
		{ name: 'Stretch', value: 'stretch' },
		{ name: 'Tile', value: 'tile' },
		{ name: 'Clip', value: 'clip' },
		{ name: 'Slice', value: 'slice' }
	]);
	relate(elDisplay.value, [
		{ case: ['stretch', 'tile'], targets: [elFlip.value?.root ?? null] },
		{
			case: 'clip',
			targets: [
				elFlip.value?.root ?? null,
				elNormalClip.value?.root ?? null,
				elHoverClip.value?.root ?? null,
				elActiveClip.value?.root ?? null
			]
		},
		{
			case: 'slice',
			targets: [
				elNormalClip.value?.root ?? null,
				elHoverClip.value?.root ?? null,
				elActiveClip.value?.root ?? null,
				elBorder.value?.root ?? null
			]
		}
	]);

	loadItems(elFlip.value, [
		{ name: 'None', value: 'none' },
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Both', value: 'both' }
	]);
	loadItems(elImageEffect.value, [
		{ name: 'None', value: 'none' },
		{ name: 'Tint', value: 'tint-1' },
		{ name: 'Tint (Normal, Hover)', value: 'tint-2' },
		{ name: 'Tint (Normal, Hover, Active)', value: 'tint-3' }
	]);
	relate(elImageEffect.value, [
		{ case: 'tint-1', targets: [elNormalTintBox.value] },
		{
			case: 'tint-2',
			targets: [elNormalTintBox.value, elHoverTintBox.value]
		},
		{
			case: 'tint-3',
			targets: [elNormalTintBox.value, elHoverTintBox.value, elActiveTintBox.value]
		}
	]);
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

	synchronize(elImagePaddingSlider.value, elImagePadding.value);
	synchronize(elImageOpacitySlider.value, elImageOpacity.value);
	synchronize(elSizeSlider.value, elSize.value);
	synchronize(elLetterSpacingSlider.value, elLetterSpacing.value);
	synchronize(elTextPaddingSlider.value, elTextPadding.value);

	const elements = registryElements(inspectorEls, [
		'uiButton-display',
		'uiButton-normalImage',
		'uiButton-normalClip',
		'uiButton-hoverImage',
		'uiButton-hoverClip',
		'uiButton-activeImage',
		'uiButton-activeClip',
		'uiButton-flip',
		'uiButton-border',
		'uiButton-imagePadding',
		'uiButton-imageOpacity',
		'uiButton-imageEffect',
		'uiButton-normalTint-0',
		'uiButton-normalTint-1',
		'uiButton-normalTint-2',
		'uiButton-normalTint-3',
		'uiButton-hoverTint-0',
		'uiButton-hoverTint-1',
		'uiButton-hoverTint-2',
		'uiButton-hoverTint-3',
		'uiButton-activeTint-0',
		'uiButton-activeTint-1',
		'uiButton-activeTint-2',
		'uiButton-activeTint-3',
		'uiButton-direction',
		'uiButton-horizontalAlign',
		'uiButton-verticalAlign',
		'uiButton-content',
		'uiButton-size',
		'uiButton-letterSpacing',
		'uiButton-textPadding',
		'uiButton-font',
		'uiButton-typeface',
		'uiButton-textEffect-type',
		'uiButton-textEffect-shadowOffsetX',
		'uiButton-textEffect-shadowOffsetY',
		'uiButton-textEffect-strokeWidth',
		'uiButton-textEffect-color',
		'uiButton-normalColor',
		'uiButton-hoverColor',
		'uiButton-activeColor',
		'uiButton-hoverSound',
		'uiButton-clickSound'
	]);
	const sliders =
		registryElements(inspectorEls, [
		'uiButton-imagePadding-slider',
		'uiButton-imageOpacity-slider',
		'uiButton-size-slider',
		'uiButton-letterSpacing-slider',
		'uiButton-textPadding-slider'
	]);
	bindInput(elements, uiButton, UI);
	bindSliders(sliders);

	const el = inspectorEls.get('uiButton-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}
	sync();
});
</script>
