<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.uiImage-properties-grid.label') || 'Image Properties'
		}}</DetailSummary>
		<div class="detail-grid" id="uiImage-properties-grid">
			<div class="text">{{ t('components.uiImage-image.label') || 'Image' }}</div>
			<CustomBox
				id="uiImage-image"
				:ref="registryRef(inspectorEls, 'uiImage-image')"
				v-tip="t('components.uiImage-image.tip')"
				v-model="form.image"
				type="file"
				filter="image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiImage-display.label') || 'Display' }}</div>
			<SelectBox
				:label="t('components.uiImage-display.label') || 'Display'"
				ref="elDisplay"
				id="uiImage-display"
				v-tip="t('components.uiImage-display.tip')"
				v-model="form.display"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiImage-flip.label') || 'Flip' }}</div>
			<SelectBox
				:label="t('components.uiImage-flip.label') || 'Flip'"
				ref="elFlip"
				id="uiImage-flip"
				v-tip="t('components.uiImage-flip.tip')"
				v-model="form.flip"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiImage-blend.label') || 'Blend' }}</div>
			<SelectBox
				:label="t('components.uiImage-blend.label') || 'Blend'"
				ref="elBlend"
				id="uiImage-blend"
				v-tip="t('components.uiImage-blend.tip')"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiImage-shift-box.label') || 'Shift' }}</div>
			<div
				ref="elShiftBox"
				id="uiImage-shift-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiImage-shiftX"
					:ref="registryRef(inspectorEls, 'uiImage-shiftX')"
					v-tip="t('components.uiImage-shiftX.tip')"
					v-model="form.shiftX"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="uiImage-shiftY"
					:ref="registryRef(inspectorEls, 'uiImage-shiftY')"
					v-tip="t('components.uiImage-shiftY.tip')"
					v-model="form.shiftY"
					min="-10000"
					max="10000"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-clip.label') || 'Clip' }}</div>
			<CustomBox
				ref="elClip"
				id="uiImage-clip"
				v-tip="t('components.uiImage-clip.tip')"
				v-model="form.clip"
				type="clip"
				image="uiImage-image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.uiImage-border.label') || 'Border' }}</div>
			<NumberBox
				:label="t('components.uiImage-border.label') || 'Border'"
				ref="elBorder"
				id="uiImage-border"
				v-tip="t('components.uiImage-border.tip')"
				v-model="form.border"
				min="1"
				max="100"
				unit="px"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.uiImage-tint-0-box.label') || 'Tint - Red' }}</div>
			<div
				class="flex-box"
				id="uiImage-tint-0-box"
				v-tip="t('components.uiImage-tint-0-box.tip')"
			>
				<SliderBox
					ref="elTint0Slider"
					id="uiImage-tint-0-slider"
					v-model="form['tint-0']"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					:label="t('components.uiImage-tint-0-box.label') || 'Tint - Red'"
					ref="elTint0"
					id="uiImage-tint-0"
					v-model="form['tint-0']"
					min="-255"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-tint-1-box.label') || 'Tint - Green' }}</div>
			<div
				class="flex-box"
				id="uiImage-tint-1-box"
				v-tip="t('components.uiImage-tint-1-box.tip')"
			>
				<SliderBox
					ref="elTint1Slider"
					id="uiImage-tint-1-slider"
					v-model="form['tint-1']"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					:label="t('components.uiImage-tint-1-box.label') || 'Tint - Green'"
					ref="elTint1"
					id="uiImage-tint-1"
					v-model="form['tint-1']"
					min="-255"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.uiImage-tint-2-box.label') || 'Tint - Blue' }}</div>
			<div
				class="flex-box"
				id="uiImage-tint-2-box"
				v-tip="t('components.uiImage-tint-2-box.tip')"
			>
				<SliderBox
					ref="elTint2Slider"
					id="uiImage-tint-2-slider"
					v-model="form['tint-2']"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					:label="t('components.uiImage-tint-2-box.label') || 'Tint - Blue'"
					ref="elTint2"
					id="uiImage-tint-2"
					v-model="form['tint-2']"
					min="-255"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.uiImage-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div
				class="flex-box"
				id="uiImage-tint-3-box"
				v-tip="t('components.uiImage-tint-3-box.tip')"
			>
				<SliderBox
					ref="elTint3Slider"
					id="uiImage-tint-3-slider"
					v-model="form['tint-3']"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					:label="t('components.uiImage-tint-3-box.label') || 'Tint - Grayscale'"
					ref="elTint3"
					id="uiImage-tint-3"
					v-model="form['tint-3']"
					min="0"
					max="255"
					step="5"
					@input="onParamInput"
				></NumberBox>
			</div>
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import { uiImageContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiImageContextKey)!;

