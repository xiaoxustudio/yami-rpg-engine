<template>
	<div class="text">{{ t('components.uiProgressBar-image.label') || 'Image' }}</div>
	<CustomBox
		id="uiProgressBar-image"
		:ref="registryRef(inspectorEls, 'uiProgressBar-image')"
		v-tip="t('components.uiProgressBar-image.tip')"
		v-model="form.image"
		type="file"
		filter="image"
		@input="onParamInput"
	></CustomBox>
	<div class="text">{{ t('components.uiProgressBar-display.label') || 'Display' }}</div>
	<SelectBox
		:label="t('components.uiProgressBar-display.label') || 'Display'"
		id="uiProgressBar-display"
		v-tip="t('components.uiProgressBar-display.tip')"
		ref="elDisplay"
		v-model="form.display"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiProgressBar-clip.label') || 'Clip' }}</div>
	<CustomBox
		id="uiProgressBar-clip"
		v-tip="t('components.uiProgressBar-clip.tip')"
		ref="elClip"
		v-model="form.clip"
		type="clip"
		image="uiProgressBar-image"
		@input="onParamInput"
	></CustomBox>
	<div class="text">{{ t('components.uiProgressBar-type.label') || 'Type' }}</div>
	<SelectBox
		:label="t('components.uiProgressBar-type.label') || 'Type'"
		id="uiProgressBar-type"
		v-tip="t('components.uiProgressBar-type.tip')"
		ref="elType"
		v-model="form.type"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiProgressBar-centerX.label') || 'Center X' }}</div>
	<NumberBox
		:label="t('components.uiProgressBar-centerX.label') || 'Center X'"
		id="uiProgressBar-centerX"
		v-tip="t('components.uiProgressBar-centerX.tip')"
		ref="elCenterX"
		v-model="form.centerX"
		min="0"
		max="1"
		step="0.05"
		decimals="4"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiProgressBar-centerY.label') || 'Center Y' }}</div>
	<NumberBox
		:label="t('components.uiProgressBar-centerY.label') || 'Center Y'"
		id="uiProgressBar-centerY"
		v-tip="t('components.uiProgressBar-centerY.tip')"
		ref="elCenterY"
		v-model="form.centerY"
		min="0"
		max="1"
		step="0.05"
		decimals="4"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiProgressBar-startAngle.label') || 'Start Angle' }}
	</div>
	<NumberBox
		:label="t('components.uiProgressBar-startAngle.label') || 'Start Angle'"
		id="uiProgressBar-startAngle"
		v-tip="t('components.uiProgressBar-startAngle.tip')"
		ref="elStartAngle"
		v-model="form.startAngle"
		min="-360"
		max="360"
		step="5"
		decimals="4"
		unit="deg"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiProgressBar-centralAngle.label') || 'Central Angle' }}
	</div>
	<NumberBox
		:label="t('components.uiProgressBar-centralAngle.label') || 'Central Angle'"
		id="uiProgressBar-centralAngle"
		v-tip="t('components.uiProgressBar-centralAngle.tip')"
		ref="elCentralAngle"
		v-model="form.centralAngle"
		min="-360"
		max="360"
		step="5"
		decimals="4"
		unit="deg"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiProgressBar-step.label') || 'Step' }}</div>
	<NumberBox
		:label="t('components.uiProgressBar-step.label') || 'Step'"
		id="uiProgressBar-step"
		:ref="registryRef(inspectorEls, 'uiProgressBar-step')"
		v-tip="t('components.uiProgressBar-step.tip')"
		v-model="form.step"
		min="0"
		max="100"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiProgressBar-progress.label') || 'Progress' }}</div>
	<NumberBox
		:label="t('components.uiProgressBar-progress.label') || 'Progress'"
		id="uiProgressBar-progress"
		:ref="registryRef(inspectorEls, 'uiProgressBar-progress')"
		v-tip="t('components.uiProgressBar-progress.tip')"
		v-model="form.progress"
		min="0"
		max="1"
		step="0.01"
		decimals="4"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiProgressBar-blend.label') || 'Blend' }}</div>
	<SelectBox
		:label="t('components.uiProgressBar-blend.label') || 'Blend'"
		id="uiProgressBar-blend"
		v-tip="t('components.uiProgressBar-blend.tip')"
		ref="elBlend"
		v-model="form.blend"
		@input="onParamInput"
	></SelectBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiProgressBarContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiProgressBarContextKey)!;

const elDisplay = ref<InstanceType<typeof SelectBox> | null>(null);
const elClip = ref<InstanceType<typeof CustomBox> | null>(null);
const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elCenterX = ref<InstanceType<typeof NumberBox> | null>(null);
const elCenterY = ref<InstanceType<typeof NumberBox> | null>(null);
const elStartAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elCentralAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);

const loadItems = (el: InstanceType<typeof SelectBox> | null, items: unknown[]) => {
	el?.loadItems(items);
};

const relate = (
	el: InstanceType<typeof SelectBox> | null,
	config: { case: string | string[]; targets: (HTMLElement | null)[] }[]
) => {
	if (el) {
		el.enableHiddenMode();
		el.relate(config);
	}
};

onMounted(() => {
	registerElement(inspectorEls, 'uiProgressBar-display', elDisplay.value);
	registerElement(inspectorEls, 'uiProgressBar-clip', elClip.value);
	registerElement(inspectorEls, 'uiProgressBar-type', elType.value);
	registerElement(inspectorEls, 'uiProgressBar-centerX', elCenterX.value);
	registerElement(inspectorEls, 'uiProgressBar-centerY', elCenterY.value);
	registerElement(inspectorEls, 'uiProgressBar-startAngle', elStartAngle.value);
	registerElement(inspectorEls, 'uiProgressBar-centralAngle', elCentralAngle.value);
	registerElement(inspectorEls, 'uiProgressBar-blend', elBlend.value);
	loadItems(elDisplay.value, [
		{ name: 'Stretch', value: 'stretch' },
		{ name: 'Clip', value: 'clip' }
	]);
	relate(elDisplay.value, [{ case: 'clip', targets: [elClip.value?.root ?? null] }]);
	loadItems(elType.value, [
		{ name: 'Horizontal', value: 'horizontal' },
		{ name: 'Vertical', value: 'vertical' },
		{ name: 'Round', value: 'round' }
	]);
	relate(elType.value, [
		{
			case: 'round',
			targets: [
				elCenterX.value?.root ?? null,
				elCenterY.value?.root ?? null,
				elStartAngle.value?.root ?? null,
				elCentralAngle.value?.root ?? null
			]
		}
	]);
	loadItems(elBlend.value, [
		{ name: 'Normal', value: 'normal' },
		{ name: 'Additive', value: 'additive' },
		{ name: 'Subtract', value: 'subtract' }
	]);
});
</script>
