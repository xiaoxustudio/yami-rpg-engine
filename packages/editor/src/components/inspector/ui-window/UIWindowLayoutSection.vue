<template>
	<div class="text">{{ t('components.uiWindow-layout.label') || 'Layout' }}</div>
	<SelectBox
		ref="elLayout"
		id="uiWindow-layout"
		v-tip="t('components.uiWindow-layout.tip')"
		v-model="form.layout"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiWindow-scrollX.label') || 'Scroll X' }}</div>
	<NumberBox
		ref="elScrollX"
		id="uiWindow-scrollX"
		v-tip="t('components.uiWindow-scrollX.tip')"
		v-model="form.scrollX"
		min="0"
		max="10000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-scrollY.label') || 'Scroll Y' }}</div>
	<NumberBox
		ref="elScrollY"
		id="uiWindow-scrollY"
		v-tip="t('components.uiWindow-scrollY.tip')"
		v-model="form.scrollY"
		min="0"
		max="10000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-gridWidth.label') || 'Grid Width' }}</div>
	<NumberBox
		ref="elGridWidth"
		id="uiWindow-gridWidth"
		v-tip="t('components.uiWindow-gridWidth.tip')"
		v-model="form.gridWidth"
		min="0"
		max="1000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-gridHeight.label') || 'Grid Height' }}</div>
	<NumberBox
		ref="elGridHeight"
		id="uiWindow-gridHeight"
		v-tip="t('components.uiWindow-gridHeight.tip')"
		v-model="form.gridHeight"
		min="0"
		max="1000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-gridGapX.label') || 'Grid Gap X' }}</div>
	<NumberBox
		ref="elGridGapX"
		id="uiWindow-gridGapX"
		v-tip="t('components.uiWindow-gridGapX.tip')"
		v-model="form.gridGapX"
		min="0"
		max="1000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-gridGapY.label') || 'Grid Gap Y' }}</div>
	<NumberBox
		ref="elGridGapY"
		id="uiWindow-gridGapY"
		v-tip="t('components.uiWindow-gridGapY.tip')"
		v-model="form.gridGapY"
		min="0"
		max="1000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-paddingX.label') || 'Padding X' }}</div>
	<NumberBox
		ref="elPaddingX"
		id="uiWindow-paddingX"
		v-tip="t('components.uiWindow-paddingX.tip')"
		v-model="form.paddingX"
		min="0"
		max="1000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">{{ t('components.uiWindow-paddingY.label') || 'Padding Y' }}</div>
	<NumberBox
		ref="elPaddingY"
		id="uiWindow-paddingY"
		v-tip="t('components.uiWindow-paddingY.tip')"
		v-model="form.paddingY"
		min="0"
		max="1000"
		unit="px"
		@input="onParamInput"
	></NumberBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiWindowContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiWindowContextKey)!;

const elLayout = ref<InstanceType<typeof SelectBox> | null>(null);
const elScrollX = ref<InstanceType<typeof NumberBox> | null>(null);
const elScrollY = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridGapX = ref<InstanceType<typeof NumberBox> | null>(null);
const elGridGapY = ref<InstanceType<typeof NumberBox> | null>(null);
const elPaddingX = ref<InstanceType<typeof NumberBox> | null>(null);
const elPaddingY = ref<InstanceType<typeof NumberBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiWindow-layout', elLayout.value);
	registerElement(inspectorEls, 'uiWindow-scrollX', elScrollX.value);
	registerElement(inspectorEls, 'uiWindow-scrollY', elScrollY.value);
	registerElement(inspectorEls, 'uiWindow-gridWidth', elGridWidth.value);
	registerElement(inspectorEls, 'uiWindow-gridHeight', elGridHeight.value);
	registerElement(inspectorEls, 'uiWindow-gridGapX', elGridGapX.value);
	registerElement(inspectorEls, 'uiWindow-gridGapY', elGridGapY.value);
	registerElement(inspectorEls, 'uiWindow-paddingX', elPaddingX.value);
	registerElement(inspectorEls, 'uiWindow-paddingY', elPaddingY.value);
	elLayout.value?.loadItems([
		{
			name: t('components.uiWindow-layout.options.normal.name'),
			tip: t('components.uiWindow-layout.options.normal.tip'),
			value: 'normal'
		},
		{
			name: t('components.uiWindow-layout.options.horizontal-grid.name'),
			tip: t('components.uiWindow-layout.options.horizontal-grid.tip'),
			value: 'horizontal-grid'
		},
		{
			name: t('components.uiWindow-layout.options.vertical-grid.name'),
			tip: t('components.uiWindow-layout.options.vertical-grid.tip'),
			value: 'vertical-grid'
		}
	]);
	elLayout.value?.enableHiddenMode();
	elLayout.value?.relate([
		{
			case: 'normal',
			targets: [elScrollX.value?.root ?? null, elScrollY.value?.root ?? null]
		},
		{
			case: ['horizontal-grid', 'vertical-grid'],
			targets: [
				elScrollX.value?.root ?? null,
				elScrollY.value?.root ?? null,
				elGridWidth.value?.root ?? null,
				elGridHeight.value?.root ?? null,
				elGridGapX.value?.root ?? null,
				elGridGapY.value?.root ?? null,
				elPaddingX.value?.root ?? null,
				elPaddingY.value?.root ?? null
			]
		}
	]);
});
</script>
