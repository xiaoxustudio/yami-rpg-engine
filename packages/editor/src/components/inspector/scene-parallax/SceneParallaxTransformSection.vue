<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-parallax-grid.label') || 'Parallax'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-parallax-grid">
			<div class="text">{{ t('components.sceneParallax-scaleX.label') || 'Scale X' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-scaleX.label') || 'Scale X'"
				id="sceneParallax-scaleX"
				:ref="bind('scaleX')"
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
				:label="t('components.sceneParallax-scaleY.label') || 'Scale Y'"
				id="sceneParallax-scaleY"
				:ref="bind('scaleY')"
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
				:label="t('components.sceneParallax-repeatX.label') || 'Repeat X'"
				id="sceneParallax-repeatX"
				:ref="bind('repeatX')"
				v-tip="t('components.sceneParallax-repeatX.tip')"
				v-model="form.repeatX"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatY.label') || 'Repeat Y' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-repeatY.label') || 'Repeat Y'"
				id="sceneParallax-repeatY"
				:ref="bind('repeatY')"
				v-tip="t('components.sceneParallax-repeatY.tip')"
				v-model="form.repeatY"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorX.label') || 'Anchor X' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-anchorX.label') || 'Anchor X'"
				id="sceneParallax-anchorX"
				:ref="bind('anchorX')"
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
				:label="t('components.sceneParallax-anchorY.label') || 'Anchor Y'"
				id="sceneParallax-anchorY"
				:ref="bind('anchorY')"
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
				:label="t('components.sceneParallax-offsetX.label') || 'Offset X'"
				id="sceneParallax-offsetX"
				:ref="bind('offsetX')"
				v-tip="t('components.sceneParallax-offsetX.tip')"
				v-model="form.offsetX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetY.label') || 'Offset Y' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-offsetY.label') || 'Offset Y'"
				id="sceneParallax-offsetY"
				:ref="bind('offsetY')"
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
				:label="t('components.sceneParallax-parallaxFactorX.label') || 'Parallax Factor X'"
				id="sceneParallax-parallaxFactorX"
				:ref="bind('parallaxFactorX')"
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
				:label="t('components.sceneParallax-parallaxFactorY.label') || 'Parallax Factor Y'"
				id="sceneParallax-parallaxFactorY"
				:ref="bind('parallaxFactorY')"
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
				:label="t('components.sceneParallax-shiftSpeedX.label') || 'Shift Speed X'"
				id="sceneParallax-shiftSpeedX"
				:ref="bind('shiftSpeedX')"
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
				:label="t('components.sceneParallax-shiftSpeedY.label') || 'Shift Speed Y'"
				id="sceneParallax-shiftSpeedY"
				:ref="bind('shiftSpeedY')"
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
					:label="t('components.sceneParallax-tint-0-box.label') || 'Tint - Red'"
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
					:label="t('components.sceneParallax-tint-1-box.label') || 'Tint - Green'"
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
					:label="t('components.sceneParallax-tint-2-box.label') || 'Tint - Blue'"
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
					:label="t('components.sceneParallax-tint-3-box.label') || 'Tint - Grayscale'"
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
import { computed, inject, onMounted, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { sceneParallaxPageNodes } from '@app/composables/inspector-page-nodes';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import { sceneParallaxContextKey } from './context.ts';

const { t } = useI18n();

const { bind, dispose } = sceneParallaxPageNodes.scoped();
onUnmounted(dispose);
const { form, onParamInput } = inject(sceneParallaxContextKey)!;

const tint = computed(() => form.tint as number[]);

const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	sceneParallaxPageNodes.set('tint0', elTint0.value?.root ?? null);
	sceneParallaxPageNodes.set('tint1', elTint1.value?.root ?? null);
	sceneParallaxPageNodes.set('tint2', elTint2.value?.root ?? null);
	sceneParallaxPageNodes.set('tint3', elTint3.value?.root ?? null);
	sceneParallaxPageNodes.set('tint0Slider', elTint0Slider.value?.root ?? null);
	sceneParallaxPageNodes.set('tint1Slider', elTint1Slider.value?.root ?? null);
	sceneParallaxPageNodes.set('tint2Slider', elTint2Slider.value?.root ?? null);
	sceneParallaxPageNodes.set('tint3Slider', elTint3Slider.value?.root ?? null);
	elTint0Slider.value?.synchronize(elTint0.value);
	elTint1Slider.value?.synchronize(elTint1.value);
	elTint2Slider.value?.synchronize(elTint2.value);
	elTint3Slider.value?.synchronize(elTint3.value);
});
</script>
