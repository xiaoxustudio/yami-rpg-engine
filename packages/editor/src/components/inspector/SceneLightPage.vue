<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneLight-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneLight-general-grid">
			<div class="text">{{ t('components.sceneLight-name.label') || 'Name' }}</div>
			<TextBox id="sceneLight-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneLight-type.label') || 'Type' }}</div>
			<SelectBox
				id="sceneLight-type"
				ref="elType"
				v-model="form.type"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneLight-blend.label') || 'Blend' }}</div>
			<SelectBox
				id="sceneLight-blend"
				ref="elBlend"
				v-model="form.blend"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneLight-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneLight-x"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneLight-y.label') || 'Y' }}</div>
			<NumberBox
				id="sceneLight-y"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneLight-range-box.label') || 'Range' }}</div>
			<div class="flex-box" id="sceneLight-range-box" ref="elRangeBox">
				<SliderBox
					id="sceneLight-range-slider"
					ref="elRangeSlider"
					v-model="form.range"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-range"
					ref="elRange"
					v-model="form.range"
					@input="onParamInput"
					min="0"
					max="128"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneLight-intensity-box.label') || 'Intensity' }}
			</div>
			<div class="flex-box" id="sceneLight-intensity-box" ref="elIntensityBox">
				<SliderBox
					id="sceneLight-intensity-slider"
					ref="elIntensitySlider"
					v-model="form.intensity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-intensity"
					ref="elIntensity"
					v-model="form.intensity"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-mask.label') || 'Mask' }}</div>
			<CustomBox
				id="sceneLight-mask"
				ref="elMask"
				:model-value="form.mask"
				@input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ t('components.sceneLight-anchorX-box.label') || 'Anchor X' }}</div>
			<div class="flex-box" id="sceneLight-anchorX-box" ref="elAnchorXBox">
				<SliderBox
					id="sceneLight-anchorX-slider"
					ref="elAnchorXSlider"
					v-model="form.anchorX"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorX"
					ref="elAnchorX"
					v-model="form.anchorX"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-anchorY-box.label') || 'Anchor Y' }}</div>
			<div class="flex-box" id="sceneLight-anchorY-box" ref="elAnchorYBox">
				<SliderBox
					id="sceneLight-anchorY-slider"
					ref="elAnchorYSlider"
					v-model="form.anchorY"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorY"
					ref="elAnchorY"
					v-model="form.anchorY"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-width-box.label') || 'Width' }}</div>
			<div class="flex-box" id="sceneLight-width-box" ref="elWidthBox">
				<SliderBox
					id="sceneLight-width-slider"
					ref="elWidthSlider"
					v-model="form.width"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-width"
					ref="elWidth"
					v-model="form.width"
					@input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-height-box.label') || 'Height' }}</div>
			<div class="flex-box" id="sceneLight-height-box" ref="elHeightBox">
				<SliderBox
					id="sceneLight-height-slider"
					ref="elHeightSlider"
					v-model="form.height"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-height"
					ref="elHeight"
					v-model="form.height"
					@input="onParamInput"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-angle-box.label') || 'Angle' }}</div>
			<div class="flex-box" id="sceneLight-angle-box" ref="elAngleBox">
				<SliderBox
					id="sceneLight-angle-slider"
					ref="elAngleSlider"
					v-model="form.angle"
					min="0"
					max="360"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-angle"
					ref="elAngle"
					v-model="form.angle"
					@input="onParamInput"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-red-box.label') || 'Red' }}</div>
			<div class="flex-box" id="sceneLight-red-box" ref="elRedBox">
				<SliderBox
					id="sceneLight-red-slider"
					ref="elRedSlider"
					v-model="form.red"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-red"
					ref="elRed"
					v-model="form.red"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-green-box.label') || 'Green' }}</div>
			<div class="flex-box" id="sceneLight-green-box" ref="elGreenBox">
				<SliderBox
					id="sceneLight-green-slider"
					ref="elGreenSlider"
					v-model="form.green"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-green"
					ref="elGreen"
					v-model="form.green"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneLight-blue-box.label') || 'Blue' }}</div>
			<div class="flex-box" id="sceneLight-blue-box" ref="elBlueBox">
				<SliderBox
					id="sceneLight-blue-slider"
					ref="elBlueSlider"
					v-model="form.blue"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-blue"
					ref="elBlue"
					v-model="form.blue"
					@input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneLight-direct-box.label') || 'Direct Light Ratio' }}
			</div>
			<div class="flex-box" id="sceneLight-direct-box" ref="elDirectBox">
				<SliderBox
					id="sceneLight-direct-slider"
					ref="elDirectSlider"
					v-model="form.direct"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-direct"
					ref="elDirect"
					v-model="form.direct"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneLight-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneLight-conditions"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneLight-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneLight-events"
			ref="elEvents"
			class="inspector-list"
			filter="light"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneLight-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneLight-scripts"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneLight-parameter-pane" ref="elParameterPane"></ParameterPane>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
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

