<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-scale-grid.label') || 'Scale'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-scale-grid">
			<div class="text">
				{{ t('components.particleLayer-scale-factor-box.label') || 'Scale Factor' }}
			</div>
			<div class="flex-box" id="particleLayer-scale-factor-box">
				<NumberBox
					:label="t('components.particleLayer-scale-factor-box.label') || 'Scale Factor'"
					id="particleLayer-scale-factor-0"
					:ref="controlRef('particleLayer-scale-factor-0')"
					v-tip="t('components.particleLayer-scale-factor-0.tip')"
					v-model="form.scale.factor[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-factor-1"
					:ref="controlRef('particleLayer-scale-factor-1')"
					v-tip="t('components.particleLayer-scale-factor-1.tip')"
					v-model="form.scale.factor[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-scale-speed-box.label') || 'Expansion Speed' }}
			</div>
			<div class="flex-box" id="particleLayer-scale-speed-box">
				<NumberBox
					:label="
						t('components.particleLayer-scale-speed-box.label') || 'Expansion Speed'
					"
					id="particleLayer-scale-speed-0"
					:ref="controlRef('particleLayer-scale-speed-0')"
					v-tip="t('components.particleLayer-scale-speed-0.tip')"
					v-model="form.scale.speed[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-speed-1"
					:ref="controlRef('particleLayer-scale-speed-1')"
					v-tip="t('components.particleLayer-scale-speed-1.tip')"
					v-model="form.scale.speed[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-scale-accel-box.label') || 'Expansion Accel' }}
			</div>
			<div class="flex-box" id="particleLayer-scale-accel-box">
				<NumberBox
					:label="
						t('components.particleLayer-scale-accel-box.label') || 'Expansion Accel'
					"
					id="particleLayer-scale-accel-0"
					:ref="controlRef('particleLayer-scale-accel-0')"
					v-tip="t('components.particleLayer-scale-accel-0.tip')"
					v-model="form.scale.accel[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-scale-accel-1"
					:ref="controlRef('particleLayer-scale-accel-1')"
					v-tip="t('components.particleLayer-scale-accel-1.tip')"
					v-model="form.scale.accel[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
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
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import { particleLayerContextKey } from './context.ts';
import { useControlRefs } from '@app/composables/control-refs';

/** 控件 id 联合：模板与脚本共用，拼错在 tsc / vue-tsc 就红。 */
type Id =
	| 'particleLayer-scale-accel-0'
	| 'particleLayer-scale-accel-1'
	| 'particleLayer-scale-factor-0'
	| 'particleLayer-scale-factor-1'
	| 'particleLayer-scale-speed-0'
	| 'particleLayer-scale-speed-1';

const { controlRef } = useControlRefs<Id>();

const { t } = useI18n();
const { form, onParamInput } = inject(particleLayerContextKey)!;
</script>
