<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-general-grid.label') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-general-grid">
			<div class="text">{{ t('components.sceneParallax-name.label') || 'Name' }}</div><TextBox id="sceneParallax-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneParallax-image.label') || 'Image' }}</div
			><CustomBox
				id="sceneParallax-image" :model-value="form.image" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.sceneParallax-layer.label') || 'Layer' }}</div><SelectBox id="sceneParallax-layer" v-model="form.layer" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.sceneParallax-order.label') || 'Order' }}</div
			><NumberBox id="sceneParallax-order" v-model="form.order" @input="onParamInput" min="0" max="100"></NumberBox>
			<div class="text">{{ t('components.sceneParallax-light.label') || 'Light Sampling' }}</div
			><SelectBox id="sceneParallax-light" v-model="form.light" @input="onParamInput"></SelectBox> <div class="text">{{ t('components.sceneParallax-blend.label') || 'Blend' }}</div
			><SelectBox id="sceneParallax-blend" v-model="form.blend" @input="onParamInput"></SelectBox> <div class="text">{{ t('components.sceneParallax-opacity.label') || 'Opacity' }}</div
			><NumberBox
				id="sceneParallax-opacity" v-model="form.opacity" @input="onParamInput"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-x.label') || 'X' }}</div
			><NumberBox
				id="sceneParallax-x" v-model="form.x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-y.label') || 'Y' }}</div
			><NumberBox
				id="sceneParallax-y" v-model="form.y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-parallax-grid.label') || 'Parallax' }}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-parallax-grid">
			<div class="text">{{ t('components.sceneParallax-scaleX.label') || 'Scale X' }}</div
			><NumberBox
				id="sceneParallax-scaleX" v-model="form.scaleX" @input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-scaleY.label') || 'Scale Y' }}</div
			><NumberBox
				id="sceneParallax-scaleY" v-model="form.scaleY" @input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatX.label') || 'Repeat X' }}</div
			><NumberBox id="sceneParallax-repeatX" v-model="form.repeatX" @input="onParamInput" min="1" max="100"></NumberBox>
			<div class="text">{{ t('components.sceneParallax-repeatY.label') || 'Repeat Y' }}</div
			><NumberBox id="sceneParallax-repeatY" v-model="form.repeatY" @input="onParamInput" min="1" max="100"></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorX.label') || 'Anchor X' }}</div
			><NumberBox
				id="sceneParallax-anchorX" v-model="form.anchorX" @input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-anchorY.label') || 'Anchor Y' }}</div
			><NumberBox
				id="sceneParallax-anchorY" v-model="form.anchorY" @input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetX.label') || 'Offset X' }}</div
			><NumberBox
				id="sceneParallax-offsetX" v-model="form.offsetX" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-offsetY.label') || 'Offset Y' }}</div
			><NumberBox
				id="sceneParallax-offsetY" v-model="form.offsetY" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-parallaxFactorX.label') || 'Parallax Factor X' }}</div
			><NumberBox
				id="sceneParallax-parallaxFactorX" v-model="form.parallaxFactorX" @input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-parallaxFactorY.label') || 'Parallax Factor Y' }}</div
			><NumberBox
				id="sceneParallax-parallaxFactorY" v-model="form.parallaxFactorY" @input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-shiftSpeedX.label') || 'Shift Speed X' }}</div
			><NumberBox
				id="sceneParallax-shiftSpeedX" v-model="form.shiftSpeedX" @input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-shiftSpeedY.label') || 'Shift Speed Y' }}</div
			><NumberBox
				id="sceneParallax-shiftSpeedY" v-model="form.shiftSpeedY" @input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">{{ t('components.sceneParallax-tint-0-box.label') || 'Tint - Red' }}</div>
			<div class="flex-box" id="sceneParallax-tint-0-box">
				<SliderBox
					id="sceneParallax-tint-0-slider"
					v-model="form.tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-0" v-model="form.tint[0]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParallax-tint-1-box.label') || 'Tint - Green' }}</div>
			<div class="flex-box" id="sceneParallax-tint-1-box">
				<SliderBox
					id="sceneParallax-tint-1-slider"
					v-model="form.tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-1" v-model="form.tint[1]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParallax-tint-2-box.label') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="sceneParallax-tint-2-box">
				<SliderBox
					id="sceneParallax-tint-2-slider"
					v-model="form.tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-2" v-model="form.tint[2]" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParallax-tint-3-box.label') || 'Tint - Grayscale' }}</div>
			<div class="flex-box" id="sceneParallax-tint-3-box">
				<SliderBox
					id="sceneParallax-tint-3-slider"
					v-model="form.tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-3" v-model="form.tint[3]" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-conditions.label') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneParallax-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParallax-events"
			class="inspector-list"
			filter="parallax"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneParallax-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneParallax-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { ConditionListInterface } from '@app/legacy/tools/condition-list.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';
