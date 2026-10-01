<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-general-grid">
			<div class="text">{{ t('components.sceneParallax-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.sceneParallax-name.label') || 'Name'"
				id="sceneParallax-name"
				:ref="registryRef(inspectorEls, 'sceneParallax-name')"
				v-tip="t('components.sceneParallax-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneParallax-image.label') || 'Image' }}</div>
			<CustomBox
				id="sceneParallax-image"
				:ref="registryRef(inspectorEls, 'sceneParallax-image')"
				v-tip="t('components.sceneParallax-image.tip')"
				:model-value="form.image"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.sceneParallax-layer.label') || 'Layer' }}</div>
			<SelectBox
				id="sceneParallax-layer"
				v-tip="t('components.sceneParallax-layer.tip')"
				ref="elLayer"
				v-model="form.layer"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneParallax-order.label') || 'Order' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-order.label') || 'Order'"
				id="sceneParallax-order"
				:ref="registryRef(inspectorEls, 'sceneParallax-order')"
				v-tip="t('components.sceneParallax-order.tip')"
				v-model="form.order"
				@input="onParamInput"
				min="0"
				max="100"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-light.label') || 'Light Sampling' }}
			</div>
			<SelectBox
				id="sceneParallax-light"
				v-tip="t('components.sceneParallax-light.tip')"
				ref="elLight"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneParallax-blend.label') || 'Blend' }}</div>
			<SelectBox
				id="sceneParallax-blend"
				v-tip="t('components.sceneParallax-blend.tip')"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneParallax-opacity.label') || 'Opacity' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-opacity.label') || 'Opacity'"
				id="sceneParallax-opacity"
				:ref="registryRef(inspectorEls, 'sceneParallax-opacity')"
				v-tip="t('components.sceneParallax-opacity.tip')"
				v-model="form.opacity"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-x.label') || 'X' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-x.label') || 'X'"
				id="sceneParallax-x"
				:ref="registryRef(inspectorEls, 'sceneParallax-x')"
				v-tip="t('components.sceneParallax-x.tip')"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-y.label') || 'Y' }}</div>
			<NumberBox
				:label="t('components.sceneParallax-y.label') || 'Y'"
				id="sceneParallax-y"
				:ref="registryRef(inspectorEls, 'sceneParallax-y')"
				v-tip="t('components.sceneParallax-y.tip')"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { sceneParallaxContextKey } from './context.ts';

const { t } = useI18n();
const { form, onParamInput } = inject(sceneParallaxContextKey)!;

const elLayer = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);

// 三个下拉的选项名跟随语言。放在 setup 顶层即可——`useLocalizedOptions` 内部用
// **全局 Composer** + `watchEffect`：既跟踪语言切换，也跟踪 `:ref` 挂载后 ref 的赋值（挂载完成时
// effect 因读到新 ref 重跑，那时才真正 `loadItems`）。在**事件回调**里调用本组合式函数，
// 运行期会抛 vue-i18n 的 `Must be called at the top of a setup function`。
useLocalizedOptions('sceneParallax-layer', ['background', 'foreground'], (items) =>
	elLayer.value?.loadItems?.(items)
);
useLocalizedOptions('sceneParallax-light', ['raw', 'global', 'anchor', 'ambient'], (items) =>
	elLight.value?.loadItems?.(items)
);
useLocalizedOptions('sceneParallax-blend', ['normal', 'additive', 'subtract'], (items) =>
	elBlend.value?.loadItems?.(items)
);

onMounted(() => {
	registerElement(inspectorEls, 'sceneParallax-layer', elLayer.value);
	registerElement(inspectorEls, 'sceneParallax-light', elLight.value);
	registerElement(inspectorEls, 'sceneParallax-blend', elBlend.value);
});
</script>
