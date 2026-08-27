<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneActor-general-grid.label') || 'General'
		}}</DetailSummary>
		<div class="detail-grid" id="sceneActor-general-grid">
			<div class="text">{{ t('components.sceneActor-name.label') || 'Name' }}</div>
			<TextBox id="sceneActor-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneActor-type.label') || 'Type' }}</div>
			<SelectBox
				id="sceneActor-type"
				v-model="form.type"
				@input="onParamInput"
				@write="onTypeWrite"
			></SelectBox>
			<div class="text">{{ t('components.sceneActor-actorId.label') || 'Actor' }}</div>
			<CustomBox
				id="sceneActor-actorId"
				:model-value="form.actorId"
				type="file"
				filter="actor"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ t('components.sceneActor-teamId.label') || 'Team' }}</div>
			<SelectBox
				id="sceneActor-teamId"
				v-model="form.teamId"
				@input="onParamInput"
			></SelectBox>
			<div class="text">{{ t('components.sceneActor-x.label') || 'X' }}</div>
			<NumberBox
				id="sceneActor-x"
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
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ t('components.sceneActor-angle-box.label') || 'Angle' }}</div>
			<div class="flex-box" id="sceneActor-angle-box">
				<SliderBox
					id="sceneActor-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
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
			<div class="flex-box" id="sceneActor-scale-box">
				<SliderBox
					id="sceneActor-scale-slider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
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
		<ParamList id="sceneActor-conditions" class="inspector-list" flexible></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneActor-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneActor-events"
			class="inspector-list"
			filter="actor"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox id="sceneActor-scripts-detail" open>
		<DetailSummary>{{ t('components.sceneActor-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList id="sceneActor-scripts" class="inspector-list" flexible></ParamList>
	</DetailBox>
	<ParameterPane id="sceneActor-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useSceneStore } from '@app/stores/scene';
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
const { t } = useI18n();

const { form, sync, onParamInput } = useSceneActorPage();

const { bindInput, bindSliders } = useInspectorInput();

const onTypeWrite = (value: unknown) => {
	Inspector?.sceneActor?.typeWrite?.({ value });
};

onMounted(() => {
	const editor = Inspector.sceneActor;
	if (!editor) return;

	const el = document.getElementById('sceneActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	const elType = document.getElementById('sceneActor-type') as
		| (HTMLElement & { loadItems?: (items: unknown[]) => void })
		| null;
	if (elType?.loadItems) {
		elType.loadItems([
			{ name: 'Local Actor', value: 'local' },
			{ name: 'Global Actor', value: 'global' }
		]);
	}

	document
		.getElementById('sceneActor-conditions')
		?.bind?.(new ConditionListInterface(editor, Scene));
	document.getElementById('sceneActor-events')?.bind?.(new EventListInterface(editor, Scene));
	document
		.getElementById('sceneActor-scripts')
		?.bind?.(new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene));
	document
		.getElementById('sceneActor-parameter-pane')
		?.bind?.(document.getElementById('sceneActor-scripts'));

	document
		.getElementById('sceneActor-angle-slider')
		?.synchronize?.(document.getElementById('sceneActor-angle'));
	document
		.getElementById('sceneActor-scale-slider')
		?.synchronize?.(document.getElementById('sceneActor-scale'));

	window.addEventListener('datachange', editor.datachange as unknown as EventListener);
	const elements = document.querySelectorAll(
		'#sceneActor-name, #sceneActor-type, #sceneActor-actorId, #sceneActor-teamId, #sceneActor-x, #sceneActor-y, #sceneActor-angle, #sceneActor-scale'
	);
	const sliders = document.querySelectorAll('#sceneActor-angle-slider, #sceneActor-scale-slider');
	bindInput(elements, editor, Scene);
	bindSliders(sliders);
	document
		.querySelectorAll('#sceneActor-conditions, #sceneActor-events, #sceneActor-scripts')
		.forEach((el) => el.addEventListener('change', Scene.listChange));

	sync();
});
</script>
