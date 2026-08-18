<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiText-properties-grid.label') || 'Text Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiText-properties-grid">
			<div class="text">{{ t('components.uiText-direction.label') || 'Direction' }}</div><SelectBox id="uiText-direction" v-model="form.direction" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiText-align-box.label') || 'Align' }}</div>
			<div class="flex-box" id="uiText-align-box">
				<RadioBox
					id="uiText-align-left"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-center"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-right"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-top"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-middle"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-bottom"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
			</div>
			<div class="text">{{ t('components.uiText-content.label') || 'Content' }}</div
			><TextArea
				id="uiText-content"
				v-model="form.content"
				menu="tag-global-var tag-dynamic-global-var tag-localization" @input="onParamInput"
			></TextArea>
			<div class="text">{{ t('components.uiText-size-box.label') || 'Size' }}</div>
			<div class="flex-box" id="uiText-size-box">
				<SliderBox
					id="uiText-size-slider"
					v-model="form.size"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiText-size"
					v-model="form.size"
					min="10"
					max="400"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiText-lineSpacing-box.label') || 'Line Spacing' }}</div>
			<div class="flex-box" id="uiText-lineSpacing-box">
				<SliderBox
					id="uiText-lineSpacing-slider"
					v-model="form.lineSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiText-lineSpacing"
					v-model="form.lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiText-letterSpacing-box.label') || 'Letter Spacing' }}</div>
			<div class="flex-box" id="uiText-letterSpacing-box">
				<SliderBox
					id="uiText-letterSpacing-slider"
					v-model="form.letterSpacing"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiText-letterSpacing"
					v-model="form.letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiText-color.label') || 'Color' }}</div><ColorBox id="uiText-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiText-font.label') || 'Font' }}</div><TextBox id="uiText-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiText-typeface.label') || 'Typeface' }}</div><SelectBox id="uiText-typeface" v-model="form.typeface" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiText-effect-type.label') || 'Effect' }}</div><SelectBox id="uiText-effect-type" v-model="form.effect.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiText-effect-shadowOffsetX.label') || 'Shadow X' }}</div
			><NumberBox
				id="uiText-effect-shadowOffsetX"
				v-model="form.effect.shadowOffsetX"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiText-effect-shadowOffsetY.label') || 'Shadow Y' }}</div
			><NumberBox
				id="uiText-effect-shadowOffsetY"
				v-model="form.effect.shadowOffsetY"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiText-effect-strokeWidth.label') || 'Stroke Width' }}</div
			><NumberBox
				id="uiText-effect-strokeWidth"
				v-model="form.effect.strokeWidth"
				min="1"
				max="20"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiText-effect-color.label') || 'Effect Color' }}</div
			><ColorBox id="uiText-effect-color" v-model="form.effect.color" @input="onParamInput"></ColorBox> <div class="text">{{ t('components.uiText-overflow.label') || 'Overflow' }}</div
			><SelectBox id="uiText-overflow" v-model="form.overflow" @input="onParamInput"></SelectBox> <div class="text">{{ t('components.uiText-blend.label') || 'Blend' }}</div
			><SelectBox id="uiText-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUITextPage } from '@app/composables/useUITextPage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useUITextPage();

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
	const uiText = Inspector.uiText;
	if (!uiText) return;

	loadItems('uiText-direction', [
		{ name: 'Horizontal - TB', value: 'horizontal-tb' },
		{ name: 'Vertical - LR', value: 'vertical-lr' },
		{ name: 'Vertical - RL', value: 'vertical-rl' }
	]);
	loadItems('uiText-typeface', [
		{ name: 'Regular', value: 'regular' },
		{ name: 'Bold', value: 'bold' },
		{ name: 'Italic', value: 'italic' },
		{ name: 'Bold Italic', value: 'bold-italic' }
	]);
	loadItems('uiText-effect-type', [
		{ name: 'None', value: 'none' },
		{ name: 'Shadow', value: 'shadow' },
		{ name: 'Stroke', value: 'stroke' },
		{ name: 'Outline', value: 'outline' }
	]);
	loadItems('uiText-overflow', [
		{ name: 'Visible', value: 'visible' },
		{ name: 'Wrap', value: 'wrap' },
		{ name: 'Truncate', value: 'truncate' },
		{ name: 'Wrap Truncate', value: 'wrap-truncate' }
	]);
	loadItems('uiText-blend', [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' }
	]);
	synchronize('uiText-size-slider', 'uiText-size');
	synchronize('uiText-lineSpacing-slider', 'uiText-lineSpacing');
	synchronize('uiText-letterSpacing-slider', 'uiText-letterSpacing');
	relate('uiText-effect-type', [
		{ case: 'shadow', targets: [document.getElementById('uiText-effect-shadowOffsetX'), document.getElementById('uiText-effect-shadowOffsetY'), document.getElementById('uiText-effect-color')] },
		{ case: 'stroke', targets: [document.getElementById('uiText-effect-strokeWidth'), document.getElementById('uiText-effect-color')] },
		{ case: 'outline', targets: [document.getElementById('uiText-effect-color')] }
	]);

	const elements = document.querySelectorAll(`#uiText-direction, #uiText-horizontalAlign, #uiText-verticalAlign,
    #uiText-content, #uiText-size, #uiText-lineSpacing, #uiText-letterSpacing, #uiText-color, #uiText-font,
    #uiText-typeface, #uiText-effect-type, #uiText-effect-shadowOffsetX, #uiText-effect-shadowOffsetY,
    #uiText-effect-strokeWidth, #uiText-effect-color, #uiText-overflow, #uiText-blend`);
	const sliders = document.querySelectorAll('#uiText-size-slider, #uiText-lineSpacing-slider, #uiText-letterSpacing-slider');
	(elements as unknown as HTMLElement[]).forEach((el) =>
		el.addEventListener('focus', Inspector.inputFocus)
	);
	if (Inspector.inputBlur) {
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(uiText, UI))
		);
	}
	if (Inspector.sliderFocus && Inspector.sliderBlur) {
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);
	}

	const el = document.getElementById('uiText-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
