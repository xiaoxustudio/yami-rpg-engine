<template>
	<div class="text">{{ t('components.particleLayer-image.label') || 'Image' }}</div>
	<CustomBox
		id="particleLayer-image"
		:ref="registryRef(inspectorEls, 'particleLayer-image')"
		v-tip="t('components.particleLayer-image.tip')"
		type="file"
		filter="image"
		:model-value="form.image"
		@input="onParamInput"
	></CustomBox>
	<div class="text">{{ t('components.particleLayer-blend.label') || 'Blend' }}</div>
	<SelectBox
		id="particleLayer-blend"
		v-tip="t('components.particleLayer-blend.tip')"
		ref="elBlend"
		v-model="form.blend"
		@input="onParamInput"
	></SelectBox>
	<div class="text">
		{{ t('components.particleLayer-light.label') || 'Light Sampling' }}
	</div>
	<SelectBox
		id="particleLayer-light"
		v-tip="t('components.particleLayer-light.tip')"
		ref="elLight"
		v-model="form.light"
		@input="onParamInput"
	></SelectBox>
	<div class="text">{{ t('components.particleLayer-sort.label') || 'Sort' }}</div>
	<SelectBox
		id="particleLayer-sort"
		v-tip="t('components.particleLayer-sort.tip')"
		ref="elSort"
		v-model="form.sort"
		@input="onParamInput"
	></SelectBox>
	<div class="text">
		{{ t('components.particleLayer-sprite-mode.label') || 'Sprite Mode' }}
	</div>
	<SelectBox
		id="particleLayer-sprite-mode"
		v-tip="t('components.particleLayer-sprite-mode.tip')"
		ref="elSpriteMode"
		v-model="form.sprite.mode"
		@input="onParamInput"
	></SelectBox>
	<div class="text">
		{{ t('components.particleLayer-sprite-hframes.label') || 'Horiz Frames' }}
	</div>
	<NumberBox
		:label="t('components.particleLayer-sprite-hframes.label') || 'Horiz Frames'"
		id="particleLayer-sprite-hframes"
		:ref="registryRef(inspectorEls, 'particleLayer-sprite-hframes')"
		v-tip="t('components.particleLayer-sprite-hframes.tip')"
		v-model="form.sprite.hframes"
		@input="onParamInput"
		min="1"
		max="100"
	></NumberBox>
	<div class="text">
		{{ t('components.particleLayer-sprite-vframes.label') || 'Vert Frames' }}
	</div>
	<NumberBox
		:label="t('components.particleLayer-sprite-vframes.label') || 'Vert Frames'"
		id="particleLayer-sprite-vframes"
		:ref="registryRef(inspectorEls, 'particleLayer-sprite-vframes')"
		v-tip="t('components.particleLayer-sprite-vframes.tip')"
		v-model="form.sprite.vframes"
		@input="onParamInput"
		min="1"
		max="100"
	></NumberBox>
	<div class="text">
		{{ t('components.particleLayer-sprite-interval.label') || 'Animation Interval' }}
	</div>
	<NumberBox
		:label="t('components.particleLayer-sprite-interval.label') || 'Animation Interval'"
		id="particleLayer-sprite-interval"
		v-tip="t('components.particleLayer-sprite-interval.tip')"
		ref="elSpriteInterval"
		v-model="form.sprite.interval"
		@input="onParamInput"
		min="1"
		max="5000"
		unit="ms"
	></NumberBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { particleLayerContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(particleLayerContextKey)!;

const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elSort = ref<InstanceType<typeof SelectBox> | null>(null);
const elSpriteMode = ref<InstanceType<typeof SelectBox> | null>(null);
const elSpriteInterval = ref<InstanceType<typeof NumberBox> | null>(null);

// 选项名跟随语言。放在 setup 顶层即可——`useLocalizedOptions` 内部用**全局 Composer** +
// `watchEffect`：既跟踪语言切换，也跟踪 `:ref` 挂载后 ref 的赋值（挂载完成时 effect 因读到新 ref
// 重跑，那时才真正 `loadItems`）。在**事件回调**里调用它会抛 vue-i18n 的
// `Must be called at the top of a setup function`。
useLocalizedOptions('particleLayer-blend', ['normal', 'additive', 'subtract'], (items) =>
	elBlend.value?.loadItems?.(items)
);
useLocalizedOptions('particleLayer-light', ['raw', 'global', 'ambient'], (items) =>
	elLight.value?.loadItems?.(items)
);

onMounted(() => {
	registerElement(inspectorEls, 'particleLayer-blend', elBlend.value);
	registerElement(inspectorEls, 'particleLayer-light', elLight.value);
	registerElement(inspectorEls, 'particleLayer-sort', elSort.value);
	registerElement(inspectorEls, 'particleLayer-sprite-mode', elSpriteMode.value);
	registerElement(inspectorEls, 'particleLayer-sprite-interval', elSpriteInterval.value);
	elSort.value?.loadItems([
		{
			name: t('components.particleLayer-sort.options.youngest-in-front.name'),
			tip: t('components.particleLayer-sort.options.youngest-in-front.tip'),
			value: 'youngest-in-front'
		},
		{
			name: t('components.particleLayer-sort.options.oldest-in-front.name'),
			tip: t('components.particleLayer-sort.options.oldest-in-front.tip'),
			value: 'oldest-in-front'
		},
		{
			name: t('components.particleLayer-sort.options.by-scale-factor.name'),
			tip: t('components.particleLayer-sort.options.by-scale-factor.tip'),
			value: 'by-scale-factor'
		}
	]);

	elSpriteMode.value?.loadItems([
		{
			name: t('components.particleLayer-sprite-mode.options.random.name'),
			tip: t('components.particleLayer-sprite-mode.options.random.tip'),
			value: 'random'
		},
		{
			name: t('components.particleLayer-sprite-mode.options.animation.name'),
			tip: t('components.particleLayer-sprite-mode.options.animation.tip'),
			value: 'animation'
		},
		{
			name: t('components.particleLayer-sprite-mode.options.animation-loop.name'),
			tip: t('components.particleLayer-sprite-mode.options.animation-loop.tip'),
			value: 'animation-loop'
		}
	]);
	if (elSpriteMode.value) {
		elSpriteMode.value.enableHiddenMode();
		elSpriteMode.value.relate([
			{
				case: ['animation', 'animation-loop'],
				targets: [elSpriteInterval.value?.root ?? null]
			}
		]);
	}
});
</script>
