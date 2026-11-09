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
				:ref="bind('name')"
				v-tip="t('components.sceneParallax-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneParallax-image.label') || 'Image' }}</div>
			<CustomBox
				id="sceneParallax-image"
				:ref="bind('image')"
				v-tip="t('components.sceneParallax-image.tip')"
				:model-value="form.image"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.sceneParallax-layer.label') || 'Layer' }}</div>
			<SelectBox
				:label="t('components.sceneParallax-layer.label') || 'Layer'"
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
				:ref="bind('order')"
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
				:label="t('components.sceneParallax-light.label') || 'Light Sampling'"
				id="sceneParallax-light"
				v-tip="t('components.sceneParallax-light.tip')"
				ref="elLight"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneParallax-blend.label') || 'Blend' }}</div>
			<SelectBox
				:label="t('components.sceneParallax-blend.label') || 'Blend'"
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
				:ref="bind('opacity')"
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
				:ref="bind('x')"
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
				:ref="bind('y')"
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
import { inject, onMounted, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { sceneParallaxPageNodes } from '@app/composables/inspector-page-nodes';
import { useLocalizedOptions } from '@app/composables/useLocalizedOptions';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { sceneParallaxContextKey } from './context.ts';

const { t } = useI18n();

const { bind, dispose } = sceneParallaxPageNodes.scoped();
onUnmounted(dispose);
const { form, onParamInput } = inject(sceneParallaxContextKey)!;

const elLayer = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);

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
	sceneParallaxPageNodes.set('layer', elLayer.value?.root ?? null);
	sceneParallaxPageNodes.set('light', elLight.value?.root ?? null);
	sceneParallaxPageNodes.set('blend', elBlend.value?.root ?? null);
});
</script>
