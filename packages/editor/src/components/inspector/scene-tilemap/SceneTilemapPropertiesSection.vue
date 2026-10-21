<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneTilemap-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneTilemap-general-grid">
			<div class="text">{{ t('components.sceneTilemap-name.label') || 'Name' }}</div>
			<TextBox
				:label="t('components.sceneTilemap-name.label') || 'Name'"
				id="sceneTilemap-name"
				:ref="registryRef(inspectorEls, 'sceneTilemap-name')"
				v-tip="t('components.sceneTilemap-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneTilemap-layer.label') || 'Layer' }}</div>
			<SelectBox
				:label="t('components.sceneTilemap-layer.label') || 'Layer'"
				ref="elLayer"
				id="sceneTilemap-layer"
				v-tip="t('components.sceneTilemap-layer.tip')"
				v-model="form.layer"
				@input="onParamInput"
				@write="onLayerWrite"
			></SelectBox>
			<div class="text">{{ t('components.sceneTilemap-order.label') || 'Order' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-order.label') || 'Order'"
				id="sceneTilemap-order"
				:ref="registryRef(inspectorEls, 'sceneTilemap-order')"
				v-model="form.order"
				@input="onParamInput"
				min="0"
				max="100"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneTilemap-light.label') || 'Light Sampling' }}
			</div>
			<SelectBox
				:label="t('components.sceneTilemap-light.label') || 'Light Sampling'"
				ref="elLight"
				id="sceneTilemap-light"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneTilemap-blend.label') || 'Blend' }}</div>
			<SelectBox
				:label="t('components.sceneTilemap-blend.label') || 'Blend'"
				ref="elBlend"
				id="sceneTilemap-blend"
				v-tip="t('components.sceneTilemap-blend.tip')"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneTilemap-x.label') || 'X' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-x.label') || 'X'"
				id="sceneTilemap-x"
				:ref="registryRef(inspectorEls, 'sceneTilemap-x')"
				v-tip="t('components.sceneTilemap-x.tip')"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-y.label') || 'Y' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-y.label') || 'Y'"
				id="sceneTilemap-y"
				:ref="registryRef(inspectorEls, 'sceneTilemap-y')"
				v-tip="t('components.sceneTilemap-y.tip')"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-width.label') || 'Width' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-width.label') || 'Width'"
				id="sceneTilemap-width"
				v-tip="t('components.sceneTilemap-width.tip')"
				v-model="form.width"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-height.label') || 'Height' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-height.label') || 'Height'"
				id="sceneTilemap-height"
				v-tip="t('components.sceneTilemap-height.tip')"
				v-model="form.height"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-anchorX.label') || 'Anchor X' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-anchorX.label') || 'Anchor X'"
				id="sceneTilemap-anchorX"
				:ref="registryRef(inspectorEls, 'sceneTilemap-anchorX')"
				v-tip="t('components.sceneTilemap-anchorX.tip')"
				v-model="form.anchorX"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-anchorY.label') || 'Anchor Y' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-anchorY.label') || 'Anchor Y'"
				id="sceneTilemap-anchorY"
				:ref="registryRef(inspectorEls, 'sceneTilemap-anchorY')"
				v-tip="t('components.sceneTilemap-anchorY.tip')"
				v-model="form.anchorY"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-offsetX.label') || 'Offset X' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-offsetX.label') || 'Offset X'"
				id="sceneTilemap-offsetX"
				:ref="registryRef(inspectorEls, 'sceneTilemap-offsetX')"
				v-tip="t('components.sceneTilemap-offsetX.tip')"
				v-model="form.offsetX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-offsetY.label') || 'Offset Y' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-offsetY.label') || 'Offset Y'"
				id="sceneTilemap-offsetY"
				:ref="registryRef(inspectorEls, 'sceneTilemap-offsetY')"
				v-tip="t('components.sceneTilemap-offsetY.tip')"
				v-model="form.offsetY"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneTilemap-parallaxFactorX.label') || 'Parallax Factor X' }}
			</div>
			<NumberBox
				:label="t('components.sceneTilemap-parallaxFactorX.label') || 'Parallax Factor X'"
				id="sceneTilemap-parallaxFactorX"
				:ref="registryRef(inspectorEls, 'sceneTilemap-parallaxFactorX')"
				v-tip="t('components.sceneTilemap-parallaxFactorX.tip')"
				v-model="form.parallaxFactorX"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneTilemap-parallaxFactorY.label') || 'Parallax Factor Y' }}
			</div>
			<NumberBox
				:label="t('components.sceneTilemap-parallaxFactorY.label') || 'Parallax Factor Y'"
				id="sceneTilemap-parallaxFactorY"
				:ref="registryRef(inspectorEls, 'sceneTilemap-parallaxFactorY')"
				v-tip="t('components.sceneTilemap-parallaxFactorY.tip')"
				v-model="form.parallaxFactorY"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneTilemap-opacity.label') || 'Opacity' }}</div>
			<NumberBox
				:label="t('components.sceneTilemap-opacity.label') || 'Opacity'"
				id="sceneTilemap-opacity"
				:ref="registryRef(inspectorEls, 'sceneTilemap-opacity')"
				v-tip="t('components.sceneTilemap-opacity.tip')"
				v-model="form.opacity"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useEventListener } from '@app/composables/useEventListener';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryRef } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import { getLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { sceneTilemapContextKey } from './context.ts';

const local = getLocalStore();
const { t } = useI18n();
const { form, onParamInput } = inject(sceneTilemapContextKey)!;

const onLayerWrite = (value: unknown) => {
	Inspector?.sceneTilemap?.layerWrite?.({ value });
};

const elLayer = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);

