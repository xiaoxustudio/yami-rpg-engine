<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-general-grid">
			<div class="text">{{ t('components.sceneParallax-name.label') || 'Name' }}</div>
			<TextBox id="sceneParallax-name"
				v-tip="t('components.sceneParallax-name.tip')" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneParallax-image.label') || 'Image' }}</div>
			<CustomBox
				id="sceneParallax-image"
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
				id="sceneParallax-order"
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
				id="sceneParallax-opacity"
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
				id="sceneParallax-x"
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
				id="sceneParallax-y"
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
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-parallax-grid.label') || 'Parallax'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-parallax-grid">
			<div class="text">{{ t('components.sceneParallax-scaleX.label') || 'Scale X' }}</div>
			<NumberBox
				id="sceneParallax-scaleX"
				v-tip="t('components.sceneParallax-scaleX.tip')"
				v-model="form.scaleX"
				@input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-scaleY.label') || 'Scale Y' }}</div>
			<NumberBox
				id="sceneParallax-scaleY"
				v-tip="t('components.sceneParallax-scaleY.tip')"
				v-model="form.scaleY"
				@input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatX.label') || 'Repeat X' }}</div>
			<NumberBox
				id="sceneParallax-repeatX"
				v-tip="t('components.sceneParallax-repeatX.tip')"
				v-model="form.repeatX"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatY.label') || 'Repeat Y' }}</div>
			<NumberBox
				id="sceneParallax-repeatY"
				v-tip="t('components.sceneParallax-repeatY.tip')"
				v-model="form.repeatY"
				@input="onParamInput"
				min="1"
				max="100"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorX.label') || 'Anchor X' }}</div>
			<NumberBox
				id="sceneParallax-anchorX"
				v-tip="t('components.sceneParallax-anchorX.tip')"
				v-model="form.anchorX"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorY.label') || 'Anchor Y' }}</div>
			<NumberBox
				id="sceneParallax-anchorY"
				v-tip="t('components.sceneParallax-anchorY.tip')"
				v-model="form.anchorY"
				@input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetX.label') || 'Offset X' }}</div>
			<NumberBox
				id="sceneParallax-offsetX"
				v-tip="t('components.sceneParallax-offsetX.tip')"
				v-model="form.offsetX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetY.label') || 'Offset Y' }}</div>
			<NumberBox
				id="sceneParallax-offsetY"
				v-tip="t('components.sceneParallax-offsetY.tip')"
				v-model="form.offsetY"
				@input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-parallaxFactorX.label') || 'Parallax Factor X' }}
			</div>
			<NumberBox
				id="sceneParallax-parallaxFactorX"
				v-tip="t('components.sceneParallax-parallaxFactorX.tip')"
				v-model="form.parallaxFactorX"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-parallaxFactorY.label') || 'Parallax Factor Y' }}
			</div>
			<NumberBox
				id="sceneParallax-parallaxFactorY"
				v-tip="t('components.sceneParallax-parallaxFactorY.tip')"
				v-model="form.parallaxFactorY"
				@input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-shiftSpeedX.label') || 'Shift Speed X' }}
			</div>
			<NumberBox
				id="sceneParallax-shiftSpeedX"
				v-tip="t('components.sceneParallax-shiftSpeedX.tip')"
				v-model="form.shiftSpeedX"
				@input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-shiftSpeedY.label') || 'Shift Speed Y' }}
			</div>
			<NumberBox
				id="sceneParallax-shiftSpeedY"
				v-tip="t('components.sceneParallax-shiftSpeedY.tip')"
				v-model="form.shiftSpeedY"
				@input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">
				{{ t('components.sceneParallax-tint-0-box.label') || 'Tint - Red' }}
			</div>
			<div class="flex-box" id="sceneParallax-tint-0-box"
				v-tip="t('components.sceneParallax-tint-0-box.tip')">
				<SliderBox
					id="sceneParallax-tint-0-slider"
					ref="elTint0Slider"
					v-model="tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-0"
					ref="elTint0"
					v-model="tint[0]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParallax-tint-1-box.label') || 'Tint - Green' }}
			</div>
			<div class="flex-box" id="sceneParallax-tint-1-box"
				v-tip="t('components.sceneParallax-tint-1-box.tip')">
				<SliderBox
					id="sceneParallax-tint-1-slider"
					ref="elTint1Slider"
					v-model="tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-1"
					ref="elTint1"
					v-model="tint[1]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParallax-tint-2-box.label') || 'Tint - Blue' }}
			</div>
			<div class="flex-box" id="sceneParallax-tint-2-box"
				v-tip="t('components.sceneParallax-tint-2-box.tip')">
				<SliderBox
					id="sceneParallax-tint-2-slider"
					ref="elTint2Slider"
					v-model="tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-2"
					ref="elTint2"
					v-model="tint[2]"
					@input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParallax-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div class="flex-box" id="sceneParallax-tint-3-box"
				v-tip="t('components.sceneParallax-tint-3-box.tip')">
				<SliderBox
					id="sceneParallax-tint-3-slider"
					ref="elTint3Slider"
					v-model="tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-3"
					ref="elTint3"
					v-model="tint[3]"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneParallax-conditions"
				v-tip="t('components.sceneParallax-conditions.tip')"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParallax-events"
				v-tip="t('components.sceneParallax-events.tip')"
			ref="elEvents"
			class="inspector-list"
			filter="parallax"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-scripts.label') || 'Scripts'
		}}</DetailSummary>
		<ParamList
			id="sceneParallax-scripts"
				v-tip="t('components.sceneParallax-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane
		id="sceneParallax-parameter-pane"
		ref="elParameterPane"
	></ParameterPane>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const local = useLocalStore();
