<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneParallax-conditions"
			v-tip="t('components.sceneParallax-conditions.tip')"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneParallax-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParallax-events"
			v-tip="t('components.sceneParallax-events.tip')"
			ref="elEvents"
			class="inspector-list"
			filter="parallax"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneParallax-scripts.label') || 'Scripts'
		}}</DetailSummary>
		<ParamList
			id="sceneParallax-scripts"
			v-tip="t('components.sceneParallax-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneParallax-parameter-pane" ref="elParameterPane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { sceneParallaxNodes } from '@app/composables/inspector-scene-nodes';
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
	sceneParallaxNodes.set('conditions', elConditions.value?.root ?? null);
	sceneParallaxNodes.set('events', elEvents.value?.root ?? null);
	sceneParallaxNodes.set('scripts', elScripts.value?.root ?? null);
	sceneParallaxNodes.set('parameterPane', elParameterPane.value?.root ?? null);
	const editor = Inspector.sceneParallax;
	if (!editor) return;
	elConditions.value?.bind(new ConditionListInterface(editor, Scene));
	elEvents.value?.bind(new EventListInterface(editor, Scene));
	elScripts.value?.bind(new ScriptListInterface(editor as { target?: { id: string } }, Scene));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
	[
		sceneParallaxNodes.pick('conditions'),
		sceneParallaxNodes.pick('events'),
		sceneParallaxNodes.pick('scripts')
	].forEach((el) => el?.addEventListener('change', Scene.listChange));
});
</script>