const refreshLocalizedItems = () => {
	try {
		const readOption = (id: string, key: string) => {
			const legacyComponents = local.components as Record<
				string,
				{ options?: Record<string, { name?: string }> }
			>;
			const legacyName = legacyComponents[id]?.options?.[key]?.name;
			if (legacyName) return legacyName;
			return t(`components.${id}.options.${key}.label`);
		};
		const lightRoot = elLight.value?.root as
			| (HTMLElement & {
					lightItems: { all: unknown[]; tile: unknown[]; sprite: unknown[] };
			  })
			| null;
		if (lightRoot) {
			const items = {
				raw: { name: readOption('sceneTilemap-light', 'raw'), value: 'raw' },
				global: { name: readOption('sceneTilemap-light', 'global'), value: 'global' },
				ambient: {
					name: readOption('sceneTilemap-light', 'ambient'),
					value: 'ambient'
				},
				anchor: { name: readOption('sceneTilemap-light', 'anchor'), value: 'anchor' }
			};
			lightRoot.lightItems = {
				all: Object.values(items),
				tile: [items.raw, items.global, items.ambient],
				sprite: [items.raw, items.global, items.anchor]
			};
			elLight.value?.loadItems([items.raw, items.global, items.ambient]);
		}
		elBlend.value?.loadItems([
			{ name: readOption('sceneTilemap-blend', 'normal'), value: 'normal' },
			{ name: readOption('sceneTilemap-blend', 'additive'), value: 'additive' },
			{ name: readOption('sceneTilemap-blend', 'subtract'), value: 'subtract' }
		]);
	} catch {}
};

onMounted(() => {
	registerElement(inspectorEls, 'sceneTilemap-layer', elLayer.value);
	registerElement(inspectorEls, 'sceneTilemap-light', elLight.value);
	registerElement(inspectorEls, 'sceneTilemap-blend', elBlend.value);
	const editor = Inspector.sceneTilemap;
	if (!editor) return;
	elLayer.value?.loadItems([
		{
			name: t('components.sceneTilemap-layer.options.background.name'),
			tip: t('components.sceneTilemap-layer.options.background.tip'),
			value: 'background'
		},
		{
			name: t('components.sceneTilemap-layer.options.foreground.name'),
			tip: t('components.sceneTilemap-layer.options.foreground.tip'),
			value: 'foreground'
		},
		{
			name: t('components.sceneTilemap-layer.options.object.name'),
			tip: t('components.sceneTilemap-layer.options.object.tip'),
			value: 'object'
		}
	]);
	if (elLight.value) {
		editor.lightBox = elLight.value.root;
		refreshLocalizedItems();
	}

	if (elBlend.value) {
		refreshLocalizedItems();
	}
	// ⚠️ 这条元素优先订阅**不能**改成模板 `@input`（2026-10 定论）：
	// 1) `SceneTilemap.layerInput` 的实现首句是 `if (managerData(...).focusing === this)` ——
	//    它靠 `this` 拿元素。元素优先调用天然把 `this` 绑成那个元素，模板 `@` 给不了。
	// 2) 该 `SelectBox` 的 `@input` 已被上面的 `onParamInput` 占用 ——
	//    同一元素同一事件只能有一个模板 `@`。
	// 要迁得先把 `layerInput` 改写成接收元素参数的函数（那是另一件事）。
	elLayer.value?.on('input', editor.layerInput!);
	watch(
		() => local.components,
		() => refreshLocalizedItems()
	);
});

// 全局事件走 composable：挂/摘成对，不再手写 onBeforeUnmount 配对。
useEventListener(window, 'localize', refreshLocalizedItems);
</script>
