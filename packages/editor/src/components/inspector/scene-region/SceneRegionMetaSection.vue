<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.sceneRegion-conditions.label') || 'Conditions'
		}}</DetailSummary>
		<ParamList
			id="sceneRegion-conditions"
			v-tip="t('components.sceneRegion-conditions.tip')"
			ref="elConditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneRegion-events"
			v-tip="t('components.sceneRegion-events.tip')"
			ref="elEvents"
			class="inspector-list"
			filter="region"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.sceneRegion-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneRegion-scripts"
			v-tip="t('components.sceneRegion-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneRegion-parameter-pane" ref="elParameterPane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
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
	registerElement(inspectorEls, 'sceneRegion-conditions', elConditions.value);
	registerElement(inspectorEls, 'sceneRegion-events', elEvents.value);
	registerElement(inspectorEls, 'sceneRegion-scripts', elScripts.value);
	registerElement(inspectorEls, 'sceneRegion-parameter-pane', elParameterPane.value);
	const editor = Inspector.sceneRegion;
	if (!editor) return;
	try {
		elConditions.value?.bind(new ConditionListInterface(editor, Scene));

		elEvents.value?.bind(new EventListInterface(editor, Scene));

		elScripts.value?.bind(
			new ScriptListInterface(editor as { target?: { id: string } }, Scene)
		);

		const scriptsEl = elScripts.value?.root;
		if (scriptsEl) {
			elParameterPane.value?.bind(scriptsEl);
		}

		[elConditions.value?.root, elEvents.value?.root, elScripts.value?.root]
			.filter((el): el is HTMLElement => el != null)
			.forEach((el) => el.addEventListener('change', Scene.listChange));
	} catch (e) {
		console.warn('[SceneRegionPage] meta init skipped:', (e as Error)?.message);
	}
});
</script>
