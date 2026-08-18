<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneAnimation-general-grid">
			<div class="text">{{ local.getLabel('sceneAnimation-name') || 'Name' }}</div><TextBox id="sceneAnimation-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneAnimation-animationId') || 'Animation' }}</div
			><CustomBox
				id="sceneAnimation-animationId"
				:model-value="form.animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneAnimation-motion') || 'Motion' }}</div><SelectBox id="sceneAnimation-motion" v-model="form.motion" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('sceneAnimation-rotatable') || 'Rotatable' }}</div
			><SelectBox id="sceneAnimation-rotatable" v-model="form.rotatable" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('sceneAnimation-x') || 'X' }}</div
			><NumberBox
				id="sceneAnimation-x"
				v-model="form.x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneAnimation-y') || 'Y' }}</div
			><NumberBox
				id="sceneAnimation-y"
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneAnimation-angle-box') || 'Angle' }}</div
			><div class="flex-box" id="sceneAnimation-angle-box">
				<SliderBox
					id="sceneAnimation-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-angle"
					v-model="form.angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-scale-box') || 'Scale' }}</div
			><div class="flex-box" id="sceneAnimation-scale-box">
				<SliderBox
					id="sceneAnimation-scale-slider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-scale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-speed-box') || 'Speed' }}</div
			><div class="flex-box" id="sceneAnimation-speed-box">
				<SliderBox
					id="sceneAnimation-speed-slider"
					v-model="form.speed"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-speed"
					v-model="form.speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-opacity-box') || 'Opacity' }}</div
			><div class="flex-box" id="sceneAnimation-opacity-box">
				<SliderBox
					id="sceneAnimation-opacity-slider"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-opacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-priority-box') || 'Priority' }}</div
			><div class="flex-box" id="sceneAnimation-priority-box">
				<SliderBox
					id="sceneAnimation-priority-slider"
					v-model="form.priority"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-priority"
					v-model="form.priority"
					min="-512"
					max="512"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-events"
			class="inspector-list"
			filter="animation"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneAnimation-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { ConditionListInterface } from '@app/legacy/tools/condition-list.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
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

const { form, sync, onParamInput } = useSceneAnimationPage();

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.sceneAnimation?.animationIdWrite?.({ value });
};

onMounted(() => {
	const editor = Inspector.sceneAnimation;
	if (!editor) return;

	const el = document.getElementById('sceneAnimation-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elRotatable = document.getElementById('sceneAnimation-rotatable') as HTMLElement & { loadItems?: (items: unknown[]) => void } | null;
	if (elRotatable?.loadItems) {
		elRotatable.loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);
	}

	document.getElementById('sceneAnimation-conditions')?.bind?.(new ConditionListInterface(editor, Scene));
	document.getElementById('sceneAnimation-events')?.bind?.(new EventListInterface(editor, Scene));
	document.getElementById('sceneAnimation-scripts')?.bind?.(
		new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
	);
	document.getElementById('sceneAnimation-parameter-pane')?.bind?.(document.getElementById('sceneAnimation-scripts'));

	document.getElementById('sceneAnimation-angle-slider')?.synchronize?.(document.getElementById('sceneAnimation-angle'));
	document.getElementById('sceneAnimation-scale-slider')?.synchronize?.(document.getElementById('sceneAnimation-scale'));
	document.getElementById('sceneAnimation-speed-slider')?.synchronize?.(document.getElementById('sceneAnimation-speed'));
	document.getElementById('sceneAnimation-opacity-slider')?.synchronize?.(document.getElementById('sceneAnimation-opacity'));
	document.getElementById('sceneAnimation-priority-slider')?.synchronize?.(document.getElementById('sceneAnimation-priority'));

	document.getElementById('sceneAnimation-animationId')?.on?.('write', editor.animationIdWrite);

	const elements = document.querySelectorAll(
		'#sceneAnimation-name, #sceneAnimation-animationId, #sceneAnimation-motion, #sceneAnimation-rotatable, #sceneAnimation-x, #sceneAnimation-y, #sceneAnimation-angle, #sceneAnimation-scale, #sceneAnimation-speed, #sceneAnimation-opacity, #sceneAnimation-priority'
	);
	const sliders = document.querySelectorAll(
		'#sceneAnimation-angle-slider, #sceneAnimation-scale-slider, #sceneAnimation-speed-slider, #sceneAnimation-opacity-slider, #sceneAnimation-priority-slider'
	);
	(elements as unknown as HTMLElement[]).forEach((el) => el.addEventListener('focus', Inspector.inputFocus));
	(elements as unknown as HTMLElement[]).forEach((el) => el.addEventListener('blur', Inspector.inputBlur!(editor, Scene)));
	(sliders as unknown as HTMLElement[]).forEach((el) => el.addEventListener('focus', Inspector.sliderFocus));
	(sliders as unknown as HTMLElement[]).forEach((el) => el.addEventListener('blur', Inspector.sliderBlur));
	document.querySelectorAll('#sceneAnimation-conditions, #sceneAnimation-events, #sceneAnimation-scripts')
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
});
</script>
