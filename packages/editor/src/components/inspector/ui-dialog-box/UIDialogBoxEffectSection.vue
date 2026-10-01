<template>
	<div class="text">{{ t('components.uiDialogBox-effect-type.label') || 'Effect' }}</div>
	<SelectBox
		:label="t('components.uiDialogBox-effect-type.label') || 'Effect'"
		ref="elEffectType"
		id="uiDialogBox-effect-type"
		v-tip="t('components.uiDialogBox-effect-type.tip')"
		v-model="form.effect.type"
		@input="onParamInput"
	></SelectBox>
	<div class="text">
		{{ t('components.uiDialogBox-effect-shadowOffsetX.label') || 'Shadow X' }}
	</div>
	<NumberBox
		:label="t('components.uiDialogBox-effect-shadowOffsetX.label') || 'Shadow X'"
		ref="elShadowOffsetX"
		id="uiDialogBox-effect-shadowOffsetX"
		v-tip="t('components.uiDialogBox-effect-shadowOffsetX.tip')"
		v-model="form.effect.shadowOffsetX"
		min="-9"
		max="9"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiDialogBox-effect-shadowOffsetY.label') || 'Shadow Y' }}
	</div>
	<NumberBox
		:label="t('components.uiDialogBox-effect-shadowOffsetY.label') || 'Shadow Y'"
		ref="elShadowOffsetY"
		id="uiDialogBox-effect-shadowOffsetY"
		v-tip="t('components.uiDialogBox-effect-shadowOffsetY.tip')"
		v-model="form.effect.shadowOffsetY"
		min="-9"
		max="9"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiDialogBox-effect-strokeWidth.label') || 'Stroke Width' }}
	</div>
	<NumberBox
		:label="t('components.uiDialogBox-effect-strokeWidth.label') || 'Stroke Width'"
		ref="elStrokeWidth"
		id="uiDialogBox-effect-strokeWidth"
		v-tip="t('components.uiDialogBox-effect-strokeWidth.tip')"
		v-model="form.effect.strokeWidth"
		min="1"
		max="20"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiDialogBox-effect-color.label') || 'Effect Color' }}
	</div>
	<ColorBox
		:label="t('components.uiDialogBox-effect-color.label') || 'Effect Color'"
		ref="elEffectColor"
		id="uiDialogBox-effect-color"
		v-tip="t('components.uiDialogBox-effect-color.tip')"
		v-model="form.effect.color"
		@input="onParamInput"
	></ColorBox>
	<div class="text">{{ t('components.uiDialogBox-blend.label') || 'Blend' }}</div>
	<SelectBox
		:label="t('components.uiDialogBox-blend.label') || 'Blend'"
		ref="elBlend"
		id="uiDialogBox-blend"
		v-tip="t('components.uiDialogBox-blend.tip')"
		v-model="form.blend"
		@input="onParamInput"
	></SelectBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { uiDialogBoxContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiDialogBoxContextKey)!;

const elEffectType = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elShadowOffsetX = ref<InstanceType<typeof NumberBox> | null>(null);
const elShadowOffsetY = ref<InstanceType<typeof NumberBox> | null>(null);
const elStrokeWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elEffectColor = ref<InstanceType<typeof ColorBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiDialogBox-effect-type', elEffectType.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-shadowOffsetX', elShadowOffsetX.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-shadowOffsetY', elShadowOffsetY.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-strokeWidth', elStrokeWidth.value);
	registerElement(inspectorEls, 'uiDialogBox-effect-color', elEffectColor.value);
	registerElement(inspectorEls, 'uiDialogBox-blend', elBlend.value);
	elEffectType.value?.loadItems([
		{
			name: t('components.uiDialogBox-effect-type.options.none.name'),
			tip: t('components.uiDialogBox-effect-type.options.none.tip'),
			value: 'none'
		},
		{
			name: t('components.uiDialogBox-effect-type.options.shadow.name'),
			tip: t('components.uiDialogBox-effect-type.options.shadow.tip'),
			value: 'shadow'
		},
		{
			name: t('components.uiDialogBox-effect-type.options.stroke.name'),
			tip: t('components.uiDialogBox-effect-type.options.stroke.tip'),
			value: 'stroke'
		},
		{
			name: t('components.uiDialogBox-effect-type.options.outline.name'),
			tip: t('components.uiDialogBox-effect-type.options.outline.tip'),
			value: 'outline'
		}
	]);
	elBlend.value?.loadItems([
		{
			name: t('components.uiDialogBox-blend.options.normal.name'),
			tip: t('components.uiDialogBox-blend.options.normal.tip'),
			value: 'normal'
		},
		{
			name: t('components.uiDialogBox-blend.options.additive.name'),
			tip: t('components.uiDialogBox-blend.options.additive.tip'),
			value: 'additive'
		},
		{
			name: t('components.uiDialogBox-blend.options.subtract.name'),
			tip: t('components.uiDialogBox-blend.options.subtract.tip'),
			value: 'subtract'
		}
	]);
	elEffectType.value?.enableHiddenMode();
	elEffectType.value?.relate([
		{
			case: 'shadow',
			targets: [
				elShadowOffsetX.value?.root ?? null,
				elShadowOffsetY.value?.root ?? null,
				elEffectColor.value?.root ?? null
			]
		},
		{
			case: 'stroke',
			targets: [elStrokeWidth.value?.root ?? null, elEffectColor.value?.root ?? null]
		},
		{ case: 'outline', targets: [elEffectColor.value?.root ?? null] }
	]);
});
</script>
