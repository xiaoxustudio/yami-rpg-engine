<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-general-grid.label') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneRegion-general-grid">
			<div class="text">{{ t('components.sceneRegion-name.label') || 'Name' }}</div><TextBox id="sceneRegion-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ t('components.sceneRegion-color.label') || 'Color' }}</div><ColorBox id="sceneRegion-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ t('components.sceneRegion-x.label') || 'X' }}</div
			><NumberBox
				id="sceneRegion-x" v-model="form.x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneRegion-y.label') || 'Y' }}</div
			><NumberBox
				id="sceneRegion-y" v-model="form.y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneRegion-width.label') || 'Width' }}</div
			><NumberBox
				id="sceneRegion-width" v-model="form.width" @input="onParamInput"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
			<div class="text">{{ t('components.sceneRegion-height.label') || 'Height' }}</div
			><NumberBox
				id="sceneRegion-height" v-model="form.height" @input="onParamInput"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-conditions.label') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneRegion-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneRegion-events"
			class="inspector-list"
			filter="region"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneRegion-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneRegion-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSceneRegionPage } from '@app/composables/useSceneRegionPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';
import { ConditionListInterface } from '@app/legacy/tools/condition-list.ts';
import { EventListInterface } from '@app/legacy/tools/event-list.ts';
import { ScriptListInterface } from '@app/legacy/tools/script-list.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useSceneRegionPage();

const { bindInput } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneRegion;
	if (!editor) return;

	const el = document.getElementById('sceneRegion-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}

	try {
		const conditions = document.getElementById('sceneRegion-conditions');
		conditions?.bind?.(new ConditionListInterface(editor, Scene));

		const events = document.getElementById('sceneRegion-events');
		events?.bind?.(new EventListInterface(editor, Scene));

		const scripts = document.getElementById('sceneRegion-scripts');
		scripts?.bind?.(
			new ScriptListInterface(editor as unknown as { target?: { id: string } }, Scene)
		);

		const parameterPane = document.getElementById('sceneRegion-parameter-pane');
		parameterPane?.bind?.(scripts);

		const elements = document.querySelectorAll(
			'#sceneRegion-name, #sceneRegion-color, #sceneRegion-x, #sceneRegion-y, #sceneRegion-width, #sceneRegion-height'
		);
		bindInput(elements, editor, Scene);

		document
			.querySelectorAll('#sceneRegion-conditions, #sceneRegion-events, #sceneRegion-scripts')
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	} catch (e) {
		console.warn('[SceneRegionPage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>
