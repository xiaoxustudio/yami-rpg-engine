<template>
	<DetailBox open>
		<DetailSummary>{{
			local.getLabel('sceneTilemap-general-grid') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneTilemap-general-grid">
			<div class="text">{{ local.getLabel('sceneTilemap-name') || 'Name' }}</div>
			<TextBox id="sceneTilemap-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneTilemap-layer') || 'Layer' }}</div>
			<SelectBox
				id="sceneTilemap-layer"
				v-model="form.layer"
				@input="onParamInput"
				@write="onLayerWrite"
			></SelectBox>
			<div class="text">{{ local.getLabel('sceneTilemap-order') || 'Order' }}</div>
			<NumberBox
				id="sceneTilemap-order"
				v-model="form.order"
				@input="onParamInput"
				min="0"
				max="100"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-light') || 'Light Sampling' }}</div>
			<SelectBox
				id="sceneTilemap-light"
				v-model="form.light"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ local.getLabel('sceneTilemap-blend') || 'Blend' }}</div>
			<SelectBox
				id="sceneTilemap-blend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ local.getLabel('sceneTilemap-x') || 'X' }}</div>
			<NumberBox
				id="sceneTilemap-x"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-y') || 'Y' }}</div>
			<NumberBox
				id="sceneTilemap-y"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-width') || 'Width' }}</div>
			<NumberBox
				id="sceneTilemap-width"
				v-model="form.width"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-height') || 'Height' }}</div>
			<NumberBox
				id="sceneTilemap-height"
				v-model="form.height"
				min="0"
				max="512"
				unit="tile"
				@change="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-anchorX') || 'Anchor X' }}</div>
			<NumberBox
				id="sceneTilemap-anchorX"
				v-model="form.anchorX"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-anchorY') || 'Anchor Y' }}</div>
			<NumberBox
				id="sceneTilemap-anchorY"
				v-model="form.anchorY"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-offsetX') || 'Offset X' }}</div>
			<NumberBox
				id="sceneTilemap-offsetX"
				v-model="form.offsetX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-offsetY') || 'Offset Y' }}</div>
			<NumberBox
				id="sceneTilemap-offsetY"
				v-model="form.offsetY"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ local.getLabel('sceneTilemap-parallaxFactorX') || 'Parallax Factor X' }}
			</div>
			<NumberBox
				id="sceneTilemap-parallaxFactorX"
				v-model="form.parallaxFactorX"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">
				{{ local.getLabel('sceneTilemap-parallaxFactorY') || 'Parallax Factor Y' }}
			</div>
			<NumberBox
				id="sceneTilemap-parallaxFactorY"
				v-model="form.parallaxFactorY"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-opacity') || 'Opacity' }}</div>
			<NumberBox
				id="sceneTilemap-opacity"
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
			local.getLabel('sceneTilemap-conditions') || 'Conditions'
		}}</DetailSummary>
		<ParamList id="sceneTilemap-conditions" class="inspector-list" flexible></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneTilemap-events"
			class="inspector-list"
			filter="tilemap"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList id="sceneTilemap-scripts" class="inspector-list" flexible></ParamList>
	</DetailBox>
	<ParameterPane id="sceneTilemap-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const scene = useSceneStore();
const local = useLocalStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useSceneTilemapPage();

const { bindInput } = useInspectorInput();

const onLayerWrite = (value: unknown) => {
	Inspector?.sceneTilemap?.layerWrite?.({ value });
};

