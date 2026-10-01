<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-anchor-grid.label') || 'Anchor'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-anchor-grid">
			<div class="text">
				{{ t('components.particleLayer-anchor-x-box.label') || 'Anchor X' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-x-box">
				<NumberBox
					:label="t('components.particleLayer-anchor-x-box.label') || 'Anchor X'"
					id="particleLayer-anchor-x-0"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-x-0')"
					v-tip="t('components.particleLayer-anchor-x-0.tip')"
					v-model="form.anchor.x[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-x-1"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-x-1')"
					v-tip="t('components.particleLayer-anchor-x-1.tip')"
					v-model="form.anchor.x[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-anchor-y-box.label') || 'Anchor Y' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-y-box">
				<NumberBox
					:label="t('components.particleLayer-anchor-y-box.label') || 'Anchor Y'"
					id="particleLayer-anchor-y-0"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-y-0')"
					v-tip="t('components.particleLayer-anchor-y-0.tip')"
					v-model="form.anchor.y[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-y-1"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-y-1')"
					v-tip="t('components.particleLayer-anchor-y-1.tip')"
					v-model="form.anchor.y[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-anchor-speedX-box.label') || 'Anchor Speed X' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-speedX-box">
				<NumberBox
					:label="
						t('components.particleLayer-anchor-speedX-box.label') || 'Anchor Speed X'
					"
					id="particleLayer-anchor-speedX-0"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-speedX-0')"
					v-tip="t('components.particleLayer-anchor-speedX-0.tip')"
					v-model="form.anchor.speedX[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedX-1"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-speedX-1')"
					v-tip="t('components.particleLayer-anchor-speedX-1.tip')"
					v-model="form.anchor.speedX[1]"
					@input="onParamInput"
					min="0"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">dev</div></NumberBox
				>
			</div>
			<div class="text">
				{{ t('components.particleLayer-anchor-speedY-box.label') || 'Anchor Speed Y' }}
			</div>
			<div class="flex-box" id="particleLayer-anchor-speedY-box">
				<NumberBox
					:label="
						t('components.particleLayer-anchor-speedY-box.label') || 'Anchor Speed Y'
					"
					id="particleLayer-anchor-speedY-0"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-speedY-0')"
					v-tip="t('components.particleLayer-anchor-speedY-0.tip')"
					v-model="form.anchor.speedY[0]"
					@input="onParamInput"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					><div class="text label">std</div></NumberBox
				>
				<NumberBox
					id="particleLayer-anchor-speedY-1"
					:ref="registryRef(inspectorEls, 'particleLayer-anchor-speedY-1')"
					v-tip="t('components.particleLayer-anchor-speedY-1.tip')"
					v-model="form.anchor.speedY[1]"
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
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import { particleLayerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(particleLayerContextKey)!;
</script>
