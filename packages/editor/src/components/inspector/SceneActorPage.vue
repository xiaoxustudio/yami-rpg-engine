<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneActor-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneActor-general-grid">
			<div class="text">{{ t('components.sceneActor-name.label') || 'Name' }}</div>
			<TextBox
				id="sceneActor-name"
				:ref="registryRef(inspectorEls, 'sceneActor-name')"
				v-tip="t('components.sceneActor-name.tip')"
				v-model="form.name"
				@input="onParamInput"
			></TextBox>
			<div class="text">{{ t('components.sceneActor-type.label') || 'Type' }}</div>
			<SelectBox
				ref="elType"
				id="sceneActor-type"
				v-tip="t('components.sceneActor-type.tip')"
				v-model="form.type"
				@input="onParamInput"
				@write="onTypeWrite"
			></SelectBox>
			<div class="text">{{ t('components.sceneActor-actorId.label') || 'Actor' }}</div>
			<CustomBox
				id="sceneActor-actorId"
				:ref="registryRef(inspectorEls, 'sceneActor-actorId')"
				v-tip="t('components.sceneActor-actorId.tip')"
				:model-value="form.actorId"
				type="file"
				filter="actor"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.sceneActor-teamId.label') || 'Team' }}</div>
			<SelectBox
				id="sceneActor-teamId"
				v-tip="t('components.sceneActor-teamId.tip')"
				:ref="registryRef(inspectorEls, 'sceneActor-teamId')"
				v-model="form.teamId"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneActor-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneActor-x"
				:ref="registryRef(inspectorEls, 'sceneActor-x')"
				v-tip="t('components.sceneActor-x.tip')"
				v-model="form.x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneActor-y.label') || 'Y' }}</div>
			<NumberBox
				id="sceneActor-y"
				:ref="registryRef(inspectorEls, 'sceneActor-y')"
				v-tip="t('components.sceneActor-y.tip')"
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneActor-angle-box.label') || 'Angle' }}</div>
			<div
				class="flex-box"
				id="sceneActor-angle-box"
				v-tip="t('components.sceneActor-angle-box.tip')"
			>
				<SliderBox
					ref="elAngleSlider"
					id="sceneActor-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					ref="elAngle"
					id="sceneActor-angle"
					v-model="form.angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneActor-scale-box.label') || 'Scale' }}</div>
			<div
				class="flex-box"
				id="sceneActor-scale-box"
				v-tip="t('components.sceneActor-scale-box.tip')"
			>
				<SliderBox
					ref="elScaleSlider"
					id="sceneActor-scale-slider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					ref="elScale"
					id="sceneActor-scale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneActor-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			ref="elConditions"
			id="sceneActor-conditions"
			v-tip="t('components.sceneActor-conditions.tip')"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneActor-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			ref="elEvents"
			id="sceneActor-events"
			v-tip="t('components.sceneActor-events.tip')"
			class="inspector-list"
			filter="actor"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox
		id="sceneActor-scripts-detail"
		:ref="registryRef(inspectorEls, 'sceneActor-scripts-detail')"
		open
	>
		<DetailSummary>{{ t('components.sceneActor-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			ref="elScripts"
			id="sceneActor-scripts"
			v-tip="t('components.sceneActor-scripts.tip')"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane ref="elParameterPane" id="sceneActor-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef, registerElement, registryElements } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';
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

const { form, sync, onParamInput: onParamInputEvent } = useSceneActorPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

const { bindInput, bindSliders } = useInspectorInput();

const onTypeWrite = (value: unknown) => {
	Inspector?.sceneActor?.typeWrite?.({ value });
};

const elType = ref<InstanceType<typeof SelectBox> | null>(null);
const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);
const elAngleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elAngle = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleSlider = ref<InstanceType<typeof SliderBox> | null>(null);
const elScale = ref<InstanceType<typeof NumberBox> | null>(null);

const synchronize = (
	slider: InstanceType<typeof SliderBox> | null,
	input: InstanceType<typeof NumberBox> | null
) => {
	const el = input?.root ?? null;
	if (!el) return;
	slider?.synchronize(
		el as HTMLElement & {
			write(value: number | string): void;
			input: HTMLInputElement;
		}
	);
};

let datachangeHandler: EventListener | null = null;

onMounted(() => {
	// P1b：以下控件的 :ref 槽位已被具名 ref 占用 → 命令式登记（页面内批量绑定焦点/滑杆用）
	registerElement(inspectorEls, 'sceneActor-type', elType.value);
	registerElement(inspectorEls, 'sceneActor-angle', elAngle.value);
	registerElement(inspectorEls, 'sceneActor-scale', elScale.value);
	registerElement(inspectorEls, 'sceneActor-angle-slider', elAngleSlider.value);
	registerElement(inspectorEls, 'sceneActor-scale-slider', elScaleSlider.value);
	registerElement(inspectorEls, 'sceneActor-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneActor-events', elEvents.value);
	registerElement(inspectorEls, 'sceneActor-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneActor-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneActor;
	if (!editor) return;

	const el = inspectorEls.get('sceneActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	elType.value?.loadItems([
		{
			name: t('components.sceneActor-type.options.local.name'),
			tip: t('components.sceneActor-type.options.local.tip'),
			value: 'local'
		},
		{
			name: t('components.sceneActor-type.options.global.name'),
			tip: t('components.sceneActor-type.options.global.tip'),
			value: 'global'
		}
	]);

	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(new ScriptListInterface(editor as { target?: { id: string } }, Scene));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);

	synchronize(elAngleSlider.value, elAngle.value);
	synchronize(elScaleSlider.value, elScale.value);

	// E1：存变量再 add/remove（原先只 add）
	datachangeHandler = editor.datachange as EventListener;
	window.addEventListener('datachange', datachangeHandler);
	const elements = registryElements(inspectorEls, [
		'sceneActor-name',
		'sceneActor-type',
		'sceneActor-actorId',
		'sceneActor-teamId',
		'sceneActor-x',
		'sceneActor-y',
		'sceneActor-angle',
		'sceneActor-scale'
	]);
	const sliders = registryElements(inspectorEls, [
		'sceneActor-angle-slider',
		'sceneActor-scale-slider'
	]);
	bindInput(elements, editor, Scene);
	bindSliders(sliders);
	registryElements(inspectorEls, [
		'sceneActor-conditions',
		'sceneActor-events',
		'sceneActor-scripts'
	]).forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
});
onBeforeUnmount(() => {
	if (datachangeHandler) window.removeEventListener('datachange', datachangeHandler);
});
</script>

<style>
/* 样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#sceneActor-angle-slider,
#sceneActor-scale-slider {
	flex: 2 1 auto;
}

#sceneActor-angle,
#sceneActor-scale {
	flex: 1 1 auto;
}
</style>
