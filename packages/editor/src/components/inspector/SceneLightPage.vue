<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneLight-general-grid.label') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneLight-general-grid">
			<div class="text">{{ t('components.sceneLight-name.label') || 'Name' }}</div><TextBox id="sceneLight-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneLight-type.label') || 'Type' }}</div><SelectBox id="sceneLight-type" v-model="form.type" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.sceneLight-blend.label') || 'Blend' }}</div><SelectBox id="sceneLight-blend" v-model="form.blend" @input="onParamInput"></SelectBox>
			<div class="text">{{ t('components.sceneLight-x.label') || 'X' }}</div
			><NumberBox
				id="sceneLight-x" v-model="form.x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneLight-y.label') || 'Y' }}</div
			><NumberBox
				id="sceneLight-y" v-model="form.y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneLight-range-box.label') || 'Range' }}</div>
			<div class="flex-box" id="sceneLight-range-box">
				<SliderBox
					id="sceneLight-range-slider"
					v-model="form.range"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-range" v-model="form.range" @input="onParamInput"
					min="0"
					max="128"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-intensity-box.label') || 'Intensity' }}</div>
			<div class="flex-box" id="sceneLight-intensity-box">
				<SliderBox
					id="sceneLight-intensity-slider"
					v-model="form.intensity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-intensity" v-model="form.intensity" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-mask.label') || 'Mask' }}</div
			><CustomBox
				id="sceneLight-mask" :model-value="form.mask" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.sceneLight-anchorX-box.label') || 'Anchor X' }}</div>
			<div class="flex-box" id="sceneLight-anchorX-box">
				<SliderBox
					id="sceneLight-anchorX-slider"
					v-model="form.anchorX"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorX" v-model="form.anchorX" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-anchorY-box.label') || 'Anchor Y' }}</div>
			<div class="flex-box" id="sceneLight-anchorY-box">
				<SliderBox
					id="sceneLight-anchorY-slider"
					v-model="form.anchorY"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorY" v-model="form.anchorY" @input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-width-box.label') || 'Width' }}</div>
			<div class="flex-box" id="sceneLight-width-box">
				<SliderBox
					id="sceneLight-width-slider"
					v-model="form.width"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-width" v-model="form.width" @input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-height-box.label') || 'Height' }}</div>
			<div class="flex-box" id="sceneLight-height-box">
				<SliderBox
					id="sceneLight-height-slider"
					v-model="form.height"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-height" v-model="form.height" @input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-angle-box.label') || 'Angle' }}</div>
			<div class="flex-box" id="sceneLight-angle-box">
				<SliderBox
					id="sceneLight-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-angle" v-model="form.angle" @input="onParamInput"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-red-box.label') || 'Red' }}</div>
			<div class="flex-box" id="sceneLight-red-box">
				<SliderBox
					id="sceneLight-red-slider"
					v-model="form.red"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-red" v-model="form.red" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-green-box.label') || 'Green' }}</div>
			<div class="flex-box" id="sceneLight-green-box">
				<SliderBox
					id="sceneLight-green-slider"
					v-model="form.green"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-green" v-model="form.green" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-blue-box.label') || 'Blue' }}</div>
			<div class="flex-box" id="sceneLight-blue-box">
				<SliderBox
					id="sceneLight-blue-slider"
					v-model="form.blue"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-blue" v-model="form.blue" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-direct-box.label') || 'Direct Light Ratio' }}</div>
			<div class="flex-box" id="sceneLight-direct-box">
				<SliderBox
					id="sceneLight-direct-slider"
					v-model="form.direct"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-direct" v-model="form.direct" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneLight-conditions.label') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneLight-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneLight-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneLight-events"
			class="inspector-list"
			filter="light"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneLight-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneLight-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneLight-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSceneLightPage } from '@app/composables/useSceneLightPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
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

const { t } = useI18n();

