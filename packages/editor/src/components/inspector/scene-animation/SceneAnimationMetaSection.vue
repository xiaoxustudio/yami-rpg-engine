<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneAnimation-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneAnimation-conditions"
			v-tip="t('components.sceneAnimation-conditions.tip')"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneAnimation-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-events"
			v-tip="t('components.sceneAnimation-events.tip')"
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
			v-tip="t('components.sceneAnimation-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneAnimation-parameter-pane" ref="elParameterPane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement, registryElements } from '@app/utils/element-registry';
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
	registerElement(inspectorEls, 'sceneAnimation-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneAnimation-events', elEvents.value);
	registerElement(inspectorEls, 'sceneAnimation-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneAnimation-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneAnimation;
	if (!editor) return;
	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(new ScriptListInterface(editor as { target?: { id: string } }, Scene));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
	registryElements(inspectorEls, [
		'sceneAnimation-conditions',
		'sceneAnimation-events',
		'sceneAnimation-scripts'
	]).forEach((el) => el.addEventListener('change', Scene.listChange));
});
</script>