const elDisplay = ref<InstanceType<typeof SelectBox> | null>(null);
const elFlip = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elShiftBox = ref<HTMLElement | null>(null);
const elClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elBorder = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);

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
	registerElement(inspectorEls, 'uiImage-display', elDisplay.value);
	registerElement(inspectorEls, 'uiImage-flip', elFlip.value);
	registerElement(inspectorEls, 'uiImage-blend', elBlend.value);
	registerElement(inspectorEls, 'uiImage-clip', elClip.value);
	registerElement(inspectorEls, 'uiImage-border', elBorder.value);
	registerElement(inspectorEls, 'uiImage-tint-0', elTint0.value);
	registerElement(inspectorEls, 'uiImage-tint-1', elTint1.value);
	registerElement(inspectorEls, 'uiImage-tint-2', elTint2.value);
	registerElement(inspectorEls, 'uiImage-tint-3', elTint3.value);
	registerElement(inspectorEls, 'uiImage-tint-0-slider', elTint0Slider.value);
	registerElement(inspectorEls, 'uiImage-tint-1-slider', elTint1Slider.value);
	registerElement(inspectorEls, 'uiImage-tint-2-slider', elTint2Slider.value);
	registerElement(inspectorEls, 'uiImage-tint-3-slider', elTint3Slider.value);
	elDisplay.value?.loadItems([
		{
			name: t('components.uiImage-display.options.stretch.name'),
			tip: t('components.uiImage-display.options.stretch.tip'),
			value: 'stretch'
		},
		{
			name: t('components.uiImage-display.options.tile.name'),
			tip: t('components.uiImage-display.options.tile.tip'),
			value: 'tile'
		},
		{
			name: t('components.uiImage-display.options.clip.name'),
			tip: t('components.uiImage-display.options.clip.tip'),
			value: 'clip'
		},
		{
			name: t('components.uiImage-display.options.slice.name'),
			tip: t('components.uiImage-display.options.slice.tip'),
			value: 'slice'
		}
	]);
	elDisplay.value?.enableHiddenMode();
	elDisplay.value?.relate([
		{
			case: ['stretch', 'tile'],
			targets: [elFlip.value?.root ?? null, elShiftBox.value]
		},
		{
			case: 'clip',
			targets: [elFlip.value?.root ?? null, elClip.value?.root ?? null]
		},
		{
			case: 'slice',
			targets: [elClip.value?.root ?? null, elBorder.value?.root ?? null]
		}
	]);
	elFlip.value?.loadItems([
		{
			name: t('components.uiImage-flip.options.none.name'),
			tip: t('components.uiImage-flip.options.none.tip'),
			value: 'none'
		},
		{
			name: t('components.uiImage-flip.options.horizontal.name'),
			tip: t('components.uiImage-flip.options.horizontal.tip'),
			value: 'horizontal'
		},
		{
			name: t('components.uiImage-flip.options.vertical.name'),
			tip: t('components.uiImage-flip.options.vertical.tip'),
			value: 'vertical'
		},
		{
			name: t('components.uiImage-flip.options.both.name'),
			tip: t('components.uiImage-flip.options.both.tip'),
			value: 'both'
		}
	]);
	elBlend.value?.loadItems([
		{
			name: t('components.uiImage-blend.options.normal.name'),
			tip: t('components.uiImage-blend.options.normal.tip'),
			value: 'normal'
		},
		{
			name: t('components.uiImage-blend.options.additive.name'),
			tip: t('components.uiImage-blend.options.additive.tip'),
			value: 'additive'
		},
		{
			name: t('components.uiImage-blend.options.subtract.name'),
			tip: t('components.uiImage-blend.options.subtract.tip'),
			value: 'subtract'
		},
		{
			name: t('components.uiImage-blend.options.mask.name'),
			tip: t('components.uiImage-blend.options.mask.tip'),
			value: 'mask'
		}
	]);
	synchronize(elTint0Slider.value, elTint0.value);
	synchronize(elTint1Slider.value, elTint1.value);
	synchronize(elTint2Slider.value, elTint2.value);
	synchronize(elTint3Slider.value, elTint3.value);
});
</script>
