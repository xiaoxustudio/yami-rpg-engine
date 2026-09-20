<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneTilemap-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneTilemap-general-grid">
			<div class="text">{{ t('components.sceneTilemap-name.label') || 'Name' }}</div>
			<TextBox
				id="sceneTilemap-name"
				:ref="registryRef(inspectorEls, 'sceneTilemap-name')"
				v-tip="t('components.sceneTilemap-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneTilemap-layer.label') || 'Layer' }}</div>
			<SelectBox
				ref="elLayer"
				id="sceneTilemap-layer"
				v-tip="t('components.sceneTilemap-layer.tip')"
				v-model="form.layer"
				@input="onParamInput"
				@write="onLayerWrite"
			></SelectBox>
			<div class="text">{{ t('components.sceneTilemap-order.label') || 'Order' }}</div>
			<NumberBox
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
				ref="elLight"
				id="sceneTilemap-light"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneTilemap-blend.label') || 'Blend' }}</div>
			<SelectBox
				ref="elBlend"
				id="sceneTilemap-blend"
				v-tip="t('components.sceneTilemap-blend.tip')"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneTilemap-x.label') || 'X' }}</div>
			<NumberBox
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
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneTilemap-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			ref="elConditions"
			id="sceneTilemap-conditions"
			v-tip="t('components.sceneTilemap-conditions.tip')"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneTilemap-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			ref="elEvents"
			id="sceneTilemap-events"
			v-tip="t('components.sceneTilemap-events.tip')"
			class="inspector-list"
			filter="tilemap"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneTilemap-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			ref="elScripts"
			id="sceneTilemap-scripts"
			v-tip="t('components.sceneTilemap-scripts.tip')"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane ref="elParameterPane" id="sceneTilemap-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryElements, registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();
const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useSceneTilemapPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput } = useInspectorInput();

const onLayerWrite = (value: unknown) => {
	Inspector?.sceneTilemap?.layerWrite?.({ value });
};

const elLayer = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	// P1b：以下控件的 :ref 槽位已被具名 ref 占用 → 命令式登记（页面内批量绑定焦点/滑杆用）
	registerElement(inspectorEls, 'sceneTilemap-layer', elLayer.value);
	registerElement(inspectorEls, 'sceneTilemap-light', elLight.value);
	registerElement(inspectorEls, 'sceneTilemap-blend', elBlend.value);
	registerElement(inspectorEls, 'sceneTilemap-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneTilemap-events', elEvents.value);
	registerElement(inspectorEls, 'sceneTilemap-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneTilemap-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneTilemap;
	if (!editor) return;

	const el = inspectorEls.get('sceneTilemap-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

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
		} catch {
			// 璇█鍒囨崲涓棿鎬侊細t()/DOM 璁块棶鍙兘澶辫触锛岃烦杩囨湰娆″埛鏂?
		}
	};
	if (elLight.value) {
		editor.lightBox = elLight.value.root;
		refreshLocalizedItems();
	}

	if (elBlend.value) {
		refreshLocalizedItems();
	}

	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(new ScriptListInterface(editor as { target?: { id: string } }, Scene));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	const elements = registryElements(inspectorEls, [
		'sceneTilemap-name',
		'sceneTilemap-layer',
		'sceneTilemap-order',
		'sceneTilemap-light',
		'sceneTilemap-blend',
		'sceneTilemap-x',
		'sceneTilemap-y',
		'sceneTilemap-anchorX',
		'sceneTilemap-anchorY',
		'sceneTilemap-offsetX',
		'sceneTilemap-offsetY',
		'sceneTilemap-parallaxFactorX',
		'sceneTilemap-parallaxFactorY',
		'sceneTilemap-opacity'
	]);
	bindInput(elements, editor, Scene as unknown as { history: unknown });
	elLayer.value?.on('input', editor.layerInput!);
	registryElements(inspectorEls, [
		'sceneTilemap-conditions',
		'sceneTilemap-events',
		'sceneTilemap-scripts'
	]).forEach((el) => el.addEventListener('change', Scene.listChange));

	watch(
		() => local.components,
		() => refreshLocalizedItems()
	);
	sync();
	window.addEventListener('localize', refreshLocalizedItems);
	onBeforeUnmount(() => window.removeEventListener('localize', refreshLocalizedItems));
});
</script>
