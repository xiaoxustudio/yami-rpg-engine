<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileTrigger-events.label') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileTrigger-events"
			v-tip="t('components.fileTrigger-events.tip')"
			ref="elEvents"
			class="inspector-list"
			filter="trigger"
			flexible
			@change="onListChange"
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileTrigger-scripts.label') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileTrigger-scripts"
			v-tip="t('components.fileTrigger-scripts.tip')"
			ref="elScripts"
			class="inspector-list"
			flexible
			@change="onListChange"
		/>
	</DetailBox>
	<ParameterPane id="fileTrigger-parameter-pane" ref="elParameterPane" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
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

const onListChange = () => {
	Inspector?.fileTrigger?.listChange?.();
};

onMounted(() => {
	registerElement(inspectorEls, 'fileTrigger-events', elEvents.value);
	registerElement(inspectorEls, 'fileTrigger-scripts', elScripts.value);
	registerElement(inspectorEls, 'fileTrigger-parameter-pane', elParameterPane.value);
	const editor = Inspector.fileTrigger;
	if (!editor) return;
	elEvents.value?.bind(new EventListInterface(editor));
	elScripts.value?.bind(new ScriptListInterface());
	elParameterPane.value?.bind(elScripts.value?.root as HTMLElement);
});
</script>
