<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-rendering-grid.label') || 'Rendering'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rendering-grid">
			<div class="text">{{ t('components.particleLayer-image.label') || 'Image' }}</div>
			<CustomBox
				id="particleLayer-image"
				:ref="registryRef(inspectorEls, 'particleLayer-image')"
				v-tip="t('components.particleLayer-image.tip')"
				type="file"
				filter="image"
				:model-value="form.image"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.particleLayer-blend.label') || 'Blend' }}</div>
			<SelectBox
				id="particleLayer-blend"
				v-tip="t('components.particleLayer-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-light.label') || 'Light Sampling' }}
			</div>
			<SelectBox
				id="particleLayer-light"
				v-tip="t('components.particleLayer-light.tip')"
				ref="elLight"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.particleLayer-sort.label') || 'Sort' }}</div>
			<SelectBox
				id="particleLayer-sort"
				v-tip="t('components.particleLayer-sort.tip')"
				ref="elSort"
				v-model="form.sort"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-mode.label') || 'Sprite Mode' }}
			</div>
			<SelectBox
				id="particleLayer-sprite-mode"
				v-tip="t('components.particleLayer-sprite-mode.tip')"
				ref="elSpriteMode"
				v-model="form.sprite.mode"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-hframes.label') || 'Horiz Frames' }}
			</div>
			<NumberBox
				id="particleLayer-sprite-hframes"
				:ref="registryRef(inspectorEls, 'particleLayer-sprite-hframes')"
				v-tip="t('components.particleLayer-sprite-hframes.tip')"
				v-model="form.sprite.hframes"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-vframes.label') || 'Vert Frames' }}
			</div>
			<NumberBox
				id="particleLayer-sprite-vframes"
				:ref="registryRef(inspectorEls, 'particleLayer-sprite-vframes')"
				v-tip="t('components.particleLayer-sprite-vframes.tip')"
				v-model="form.sprite.vframes"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-sprite-interval.label') || 'Animation Interval' }}
			</div>
			<NumberBox
				id="particleLayer-sprite-interval"
				v-tip="t('components.particleLayer-sprite-interval.tip')"
				ref="elSpriteInterval"
				v-model="form.sprite.interval"
				@input="onParamInput"
				min="1"
				max="5000"
				unit="ms"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-color-mode.label') || 'Color Mode' }}
			</div>
			<SelectBox
				id="particleLayer-color-mode"
				v-tip="t('components.particleLayer-color-mode.tip')"
				ref="elColorMode"
				v-model="form.color.mode"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-color-rgba-box.label') || 'Color' }}
			</div>
			<div class="flex-box" id="particleLayer-color-rgba-box" ref="elColorRgbaBox">
				<NumberBox
					id="particleLayer-color-rgba-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-rgba-0')"
					v-tip="t('components.particleLayer-color-rgba-0.tip')"
					v-model="form.color.rgba[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-rgba-1')"
					v-tip="t('components.particleLayer-color-rgba-1.tip')"
					v-model="form.color.rgba[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-rgba-2')"
					v-tip="t('components.particleLayer-color-rgba-2.tip')"
					v-model="form.color.rgba[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-rgba-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-rgba-3')"
					v-tip="t('components.particleLayer-color-rgba-3.tip')"
					v-model="form.color.rgba[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-min-box.label') || 'Color Min' }}
			</div>
			<div class="flex-box" id="particleLayer-color-min-box" ref="elColorMinBox">
				<NumberBox
					id="particleLayer-color-min-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-min-0')"
					v-tip="t('components.particleLayer-color-min-0.tip')"
					v-model="form.color.min[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-min-1')"
					v-tip="t('components.particleLayer-color-min-1.tip')"
					v-model="form.color.min[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-min-2')"
					v-tip="t('components.particleLayer-color-min-2.tip')"
					v-model="form.color.min[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-min-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-min-3')"
					v-tip="t('components.particleLayer-color-min-3.tip')"
					v-model="form.color.min[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-max-box.label') || 'Color Max' }}
			</div>
			<div class="flex-box" id="particleLayer-color-max-box" ref="elColorMaxBox">
				<NumberBox
					id="particleLayer-color-max-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-max-0')"
					v-tip="t('components.particleLayer-color-max-0.tip')"
					v-model="form.color.max[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-max-1')"
					v-tip="t('components.particleLayer-color-max-1.tip')"
					v-model="form.color.max[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-max-2')"
					v-tip="t('components.particleLayer-color-max-2.tip')"
					v-model="form.color.max[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-max-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-max-3')"
					v-tip="t('components.particleLayer-color-max-3.tip')"
					v-model="form.color.max[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-easingId.label') || 'Color Easing' }}
			</div>
			<SelectBox
				id="particleLayer-color-easingId"
				v-tip="t('components.particleLayer-color-easingId.tip')"
				ref="elColorEasingId"
				v-model="form.color.easingId"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.particleLayer-color-startMin-box.label') || 'Color Start Min' }}
			</div>
			<div class="flex-box" id="particleLayer-color-startMin-box" ref="elColorStartMinBox">
				<NumberBox
					id="particleLayer-color-startMin-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMin-0')"
					v-tip="t('components.particleLayer-color-startMin-0.tip')"
					v-model="form.color.startMin[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMin-1')"
					v-tip="t('components.particleLayer-color-startMin-1.tip')"
					v-model="form.color.startMin[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMin-2')"
					v-tip="t('components.particleLayer-color-startMin-2.tip')"
					v-model="form.color.startMin[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMin-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMin-3')"
					v-tip="t('components.particleLayer-color-startMin-3.tip')"
					v-model="form.color.startMin[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-startMax-box.label') || 'Color Start Max' }}
			</div>
			<div class="flex-box" id="particleLayer-color-startMax-box" ref="elColorStartMaxBox">
				<NumberBox
					id="particleLayer-color-startMax-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMax-0')"
					v-tip="t('components.particleLayer-color-startMax-0.tip')"
					v-model="form.color.startMax[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMax-1')"
					v-tip="t('components.particleLayer-color-startMax-1.tip')"
					v-model="form.color.startMax[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMax-2')"
					v-tip="t('components.particleLayer-color-startMax-2.tip')"
					v-model="form.color.startMax[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-startMax-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-startMax-3')"
					v-tip="t('components.particleLayer-color-startMax-3.tip')"
					v-model="form.color.startMax[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-endMin-box.label') || 'Color End Min' }}
			</div>
			<div class="flex-box" id="particleLayer-color-endMin-box" ref="elColorEndMinBox">
				<NumberBox
					id="particleLayer-color-endMin-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMin-0')"
					v-tip="t('components.particleLayer-color-endMin-0.tip')"
					v-model="form.color.endMin[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMin-1')"
					v-tip="t('components.particleLayer-color-endMin-1.tip')"
					v-model="form.color.endMin[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMin-2')"
					v-tip="t('components.particleLayer-color-endMin-2.tip')"
					v-model="form.color.endMin[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMin-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMin-3')"
					v-tip="t('components.particleLayer-color-endMin-3.tip')"
					v-model="form.color.endMin[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-endMax-box.label') || 'Color End Max' }}
			</div>
			<div class="flex-box" id="particleLayer-color-endMax-box" ref="elColorEndMaxBox">
				<NumberBox
					id="particleLayer-color-endMax-0"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMax-0')"
					v-tip="t('components.particleLayer-color-endMax-0.tip')"
					v-model="form.color.endMax[0]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label red">R</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-1"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMax-1')"
					v-tip="t('components.particleLayer-color-endMax-1.tip')"
					v-model="form.color.endMax[1]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label green">G</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-2"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMax-2')"
					v-tip="t('components.particleLayer-color-endMax-2.tip')"
					v-model="form.color.endMax[2]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label blue">B</div></NumberBox
				>
				<NumberBox
					id="particleLayer-color-endMax-3"
					:ref="registryRef(inspectorEls, 'particleLayer-color-endMax-3')"
					v-tip="t('components.particleLayer-color-endMax-3.tip')"
					v-model="form.color.endMax[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
					><div class="text label">A</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-0-box.label') || 'Tint - Red' }}
			</div>
			<div
				class="flex-box"
				id="particleLayer-color-tint-0-box"
				v-tip="t('components.particleLayer-color-tint-0-box.tip')"
				ref="elTint0Box"
			>
				<SliderBox
					id="particleLayer-color-tint-0-slider"
					ref="elTint0Slider"
					v-model="form.color.tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-0"
					ref="elTint0"
					v-model="form.color.tint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-1-box.label') || 'Tint - Green' }}
			</div>
			<div
				class="flex-box"
				id="particleLayer-color-tint-1-box"
				v-tip="t('components.particleLayer-color-tint-1-box.tip')"
				ref="elTint1Box"
			>
				<SliderBox
					id="particleLayer-color-tint-1-slider"
					ref="elTint1Slider"
					v-model="form.color.tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-1"
					ref="elTint1"
					v-model="form.color.tint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-2-box.label') || 'Tint - Blue' }}
			</div>
			<div
				class="flex-box"
				id="particleLayer-color-tint-2-box"
				v-tip="t('components.particleLayer-color-tint-2-box.tip')"
				ref="elTint2Box"
			>
				<SliderBox
					id="particleLayer-color-tint-2-slider"
					ref="elTint2Slider"
					v-model="form.color.tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-2"
					ref="elTint2"
					v-model="form.color.tint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.particleLayer-color-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div
				class="flex-box"
				id="particleLayer-color-tint-3-box"
				v-tip="t('components.particleLayer-color-tint-3-box.tip')"
				ref="elTint3Box"
			>
				<SliderBox
					id="particleLayer-color-tint-3-slider"
					ref="elTint3Slider"
					v-model="form.color.tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="particleLayer-color-tint-3"
					ref="elTint3"
					v-model="form.color.tint[3]"
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
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import { particleLayerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(particleLayerContextKey)!;

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elSort = ref<InstanceType<typeof SelectBox> | null>(null);
const elSpriteMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elSpriteInterval = ref<InstanceType<typeof NumberBox> | null>(null);
const elColorMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elColorEasingId = ref<InstanceType<typeof SelectBox> | null>(null);
const elColorRgbaBox = ref<HTMLElement | null>(null);
const elColorMinBox = ref<HTMLElement | null>(null);
const elColorMaxBox = ref<HTMLElement | null>(null);
const elColorStartMinBox = ref<HTMLElement | null>(null);
const elColorStartMaxBox = ref<HTMLElement | null>(null);
const elColorEndMinBox = ref<HTMLElement | null>(null);
const elColorEndMaxBox = ref<HTMLElement | null>(null);
const elTint0Box = ref<HTMLElement | null>(null);
const elTint1Box = ref<HTMLElement | null>(null);
const elTint2Box = ref<HTMLElement | null>(null);
const elTint3Box = ref<HTMLElement | null>(null);
const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);

