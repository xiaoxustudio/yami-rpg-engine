<template>
	<div class="text">{{ t('components.uiText-effect-type.label') || 'Effect' }}</div>
	<SelectBox
		ref="elEffectType"
		id="uiText-effect-type"
		v-tip="t('components.uiText-effect-type.tip')"
		v-model="form.effect.type"
		@input="onParamInput"
	></SelectBox>
	<div class="text">
		{{ t('components.uiText-effect-shadowOffsetX.label') || 'Shadow X' }}
	</div>
	<NumberBox
		ref="elShadowOffsetX"
		id="uiText-effect-shadowOffsetX"
		v-tip="t('components.uiText-effect-shadowOffsetX.tip')"
		v-model="form.effect.shadowOffsetX"
		min="-9"
		max="9"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiText-effect-shadowOffsetY.label') || 'Shadow Y' }}
	</div>
	<NumberBox
		ref="elShadowOffsetY"
		id="uiText-effect-shadowOffsetY"
		v-tip="t('components.uiText-effect-shadowOffsetY.tip')"
		v-model="form.effect.shadowOffsetY"
		min="-9"
		max="9"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiText-effect-strokeWidth.label') || 'Stroke Width' }}
	</div>
	<NumberBox
		ref="elStrokeWidth"
		id="uiText-effect-strokeWidth"
		v-tip="t('components.uiText-effect-strokeWidth.tip')"
		v-model="form.effect.strokeWidth"
		min="1"
		max="20"
		unit="px"
		@input="onParamInput"
	></NumberBox>
	<div class="text">
		{{ t('components.uiText-effect-color.label') || 'Effect Color' }}
	</div>
	<ColorBox
		ref="elEffectColor"
		id="uiText-effect-color"
		v-tip="t('components.uiText-effect-color.tip')"
		v-model="form.effect.color"
		@input="onParamInput"
	></ColorBox>
	<div class="text">{{ t('components.uiText-overflow.label') || 'Overflow' }}</div>
	<SelectBox
		ref="elOverflow"
		id="uiText-overflow"
		v-tip="t('components.uiText-overflow.tip')"
		v-model="form.overflow"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.uiText-blend.label') || 'Blend' }}</div>
	<SelectBox
		ref="elBlend"
		id="uiText-blend"
		v-tip="t('components.uiText-blend.tip')"
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
import { uiTextContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(uiTextContextKey)!;

const elEffectType = ref<InstanceType<typeof SelectBox> | null>(null);
const elOverflow = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elShadowOffsetX = ref<InstanceType<typeof NumberBox> | null>(null);
const elShadowOffsetY = ref<InstanceType<typeof NumberBox> | null>(null);
const elStrokeWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elEffectColor = ref<InstanceType<typeof ColorBox> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'uiText-effect-type', elEffectType.value);
	registerElement(inspectorEls, 'uiText-effect-shadowOffsetX', elShadowOffsetX.value);
	registerElement(inspectorEls, 'uiText-effect-shadowOffsetY', elShadowOffsetY.value);
	registerElement(inspectorEls, 'uiText-effect-strokeWidth', elStrokeWidth.value);
	registerElement(inspectorEls, 'uiText-effect-color', elEffectColor.value);
	registerElement(inspectorEls, 'uiText-overflow', elOverflow.value);
	registerElement(inspectorEls, 'uiText-blend', elBlend.value);
	elEffectType.value?.loadItems([
		{
			name: t('components.uiText-effect-type.options.none.name'),
			tip: t('components.uiText-effect-type.options.none.tip'),
			value: 'none'
		},
		{
			name: t('components.uiText-effect-type.options.shadow.name'),
			tip: t('components.uiText-effect-type.options.shadow.tip'),
			value: 'shadow'
		},
		{
			name: t('components.uiText-effect-type.options.stroke.name'),
			tip: t('components.uiText-effect-type.options.stroke.tip'),
			value: 'stroke'
		},
		{
			name: t('components.uiText-effect-type.options.outline.name'),
			tip: t('components.uiText-effect-type.options.outline.tip'),
			value: 'outline'
		}
	]);
	elOverflow.value?.loadItems([
		{
			name: t('components.uiText-overflow.options.visible.name'),
			tip: t('components.uiText-overflow.options.visible.tip'),
			value: 'visible'
		},
		{
			name: t('components.uiText-overflow.options.wrap.name'),
			tip: t('components.uiText-overflow.options.wrap.tip'),
			value: 'wrap'
		},
		{
			name: t('components.uiText-overflow.options.truncate.name'),
			tip: t('components.uiText-overflow.options.truncate.tip'),
			value: 'truncate'
		},
		{
			name: t('components.uiText-overflow.options.wrap-truncate.name'),
			tip: t('components.uiText-overflow.options.wrap-truncate.tip'),
			value: 'wrap-truncate'
		}
	]);
	elBlend.value?.loadItems([
		{
			name: t('components.uiText-blend.options.normal.name'),
			tip: t('components.uiText-blend.options.normal.tip'),
			value: 'normal'
		},
		{
			name: t('components.uiText-blend.options.additive.name'),
			tip: t('components.uiText-blend.options.additive.tip'),
			value: 'additive'
		},
		{
			name: t('components.uiText-blend.options.subtract.name'),
			tip: t('components.uiText-blend.options.subtract.tip'),
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
