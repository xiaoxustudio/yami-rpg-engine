<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneLight-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneLight-general-grid">
			<div class="text">{{ t('components.sceneLight-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.sceneLight-name.label') || 'Name'"
				id="sceneLight-name"
				:ref="bind('name')"
				v-tip="t('components.sceneLight-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneLight-type.label') || 'Type' }}</div>
			<SelectBox
				:label="t('components.sceneLight-type.label') || 'Type'"
				id="sceneLight-type"
				v-tip="t('components.sceneLight-type.tip')"
				ref="elType"
				v-model="form.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneLight-blend.label') || 'Blend' }}</div>
			<SelectBox
				:label="t('components.sceneLight-blend.label') || 'Blend'"
				id="sceneLight-blend"
				v-tip="t('components.sceneLight-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneLight-x.label') || 'X' }}</div>
			<NumberBox
				:label="t('components.sceneLight-x.label') || 'X'"
				id="sceneLight-x"
				:ref="bind('x')"
				v-tip="t('components.sceneLight-x.tip')"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneLight-y.label') || 'Y' }}</div>
			<NumberBox
				:label="t('components.sceneLight-y.label') || 'Y'"
				id="sceneLight-y"
				:ref="bind('y')"
				v-tip="t('components.sceneLight-y.tip')"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneLight-range-box.label') || 'Range' }}</div>
			<div
				class="flex-box"
				id="sceneLight-range-box"
				v-tip="t('components.sceneLight-range-box.tip')"
				ref="elRangeBox"
			>
				<SliderBox
					id="sceneLight-range-slider"
					ref="elRangeSlider"
					v-model="form.range"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-range-box.label') || 'Range'"
					id="sceneLight-range"
					ref="elRange"
					v-model="form.range"
					@input="onParamInput"
					min="0"
					max="128"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneLight-intensity-box.label') || 'Intensity' }}
			</div>
			<div
				class="flex-box"
				id="sceneLight-intensity-box"
				v-tip="t('components.sceneLight-intensity-box.tip')"
				ref="elIntensityBox"
			>
				<SliderBox
					id="sceneLight-intensity-slider"
					ref="elIntensitySlider"
					v-model="form.intensity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-intensity-box.label') || 'Intensity'"
					id="sceneLight-intensity"
					ref="elIntensity"
					v-model="form.intensity"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-mask.label') || 'Mask' }}</div>
			<CustomBox
				id="sceneLight-mask"
				v-tip="t('components.sceneLight-mask.tip')"
				ref="elMask"
				:model-value="form.mask"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.sceneLight-anchorX-box.label') || 'Anchor X' }}</div>
			<div
				class="flex-box"
				id="sceneLight-anchorX-box"
				v-tip="t('components.sceneLight-anchorX-box.tip')"
				ref="elAnchorXBox"
			>
				<SliderBox
					id="sceneLight-anchorX-slider"
					ref="elAnchorXSlider"
					v-model="form.anchorX"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-anchorX-box.label') || 'Anchor X'"
					id="sceneLight-anchorX"
					ref="elAnchorX"
					v-model="form.anchorX"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-anchorY-box.label') || 'Anchor Y' }}</div>
			<div
				class="flex-box"
				id="sceneLight-anchorY-box"
				v-tip="t('components.sceneLight-anchorY-box.tip')"
				ref="elAnchorYBox"
			>
				<SliderBox
					id="sceneLight-anchorY-slider"
					ref="elAnchorYSlider"
					v-model="form.anchorY"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-anchorY-box.label') || 'Anchor Y'"
					id="sceneLight-anchorY"
					ref="elAnchorY"
					v-model="form.anchorY"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-width-box.label') || 'Width' }}</div>
			<div
				class="flex-box"
				id="sceneLight-width-box"
				v-tip="t('components.sceneLight-width-box.tip')"
				ref="elWidthBox"
			>
				<SliderBox
					id="sceneLight-width-slider"
					ref="elWidthSlider"
					v-model="form.width"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-width-box.label') || 'Width'"
					id="sceneLight-width"
					ref="elWidth"
					v-model="form.width"
					@input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-height-box.label') || 'Height' }}</div>
			<div
				class="flex-box"
				id="sceneLight-height-box"
				v-tip="t('components.sceneLight-height-box.tip')"
				ref="elHeightBox"
			>
				<SliderBox
					id="sceneLight-height-slider"
					ref="elHeightSlider"
					v-model="form.height"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-height-box.label') || 'Height'"
					id="sceneLight-height"
					ref="elHeight"
					v-model="form.height"
					@input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-angle-box.label') || 'Angle' }}</div>
			<div
				class="flex-box"
				id="sceneLight-angle-box"
				v-tip="t('components.sceneLight-angle-box.tip')"
				ref="elAngleBox"
			>
				<SliderBox
					id="sceneLight-angle-slider"
					ref="elAngleSlider"
					v-model="form.angle"
					min="0"
					max="360"
					step="5"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-angle-box.label') || 'Angle'"
					id="sceneLight-angle"
					ref="elAngle"
					v-model="form.angle"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-red-box.label') || 'Red' }}</div>
			<div
				class="flex-box"
				id="sceneLight-red-box"
				v-tip="t('components.sceneLight-red-box.tip')"
				ref="elRedBox"
			>
				<SliderBox
					id="sceneLight-red-slider"
					ref="elRedSlider"
					v-model="form.red"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-red-box.label') || 'Red'"
					id="sceneLight-red"
					ref="elRed"
					v-model="form.red"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-green-box.label') || 'Green' }}</div>
			<div
				class="flex-box"
				id="sceneLight-green-box"
				v-tip="t('components.sceneLight-green-box.tip')"
				ref="elGreenBox"
			>
				<SliderBox
					id="sceneLight-green-slider"
					ref="elGreenSlider"
					v-model="form.green"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-green-box.label') || 'Green'"
					id="sceneLight-green"
					ref="elGreen"
					v-model="form.green"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-blue-box.label') || 'Blue' }}</div>
			<div
				class="flex-box"
				id="sceneLight-blue-box"
				v-tip="t('components.sceneLight-blue-box.tip')"
				ref="elBlueBox"
			>
				<SliderBox
					id="sceneLight-blue-slider"
					ref="elBlueSlider"
					v-model="form.blue"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-blue-box.label') || 'Blue'"
					id="sceneLight-blue"
					ref="elBlue"
					v-model="form.blue"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneLight-direct-box.label') || 'Direct Light Ratio' }}
			</div>
			<div
				class="flex-box"
				id="sceneLight-direct-box"
				v-tip="t('components.sceneLight-direct-box.tip')"
				ref="elDirectBox"
			>
				<SliderBox
					id="sceneLight-direct-slider"
					ref="elDirectSlider"
					v-model="form.direct"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneLight-direct-box.label') || 'Direct Light Ratio'"
					id="sceneLight-direct"
					ref="elDirect"
					v-model="form.direct"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { sceneLightNodes } from '@app/composables/inspector-page-nodes';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { sceneLightContextKey } from './context.ts';

const { t } = useI18n();

const { bind, dispose } = sceneLightNodes.scoped();
onUnmounted(dispose);
const { form, onParamInput } = inject(sceneLightContextKey)!;

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elMask = ref<InstanceType<typeof CustomBox> | null>(null);
const elRangeSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elRange = ref<InstanceType<typeof NumberBox> | null>(null);
const elIntensitySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elIntensity = ref<InstanceType<typeof NumberBox> | null>(null);
const elAnchorXSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAnchorX = ref<InstanceType<typeof NumberBox> | null>(null);
const elAnchorYSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAnchorY = ref<InstanceType<typeof NumberBox> | null>(null);
const elWidthSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elHeightSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elAngleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elRedSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elRed = ref<InstanceType<typeof NumberBox> | null>(null);
const elGreenSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elGreen = ref<InstanceType<typeof NumberBox> | null>(null);
const elBlueSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elBlue = ref<InstanceType<typeof NumberBox> | null>(null);
const elDirectSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elDirect = ref<InstanceType<typeof NumberBox> | null>(null);
const elRangeBox = ref<HTMLElement | null>(null);
const elIntensityBox = ref<HTMLElement | null>(null);
const elAnchorXBox = ref<HTMLElement | null>(null);
const elAnchorYBox = ref<HTMLElement | null>(null);
const elWidthBox = ref<HTMLElement | null>(null);
const elHeightBox = ref<HTMLElement | null>(null);
const elAngleBox = ref<HTMLElement | null>(null);

onMounted(() => {
	sceneLightNodes.set('type', elType.value?.root ?? null);
	sceneLightNodes.set('blend', elBlend.value?.root ?? null);
	sceneLightNodes.set('range', elRange.value?.root ?? null);
	sceneLightNodes.set('intensity', elIntensity.value?.root ?? null);
	sceneLightNodes.set('mask', elMask.value?.root ?? null);
	sceneLightNodes.set('anchorX', elAnchorX.value?.root ?? null);
	sceneLightNodes.set('anchorY', elAnchorY.value?.root ?? null);
	sceneLightNodes.set('width', elWidth.value?.root ?? null);
	sceneLightNodes.set('height', elHeight.value?.root ?? null);
	sceneLightNodes.set('angle', elAngle.value?.root ?? null);
	sceneLightNodes.set('red', elRed.value?.root ?? null);
	sceneLightNodes.set('green', elGreen.value?.root ?? null);
	sceneLightNodes.set('blue', elBlue.value?.root ?? null);
	sceneLightNodes.set('direct', elDirect.value?.root ?? null);
	sceneLightNodes.set('rangeSlider', elRangeSlider.value?.root ?? null);
	sceneLightNodes.set('intensitySlider', elIntensitySlider.value?.root ?? null);
	sceneLightNodes.set('anchorXSlider', elAnchorXSlider.value?.root ?? null);
	sceneLightNodes.set('anchorYSlider', elAnchorYSlider.value?.root ?? null);
	sceneLightNodes.set('widthSlider', elWidthSlider.value?.root ?? null);
	sceneLightNodes.set('heightSlider', elHeightSlider.value?.root ?? null);
	sceneLightNodes.set('angleSlider', elAngleSlider.value?.root ?? null);
	sceneLightNodes.set('redSlider', elRedSlider.value?.root ?? null);
	sceneLightNodes.set('greenSlider', elGreenSlider.value?.root ?? null);
	sceneLightNodes.set('blueSlider', elBlueSlider.value?.root ?? null);
	sceneLightNodes.set('directSlider', elDirectSlider.value?.root ?? null);
	try {
		elType.value?.loadItems([
			{
				name: t('components.sceneLight-type.options.point.name'),
				tip: t('components.sceneLight-type.options.point.tip'),
				value: 'point'
			},
			{
				name: t('components.sceneLight-type.options.area.name'),
				tip: t('components.sceneLight-type.options.area.tip'),
				value: 'area'
			}
		]);

		elBlend.value?.loadItems([
			{
				name: t('components.sceneLight-blend.options.screen.name'),
				tip: t('components.sceneLight-blend.options.screen.tip'),
				value: 'screen'
			},
			{
				name: t('components.sceneLight-blend.options.additive.name'),
				tip: t('components.sceneLight-blend.options.additive.tip'),
				value: 'additive'
			},
			{
				name: t('components.sceneLight-blend.options.subtract.name'),
				tip: t('components.sceneLight-blend.options.subtract.tip'),
				value: 'subtract'
			},
			{
				name: t('components.sceneLight-blend.options.max.name'),
				tip: t('components.sceneLight-blend.options.max.tip'),
				value: 'max'
			}
		]);

		if (elType.value) {
			elType.value.enableHiddenMode();
			elType.value.relate([
				{
					case: 'point',
					targets: [elRangeBox.value, elIntensityBox.value]
				},
				{
					case: 'area',
					targets: [
						elMask.value?.root ?? null,
						elAnchorXBox.value,
						elAnchorYBox.value,
						elWidthBox.value,
						elHeightBox.value,
						elAngleBox.value
					]
				}
			]);
		}
		elRangeSlider.value?.synchronize(elRange.value?.root as SyncTarget);
		elIntensitySlider.value?.synchronize(elIntensity.value?.root as SyncTarget);
		elAnchorXSlider.value?.synchronize(elAnchorX.value?.root as SyncTarget);
		elAnchorYSlider.value?.synchronize(elAnchorY.value?.root as SyncTarget);
		elWidthSlider.value?.synchronize(elWidth.value?.root as SyncTarget);
		elHeightSlider.value?.synchronize(elHeight.value?.root as SyncTarget);
		elAngleSlider.value?.synchronize(elAngle.value?.root as SyncTarget);
		elRedSlider.value?.synchronize(elRed.value?.root as SyncTarget);
		elGreenSlider.value?.synchronize(elGreen.value?.root as SyncTarget);
		elBlueSlider.value?.synchronize(elBlue.value?.root as SyncTarget);
		elDirectSlider.value?.synchronize(elDirect.value?.root as SyncTarget);
	} catch (e) {
		console.warn('[SceneLightPage] properties init skipped:', (e as Error)?.message);
	}
});
</script>
