<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParticle-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneParticle-general-grid">
			<div class="text">{{ t('components.sceneParticle-name.label') || 'Name' }}</div>
			<TextBox id="sceneParticle-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">
				{{ t('components.sceneParticle-particleId.label') || 'Particle' }}
			</div>
			<CustomBox
				id="sceneParticle-particleId"
				:model-value="form.particleId"
				@input="onParamInput"
				type="file"
				filter="particle"
			></CustomBox>
			<div class="text">{{ t('components.sceneParticle-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneParticle-x"
				v-model="form.x"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParticle-y.label') || 'Y' }}</div>
			<NumberBox
				id="sceneParticle-y"
				v-model="form.y"
				@input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParticle-angle-box.label') || 'Angle' }}</div>
			<div class="flex-box" id="sceneParticle-angle-box">
				<SliderBox
					id="sceneParticle-angle-slider"
					ref="elAngleSlider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneParticle-angle"
					ref="elAngle"
					v-model="form.angle"
					@input="onParamInput"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-scale-box.label') || 'Scale' }}</div>
			<div class="flex-box" id="sceneParticle-scale-box">
				<SliderBox
					id="sceneParticle-scale-slider"
					ref="elScaleSlider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-scale"
					ref="elScale"
					v-model="form.scale"
					@input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-speed-box.label') || 'Speed' }}</div>
			<div class="flex-box" id="sceneParticle-speed-box">
				<SliderBox
					id="sceneParticle-speed-slider"
					ref="elSpeedSlider"
					v-model="form.speed"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-speed"
					ref="elSpeed"
					v-model="form.speed"
					@input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParticle-opacity-box.label') || 'Opacity' }}
			</div>
			<div class="flex-box" id="sceneParticle-opacity-box">
				<SliderBox
					id="sceneParticle-opacity-slider"
					ref="elOpacitySlider"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneParticle-opacity"
					ref="elOpacity"
					v-model="form.opacity"
					@input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.sceneParticle-priority-box.label') || 'Priority' }}
			</div>
			<div class="flex-box" id="sceneParticle-priority-box">
				<SliderBox
					id="sceneParticle-priority-slider"
					ref="elPrioritySlider"
					v-model="form.priority"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-priority"
					ref="elPriority"
					v-model="form.priority"
					@input="onParamInput"
					min="-512"
					max="512"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParticle-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneParticle-conditions"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParticle-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParticle-events"
			ref="elEvents"
			class="inspector-list"
			filter="particle"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParticle-scripts.label') || 'Scripts'
		}}</DetailSummary>
		<ParamList
			id="sceneParticle-scripts"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane
		id="sceneParticle-parameter-pane"
		ref="elParameterPane"
	></ParameterPane>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSceneParticlePage } from '@app/composables/useSceneParticlePage';
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

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useSceneParticlePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

type SyncTarget = HTMLElement & {
	write(value: number | string): void;
	input: HTMLInputElement;
};

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
	const editor = Inspector.sceneParticle;
	if (!editor) return;

	const el = document.getElementById('sceneParticle-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	try {
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

		const elements = document.querySelectorAll(
			'#sceneParticle-name, #sceneParticle-particleId, #sceneParticle-x, #sceneParticle-y, #sceneParticle-angle, #sceneParticle-scale, #sceneParticle-speed, #sceneParticle-opacity, #sceneParticle-priority'
		);
		const sliders = document.querySelectorAll(
			'#sceneParticle-angle-slider, #sceneParticle-scale-slider, #sceneParticle-speed-slider, #sceneParticle-opacity-slider, #sceneParticle-priority-slider'
		);
		bindInput(elements, editor, Scene as unknown as { history: unknown });
		bindSliders(sliders);

		document
			.querySelectorAll(
				'#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts'
			)
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	} catch (e) {
		console.warn('[SceneParticlePage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#sceneParticle-angle-slider,
#sceneParticle-scale-slider,
#sceneParticle-speed-slider,
#sceneParticle-opacity-slider,
#sceneParticle-priority-slider {
	flex: 2 1 auto;
}

#sceneParticle-angle,
#sceneParticle-scale,
#sceneParticle-speed,
#sceneParticle-opacity,
#sceneParticle-priority {
	flex: 1 1 auto;
}
</style>

