<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiButton-image-properties-grid.label') || 'Image Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-image-properties-grid">
			<div class="text">{{ t('components.uiButton-display.label') || 'Display' }}</div><SelectBox id="uiButton-display" v-model="form.display" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-normalImage.label') || 'Normal Image' }}</div
			><CustomBox
				id="uiButton-normalImage" :model-value="form.normalImage" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-normalClip.label') || 'Normal Clip' }}</div
			><CustomBox
				id="uiButton-normalClip" :model-value="form.normalClip" @input="onParamInput"
				type="clip"
				image="uiButton-normalImage"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-hoverImage.label') || 'Hover Image' }}</div
			><CustomBox
				id="uiButton-hoverImage" :model-value="form.hoverImage" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-hoverClip.label') || 'Hover Clip' }}</div
			><CustomBox
				id="uiButton-hoverClip" :model-value="form.hoverClip" @input="onParamInput"
				type="clip"
				image="uiButton-hoverImage"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-activeImage.label') || 'Active Image' }}</div
			><CustomBox
				id="uiButton-activeImage" :model-value="form.activeImage" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-activeClip.label') || 'Active Clip' }}</div
			><CustomBox
				id="uiButton-activeClip" :model-value="form.activeClip" @input="onParamInput"
				type="clip"
				image="uiButton-activeImage"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-flip.label') || 'Flip' }}</div><SelectBox id="uiButton-flip" v-model="form.flip" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-border.label') || 'Border' }}</div
			><NumberBox
				id="uiButton-border" v-model="form.border" @input="onParamInput"
				min="1"
				max="100"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.uiButton-imagePadding-box.label') || 'Padding' }}</div>
			<div class="flex-box" id="uiButton-imagePadding-box">
				<SliderBox
					id="uiButton-imagePadding-slider"
					v-model="form.imagePadding"
					min="0"
					max="20"
				></SliderBox>
				<NumberBox
					id="uiButton-imagePadding" v-model="form.imagePadding" @input="onParamInput"
					min="0"
					max="100"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-imageOpacity-box.label') || 'Opacity' }}</div>
			<div class="flex-box" id="uiButton-imageOpacity-box">
				<SliderBox
					id="uiButton-imageOpacity-slider"
					v-model="form.imageOpacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="uiButton-imageOpacity" v-model="form.imageOpacity" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-imageEffect.label') || 'Effect' }}</div><SelectBox id="uiButton-imageEffect" v-model="form.imageEffect" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-normalTint-box.label') || 'Normal Tint' }}</div>
			<div
				id="uiButton-normalTint-box"
				class="box uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-normalTint-0" v-model="form.normalTint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-1" v-model="form.normalTint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-2" v-model="form.normalTint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-3" v-model="form.normalTint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-hoverTint-box.label') || 'Hover Tint' }}</div>
			<div
				id="uiButton-hoverTint-box"
				class="box uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-hoverTint-0" v-model="form.hoverTint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-1" v-model="form.hoverTint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-2" v-model="form.hoverTint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-3" v-model="form.hoverTint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-activeTint-box.label') || 'Active Tint' }}</div>
			<div
				id="uiButton-activeTint-box"
				class="box uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-activeTint-0" v-model="form.activeTint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-1" v-model="form.activeTint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-2" v-model="form.activeTint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-3" v-model="form.activeTint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiButton-text-properties-grid.label') || 'Text Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-text-properties-grid">
			<div class="text">{{ t('components.uiButton-direction.label') || 'Direction' }}</div><SelectBox id="uiButton-direction" v-model="form.direction" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-align-box.label') || 'Align' }}</div>
			<div class="flex-box" id="uiButton-align-box">
				<RadioBox
					id="uiButton-align-left"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-center"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-right"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-top"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-middle"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiButton-align-bottom"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
			</div>
			<div class="text">{{ t('components.uiButton-content.label') || 'Content' }}</div
			><TextBox
				id="uiButton-content" v-model="form.content" @input="onParamInput"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></TextBox>
			<div class="text">{{ t('components.uiButton-size-box.label') || 'Size' }}</div>
			<div class="flex-box" id="uiButton-size-box">
				<SliderBox
					id="uiButton-size-slider"
					v-model="form.size"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-size" v-model="form.size" @input="onParamInput"
					min="10"
					max="400"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-letterSpacing-box.label') || 'Letter Spacing' }}</div>
			<div class="flex-box" id="uiButton-letterSpacing-box">
				<SliderBox
					id="uiButton-letterSpacing-slider"
					v-model="form.letterSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiButton-letterSpacing" v-model="form.letterSpacing" @input="onParamInput"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-textPadding-box.label') || 'Padding' }}</div>
			<div class="flex-box" id="uiButton-textPadding-box">
				<SliderBox
					id="uiButton-textPadding-slider"
					v-model="form.textPadding"
					min="0"
					max="40"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-textPadding" v-model="form.textPadding" @input="onParamInput"
					min="0"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiButton-font.label') || 'Font' }}</div><TextBox id="uiButton-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiButton-typeface.label') || 'Typeface' }}</div><SelectBox id="uiButton-typeface" v-model="form.typeface" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-textEffect-type.label') || 'Effect' }}</div
			><SelectBox id="uiButton-textEffect-type" v-model="form.textEffect.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiButton-textEffect-shadowOffsetX.label') || 'Shadow X' }}</div
			><NumberBox
				id="uiButton-textEffect-shadowOffsetX" v-model="form.textEffect.shadowOffsetX" @input="onParamInput"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.uiButton-textEffect-shadowOffsetY.label') || 'Shadow Y' }}</div
			><NumberBox
				id="uiButton-textEffect-shadowOffsetY" v-model="form.textEffect.shadowOffsetY" @input="onParamInput"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.uiButton-textEffect-strokeWidth.label') || 'Stroke Width' }}</div
			><NumberBox
				id="uiButton-textEffect-strokeWidth" v-model="form.textEffect.strokeWidth" @input="onParamInput"
				min="1"
				max="20"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.uiButton-textEffect-color.label') || 'Effect Color' }}</div
			><ColorBox id="uiButton-textEffect-color" v-model="form.textEffect.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiButton-normalColor.label') || 'Normal Color' }}</div
			><ColorBox id="uiButton-normalColor" v-model="form.normalColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiButton-hoverColor.label') || 'Hover Color' }}</div><ColorBox id="uiButton-hoverColor" v-model="form.hoverColor" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiButton-activeColor.label') || 'Active Color' }}</div
			><ColorBox id="uiButton-activeColor" v-model="form.activeColor" @input="onParamInput"></ColorBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiButton-sound-effects-grid.label') || 'Sound Effects' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-sound-effects-grid">
			<div class="text">{{ t('components.uiButton-hoverSound.label') || 'Hover SE' }}</div
			><CustomBox
				id="uiButton-hoverSound" :model-value="form.hoverSound" @input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
			<div class="text">{{ t('components.uiButton-clickSound.label') || 'Click SE' }}</div
			><CustomBox
				id="uiButton-clickSound" :model-value="form.clickSound" @input="onParamInput"
				type="file"
				filter="audio"
			></CustomBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIButtonPage } from '@app/composables/useUIButtonPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
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

