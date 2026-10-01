<template>
	<div class="field-set" id="easing-points-fieldset">
		<div class="legend">{{ t('components.easing-points-grid.label') }}</div>
		<div
			class="grid-box"
			id="easing-points-grid"
			:ref="registryRef(dataEls, 'easing-points-grid')"
		>
			<div class="text">{{ t('components.easing-mode.label') }}</div>
			<SelectBox
				id="easing-mode"
				v-tip="t('components.easing-mode.tip')"
				:ref="registryRef(dataEls, 'easing-mode')"
				v-model="form.mode"
			/>
			<div class="text" id="easing-points-0">
				{{ t('components.easing-points-0.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-0.content')"
				id="easing-points-0-x"
				:ref="registryRef(dataEls, 'easing-points-0-x')"
				v-tip="t('components.easing-points-0-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[0].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-0-y"
				:ref="registryRef(dataEls, 'easing-points-0-y')"
				v-tip="t('components.easing-points-0-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[0].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-1">
				{{ t('components.easing-points-1.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-1.content')"
				id="easing-points-1-x"
				:ref="registryRef(dataEls, 'easing-points-1-x')"
				v-tip="t('components.easing-points-1-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[1].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-1-y"
				:ref="registryRef(dataEls, 'easing-points-1-y')"
				v-tip="t('components.easing-points-1-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[1].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-2">
				{{ t('components.easing-points-2.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-2.content')"
				id="easing-points-2-x"
				:ref="registryRef(dataEls, 'easing-points-2-x')"
				v-tip="t('components.easing-points-2-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[2].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-2-y"
				:ref="registryRef(dataEls, 'easing-points-2-y')"
				v-tip="t('components.easing-points-2-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[2].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-3">
				{{ t('components.easing-points-3.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-3.content')"
				id="easing-points-3-x"
				:ref="registryRef(dataEls, 'easing-points-3-x')"
				v-tip="t('components.easing-points-3-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[3].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-3-y"
				:ref="registryRef(dataEls, 'easing-points-3-y')"
				v-tip="t('components.easing-points-3-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[3].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-4">
				{{ t('components.easing-points-4.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-4.content')"
				id="easing-points-4-x"
				:ref="registryRef(dataEls, 'easing-points-4-x')"
				v-tip="t('components.easing-points-4-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[4].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-4-y"
				:ref="registryRef(dataEls, 'easing-points-4-y')"
				v-tip="t('components.easing-points-4-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[4].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-5">
				{{ t('components.easing-points-5.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-5.content')"
				id="easing-points-5-x"
				:ref="registryRef(dataEls, 'easing-points-5-x')"
				v-tip="t('components.easing-points-5-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[5].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-5-y"
				:ref="registryRef(dataEls, 'easing-points-5-y')"
				v-tip="t('components.easing-points-5-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[5].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-6">
				{{ t('components.easing-points-6.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-6.content')"
				id="easing-points-6-x"
				:ref="registryRef(dataEls, 'easing-points-6-x')"
				v-tip="t('components.easing-points-6-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[6].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-6-y"
				:ref="registryRef(dataEls, 'easing-points-6-y')"
				v-tip="t('components.easing-points-6-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[6].y"
				><div class="text label">Y</div></NumberBox
			>
			<div class="text" id="easing-points-7">
				{{ t('components.easing-points-7.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-7.content')"
				id="easing-points-7-x"
				:ref="registryRef(dataEls, 'easing-points-7-x')"
				v-tip="t('components.easing-points-7-x.tip')"
				min="0"
				max="1"
				step="0.01"
				decimals="2"
				v-model="form.points[7].x"
				><div class="text label">X</div></NumberBox
			>
			<NumberBox
				id="easing-points-7-y"
				:ref="registryRef(dataEls, 'easing-points-7-y')"
				v-tip="t('components.easing-points-7-y.tip')"
				min="-5"
				max="5"
				step="0.01"
				decimals="2"
				v-model="form.points[7].y"
				><div class="text label">Y</div></NumberBox
			>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { dataEls } from '@app/data/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useEasingWindow } from '@app/composables/useEasingWindow';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();
const { form } = useEasingWindow();
</script>
