<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileScene-events"
			v-tip="t('components.fileScene-events.tip')"
			ref="elEvents"
			class="inspector-list"
			filter="scene"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScene-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileScene-scripts"
			v-tip="t('components.fileScene-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileScene-parameter-pane" ref="elParameterPane" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { fileSceneNodes } from '@app/composables/inspector-scene-nodes';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { EventListInterface } from '@app/tools/event-list.ts';
import { ScriptListInterface } from '@app/tools/script-list.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const { t } = useI18n();

const elEvents = ref<InstanceType<typeof ParamList> | null>(null);
const elScripts = ref<InstanceType<typeof ParamList> | null>(null);
const elParameterPane = ref<InstanceType<typeof ParameterPane> | null>(null);

onMounted(() => {
	fileSceneNodes.set('events', elEvents.value?.root ?? null);
	fileSceneNodes.set('scripts', elScripts.value?.root ?? null);
	fileSceneNodes.set('parameterPane', elParameterPane.value?.root ?? null);
	const editor = Inspector.fileScene;
	if (!editor) return;
	const owner = editor.owner;
	elEvents.value?.bind(new EventListInterface(editor, owner));
	elScripts.value?.bind(new ScriptListInterface(editor, owner));
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
	[fileSceneNodes.pick('events'), fileSceneNodes.pick('scripts')].forEach((el) =>
		el?.addEventListener('change', Scene.listChange)
	);
});
</script>
