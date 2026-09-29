<template>
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
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryElements, registryRef } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { ConditionListInterface } from '@app/tools/condition-list.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const elConditions = ref<InstanceType<typeof ParamList> | null>(null);
const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	registerElement(inspectorEls, 'sceneActor-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneActor-events', elEvents.value);
	registerElement(inspectorEls, 'sceneActor-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneActor-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneActor;
	if (!editor) return;
	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(new ScriptListInterface(editor as { target?: { id: string } }, Scene));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
	registryElements(inspectorEls, [
		'sceneActor-conditions',
		'sceneActor-events',
		'sceneActor-scripts'
	]).forEach((el) => el.addEventListener('change', Scene.listChange));
});
</script>
