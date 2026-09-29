<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-rotation-grid.label') || 'Rotation'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-rotation-grid">
			<div class="text">
				{{ t('components.particleLayer-rotation-angle-box.label') || 'Rotation Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-rotation-angle-box">
				<NumberBox
					id="particleLayer-rotation-angle-0"
					:ref="registryRef(inspectorEls, 'particleLayer-rotation-angle-0')"
					v-tip="t('components.particleLayer-rotation-angle-0.tip')"
					v-model="form.rotation.angle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-angle-1"
					:ref="registryRef(inspectorEls, 'particleLayer-rotation-angle-1')"
					v-tip="t('components.particleLayer-rotation-angle-1.tip')"
					v-model="form.rotation.angle[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-rotation-speed-box.label') || 'Angular Velocity' }}
			</div>
			<div class="flex-box" id="particleLayer-rotation-speed-box">
				<NumberBox
					id="particleLayer-rotation-speed-0"
					:ref="registryRef(inspectorEls, 'particleLayer-rotation-speed-0')"
					v-tip="t('components.particleLayer-rotation-speed-0.tip')"
					v-model="form.rotation.speed[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-speed-1"
					:ref="registryRef(inspectorEls, 'particleLayer-rotation-speed-1')"
					v-tip="t('components.particleLayer-rotation-speed-1.tip')"
					v-model="form.rotation.speed[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-rotation-accel-box.label') || 'Angular Accel' }}
			</div>
			<div class="flex-box" id="particleLayer-rotation-accel-box">
				<NumberBox
					id="particleLayer-rotation-accel-0"
					:ref="registryRef(inspectorEls, 'particleLayer-rotation-accel-0')"
					v-tip="t('components.particleLayer-rotation-accel-0.tip')"
					v-model="form.rotation.accel[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-rotation-accel-1"
					:ref="registryRef(inspectorEls, 'particleLayer-rotation-accel-1')"
					v-tip="t('components.particleLayer-rotation-accel-1.tip')"
					v-model="form.rotation.accel[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import { particleLayerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(particleLayerContextKey)!;
</script>
