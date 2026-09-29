<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-hRotation-grid.label') || 'Horizontal Rotation'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-hRotation-grid">
			<div class="text">
				{{ t('components.particleLayer-hRotation-radius-box.label') || 'Initial Radius' }}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-radius-box">
				<NumberBox
					id="particleLayer-hRotation-radius-0"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-radius-0')"
					v-tip="t('components.particleLayer-hRotation-radius-0.tip')"
					v-model="form.hRotation.radius[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-radius-1"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-radius-1')"
					v-tip="t('components.particleLayer-hRotation-radius-1.tip')"
					v-model="form.hRotation.radius[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					unit="px"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-expansionSpeed-box.label') ||
					'Expansion Speed'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-expansionSpeed-box">
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-0"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-expansionSpeed-0')"
					v-tip="t('components.particleLayer-hRotation-expansionSpeed-0.tip')"
					v-model="form.hRotation.expansionSpeed[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionSpeed-1"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-expansionSpeed-1')"
					v-tip="t('components.particleLayer-hRotation-expansionSpeed-1.tip')"
					v-model="form.hRotation.expansionSpeed[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-expansionAccel-box.label') ||
					'Expansion Accel'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-expansionAccel-box">
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-0"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-expansionAccel-0')"
					v-tip="t('components.particleLayer-hRotation-expansionAccel-0.tip')"
					v-model="form.hRotation.expansionAccel[0]"
					@input="onParamInput"
					min="-10000"
					max="10000"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-expansionAccel-1"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-expansionAccel-1')"
					v-tip="t('components.particleLayer-hRotation-expansionAccel-1.tip')"
					v-model="form.hRotation.expansionAccel[1]"
					@input="onParamInput"
					min="0"
					max="10000"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-hRotation-angle-box.label') || 'Rotation Angle' }}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-angle-box">
				<NumberBox
					id="particleLayer-hRotation-angle-0"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-angle-0')"
					v-tip="t('components.particleLayer-hRotation-angle-0.tip')"
					v-model="form.hRotation.angle[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					unit="deg"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angle-1"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-angle-1')"
					v-tip="t('components.particleLayer-hRotation-angle-1.tip')"
					v-model="form.hRotation.angle[1]"
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
				{{
					t('components.particleLayer-hRotation-angularSpeed-box.label') ||
					'Angular Velocity'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-angularSpeed-box">
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-0"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-angularSpeed-0')"
					v-tip="t('components.particleLayer-hRotation-angularSpeed-0.tip')"
					v-model="form.hRotation.angularSpeed[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularSpeed-1"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-angularSpeed-1')"
					v-tip="t('components.particleLayer-hRotation-angularSpeed-1.tip')"
					v-model="form.hRotation.angularSpeed[1]"
					@input="onParamInput"
					min="0"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{
					t('components.particleLayer-hRotation-angularAccel-box.label') ||
					'Angular Accel'
				}}
			</div>
			<div class="flex-box" id="particleLayer-hRotation-angularAccel-box">
				<NumberBox
					id="particleLayer-hRotation-angularAccel-0"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-angularAccel-0')"
					v-tip="t('components.particleLayer-hRotation-angularAccel-0.tip')"
					v-model="form.hRotation.angularAccel[0]"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="15"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-hRotation-angularAccel-1"
					:ref="registryRef(inspectorEls, 'particleLayer-hRotation-angularAccel-1')"
					v-tip="t('components.particleLayer-hRotation-angularAccel-1.tip')"
					v-model="form.hRotation.angularAccel[1]"
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