const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useSceneParallaxPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const tint = computed(() => form.tint as number[]);

const getOptions = (id: string) =>
	local.components?.[id]?.options as Record<string, { name?: string }> | undefined;

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elLayer = ref<InstanceType<typeof SelectBox> | null>(null);
const elLight = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);
const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'sceneParallax-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneParallax-events', elEvents.value);
	registerElement(inspectorEls, 'sceneParallax-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneParallax-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneParallax;
	if (!editor) return;

	const el = inspectorEls.get('sceneParallax-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elLayer.value?.loadItems([
		{ name: t('components.sceneParallax-layer.options.background.name'), tip: t('components.sceneParallax-layer.options.background.tip'), value: 'background'  },
		{ name: t('components.sceneParallax-layer.options.foreground.name'), tip: t('components.sceneParallax-layer.options.foreground.tip'), value: 'foreground'  }
	]);

	const refreshLocalizedItems = () => {
		if (elLight.value) {
			const lightName = (key: string, fallback: string) =>
				getOptions('sceneParallax-light')?.[key]?.name || fallback;
			elLight.value.loadItems([
				{ name: lightName('raw', 'Raw'), value: 'raw' },
				{ name: lightName('global', 'Global Sampling'), value: 'global' },
				{ name: lightName('anchor', 'Anchor Sampling'), value: 'anchor' },
				{ name: lightName('ambient', 'Ambient Light'), value: 'ambient' }
			]);
		}
		if (elBlend.value) {
			const blendName = (key: string, fallback: string) =>
				getOptions('sceneParallax-blend')?.[key]?.name || fallback;
			elBlend.value.loadItems([
				{ name: blendName('normal', 'Normal'), value: 'normal' },
				{ name: blendName('additive', 'Additive'), value: 'additive' },
				{ name: blendName('subtract', 'Subtract'), value: 'subtract' }
			]);
		}
	};
	refreshLocalizedItems();

	elTint0Slider.value?.synchronize(elTint0.value?.root as SyncTarget);
	elTint1Slider.value?.synchronize(elTint1.value?.root as SyncTarget);
	elTint2Slider.value?.synchronize(elTint2.value?.root as SyncTarget);
	elTint3Slider.value?.synchronize(elTint3.value?.root as SyncTarget);

	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(
		new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
	);
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	const elements = document.querySelectorAll(
		'#sceneParallax-name, #sceneParallax-image, #sceneParallax-layer, #sceneParallax-order, #sceneParallax-light, #sceneParallax-blend, #sceneParallax-opacity, #sceneParallax-x, #sceneParallax-y, #sceneParallax-scaleX, #sceneParallax-scaleY, #sceneParallax-repeatX, #sceneParallax-repeatY, #sceneParallax-anchorX, #sceneParallax-anchorY, #sceneParallax-offsetX, #sceneParallax-offsetY, #sceneParallax-parallaxFactorX, #sceneParallax-parallaxFactorY, #sceneParallax-shiftSpeedX, #sceneParallax-shiftSpeedY, #sceneParallax-tint-0, #sceneParallax-tint-1, #sceneParallax-tint-2, #sceneParallax-tint-3'
	);
	const sliders = document.querySelectorAll(
		'#sceneParallax-tint-0-slider, #sceneParallax-tint-1-slider, #sceneParallax-tint-2-slider, #sceneParallax-tint-3-slider'
	);
	bindInput(elements, editor, Scene as unknown as { history: unknown });
	bindSliders(sliders);
	document
		.querySelectorAll(
			'#sceneParallax-conditions, #sceneParallax-events, #sceneParallax-scripts'
		)
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
	window.addEventListener('localize', refreshLocalizedItems);
	watch(
		() => local.components,
		() => refreshLocalizedItems()
	);
	onBeforeUnmount(() => window.removeEventListener('localize', refreshLocalizedItems));
});
</script>

<style>
/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#sceneParallax-tint-0-slider,
#sceneParallax-tint-1-slider,
#sceneParallax-tint-2-slider,
#sceneParallax-tint-3-slider {
	flex: 2 1 auto;
}

#sceneParallax-tint-0,
#sceneParallax-tint-1,
#sceneParallax-tint-2,
#sceneParallax-tint-3 {
	flex: 1 1 auto;
}
</style>

