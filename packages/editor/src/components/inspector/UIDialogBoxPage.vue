<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.uiDialogBox-properties-grid.label') || 'DialogBox Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiDialogBox-properties-grid">
			<div class="text">{{ t('components.uiDialogBox-content.label') || 'Content' }}</div
			><TextArea
				id="uiDialogBox-content"
				:model-value="form.content"
				menu="tag-localization" @input="onParamInput"
			></TextArea>
			<div class="text">{{ t('components.uiDialogBox-interval.label') || 'Print Interval' }}</div
			><NumberBox
				id="uiDialogBox-interval"
				v-model="form.interval"
				min="0"
				max="100"
				decimals="4"
				unit="ms" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiDialogBox-size-box.label') || 'Size' }}</div>
			<div class="flex-box" id="uiDialogBox-size-box">
				<SliderBox
					id="uiDialogBox-size-slider"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiDialogBox-size"
					v-model="form.size"
					min="10"
					max="400"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiDialogBox-lineSpacing-box.label') || 'Line Spacing' }}</div>
			<div class="flex-box" id="uiDialogBox-lineSpacing-box">
				<SliderBox
					id="uiDialogBox-lineSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiDialogBox-lineSpacing"
					v-model="form.lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiDialogBox-letterSpacing-box.label') || 'Letter Spacing' }}</div>
			<div class="flex-box" id="uiDialogBox-letterSpacing-box">
				<SliderBox
					id="uiDialogBox-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiDialogBox-letterSpacing"
					v-model="form.letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiDialogBox-color.label') || 'Color' }}</div><ColorBox id="uiDialogBox-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.uiDialogBox-font.label') || 'Font' }}</div><TextBox id="uiDialogBox-font" v-model="form.font" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.uiDialogBox-typeface.label') || 'Typeface' }}</div><SelectBox id="uiDialogBox-typeface" v-model="form.typeface" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiDialogBox-effect-type.label') || 'Effect' }}</div
			><SelectBox id="uiDialogBox-effect-type" v-model="form.effect.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.uiDialogBox-effect-shadowOffsetX.label') || 'Shadow X' }}</div
			><NumberBox
				id="uiDialogBox-effect-shadowOffsetX"
				v-model="form.effect.shadowOffsetX"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiDialogBox-effect-shadowOffsetY.label') || 'Shadow Y' }}</div
			><NumberBox
				id="uiDialogBox-effect-shadowOffsetY"
				v-model="form.effect.shadowOffsetY"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiDialogBox-effect-strokeWidth.label') || 'Stroke Width' }}</div
			><NumberBox
				id="uiDialogBox-effect-strokeWidth"
				v-model="form.effect.strokeWidth"
				min="1"
				max="20"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiDialogBox-effect-color.label') || 'Effect Color' }}</div
			><ColorBox id="uiDialogBox-effect-color" v-model="form.effect.color" @input="onParamInput"></ColorBox> <div class="text">{{ t('components.uiDialogBox-blend.label') || 'Blend' }}</div
			><SelectBox id="uiDialogBox-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUIDialogBoxPage } from '@app/composables/useUIDialogBoxPage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useUIDialogBoxPage();

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
	const uiDialogBox = Inspector.uiDialogBox;
	if (!uiDialogBox) return;

	loadItems('uiDialogBox-typeface', [
		{ name: 'Regular', value: 'regular' },
		{ name: 'Bold', value: 'bold' },
		{ name: 'Italic', value: 'italic' },
		{ name: 'Bold Italic', value: 'bold-italic' }
	]);
	loadItems('uiDialogBox-effect-type', [
		{ name: 'None', value: 'none' },
		{ name: 'Shadow', value: 'shadow' },
		{ name: 'Stroke', value: 'stroke' },
		{ name: 'Outline', value: 'outline' }
	]);
	loadItems('uiDialogBox-blend', [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' }
	]);
	synchronize('uiDialogBox-size-slider', 'uiDialogBox-size');
	synchronize('uiDialogBox-lineSpacing-slider', 'uiDialogBox-lineSpacing');
	synchronize('uiDialogBox-letterSpacing-slider', 'uiDialogBox-letterSpacing');
	relate('uiDialogBox-effect-type', [
		{ case: 'shadow', targets: [document.getElementById('uiDialogBox-effect-shadowOffsetX'), document.getElementById('uiDialogBox-effect-shadowOffsetY'), document.getElementById('uiDialogBox-effect-color')] },
		{ case: 'stroke', targets: [document.getElementById('uiDialogBox-effect-strokeWidth'), document.getElementById('uiDialogBox-effect-color')] },
		{ case: 'outline', targets: [document.getElementById('uiDialogBox-effect-color')] }
	]);

	const elements = document.querySelectorAll(`#uiDialogBox-content, #uiDialogBox-interval, #uiDialogBox-size,
    #uiDialogBox-lineSpacing, #uiDialogBox-letterSpacing, #uiDialogBox-color, #uiDialogBox-font,
    #uiDialogBox-typeface, #uiDialogBox-effect-type, #uiDialogBox-effect-shadowOffsetX, #uiDialogBox-effect-shadowOffsetY,
    #uiDialogBox-effect-strokeWidth, #uiDialogBox-effect-color, #uiDialogBox-blend`);
	const sliders = document.querySelectorAll('#uiDialogBox-size-slider, #uiDialogBox-lineSpacing-slider, #uiDialogBox-letterSpacing-slider');
	(elements as unknown as HTMLElement[]).forEach((el) =>
		el.addEventListener('focus', Inspector.inputFocus)
	);
	if (Inspector.inputBlur) {
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(uiDialogBox, UI))
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

	const el = document.getElementById('uiDialogBox-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
