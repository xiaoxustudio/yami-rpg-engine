<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneAnimation-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneAnimation-general-grid">
			<div class="text">{{ t('components.sceneAnimation-name.label') || 'Name' }}</div>
			<TextBox id="sceneAnimation-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">
				{{ t('components.sceneAnimation-animationId.label') || 'Animation' }}
			</div>
			<CustomBox
				id="sceneAnimation-animationId"
				ref="elAnimationId"
				:model-value="form.animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			></CustomBox>
			<div class="text">{{ t('components.sceneAnimation-motion.label') || 'Motion' }}</div>
			<SelectBox
				id="sceneAnimation-motion"
				:ref="registryRef(inspectorEls, 'sceneAnimation-motion')"
				v-model="form.motion"
				@input="onParamInput"
			></SelectBox>
			<div class="text">
				{{ t('components.sceneAnimation-rotatable.label') || 'Rotatable' }}
			</div>
			<SelectBox
				id="sceneAnimation-rotatable"
				ref="elRotatable"
				v-model="form.rotatable"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneAnimation-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneAnimation-x"
				v-model="form.x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneAnimation-y.label') || 'Y' }}</div>
			<NumberBox
				id="sceneAnimation-y"
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneAnimation-angle-box.label') || 'Angle' }}</div>
			<div class="flex-box" id="sceneAnimation-angle-box">
				<SliderBox
					id="sceneAnimation-angle-slider"
					ref="elAngleSlider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-angle"
					ref="elAngle"
					v-model="form.angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneAnimation-scale-box.label') || 'Scale' }}</div>
			<div class="flex-box" id="sceneAnimation-scale-box">
				<SliderBox
					id="sceneAnimation-scale-slider"
					ref="elScaleSlider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-scale"
					ref="elScale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneAnimation-speed-box.label') || 'Speed' }}</div>
			<div class="flex-box" id="sceneAnimation-speed-box">
				<SliderBox
					id="sceneAnimation-speed-slider"
					ref="elSpeedSlider"
					v-model="form.speed"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-speed"
					ref="elSpeed"
					v-model="form.speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneAnimation-opacity-box.label') || 'Opacity' }}
			</div>
			<div class="flex-box" id="sceneAnimation-opacity-box">
				<SliderBox
					id="sceneAnimation-opacity-slider"
					ref="elOpacitySlider"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-opacity"
					ref="elOpacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneAnimation-priority-box.label') || 'Priority' }}
			</div>
			<div class="flex-box" id="sceneAnimation-priority-box">
				<SliderBox
					id="sceneAnimation-priority-slider"
					ref="elPrioritySlider"
					v-model="form.priority"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-priority"
					ref="elPriority"
					v-model="form.priority"
					min="-512"
					max="512"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneAnimation-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneAnimation-conditions"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneAnimation-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-events"
			ref="elEvents"
			class="inspector-list"
			filter="animation"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneAnimation-scripts.label') || 'Scripts'
		}}</DetailSummary>
		<ParamList
			id="sceneAnimation-scripts"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane
		id="sceneAnimation-parameter-pane"
		ref="elParameterPane"
	></ParameterPane>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef, registerElement } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
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

const { form, sync, onParamInput: onParamInputEvent } = useSceneAnimationPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.sceneAnimation?.animationIdWrite?.({ value });
};

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

const elAnimationId = ref<InstanceType<typeof CustomBox> | null>(null);
const elRotatable = ref<InstanceType<typeof SelectBox> | null>(null);
const elAngleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elScale = ref<InstanceType<typeof NumberBox> | null>(null);
const elSpeedSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elSpeed = ref<InstanceType<typeof NumberBox> | null>(null);
const elOpacitySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elOpacity = ref<InstanceType<typeof NumberBox> | null>(null);
const elPrioritySlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elPriority = ref<InstanceType<typeof NumberBox> | null>(null);
const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'sceneAnimation-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneAnimation-events', elEvents.value);
	registerElement(inspectorEls, 'sceneAnimation-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneAnimation-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneAnimation;
	if (!editor) return;

	const el = document.getElementById('sceneAnimation-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elRotatable.value?.loadItems([
		{ name: 'Yes', value: true },
		{ name: 'No', value: false }
	]);

	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(
		new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
	);
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	elAngleSlider.value?.synchronize(elAngle.value?.root as SyncTarget);
	elScaleSlider.value?.synchronize(elScale.value?.root as SyncTarget);
	elSpeedSlider.value?.synchronize(elSpeed.value?.root as SyncTarget);
	elOpacitySlider.value?.synchronize(elOpacity.value?.root as SyncTarget);
	elPrioritySlider.value?.synchronize(elPriority.value?.root as SyncTarget);

	elAnimationId.value?.on('write', editor.animationIdWrite);

	const elements = document.querySelectorAll(
		'#sceneAnimation-name, #sceneAnimation-animationId, #sceneAnimation-motion, #sceneAnimation-rotatable, #sceneAnimation-x, #sceneAnimation-y, #sceneAnimation-angle, #sceneAnimation-scale, #sceneAnimation-speed, #sceneAnimation-opacity, #sceneAnimation-priority'
	);
	const sliders = document.querySelectorAll(
		'#sceneAnimation-angle-slider, #sceneAnimation-scale-slider, #sceneAnimation-speed-slider, #sceneAnimation-opacity-slider, #sceneAnimation-priority-slider'
	);
	bindInput(elements, editor, Scene as unknown as { history: unknown });
	bindSliders(sliders);
	document
		.querySelectorAll(
			'#sceneAnimation-conditions, #sceneAnimation-events, #sceneAnimation-scripts'
		)
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#sceneAnimation-angle-slider,
#sceneAnimation-scale-slider,
#sceneAnimation-speed-slider,
#sceneAnimation-opacity-slider,
#sceneAnimation-priority-slider {
	flex: 2 1 auto;
}

#sceneAnimation-angle,
#sceneAnimation-scale,
#sceneAnimation-speed,
#sceneAnimation-opacity,
#sceneAnimation-priority {
	flex: 1 1 auto;
}
</style>