// 选项名跟随语言。放在 setup 顶层即可——`useLocalizedOptions` 内部用**全局 Composer** +
// `watchEffect`：既跟踪语言切换，也跟踪 `:ref` 挂载后 ref 的赋值（挂载完成时 effect 因读到新 ref
// 重跑，那时才真正 `loadItems`）。在**事件回调**里调用它会抛 vue-i18n 的
// `Must be called at the top of a setup function`。
useLocalizedOptions('particleLayer-blend', ['normal', 'additive', 'subtract'], (items) =>
	elBlend.value?.loadItems?.(items)
);
useLocalizedOptions('particleLayer-light', ['raw', 'global', 'ambient'], (items) =>
	elLight.value?.loadItems?.(items)
);

onMounted(() => {
	registerElement(inspectorEls, 'particleLayer-blend', elBlend.value);
	registerElement(inspectorEls, 'particleLayer-light', elLight.value);
	registerElement(inspectorEls, 'particleLayer-sort', elSort.value);
	registerElement(inspectorEls, 'particleLayer-sprite-mode', elSpriteMode.value);
	registerElement(inspectorEls, 'particleLayer-sprite-interval', elSpriteInterval.value);
	registerElement(inspectorEls, 'particleLayer-color-mode', elColorMode.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-0', elTint0.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-1', elTint1.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-2', elTint2.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-3', elTint3.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-0-slider', elTint0Slider.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-1-slider', elTint1Slider.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-2-slider', elTint2Slider.value);
	registerElement(inspectorEls, 'particleLayer-color-tint-3-slider', elTint3Slider.value);
	registerElement(inspectorEls, 'particleLayer-color-easingId', elColorEasingId.value);
	elSort.value?.loadItems([
		{
			name: t('components.particleLayer-sort.options.youngest-in-front.name'),
			tip: t('components.particleLayer-sort.options.youngest-in-front.tip'),
			value: 'youngest-in-front'
		},
		{
			name: t('components.particleLayer-sort.options.oldest-in-front.name'),
			tip: t('components.particleLayer-sort.options.oldest-in-front.tip'),
			value: 'oldest-in-front'
		},
		{
			name: t('components.particleLayer-sort.options.by-scale-factor.name'),
			tip: t('components.particleLayer-sort.options.by-scale-factor.tip'),
			value: 'by-scale-factor'
		}
	]);

	elSpriteMode.value?.loadItems([
		{
			name: t('components.particleLayer-sprite-mode.options.random.name'),
			tip: t('components.particleLayer-sprite-mode.options.random.tip'),
			value: 'random'
		},
		{
			name: t('components.particleLayer-sprite-mode.options.animation.name'),
			tip: t('components.particleLayer-sprite-mode.options.animation.tip'),
			value: 'animation'
		},
		{
			name: t('components.particleLayer-sprite-mode.options.animation-loop.name'),
			tip: t('components.particleLayer-sprite-mode.options.animation-loop.tip'),
			value: 'animation-loop'
		}
	]);
	if (elSpriteMode.value) {
		elSpriteMode.value.enableHiddenMode();
		elSpriteMode.value.relate([
			{
				case: ['animation', 'animation-loop'],
				targets: [elSpriteInterval.value?.root ?? null]
			}
		]);
	}

	elColorMode.value?.loadItems([
		{
			name: t('components.particleLayer-color-mode.options.fixed.name'),
			tip: t('components.particleLayer-color-mode.options.fixed.tip'),
			value: 'fixed'
		},
		{
			name: t('components.particleLayer-color-mode.options.random.name'),
			tip: t('components.particleLayer-color-mode.options.random.tip'),
			value: 'random'
		},
		{
			name: t('components.particleLayer-color-mode.options.easing.name'),
			tip: t('components.particleLayer-color-mode.options.easing.tip'),
			value: 'easing'
		},
		{
			name: t('components.particleLayer-color-mode.options.texture.name'),
			tip: t('components.particleLayer-color-mode.options.texture.tip'),
			value: 'texture'
		}
	]);
	if (elColorMode.value) {
		elColorMode.value.enableHiddenMode();
		elColorMode.value.relate([
			{ case: 'fixed', targets: [elColorRgbaBox.value] },
			{
				case: 'random',
				targets: [elColorMinBox.value, elColorMaxBox.value]
			},
			{
				case: 'easing',
				targets: [
					elColorEasingId.value?.root ?? null,
					elColorStartMinBox.value,
					elColorStartMaxBox.value,
					elColorEndMinBox.value,
					elColorEndMaxBox.value
				]
			},
			{
				case: 'texture',
				targets: [elTint0Box.value, elTint1Box.value, elTint2Box.value, elTint3Box.value]
			}
		]);
	}

	elTint0Slider.value?.synchronize(elTint0.value?.root as SyncTarget);
	elTint1Slider.value?.synchronize(elTint1.value?.root as SyncTarget);
	elTint2Slider.value?.synchronize(elTint2.value?.root as SyncTarget);
	elTint3Slider.value?.synchronize(elTint3.value?.root as SyncTarget);
});
</script>