const { form, sync, onParamInput } = useUIButtonPage();

const { bindInput, bindSliders } = useInspectorInput();

const loadItems = (id: string, items: { name: string; value: string }[]) => {
	const el = document.getElementById(id) as unknown as { loadItems?: (items: { name: string; value: string }[]) => void } | null;
	el?.loadItems?.(items);
};

const relate = (id: string, config: { case: string | string[]; targets: (HTMLElement | null)[] }[]) => {
	const el = document.getElementById(id) as unknown as { enableHiddenMode?: () => { relate: (config: { case: string | string[]; targets: (HTMLElement | null)[] }[]) => void } } | null;
	if (el) el.enableHiddenMode()?.relate(config);
};

const synchronize = (sliderId: string, inputId: string) => {
	const slider = document.getElementById(sliderId) as unknown as { synchronize?: (el: HTMLElement | null) => void } | null;
	const input = document.getElementById(inputId);
	slider?.synchronize?.(input);
};

onMounted(() => {
	const uiButton = Inspector.uiButton;
	if (!uiButton) return;

	loadItems('uiButton-display', [
		{ name: 'Stretch', value: 'stretch' },
		{ name: 'Tile', value: 'tile' },
		{ name: 'Clip', value: 'clip' },
		{ name: 'Slice', value: 'slice' }
	]);
	relate('uiButton-display', [
		{ case: ['stretch', 'tile'], targets: [document.getElementById('uiButton-flip')] },
		{ case: 'clip', targets: [
			document.getElementById('uiButton-flip'),
			document.getElementById('uiButton-normalClip'),
			document.getElementById('uiButton-hoverClip'),
			document.getElementById('uiButton-activeClip')
		]},
		{ case: 'slice', targets: [
			document.getElementById('uiButton-normalClip'),
			document.getElementById('uiButton-hoverClip'),
			document.getElementById('uiButton-activeClip'),
			document.getElementById('uiButton-border')
		]}
	]);

	loadItems('uiButton-flip', [
		{ name: 'None', value: 'none' },
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Both', value: 'both' }
	]);
	loadItems('uiButton-imageEffect', [
		{ name: 'None', value: 'none' },
		{ name: 'Tint', value: 'tint-1' },
		{ name: 'Tint (Normal, Hover)', value: 'tint-2' },
		{ name: 'Tint (Normal, Hover, Active)', value: 'tint-3' }
	]);
	relate('uiButton-imageEffect', [
		{ case: 'tint-1', targets: [document.getElementById('uiButton-normalTint-box')] },
		{ case: 'tint-2', targets: [document.getElementById('uiButton-normalTint-box'), document.getElementById('uiButton-hoverTint-box')] },
		{ case: 'tint-3', targets: [
			document.getElementById('uiButton-normalTint-box'),
			document.getElementById('uiButton-hoverTint-box'),
			document.getElementById('uiButton-activeTint-box')
		]}
	]);
	loadItems('uiButton-direction', [
		{ name: 'Horizontal', value: 'horizontal-tb' },
		{ name: 'Vertical', value: 'vertical-lr' }
	]);
	loadItems('uiButton-typeface', [
		{ name: 'Regular', value: 'regular' },
		{ name: 'Bold', value: 'bold' },
		{ name: 'Italic', value: 'italic' },
		{ name: 'Bold Italic', value: 'bold-italic' }
	]);
	loadItems('uiButton-textEffect-type', [
		{ name: 'None', value: 'none' },
		{ name: 'Shadow', value: 'shadow' },
		{ name: 'Stroke', value: 'stroke' },
		{ name: 'Outline', value: 'outline' }
	]);
	relate('uiButton-textEffect-type', [
		{ case: 'shadow', targets: [
			document.getElementById('uiButton-textEffect-shadowOffsetX'),
			document.getElementById('uiButton-textEffect-shadowOffsetY'),
			document.getElementById('uiButton-textEffect-color')
		]},
		{ case: 'stroke', targets: [
			document.getElementById('uiButton-textEffect-strokeWidth'),
			document.getElementById('uiButton-textEffect-color')
		]},
		{ case: 'outline', targets: [document.getElementById('uiButton-textEffect-color')] }
	]);

	synchronize('uiButton-imagePadding-slider', 'uiButton-imagePadding');
	synchronize('uiButton-imageOpacity-slider', 'uiButton-imageOpacity');
	synchronize('uiButton-size-slider', 'uiButton-size');
	synchronize('uiButton-letterSpacing-slider', 'uiButton-letterSpacing');
	synchronize('uiButton-textPadding-slider', 'uiButton-textPadding');

	const elements = document.querySelectorAll(`#uiButton-display,
    #uiButton-normalImage, #uiButton-normalClip,
    #uiButton-hoverImage, #uiButton-hoverClip,
    #uiButton-activeImage, #uiButton-activeClip,
    #uiButton-flip, #uiButton-border, #uiButton-imagePadding, #uiButton-imageOpacity, #uiButton-imageEffect,
    #uiButton-normalTint-0, #uiButton-normalTint-1, #uiButton-normalTint-2, #uiButton-normalTint-3,
    #uiButton-hoverTint-0, #uiButton-hoverTint-1, #uiButton-hoverTint-2, #uiButton-hoverTint-3,
    #uiButton-activeTint-0, #uiButton-activeTint-1, #uiButton-activeTint-2, #uiButton-activeTint-3,
    #uiButton-direction, #uiButton-horizontalAlign, #uiButton-verticalAlign,
    #uiButton-content, #uiButton-size, #uiButton-letterSpacing, #uiButton-textPadding,
    #uiButton-font, #uiButton-typeface, #uiButton-textEffect-type, #uiButton-textEffect-shadowOffsetX,
    #uiButton-textEffect-shadowOffsetY, #uiButton-textEffect-strokeWidth, #uiButton-textEffect-color,
    #uiButton-normalColor, #uiButton-hoverColor, #uiButton-activeColor,
    #uiButton-hoverSound, #uiButton-clickSound`);
	const sliders = document.querySelectorAll(`#uiButton-imagePadding-slider, #uiButton-imageOpacity-slider,
    #uiButton-size-slider, #uiButton-letterSpacing-slider, #uiButton-textPadding-slider`);
	bindInput(elements, uiButton, UI);
	bindSliders(sliders);

	const el = document.getElementById('uiButton-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
