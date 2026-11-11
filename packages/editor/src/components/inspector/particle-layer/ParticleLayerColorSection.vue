<template>
	<div class="text">
		{{ t('components.particleLayer-color-mode.label') || 'Color Mode' }}
	</div>
	<SelectBox
		:label="t('components.particleLayer-color-mode.label') || 'Color Mode'"
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
			:label="t('components.particleLayer-color-rgba-box.label') || 'Color'"
			id="particleLayer-color-rgba-0"
			:ref="bind('colorRgba0')"
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
			:ref="bind('colorRgba1')"
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
			:ref="bind('colorRgba2')"
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
			:ref="bind('colorRgba3')"
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
			:label="t('components.particleLayer-color-min-box.label') || 'Color Min'"
			id="particleLayer-color-min-0"
			:ref="bind('colorMin0')"
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
			:ref="bind('colorMin1')"
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
			:ref="bind('colorMin2')"
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
			:ref="bind('colorMin3')"
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
			:label="t('components.particleLayer-color-max-box.label') || 'Color Max'"
			id="particleLayer-color-max-0"
			:ref="bind('colorMax0')"
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
			:ref="bind('colorMax1')"
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
			:ref="bind('colorMax2')"
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
			:ref="bind('colorMax3')"
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
		:label="t('components.particleLayer-color-easingId.label') || 'Color Easing'"
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
			:label="t('components.particleLayer-color-startMin-box.label') || 'Color Start Min'"
			id="particleLayer-color-startMin-0"
			:ref="bind('colorStartMin0')"
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
			:ref="bind('colorStartMin1')"
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
			:ref="bind('colorStartMin2')"
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
			:ref="bind('colorStartMin3')"
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
			:label="t('components.particleLayer-color-startMax-box.label') || 'Color Start Max'"
			id="particleLayer-color-startMax-0"
			:ref="bind('colorStartMax0')"
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
			:ref="bind('colorStartMax1')"
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
			:ref="bind('colorStartMax2')"
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
			:ref="bind('colorStartMax3')"
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
			:label="t('components.particleLayer-color-endMin-box.label') || 'Color End Min'"
			id="particleLayer-color-endMin-0"
			:ref="bind('colorEndMin0')"
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
			:ref="bind('colorEndMin1')"
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
			:ref="bind('colorEndMin2')"
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
			:ref="bind('colorEndMin3')"
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
			:label="t('components.particleLayer-color-endMax-box.label') || 'Color End Max'"
			id="particleLayer-color-endMax-0"
			:ref="bind('colorEndMax0')"
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
			:ref="bind('colorEndMax1')"
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
			:ref="bind('colorEndMax2')"
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
			:ref="bind('colorEndMax3')"
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
			:label="t('components.particleLayer-color-tint-0-box.label') || 'Tint - Red'"
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
			:label="t('components.particleLayer-color-tint-1-box.label') || 'Tint - Green'"
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
			:label="t('components.particleLayer-color-tint-2-box.label') || 'Tint - Blue'"
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
			:label="t('components.particleLayer-color-tint-3-box.label') || 'Tint - Grayscale'"
			id="particleLayer-color-tint-3"
			ref="elTint3"
			v-model="form.color.tint[3]"
			@input="onParamInput"
			min="0"
			max="255"
			step="5"
		></NumberBox>
	</div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { particleLayerPageNodes } from '@app/composables/inspector-page-nodes';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import { particleLayerContextKey } from './context.ts';

const { t } = useI18n();

const { bind, dispose } = particleLayerPageNodes.scoped();
onUnmounted(dispose);
const { form, onParamInput } = inject(particleLayerContextKey)!;

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

onMounted(() => {
	particleLayerPageNodes.set('colorMode', elColorMode.value?.root ?? null);
	particleLayerPageNodes.set('colorTint0', elTint0.value?.root ?? null);
	particleLayerPageNodes.set('colorTint1', elTint1.value?.root ?? null);
	particleLayerPageNodes.set('colorTint2', elTint2.value?.root ?? null);
	particleLayerPageNodes.set('colorTint3', elTint3.value?.root ?? null);
	particleLayerPageNodes.set('colorTint0Slider', elTint0Slider.value?.root ?? null);
	particleLayerPageNodes.set('colorTint1Slider', elTint1Slider.value?.root ?? null);
	particleLayerPageNodes.set('colorTint2Slider', elTint2Slider.value?.root ?? null);
	particleLayerPageNodes.set('colorTint3Slider', elTint3Slider.value?.root ?? null);
	particleLayerPageNodes.set('colorEasingId', elColorEasingId.value?.root ?? null);
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
	elTint0Slider.value?.synchronize(elTint0.value);
	elTint1Slider.value?.synchronize(elTint1.value);
	elTint2Slider.value?.synchronize(elTint2.value);
	elTint3Slider.value?.synchronize(elTint3.value);
});
</script>
