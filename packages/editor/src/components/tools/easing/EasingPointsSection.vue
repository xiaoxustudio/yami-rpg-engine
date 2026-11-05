<template>
	<div class="field-set" id="easing-points-fieldset">
		<div class="legend">{{ t('components.easing-points-grid.label') }}</div>
		<div class="grid-box" id="easing-points-grid" ref="gridRef">
			<div class="text">{{ t('components.easing-mode.label') }}</div>
			<SelectBox
				:label="t('components.easing-mode.label')"
				id="easing-mode"
				v-tip="t('components.easing-mode.tip')"
				ref="modeRef"
				v-model="form.mode"
			/>
			<div class="text" id="easing-points-0">
				{{ t('components.easing-points-0.content') }}
			</div>
			<NumberBox
				:label="t('components.easing-points-0.content')"
				id="easing-points-0-x"
				:ref="(el: unknown) => setPoint('easing-points-0-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-0-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-1-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-1-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-2-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-2-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-3-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-3-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-4-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-4-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-5-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-5-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-6-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-6-y', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-7-x', el)"
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
				:ref="(el: unknown) => setPoint('easing-points-7-y', el)"
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
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideEasingPointsHandles,
	resetEasingPointsHandles,
	type EasingPointsHandles
} from '@app/composables/easing-handles';
import type { YamiElement } from '@app/types/element-api';
import { useEasingWindow } from '@app/composables/useEasingWindow';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const { t } = useI18n();
const { form } = useEasingWindow();

/** 网格 / 模式下拉 / 16 个控制点一次交给单例。 */
const gridRef = ref<unknown>(null);
const modeRef = ref<unknown>(null);
const pointEls: Record<string, HTMLElement> = {};

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

const setPoint = (id: string, target: unknown): void => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	if (el instanceof HTMLElement) pointEls[id] = el;
	else delete pointEls[id];
};

let pointsHandles: EasingPointsHandles | null = null;

onMounted(() => {
	const grid = rootOf(gridRef.value);
	const mode = rootOf(modeRef.value);
	if (!grid || !mode || Object.keys(pointEls).length === 0) return;
	pointsHandles = { grid, mode, points: pointEls };
	provideEasingPointsHandles(pointsHandles);
	onUnmounted(() => {
		if (pointsHandles) resetEasingPointsHandles(pointsHandles);
	});
});
</script>
