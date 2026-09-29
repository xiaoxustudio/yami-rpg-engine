<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-parallax-grid.label') || 'Parallax'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-parallax-grid">
			<div class="text">{{ t('components.sceneParallax-scaleX.label') || 'Scale X' }}</div>
			<NumberBox
				id="sceneParallax-scaleX"
				:ref="registryRef(inspectorEls, 'sceneParallax-scaleX')"
				v-tip="t('components.sceneParallax-scaleX.tip')"
				v-model="form.scaleX"
				@input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-scaleY.label') || 'Scale Y' }}</div>
			<NumberBox
				id="sceneParallax-scaleY"
				:ref="registryRef(inspectorEls, 'sceneParallax-scaleY')"
				v-tip="t('components.sceneParallax-scaleY.tip')"
				v-model="form.scaleY"
				@input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatX.label') || 'Repeat X' }}</div>
			<NumberBox
				id="sceneParallax-repeatX"
				:ref="registryRef(inspectorEls, 'sceneParallax-repeatX')"
				v-tip="t('components.sceneParallax-repeatX.tip')"
				v-model="form.repeatX"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatY.label') || 'Repeat Y' }}</div>
			<NumberBox
				id="sceneParallax-repeatY"
				:ref="registryRef(inspectorEls, 'sceneParallax-repeatY')"
				v-tip="t('components.sceneParallax-repeatY.tip')"
				v-model="form.repeatY"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorX.label') || 'Anchor X' }}</div>
			<NumberBox
				id="sceneParallax-anchorX"
				:ref="registryRef(inspectorEls, 'sceneParallax-anchorX')"
				v-tip="t('components.sceneParallax-anchorX.tip')"
				v-model="form.anchorX"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorY.label') || 'Anchor Y' }}</div>
			<NumberBox
				id="sceneParallax-anchorY"
				:ref="registryRef(inspectorEls, 'sceneParallax-anchorY')"
				v-tip="t('components.sceneParallax-anchorY.tip')"
				v-model="form.anchorY"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetX.label') || 'Offset X' }}</div>
			<NumberBox
				id="sceneParallax-offsetX"
				:ref="registryRef(inspectorEls, 'sceneParallax-offsetX')"
				v-tip="t('components.sceneParallax-offsetX.tip')"
				v-model="form.offsetX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetY.label') || 'Offset Y' }}</div>
			<NumberBox
				id="sceneParallax-offsetY"
				:ref="registryRef(inspectorEls, 'sceneParallax-offsetY')"
				v-tip="t('components.sceneParallax-offsetY.tip')"
				v-model="form.offsetY"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-parallaxFactorX.label') || 'Parallax Factor X' }}
			</div>
			<NumberBox
				id="sceneParallax-parallaxFactorX"
				:ref="registryRef(inspectorEls, 'sceneParallax-parallaxFactorX')"
				v-tip="t('components.sceneParallax-parallaxFactorX.tip')"
				v-model="form.parallaxFactorX"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-parallaxFactorY.label') || 'Parallax Factor Y' }}
			</div>
			<NumberBox
				id="sceneParallax-parallaxFactorY"
				:ref="registryRef(inspectorEls, 'sceneParallax-parallaxFactorY')"
				v-tip="t('components.sceneParallax-parallaxFactorY.tip')"
				v-model="form.parallaxFactorY"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-shiftSpeedX.label') || 'Shift Speed X' }}
			</div>
			<NumberBox
				id="sceneParallax-shiftSpeedX"
				:ref="registryRef(inspectorEls, 'sceneParallax-shiftSpeedX')"
				v-tip="t('components.sceneParallax-shiftSpeedX.tip')"
				v-model="form.shiftSpeedX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-shiftSpeedY.label') || 'Shift Speed Y' }}
			</div>
			<NumberBox
				id="sceneParallax-shiftSpeedY"
				:ref="registryRef(inspectorEls, 'sceneParallax-shiftSpeedY')"
				v-tip="t('components.sceneParallax-shiftSpeedY.tip')"
				v-model="form.shiftSpeedY"
				@input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-tint-0-box.label') || 'Tint - Red' }}
			</div>
			<div
				class="flex-box"
				id="sceneParallax-tint-0-box"
				v-tip="t('components.sceneParallax-tint-0-box.tip')"
			>
				<SliderBox
					id="sceneParallax-tint-0-slider"
					ref="elTint0Slider"
					v-model="tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-0"
					ref="elTint0"
					v-model="tint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParallax-tint-1-box.label') || 'Tint - Green' }}
			</div>
			<div
				class="flex-box"
				id="sceneParallax-tint-1-box"
				v-tip="t('components.sceneParallax-tint-1-box.tip')"
			>
				<SliderBox
					id="sceneParallax-tint-1-slider"
					ref="elTint1Slider"
					v-model="tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-1"
					ref="elTint1"
					v-model="tint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParallax-tint-2-box.label') || 'Tint - Blue' }}
			</div>
			<div
				class="flex-box"
				id="sceneParallax-tint-2-box"
				v-tip="t('components.sceneParallax-tint-2-box.tip')"
			>
				<SliderBox
					id="sceneParallax-tint-2-slider"
					ref="elTint2Slider"
					v-model="tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-2"
					ref="elTint2"
					v-model="tint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParallax-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div
				class="flex-box"
				id="sceneParallax-tint-3-box"
				v-tip="t('components.sceneParallax-tint-3-box.tip')"
			>
				<SliderBox
					id="sceneParallax-tint-3-slider"
					ref="elTint3Slider"
					v-model="tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-3"
					ref="elTint3"
					v-model="tint[3]"
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
import { computed, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import { sceneParallaxContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(sceneParallaxContextKey)!;

const tint = computed(() => form.tint as number[]);

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'sceneParallax-tint-0', elTint0.value);
	registerElement(inspectorEls, 'sceneParallax-tint-1', elTint1.value);
	registerElement(inspectorEls, 'sceneParallax-tint-2', elTint2.value);
	registerElement(inspectorEls, 'sceneParallax-tint-3', elTint3.value);
	registerElement(inspectorEls, 'sceneParallax-tint-0-slider', elTint0Slider.value);
	registerElement(inspectorEls, 'sceneParallax-tint-1-slider', elTint1Slider.value);
	registerElement(inspectorEls, 'sceneParallax-tint-2-slider', elTint2Slider.value);
	registerElement(inspectorEls, 'sceneParallax-tint-3-slider', elTint3Slider.value);
	elTint0Slider.value?.synchronize(elTint0.value?.root as SyncTarget);
	elTint1Slider.value?.synchronize(elTint1.value?.root as SyncTarget);
	elTint2Slider.value?.synchronize(elTint2.value?.root as SyncTarget);
	elTint3Slider.value?.synchronize(elTint3.value?.root as SyncTarget);
});
</script>