import { useSceneStore } from '@app/stores/scene';
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

const scene = useSceneStore();
const local = useLocalStore();
const { t } = useI18n();

const { form, sync, onParamInput } = useSceneParallaxPage();

onMounted(() => {
	const editor = Inspector.sceneParallax;
	if (!editor) return;

	const el = document.getElementById('sceneParallax-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elLayer = document.getElementById('sceneParallax-layer') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elLayer?.loadItems) {
		elLayer.loadItems([
			{ name: 'Background', value: 'background' },
			{ name: 'Foreground', value: 'foreground' }
		]);
	}

	const elLight = document.getElementById('sceneParallax-light') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	const elBlend = document.getElementById('sceneParallax-blend') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	const refreshLocalizedItems = () => {
		if (elLight?.loadItems) {
			const lightName = (key: string, fallback: string) =>
				local.components?.['sceneParallax-light']?.options?.[key]?.name || fallback;
			elLight.loadItems([
				{ name: lightName('raw', 'Raw'), value: 'raw' },
				{ name: lightName('global', 'Global Sampling'), value: 'global' },
				{ name: lightName('anchor', 'Anchor Sampling'), value: 'anchor' },
				{ name: lightName('ambient', 'Ambient Light'), value: 'ambient' }
			]);
		}
		if (elBlend?.loadItems) {
		const blendName = (key: string, fallback: string) =>
			local.components?.['sceneParallax-blend']?.options?.[key]?.name || fallback;
		elBlend.loadItems([
			{ name: blendName('normal', 'Normal'), value: 'normal' },
			{ name: blendName('additive', 'Additive'), value: 'additive' },
			{ name: blendName('subtract', 'Subtract'), value: 'subtract' }
		]);
		}
	};
	refreshLocalizedItems();

	document.getElementById('sceneParallax-tint-0-slider')?.synchronize?.(document.getElementById('sceneParallax-tint-0'));
	document.getElementById('sceneParallax-tint-1-slider')?.synchronize?.(document.getElementById('sceneParallax-tint-1'));
	document.getElementById('sceneParallax-tint-2-slider')?.synchronize?.(document.getElementById('sceneParallax-tint-2'));
	document.getElementById('sceneParallax-tint-3-slider')?.synchronize?.(document.getElementById('sceneParallax-tint-3'));

	document.getElementById('sceneParallax-conditions')?.bind?.(new ConditionListInterface(editor, Scene));
	document.getElementById('sceneParallax-events')?.bind?.(new EventListInterface(editor, Scene));
	document.getElementById('sceneParallax-scripts')?.bind?.(
		new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
	);
	document.getElementById('sceneParallax-parameter-pane')?.bind?.(document.getElementById('sceneParallax-scripts'));

	const elements = document.querySelectorAll(
		'#sceneParallax-name, #sceneParallax-image, #sceneParallax-layer, #sceneParallax-order, #sceneParallax-light, #sceneParallax-blend, #sceneParallax-opacity, #sceneParallax-x, #sceneParallax-y, #sceneParallax-scaleX, #sceneParallax-scaleY, #sceneParallax-repeatX, #sceneParallax-repeatY, #sceneParallax-anchorX, #sceneParallax-anchorY, #sceneParallax-offsetX, #sceneParallax-offsetY, #sceneParallax-parallaxFactorX, #sceneParallax-parallaxFactorY, #sceneParallax-shiftSpeedX, #sceneParallax-shiftSpeedY, #sceneParallax-tint-0, #sceneParallax-tint-1, #sceneParallax-tint-2, #sceneParallax-tint-3'
	);
	const sliders = document.querySelectorAll(
		'#sceneParallax-tint-0-slider, #sceneParallax-tint-1-slider, #sceneParallax-tint-2-slider, #sceneParallax-tint-3-slider'
	);
	(elements as unknown as HTMLElement[]).forEach((el) => el.addEventListener('focus', Inspector.inputFocus));
	(elements as unknown as HTMLElement[]).forEach((el) => el.addEventListener('blur', Inspector.inputBlur!(editor, Scene)));
	(sliders as unknown as HTMLElement[]).forEach((el) => el.addEventListener('focus', Inspector.sliderFocus));
	(sliders as unknown as HTMLElement[]).forEach((el) => el.addEventListener('blur', Inspector.sliderBlur));
	document.querySelectorAll('#sceneParallax-conditions, #sceneParallax-events, #sceneParallax-scripts')
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
