<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.particleLayer-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="particleLayer-general-grid">
			<div class="text">{{ t('components.particleLayer-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.particleLayer-name.label') || 'Name'"
				id="particleLayer-name"
				:ref="registryRef(inspectorEls, 'particleLayer-name')"
				v-tip="t('components.particleLayer-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">
				{{ t('components.particleLayer-area-type.label') || 'Emission Area' }}
			</div>
			<SelectBox
				:label="t('components.particleLayer-area-type.label') || 'Emission Area'"
				id="particleLayer-area-type"
				v-tip="t('components.particleLayer-area-type.tip')"
				ref="elAreaType"
				v-model="form.area.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.particleLayer-area-x.label') || 'X' }}</div>
			<NumberBox
				:label="t('components.particleLayer-area-x.label') || 'X'"
				id="particleLayer-area-x"
				v-tip="t('components.particleLayer-area-x.tip')"
				ref="elAreaX"
				v-model="form.area.x"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-area-y.label') || 'Y' }}</div>
			<NumberBox
				:label="t('components.particleLayer-area-y.label') || 'Y'"
				id="particleLayer-area-y"
				v-tip="t('components.particleLayer-area-y.tip')"
				ref="elAreaY"
				v-model="form.area.y"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-area-width.label') || 'Width' }}</div>
			<NumberBox
				:label="t('components.particleLayer-area-width.label') || 'Width'"
				id="particleLayer-area-width"
				v-tip="t('components.particleLayer-area-width.tip')"
				ref="elAreaWidth"
				v-model="form.area.width"
				@input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-area-height.label') || 'Height' }}
			</div>
			<NumberBox
				:label="t('components.particleLayer-area-height.label') || 'Height'"
				id="particleLayer-area-height"
				v-tip="t('components.particleLayer-area-height.tip')"
				ref="elAreaHeight"
				v-model="form.area.height"
				@input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-area-radius.label') || 'Radius' }}
			</div>
			<NumberBox
				:label="t('components.particleLayer-area-radius.label') || 'Radius'"
				id="particleLayer-area-radius"
				v-tip="t('components.particleLayer-area-radius.tip')"
				ref="elAreaRadius"
				v-model="form.area.radius"
				@input="onParamInput"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-count.label') || 'Emission Count' }}
			</div>
			<NumberBox
				:label="t('components.particleLayer-count.label') || 'Emission Count'"
				id="particleLayer-count"
				:ref="registryRef(inspectorEls, 'particleLayer-count')"
				v-tip="t('components.particleLayer-count.tip')"
				v-model="form.count"
				@input="onParamInput"
				min="0"
				max="1000000000"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-delay.label') || 'Initial Delay' }}
			</div>
			<NumberBox
				:label="t('components.particleLayer-delay.label') || 'Initial Delay'"
				id="particleLayer-delay"
				:ref="registryRef(inspectorEls, 'particleLayer-delay')"
				v-tip="t('components.particleLayer-delay.tip')"
				v-model="form.delay"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-interval.label') || 'Interval' }}</div>
			<NumberBox
				:label="t('components.particleLayer-interval.label') || 'Interval'"
				id="particleLayer-interval"
				:ref="registryRef(inspectorEls, 'particleLayer-interval')"
				v-tip="t('components.particleLayer-interval.tip')"
				v-model="form.interval"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-lifetime.label') || 'Lifetime' }}</div>
			<NumberBox
				:label="t('components.particleLayer-lifetime.label') || 'Lifetime'"
				id="particleLayer-lifetime"
				:ref="registryRef(inspectorEls, 'particleLayer-lifetime')"
				v-tip="t('components.particleLayer-lifetime.tip')"
				v-model="form.lifetime"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">
				{{ t('components.particleLayer-lifetimeDev.label') || 'Lifetime Dev' }}
			</div>
			<NumberBox
				:label="t('components.particleLayer-lifetimeDev.label') || 'Lifetime Dev'"
				id="particleLayer-lifetimeDev"
				:ref="registryRef(inspectorEls, 'particleLayer-lifetimeDev')"
				v-tip="t('components.particleLayer-lifetimeDev.tip')"
				v-model="form.lifetimeDev"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
			<div class="text">{{ t('components.particleLayer-fadeout.label') || 'Fadeout' }}</div>
			<NumberBox
				:label="t('components.particleLayer-fadeout.label') || 'Fadeout'"
				id="particleLayer-fadeout"
				:ref="registryRef(inspectorEls, 'particleLayer-fadeout')"
				v-tip="t('components.particleLayer-fadeout.tip')"
				v-model="form.fadeout"
				@input="onParamInput"
				min="0"
				max="1000000000"
				unit="ms"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import { particleLayerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(particleLayerContextKey)!;

const elAreaType = ref<InstanceType<typeof SelectBox> | null>(null);
const elAreaX = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaY = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elAreaRadius = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'particleLayer-area-type', elAreaType.value);
	registerElement(inspectorEls, 'particleLayer-area-x', elAreaX.value);
	registerElement(inspectorEls, 'particleLayer-area-y', elAreaY.value);
	registerElement(inspectorEls, 'particleLayer-area-width', elAreaWidth.value);
	registerElement(inspectorEls, 'particleLayer-area-height', elAreaHeight.value);
	registerElement(inspectorEls, 'particleLayer-area-radius', elAreaRadius.value);
	elAreaType.value?.loadItems([
		{
			name: t('components.particleLayer-area-type.options.point.name'),
			tip: t('components.particleLayer-area-type.options.point.tip'),
			value: 'point'
		},
		{
			name: t('components.particleLayer-area-type.options.rectangle.name'),
			tip: t('components.particleLayer-area-type.options.rectangle.tip'),
			value: 'rectangle'
		},
		{
			name: t('components.particleLayer-area-type.options.circle.name'),
			tip: t('components.particleLayer-area-type.options.circle.tip'),
			value: 'circle'
		},
		{
			name: t('components.particleLayer-area-type.options.edge.name'),
			tip: t('components.particleLayer-area-type.options.edge.tip'),
			value: 'edge'
		}
	]);
	if (elAreaType.value) {
		elAreaType.value.enableHiddenMode();
		elAreaType.value.relate([
			{
				case: 'point',
				targets: [elAreaX.value?.root ?? null, elAreaY.value?.root ?? null]
			},
			{
				case: 'rectangle',
				targets: [
					elAreaX.value?.root ?? null,
					elAreaY.value?.root ?? null,
					elAreaWidth.value?.root ?? null,
					elAreaHeight.value?.root ?? null
				]
			},
			{
				case: 'circle',
				targets: [
					elAreaX.value?.root ?? null,
					elAreaY.value?.root ?? null,
					elAreaRadius.value?.root ?? null
				]
			}
		]);
	}
});
</script>