onMounted(() => {
	const editor = Inspector.sceneTilemap;
	if (!editor) return;

	const el = document.getElementById('sceneTilemap-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elLayer = document.getElementById('sceneTilemap-layer') as
		| (HTMLElement & { loadItems?: (items: unknown[]) => void })
		| null;
	if (elLayer?.loadItems) {
		elLayer.loadItems([
			{ name: 'Background', value: 'background' },
			{ name: 'Foreground', value: 'foreground' },
			{ name: 'Object', value: 'object' }
		]);
	}

	const elLight = document.getElementById('sceneTilemap-light') as
		| (HTMLElement & {
				loadItems?: (items: unknown[]) => void;
				lightItems?: Record<string, unknown[]>;
				dataItems?: unknown[] | null;
				dataValue?: unknown;
				update?: () => void;
		  })
		| null;
	const elBlend = document.getElementById('sceneTilemap-blend') as
		| (HTMLElement & { loadItems?: (items: unknown[]) => void })
		| null;
	const refreshLocalizedItems = () => {
		try {
			const readOption = (id: string, key: string) => {
				const legacyComponents = local.components as unknown as Record<
					string,
					{ options?: Record<string, { name?: string }> }
				>;
				const legacyName = legacyComponents[id]?.options?.[key]?.name;
				if (legacyName) return legacyName;
				return t(`components.${id}.options.${key}.label`);
			};
			if (elLight) {
				const items = {
					raw: { name: readOption('sceneTilemap-light', 'raw'), value: 'raw' },
					global: { name: readOption('sceneTilemap-light', 'global'), value: 'global' },
					ambient: {
						name: readOption('sceneTilemap-light', 'ambient'),
						value: 'ambient'
					},
					anchor: { name: readOption('sceneTilemap-light', 'anchor'), value: 'anchor' }
				};
				(
					elLight as unknown as {
						lightItems: { all: unknown[]; tile: unknown[]; sprite: unknown[] };
					}
				).lightItems = {
					all: Object.values(items),
					tile: [items.raw, items.global, items.ambient],
					sprite: [items.raw, items.global, items.anchor]
				};
				if (elLight.loadItems) elLight.loadItems(items.tile);
			}
			if (elBlend?.loadItems) {
				elBlend.loadItems([
					{ name: readOption('sceneTilemap-blend', 'normal'), value: 'normal' },
					{ name: readOption('sceneTilemap-blend', 'additive'), value: 'additive' },
					{ name: readOption('sceneTilemap-blend', 'subtract'), value: 'subtract' }
				]);
			}
		} catch {
			// 语言切换中间态：t()/DOM 访问可能失败，跳过本次刷新
		}
	};
	if (elLight) {
		editor.lightBox = elLight;
		refreshLocalizedItems();
	}

	if (elBlend?.loadItems) {
		refreshLocalizedItems();
	}

	document
		.getElementById('sceneTilemap-conditions')
		?.bind?.(new ConditionListInterface(editor, Scene));
	document.getElementById('sceneTilemap-events')?.bind?.(new EventListInterface(editor, Scene));
	document
		.getElementById('sceneTilemap-scripts')
		?.bind?.(new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene));
	document
		.getElementById('sceneTilemap-parameter-pane')
		?.bind?.(document.getElementById('sceneTilemap-scripts'));

	const elements = document.querySelectorAll(
		'#sceneTilemap-name, #sceneTilemap-layer, #sceneTilemap-order, #sceneTilemap-light, #sceneTilemap-blend, #sceneTilemap-x, #sceneTilemap-y, #sceneTilemap-anchorX, #sceneTilemap-anchorY, #sceneTilemap-offsetX, #sceneTilemap-offsetY, #sceneTilemap-parallaxFactorX, #sceneTilemap-parallaxFactorY, #sceneTilemap-opacity'
	);
	bindInput(elements, editor, Scene);
	document.getElementById('sceneTilemap-layer')?.addEventListener('input', editor.layerInput!);
	document
		.querySelectorAll('#sceneTilemap-conditions, #sceneTilemap-events, #sceneTilemap-scripts')
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	watch(
		() => local.components,
		() => refreshLocalizedItems()
	);
	sync();
	window.addEventListener('localize', refreshLocalizedItems);
	onBeforeUnmount(() => window.removeEventListener('localize', refreshLocalizedItems));
});
</script>
