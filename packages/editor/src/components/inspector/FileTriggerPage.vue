<template>
	<FileTriggerPropertiesSection />
	<FileTriggerAnimationSection />
	<FileTriggerMetaSection />
</template>

<script setup lang="ts">
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { onMounted, provide, onUnmounted } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { useFileTriggerPage } from '@app/composables/useFileTriggerPage';
import { fileTriggerContextKey } from './file-trigger/context.ts';
import FileTriggerPropertiesSection from './file-trigger/FileTriggerPropertiesSection.vue';
import FileTriggerAnimationSection from './file-trigger/FileTriggerAnimationSection.vue';
import FileTriggerMetaSection from './file-trigger/FileTriggerMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileTriggerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileTriggerContextKey, { form, onParamInput });

onMounted(() => {
	const editor = Inspector.fileTrigger;
	if (!editor) return;
	const bridgeApi: PageSyncApi = { sync, form };
	inspectorPageSync.fileTrigger.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.fileTrigger.reset(bridgeApi));
	sync();
});
</script>
