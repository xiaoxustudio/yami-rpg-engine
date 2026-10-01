<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-movement-grid.label') || 'Movement'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-movement-grid">
			<div class="text">
				{{ t('components.particleLayer-movement-angle-box.label') || 'Movement Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-angle-box">
				<NumberBox
					:label="
						t('components.particleLayer-movement-angle-box.label') || 'Movement Angle'
					"
					id="particleLayer-movement-angle-0"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-angle-0')"
					v-tip="t('components.particleLayer-movement-angle-0.tip')"
					v-model="form.movement.angle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-angle-1"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-angle-1')"
					v-tip="t('components.particleLayer-movement-angle-1.tip')"
					v-model="form.movement.angle[1]"
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
				{{ t('components.particleLayer-movement-speed-box.label') || 'Movement Speed' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-speed-box">
				<NumberBox
					:label="
						t('components.particleLayer-movement-speed-box.label') || 'Movement Speed'
					"
					id="particleLayer-movement-speed-0"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-speed-0')"
					v-tip="t('components.particleLayer-movement-speed-0.tip')"
					v-model="form.movement.speed[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-speed-1"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-speed-1')"
					v-tip="t('components.particleLayer-movement-speed-1.tip')"
					v-model="form.movement.speed[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-movement-accelAngle-box.label') || 'Accel Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-accelAngle-box">
				<NumberBox
					:label="
						t('components.particleLayer-movement-accelAngle-box.label') || 'Accel Angle'
					"
					id="particleLayer-movement-accelAngle-0"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-accelAngle-0')"
					v-tip="t('components.particleLayer-movement-accelAngle-0.tip')"
					v-model="form.movement.accelAngle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accelAngle-1"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-accelAngle-1')"
					v-tip="t('components.particleLayer-movement-accelAngle-1.tip')"
					v-model="form.movement.accelAngle[1]"
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
				{{ t('components.particleLayer-movement-accel-box.label') || 'Accel' }}
			</div>
			<div class="flex-box" id="particleLayer-movement-accel-box">
				<NumberBox
					:label="t('components.particleLayer-movement-accel-box.label') || 'Accel'"
					id="particleLayer-movement-accel-0"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-accel-0')"
					v-tip="t('components.particleLayer-movement-accel-0.tip')"
					v-model="form.movement.accel[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-movement-accel-1"
					:ref="registryRef(inspectorEls, 'particleLayer-movement-accel-1')"
					v-tip="t('components.particleLayer-movement-accel-1.tip')"
					v-model="form.movement.accel[1]"
					@input="onParamInput"
					min="0"
					max="10000"
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
