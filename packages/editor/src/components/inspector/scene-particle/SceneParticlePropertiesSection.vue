<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParticle-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParticle-general-grid">
			<div class="text">{{ t('components.sceneParticle-name.label') || 'Name' }}</div>
			<TextBox
				id="sceneParticle-name"
				:ref="registryRef(inspectorEls, 'sceneParticle-name')"
				v-tip="t('components.sceneParticle-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">
				{{ t('components.sceneParticle-particleId.label') || 'Particle' }}
			</div>
			<CustomBox
				id="sceneParticle-particleId"
				:ref="registryRef(inspectorEls, 'sceneParticle-particleId')"
				v-tip="t('components.sceneParticle-particleId.tip')"
				:model-value="form.particleId"
				@input="onParamInput"
				type="file"
				filter="particle"
			></CustomBox>
			<div class="text">{{ t('components.sceneParticle-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneParticle-x"
				:ref="registryRef(inspectorEls, 'sceneParticle-x')"
				v-tip="t('components.sceneParticle-x.tip')"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParticle-y.label') || 'Y' }}</div>
			<NumberBox
				id="sceneParticle-y"
				:ref="registryRef(inspectorEls, 'sceneParticle-y')"
				v-tip="t('components.sceneParticle-y.tip')"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParticle-angle-box.label') || 'Angle' }}</div>
			<div
				class="flex-box"
				id="sceneParticle-angle-box"
				v-tip="t('components.sceneParticle-angle-box.tip')"
			>
				<SliderBox
					id="sceneParticle-angle-slider"
					ref="elAngleSlider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneParticle-angle"
					ref="elAngle"
					v-model="form.angle"
					@input="onParamInput"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-scale-box.label') || 'Scale' }}</div>
			<div
				class="flex-box"
				id="sceneParticle-scale-box"
				v-tip="t('components.sceneParticle-scale-box.tip')"
			>
				<SliderBox
					id="sceneParticle-scale-slider"
					ref="elScaleSlider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-scale"
					ref="elScale"
					v-model="form.scale"
					@input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-speed-box.label') || 'Speed' }}</div>
			<div
				class="flex-box"
				id="sceneParticle-speed-box"
				v-tip="t('components.sceneParticle-speed-box.tip')"
			>
				<SliderBox
					id="sceneParticle-speed-slider"
					ref="elSpeedSlider"
					v-model="form.speed"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-speed"
					ref="elSpeed"
					v-model="form.speed"
					@input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParticle-opacity-box.label') || 'Opacity' }}
			</div>
			<div
				class="flex-box"
				id="sceneParticle-opacity-box"
				v-tip="t('components.sceneParticle-opacity-box.tip')"
			>
				<SliderBox
					id="sceneParticle-opacity-slider"
					ref="elOpacitySlider"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneParticle-opacity"
					ref="elOpacity"
					v-model="form.opacity"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParticle-priority-box.label') || 'Priority' }}
			</div>
			<div
				class="flex-box"
				id="sceneParticle-priority-box"
				v-tip="t('components.sceneParticle-priority-box.tip')"
			>
				<SliderBox
					id="sceneParticle-priority-slider"
					ref="elPrioritySlider"
					v-model="form.priority"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-priority"
					ref="elPriority"
					v-model="form.priority"
					@input="onParamInput"
					min="-512"
					max="512"
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
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { sceneParticleContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(sceneParticleContextKey)!;

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

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
	registerElement(inspectorEls, 'sceneParticle-angle', elAngle.value);
	registerElement(inspectorEls, 'sceneParticle-scale', elScale.value);
	registerElement(inspectorEls, 'sceneParticle-speed', elSpeed.value);
	registerElement(inspectorEls, 'sceneParticle-opacity', elOpacity.value);
	registerElement(inspectorEls, 'sceneParticle-priority', elPriority.value);
	registerElement(inspectorEls, 'sceneParticle-angle-slider', elAngleSlider.value);
	registerElement(inspectorEls, 'sceneParticle-scale-slider', elScaleSlider.value);
	registerElement(inspectorEls, 'sceneParticle-speed-slider', elSpeedSlider.value);
	registerElement(inspectorEls, 'sceneParticle-opacity-slider', elOpacitySlider.value);
	registerElement(inspectorEls, 'sceneParticle-priority-slider', elPrioritySlider.value);
	try {
		elAngleSlider.value?.synchronize(elAngle.value?.root as SyncTarget);
		elScaleSlider.value?.synchronize(elScale.value?.root as SyncTarget);
		elSpeedSlider.value?.synchronize(elSpeed.value?.root as SyncTarget);
		elOpacitySlider.value?.synchronize(elOpacity.value?.root as SyncTarget);
		elPrioritySlider.value?.synchronize(elPriority.value?.root as SyncTarget);
	} catch (e) {
		console.warn('[SceneParticlePage] properties init skipped:', (e as Error)?.message);
	}
});
</script>