const { form, sync, onParamInput } = useSceneLightPage();

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneLight;
	if (!editor) return;

	const el = document.getElementById('sceneLight-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	try {
		const elType = document.getElementById('sceneLight-type') as HTMLElement & { loadItems?: (items: unknown[]) => void; enableHiddenMode?: () => HTMLElement & { relate?: (entries: unknown) => void } } | null;
		if (elType?.loadItems) {
			elType.loadItems([
				{ name: 'Point', value: 'point' },
				{ name: 'Area', value: 'area' }
			]);
		}

		const elBlend = document.getElementById('sceneLight-blend') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
		if (elBlend?.loadItems) {
			elBlend.loadItems([
				{ name: 'Screen', value: 'screen' },
				{ name: 'Additive', value: 'additive' },
				{ name: 'Subtract', value: 'subtract' },
				{ name: 'Max', value: 'max' }
			]);
		}

		if (elType?.enableHiddenMode) {
			const hidden = elType.enableHiddenMode();
			hidden.relate?.([
				{
					case: 'point',
					targets: [document.getElementById('sceneLight-range-box'), document.getElementById('sceneLight-intensity-box')]
				},
				{
					case: 'area',
					targets: [
						document.getElementById('sceneLight-mask'),
						document.getElementById('sceneLight-anchorX-box'),
						document.getElementById('sceneLight-anchorY-box'),
						document.getElementById('sceneLight-width-box'),
						document.getElementById('sceneLight-height-box'),
						document.getElementById('sceneLight-angle-box')
					]
				}
			]);
		}

		const conditions = document.getElementById('sceneLight-conditions');
		conditions?.bind?.(new ConditionListInterface(editor, Scene));

		const events = document.getElementById('sceneLight-events');
		events?.bind?.(new EventListInterface(editor, Scene));

		const scripts = document.getElementById('sceneLight-scripts');
		scripts?.bind?.(
			new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
		);

		const parameterPane = document.getElementById('sceneLight-parameter-pane');
		parameterPane?.bind?.(scripts);

		document.getElementById('sceneLight-range-slider')?.synchronize?.(document.getElementById('sceneLight-range'));
		document.getElementById('sceneLight-intensity-slider')?.synchronize?.(document.getElementById('sceneLight-intensity'));
		document.getElementById('sceneLight-anchorX-slider')?.synchronize?.(document.getElementById('sceneLight-anchorX'));
		document.getElementById('sceneLight-anchorY-slider')?.synchronize?.(document.getElementById('sceneLight-anchorY'));
		document.getElementById('sceneLight-width-slider')?.synchronize?.(document.getElementById('sceneLight-width'));
		document.getElementById('sceneLight-height-slider')?.synchronize?.(document.getElementById('sceneLight-height'));
		document.getElementById('sceneLight-angle-slider')?.synchronize?.(document.getElementById('sceneLight-angle'));
		document.getElementById('sceneLight-red-slider')?.synchronize?.(document.getElementById('sceneLight-red'));
		document.getElementById('sceneLight-green-slider')?.synchronize?.(document.getElementById('sceneLight-green'));
		document.getElementById('sceneLight-blue-slider')?.synchronize?.(document.getElementById('sceneLight-blue'));
		document.getElementById('sceneLight-direct-slider')?.synchronize?.(document.getElementById('sceneLight-direct'));

		const elements = document.querySelectorAll(
			'#sceneLight-name, #sceneLight-type, #sceneLight-blend, #sceneLight-x, #sceneLight-y, #sceneLight-range, #sceneLight-intensity, #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY, #sceneLight-width, #sceneLight-height, #sceneLight-angle, #sceneLight-red, #sceneLight-green, #sceneLight-blue, #sceneLight-direct'
		);
		const sliders = document.querySelectorAll(
			'#sceneLight-range-slider, #sceneLight-intensity-slider, #sceneLight-anchorX-slider, #sceneLight-anchorY-slider, #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider, #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider, #sceneLight-direct-slider'
		);
		bindInput(elements, editor, Scene);
		bindSliders(sliders);

		document
			.querySelectorAll('#sceneLight-conditions, #sceneLight-events, #sceneLight-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	} catch (e) {
		console.warn('[SceneLightPage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>
