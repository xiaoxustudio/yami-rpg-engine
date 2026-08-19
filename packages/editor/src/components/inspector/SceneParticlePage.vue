<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParticle-general-grid.label') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneParticle-general-grid">
			<div class="text">{{ t('components.sceneParticle-name.label') || 'Name' }}</div><TextBox id="sceneParticle-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneParticle-particleId.label') || 'Particle' }}</div
			><CustomBox
				id="sceneParticle-particleId" :model-value="form.particleId" @input="onParamInput"
				type="file"
				filter="particle"
			></CustomBox>
			<div class="text">{{ t('components.sceneParticle-x.label') || 'X' }}</div
			><NumberBox
				id="sceneParticle-x" v-model="form.x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParticle-y.label') || 'Y' }}</div
			><NumberBox
				id="sceneParticle-y" v-model="form.y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneParticle-angle-box.label') || 'Angle' }}</div
			><div class="flex-box" id="sceneParticle-angle-box">
				<SliderBox
					id="sceneParticle-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneParticle-angle" v-model="form.angle" @input="onParamInput"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-scale-box.label') || 'Scale' }}</div
			><div class="flex-box" id="sceneParticle-scale-box">
				<SliderBox
					id="sceneParticle-scale-slider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-scale" v-model="form.scale" @input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-speed-box.label') || 'Speed' }}</div
			><div class="flex-box" id="sceneParticle-speed-box">
				<SliderBox
					id="sceneParticle-speed-slider"
					v-model="form.speed"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-speed" v-model="form.speed" @input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-opacity-box.label') || 'Opacity' }}</div
			><div class="flex-box" id="sceneParticle-opacity-box">
				<SliderBox
					id="sceneParticle-opacity-slider"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneParticle-opacity" v-model="form.opacity" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.sceneParticle-priority-box.label') || 'Priority' }}</div
			><div class="flex-box" id="sceneParticle-priority-box">
				<SliderBox
					id="sceneParticle-priority-slider"
					v-model="form.priority"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-priority" v-model="form.priority" @input="onParamInput"
					min="-512"
					max="512"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParticle-conditions.label') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneParticle-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParticle-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParticle-events"
			class="inspector-list"
			filter="particle"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParticle-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneParticle-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneParticle-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSceneParticlePage } from '@app/composables/useSceneParticlePage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { ConditionListInterface } from '@app/legacy/tools/condition-list.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
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

const { form, sync, onParamInput } = useSceneParticlePage();

onMounted(() => {
	const editor = Inspector.sceneParticle;
	if (!editor) return;

	const el = document.getElementById('sceneParticle-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	try {
		const conditions = document.getElementById('sceneParticle-conditions');
		conditions?.bind?.(new ConditionListInterface(editor, Scene));

		const events = document.getElementById('sceneParticle-events');
		events?.bind?.(new EventListInterface(editor, Scene));

		const scripts = document.getElementById('sceneParticle-scripts');
		scripts?.bind?.(
			new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
		);

		const parameterPane = document.getElementById('sceneParticle-parameter-pane');
		parameterPane?.bind?.(scripts);

		document.getElementById('sceneParticle-angle-slider')?.synchronize?.(document.getElementById('sceneParticle-angle'));
		document.getElementById('sceneParticle-scale-slider')?.synchronize?.(document.getElementById('sceneParticle-scale'));
		document.getElementById('sceneParticle-speed-slider')?.synchronize?.(document.getElementById('sceneParticle-speed'));
		document.getElementById('sceneParticle-opacity-slider')?.synchronize?.(document.getElementById('sceneParticle-opacity'));
		document.getElementById('sceneParticle-priority-slider')?.synchronize?.(document.getElementById('sceneParticle-priority'));

		const elements = document.querySelectorAll(
			'#sceneParticle-name, #sceneParticle-particleId, #sceneParticle-x, #sceneParticle-y, #sceneParticle-angle, #sceneParticle-scale, #sceneParticle-speed, #sceneParticle-opacity, #sceneParticle-priority'
		);
		const sliders = document.querySelectorAll(
			'#sceneParticle-angle-slider, #sceneParticle-scale-slider, #sceneParticle-speed-slider, #sceneParticle-opacity-slider, #sceneParticle-priority-slider'
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(editor, Scene))
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);

		document
			.querySelectorAll('#sceneParticle-conditions, #sceneParticle-events, #sceneParticle-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	} catch (e) {
		console.warn('[SceneParticlePage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>
