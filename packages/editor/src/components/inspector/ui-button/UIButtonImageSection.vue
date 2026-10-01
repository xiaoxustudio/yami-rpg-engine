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
			<SelectBox
				id="uiButton-flip"
				v-tip="t('components.uiButton-flip.tip')"
				ref="elFlip"
				v-model="form.flip"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.uiButton-border.label') || 'Border' }}</div>
			<NumberBox
				:label="t('components.uiButton-border.label') || 'Border'"
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
			<div
				class="flex-box"
				id="uiButton-imagePadding-box"
				v-tip="t('components.uiButton-imagePadding-box.tip')"
			>
				<SliderBox
					id="uiButton-imagePadding-slider"
					ref="elImagePaddingSlider"
					v-model="form.imagePadding"
					min="0"
					max="20"
				></SliderBox>
				<NumberBox
					:label="t('components.uiButton-imagePadding-box.label') || 'Padding'"
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
			<div
				class="flex-box"
				id="uiButton-imageOpacity-box"
				v-tip="t('components.uiButton-imageOpacity-box.tip')"
			>
				<SliderBox
					id="uiButton-imageOpacity-slider"
					ref="elImageOpacitySlider"
					v-model="form.imageOpacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					:label="t('components.uiButton-imageOpacity-box.label') || 'Opacity'"
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
			<div
				id="uiButton-normalTint-box"
				v-tip="t('components.uiButton-normalTint-box.tip')"
				ref="elNormalTintBox"
				class="box uiElement-grid-box with-4-columns"
			>
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
			<div
				id="uiButton-hoverTint-box"
				v-tip="t('components.uiButton-hoverTint-box.tip')"
				ref="elHoverTintBox"
				class="box uiElement-grid-box with-4-columns"
			>
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
			<div
				id="uiButton-activeTint-box"
				v-tip="t('components.uiButton-activeTint-box.tip')"
				ref="elActiveTintBox"
				class="box uiElement-grid-box with-4-columns"
			>
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

onMounted(() => {
	registerElement(inspectorEls, 'uiButton-display', elDisplay.value);
	registerElement(inspectorEls, 'uiButton-normalClip', elNormalClip.value);
	registerElement(inspectorEls, 'uiButton-hoverClip', elHoverClip.value);
	registerElement(inspectorEls, 'uiButton-activeClip', elActiveClip.value);
	registerElement(inspectorEls, 'uiButton-flip', elFlip.value);
	registerElement(inspectorEls, 'uiButton-border', elBorder.value);
	registerElement(inspectorEls, 'uiButton-imagePadding', elImagePadding.value);
	registerElement(inspectorEls, 'uiButton-imageOpacity', elImageOpacity.value);
	registerElement(inspectorEls, 'uiButton-imageEffect', elImageEffect.value);
	registerElement(inspectorEls, 'uiButton-imagePadding-slider', elImagePaddingSlider.value);
	registerElement(inspectorEls, 'uiButton-imageOpacity-slider', elImageOpacitySlider.value);
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
	synchronize(elImagePaddingSlider.value, elImagePadding.value);
	synchronize(elImageOpacitySlider.value, elImageOpacity.value);
});
</script>