const { form, sync, onParamInput: onParamInputEvent } = useSceneLightPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elBlend = ref<InstanceType<typeof SelectBox> | null>(null);
const elMask = ref<InstanceType<typeof CustomBox> | null>(null);
const elRangeSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elRange = ref<InstanceType<typeof NumberBox> | null>(null);
const elIntensitySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elIntensity = ref<InstanceType<typeof NumberBox> | null>(null);
const elAnchorXSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAnchorX = ref<InstanceType<typeof NumberBox> | null>(null);
const elAnchorYSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAnchorY = ref<InstanceType<typeof NumberBox> | null>(null);
const elWidthSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elWidth = ref<InstanceType<typeof NumberBox> | null>(null);
const elHeightSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elHeight = ref<InstanceType<typeof NumberBox> | null>(null);
const elAngleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elRedSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elRed = ref<InstanceType<typeof NumberBox> | null>(null);
const elGreenSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elGreen = ref<InstanceType<typeof NumberBox> | null>(null);
const elBlueSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elBlue = ref<InstanceType<typeof NumberBox> | null>(null);
const elDirectSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elDirect = ref<InstanceType<typeof NumberBox> | null>(null);
const elRangeBox = ref<HTMLElement | null>(null);
const elIntensityBox = ref<HTMLElement | null>(null);
const elAnchorXBox = ref<HTMLElement | null>(null);
const elAnchorYBox = ref<HTMLElement | null>(null);
const elWidthBox = ref<HTMLElement | null>(null);
const elHeightBox = ref<HTMLElement | null>(null);
const elAngleBox = ref<HTMLElement | null>(null);
const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	const editor = Inspector.sceneLight;
	if (!editor) return;

	const el = document.getElementById('sceneLight-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	try {
		elType.value?.loadItems([
			{ name: 'Point', value: 'point' },
			{ name: 'Area', value: 'area' }
		]);

		elBlend.value?.loadItems([
			{ name: 'Screen', value: 'screen' },
			{ name: 'Additive', value: 'additive' },
			{ name: 'Subtract', value: 'subtract' },
			{ name: 'Max', value: 'max' }
		]);

		if (elType.value) {
			elType.value.enableHiddenMode();
			elType.value.relate([
				{
					case: 'point',
					targets: [elRangeBox.value, elIntensityBox.value]
				},
				{
					case: 'area',
					targets: [
						elMask.value?.root ?? null,
						elAnchorXBox.value,
						elAnchorYBox.value,
						elWidthBox.value,
						elHeightBox.value,
						elAngleBox.value
					]
				}
			]);
		}

		elConditions.value?.bind(new ConditionListInterface(editor, Scene));
		elEvents.value?.bind(new EventListInterface(editor, Scene));
		elScripts.value?.bind(
			new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
		);
		elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

		elRangeSlider.value?.synchronize(elRange.value?.root as SyncTarget);
		elIntensitySlider.value?.synchronize(elIntensity.value?.root as SyncTarget);
		elAnchorXSlider.value?.synchronize(elAnchorX.value?.root as SyncTarget);
		elAnchorYSlider.value?.synchronize(elAnchorY.value?.root as SyncTarget);
		elWidthSlider.value?.synchronize(elWidth.value?.root as SyncTarget);
		elHeightSlider.value?.synchronize(elHeight.value?.root as SyncTarget);
		elAngleSlider.value?.synchronize(elAngle.value?.root as SyncTarget);
		elRedSlider.value?.synchronize(elRed.value?.root as SyncTarget);
		elGreenSlider.value?.synchronize(elGreen.value?.root as SyncTarget);
		elBlueSlider.value?.synchronize(elBlue.value?.root as SyncTarget);
		elDirectSlider.value?.synchronize(elDirect.value?.root as SyncTarget);

		const elements = document.querySelectorAll(
			'#sceneLight-name, #sceneLight-type, #sceneLight-blend, #sceneLight-x, #sceneLight-y, #sceneLight-range, #sceneLight-intensity, #sceneLight-mask, #sceneLight-anchorX, #sceneLight-anchorY, #sceneLight-width, #sceneLight-height, #sceneLight-angle, #sceneLight-red, #sceneLight-green, #sceneLight-blue, #sceneLight-direct'
		);
		const sliders = document.querySelectorAll(
			'#sceneLight-range-slider, #sceneLight-intensity-slider, #sceneLight-anchorX-slider, #sceneLight-anchorY-slider, #sceneLight-width-slider, #sceneLight-height-slider, #sceneLight-angle-slider, #sceneLight-red-slider, #sceneLight-green-slider, #sceneLight-blue-slider, #sceneLight-direct-slider'
		);
		bindInput(elements, editor, Scene as unknown as { history: unknown });
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
