<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneAnimation-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneAnimation-general-grid">
			<div class="text">{{ t('components.sceneAnimation-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.sceneAnimation-name.label') || 'Name'"
				id="sceneAnimation-name"
				:ref="registryRef(inspectorEls, 'sceneAnimation-name')"
				v-tip="t('components.sceneAnimation-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">
				{{ t('components.sceneAnimation-animationId.label') || 'Animation' }}
			</div>
			<CustomBox
				id="sceneAnimation-animationId"
				v-tip="t('components.sceneAnimation-animationId.tip')"
				ref="elAnimationId"
				:model-value="form.animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			></CustomBox>
			<div class="text">{{ t('components.sceneAnimation-motion.label') || 'Motion' }}</div>
			<SelectBox
				:label="t('components.sceneAnimation-motion.label') || 'Motion'"
				id="sceneAnimation-motion"
				v-tip="t('components.sceneAnimation-motion.tip')"
				:ref="registryRef(inspectorEls, 'sceneAnimation-motion')"
				v-model="form.motion"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.sceneAnimation-rotatable.label') || 'Rotatable' }}
			</div>
			<SelectBox
				:label="t('components.sceneAnimation-rotatable.label') || 'Rotatable'"
				id="sceneAnimation-rotatable"
				v-tip="t('components.sceneAnimation-rotatable.tip')"
				ref="elRotatable"
				v-model="form.rotatable"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneAnimation-x.label') || 'X' }}</div>
			<NumberBox
				:label="t('components.sceneAnimation-x.label') || 'X'"
				id="sceneAnimation-x"
				:ref="registryRef(inspectorEls, 'sceneAnimation-x')"
				v-tip="t('components.sceneAnimation-x.tip')"
				v-model="form.x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneAnimation-y.label') || 'Y' }}</div>
			<NumberBox
				:label="t('components.sceneAnimation-y.label') || 'Y'"
				id="sceneAnimation-y"
				:ref="registryRef(inspectorEls, 'sceneAnimation-y')"
				v-tip="t('components.sceneAnimation-y.tip')"
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneAnimation-angle-box.label') || 'Angle' }}</div>
			<div
				class="flex-box"
				id="sceneAnimation-angle-box"
				v-tip="t('components.sceneAnimation-angle-box.tip')"
			>
				<SliderBox
					id="sceneAnimation-angle-slider"
					ref="elAngleSlider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneAnimation-angle-box.label') || 'Angle'"
					id="sceneAnimation-angle"
					ref="elAngle"
					v-model="form.angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneAnimation-scale-box.label') || 'Scale' }}</div>
			<div
				class="flex-box"
				id="sceneAnimation-scale-box"
				v-tip="t('components.sceneAnimation-scale-box.tip')"
			>
				<SliderBox
					id="sceneAnimation-scale-slider"
					ref="elScaleSlider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneAnimation-scale-box.label') || 'Scale'"
					id="sceneAnimation-scale"
					ref="elScale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneAnimation-speed-box.label') || 'Speed' }}</div>
			<div
				class="flex-box"
				id="sceneAnimation-speed-box"
				v-tip="t('components.sceneAnimation-speed-box.tip')"
			>
				<SliderBox
					id="sceneAnimation-speed-slider"
					ref="elSpeedSlider"
					v-model="form.speed"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneAnimation-speed-box.label') || 'Speed'"
					id="sceneAnimation-speed"
					ref="elSpeed"
					v-model="form.speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneAnimation-opacity-box.label') || 'Opacity' }}
			</div>
			<div
				class="flex-box"
				id="sceneAnimation-opacity-box"
				v-tip="t('components.sceneAnimation-opacity-box.tip')"
			>
				<SliderBox
					id="sceneAnimation-opacity-slider"
					ref="elOpacitySlider"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneAnimation-opacity-box.label') || 'Opacity'"
					id="sceneAnimation-opacity"
					ref="elOpacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneAnimation-priority-box.label') || 'Priority' }}
			</div>
			<div
				class="flex-box"
				id="sceneAnimation-priority-box"
				v-tip="t('components.sceneAnimation-priority-box.tip')"
			>
				<SliderBox
					id="sceneAnimation-priority-slider"
					ref="elPrioritySlider"
					v-model="form.priority"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					:label="t('components.sceneAnimation-priority-box.label') || 'Priority'"
					id="sceneAnimation-priority"
					ref="elPriority"
					v-model="form.priority"
					min="-512"
					max="512"
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
import { Inspector } from '@app/inspector/inspector.ts';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { sceneAnimationContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(sceneAnimationContextKey)!;

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.sceneAnimation?.animationIdWrite?.({ value });
};

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elAnimationId = ref<InstanceType<typeof CustomBox> | null>(null);
const elRotatable = ref<InstanceType<typeof SelectBox> | null>(null);
const elAngleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elScale = ref<InstanceType<typeof NumberBox> | null>(null);
const elSpeedSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elSpeed = ref<InstanceType<typeof NumberBox> | null>(null);
const elOpacitySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elOpacity = ref<InstanceType<typeof NumberBox> | null>(null);
const elPrioritySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elPriority = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'sceneAnimation-animationId', elAnimationId.value);
	registerElement(inspectorEls, 'sceneAnimation-rotatable', elRotatable.value);
	registerElement(inspectorEls, 'sceneAnimation-angle', elAngle.value);
	registerElement(inspectorEls, 'sceneAnimation-scale', elScale.value);
	registerElement(inspectorEls, 'sceneAnimation-speed', elSpeed.value);
	registerElement(inspectorEls, 'sceneAnimation-opacity', elOpacity.value);
	registerElement(inspectorEls, 'sceneAnimation-priority', elPriority.value);
	registerElement(inspectorEls, 'sceneAnimation-angle-slider', elAngleSlider.value);
	registerElement(inspectorEls, 'sceneAnimation-scale-slider', elScaleSlider.value);
	registerElement(inspectorEls, 'sceneAnimation-speed-slider', elSpeedSlider.value);
	registerElement(inspectorEls, 'sceneAnimation-opacity-slider', elOpacitySlider.value);
	registerElement(inspectorEls, 'sceneAnimation-priority-slider', elPrioritySlider.value);
	elRotatable.value?.loadItems([
		{
			name: t('components.sceneAnimation-rotatable.options.true.name'),
			tip: t('components.sceneAnimation-rotatable.options.true.tip'),
			value: true
		},
		{
			name: t('components.sceneAnimation-rotatable.options.false.name'),
			tip: t('components.sceneAnimation-rotatable.options.false.tip'),
			value: false
		}
	]);
	elAngleSlider.value?.synchronize(elAngle.value?.root as SyncTarget);
	elScaleSlider.value?.synchronize(elScale.value?.root as SyncTarget);
	elSpeedSlider.value?.synchronize(elSpeed.value?.root as SyncTarget);
	elOpacitySlider.value?.synchronize(elOpacity.value?.root as SyncTarget);
	elPrioritySlider.value?.synchronize(elPriority.value?.root as SyncTarget);
	// `write` 已由模板上的 `@write="onAnimationIdWrite"` 处理（见该处理器的注释），
	// 原先这里还额外用元素优先 API 订阅了一遍 —— 两条路径打的是同一个回调，属重复，已删。
});
</script>
