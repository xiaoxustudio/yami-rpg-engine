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
	<DetailBox id="sceneActor-scripts-detail" ref="scriptsDetailRef" open>
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
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
	provideSceneActorMeta,
	resetSceneActorMeta,
	type SceneActorMetaApi
} from '@app/composables/inspector-section-bridges';
import { clear, hide, show } from '@app/utils/element-utils';
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
const scriptsDetailRef = ref<{ root?: HTMLElement } | null>(null);

const bridgeApi: SceneActorMetaApi = {
	clearLists: () => {
		for (const control of [
			elConditions.value,
			elEvents.value,
			elScripts.value,
			elParameterPane.value
		]) {
			clear(control?.root ?? null);
		}
	},
	setScriptsDetailVisible: (visible) => {
		const detail = scriptsDetailRef.value?.root ?? null;
		const pane = elParameterPane.value?.root ?? null;
		if (visible) {
			show(detail);
			show(pane);
		} else {
			hide(detail);
			hide(pane);
		}
	}
};

onMounted(() => {
	provideSceneActorMeta(bridgeApi);
	onUnmounted(() => resetSceneActorMeta(bridgeApi));
	const editor = Inspector.sceneActor;
	if (!editor) return;
	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(new ScriptListInterface(editor as { target?: { id: string } }, Scene));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
	for (const control of [elConditions.value, elEvents.value, elScripts.value]) {
		const root = control?.root ?? null;
		if (root) root.addEventListener('change', Scene.listChange);
	}
});
</script>
